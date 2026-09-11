import "./hero.css";
import heroHtml from "./hero.html?raw";
import logoUrl from "../../assets/images/hero-wordmark.svg";
import whiteLogoUrl from "../../assets/images/hero-wordmark-white.svg";
import ribbonUrl from "../../assets/images/ribbon-red.svg";
import scissorsUrl from "../../assets/images/scissors.svg";
import { lerp, wait, easeFastMiddle } from "../../utils/animate.js";

export function mountHero(mountEl) {
  mountEl.insertAdjacentHTML(
    "beforeend",
    heroHtml
      .replace("__LOGO_URL__", logoUrl)
      .replace("__WHITE_LOGO_URL__", whiteLogoUrl)
      .replace("__RIBBON_URL__", ribbonUrl)
      .replace("__SCISSORS_URL__", scissorsUrl)
  );

  const stage = mountEl.querySelector(".hero-stage");
  const paper = stage.querySelector(".paper");
  const track = stage.querySelector(".track");
  const scissors = stage.querySelector(".scissors");
  const openLabel = stage.querySelector(".open-label");
  const dragHint = stage.querySelector(".drag-hint");
  const cta = stage.querySelector(".hero-cta");

  const logoEl = stage.querySelector(".hero-logo");

  function syncLineTop() {
    const stageRect = stage.getBoundingClientRect();
    const logoRect = logoEl.getBoundingClientRect();
    const lineTop = logoRect.bottom - stageRect.top + 24; // 24px = 로고 밑 여백, 취향껏 조절
    stage.style.setProperty("--line-top", `${lineTop}px`);
  }

  if (logoEl.complete) {
    syncLineTop();
  } else {
    logoEl.addEventListener("load", syncLineTop, { once: true });
  }
  window.addEventListener("resize", syncLineTop);

  let progress = 0;
  let rafId = null;
  let dragging = false;
  let opened = false;
  let nudgeActive = true;

  const REACH = 62;
  const OPEN_TARGET = 1;
  const OPEN_THRESHOLD = 0.92;
  const INITIAL_PROGRESS = 0.25;

  function render(p) {
    progress = Math.min(1, Math.max(0, p));
    const tipX = lerp(-REACH, 100 + REACH, progress);
    const backX = tipX - REACH;

    paper.style.clipPath = `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%,
      ${backX}% 100%, ${tipX}% 58%, ${backX}% 0%, 0% 0%
    )`;

    const cutPct = Math.min(100, Math.max(0, tipX));
    track.style.setProperty("--cut-pct", cutPct + "%");
    scissors.style.setProperty("--cut-pct", cutPct + "%");

    openLabel.style.setProperty("--label-op", progress > 0.88 ? 0 : 1);
    dragHint.style.setProperty("--hint-op", progress > INITIAL_PROGRESS + 0.02 ? 0 : 1);
    scissors.style.opacity = cutPct >= 100 ? 0 : 1;
    track.style.opacity = Math.max(0, 1 - progress / OPEN_TARGET);
  }

  function glideTo(target, duration) {
    return new Promise((resolve) => {
      const start = progress;
      const delta = target - start;
      const t0 = performance.now();
      cancelAnimationFrame(rafId);
      function frame(now) {
        const t = Math.min(1, (now - t0) / duration);
        render(start + delta * easeFastMiddle(t));
        if (t < 1) {
          rafId = requestAnimationFrame(frame);
        } else {
          resolve();
        }
      }
      rafId = requestAnimationFrame(frame);
    });
  }

  async function nudgeLoop() {
    while (nudgeActive && !dragging && !opened) {
      await glideTo(INITIAL_PROGRESS + 0.05, 800);
      if (!nudgeActive || dragging || opened) break;
      await glideTo(INITIAL_PROGRESS, 700);
      if (!nudgeActive || dragging || opened) break;
      await wait(1500);
    }
  }

  function stopNudge() {
    nudgeActive = false;
    cancelAnimationFrame(rafId);
  }

  function progressFromClientX(clientX) {
    const rect = stage.getBoundingClientRect();
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(1, Math.max(0, xPct / 100));
  }

  function onPointerDown(e) {
    if (opened) return;
    stopNudge();
    dragging = true;
    paper.classList.add("is-dragging");
    paper.setPointerCapture?.(e.pointerId);
    render(progressFromClientX(e.clientX));
  }

  function onPointerMove(e) {
    if (!dragging) return;
    render(progressFromClientX(e.clientX));
  }

  function finishDrag() {
    if (!dragging) return;
    dragging = false;
    paper.classList.remove("is-dragging");

    if (progress >= OPEN_THRESHOLD) {
      opened = true;
      glideTo(OPEN_TARGET, 320).then(() => {
        window.dispatchEvent(new CustomEvent("hero:opened"));
      });
    } else {
      glideTo(INITIAL_PROGRESS, 260).then(() => {
        nudgeActive = true;
        nudgeLoop();
      });
    }
  }

  paper.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", finishDrag);
  window.addEventListener("pointercancel", finishDrag);

  cta.addEventListener("click", (e) => e.stopPropagation());

  async function intro() {
    render(INITIAL_PROGRESS);
    await wait(400);
    nudgeLoop();
  }

  intro();

  return {
    replay: () => {
      window.dispatchEvent(new CustomEvent("hero:closed"));
      opened = false;
      stopNudge();
      return glideTo(INITIAL_PROGRESS, 500).then(() => {
        nudgeActive = true;
        intro();
      });
    },
  };
}
export function mountSectionNav(sections) {
  const nav = document.createElement("nav");
  nav.className = "section-nav";
  nav.setAttribute("aria-label", "섹션 이동");

  const list = document.createElement("ul");
  list.className = "section-nav-list";

  const items = sections.map(({ id, label }) => {
    const li = document.createElement("li");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "section-nav-item";
    btn.dataset.target = id;

    const labelSpan = document.createElement("span");
    labelSpan.className = "section-nav-label";
    labelSpan.textContent = label;

    const dash = document.createElement("span");
    dash.className = "section-nav-dash";

    btn.append(labelSpan, dash);

    btn.addEventListener("click", () => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    li.appendChild(btn);
    list.appendChild(li);

    return {
      id,
      el: btn
    };
  });

  nav.appendChild(list);
  document.body.appendChild(nav);

  /* hover */
  nav.addEventListener("mouseenter", () => {
    nav.classList.add("is-expanded");
  });

  nav.addEventListener("mouseleave", () => {
    nav.classList.remove("is-expanded");
  });

  /* 표시 상태 */
  window.addEventListener("hero:opened", () => {
    nav.classList.add("is-visible");
  });

  window.addEventListener("hero:closed", () => {
    nav.classList.remove("is-visible");
  });

  const targets = sections
    .map(({ id }) => document.getElementById(id))
    .filter(Boolean);

  /* 현재 페이지 감지 */
// 현재 페이지에 해당하는 네비게이터를 표시
function updateActiveSection() {
  const viewportCenter = window.scrollY + window.innerHeight / 2;

  let activeIndex = 0;
  let closestDistance = Infinity;

  targets.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    // 화면 중앙이 section 안에 있으면 바로 active
    if (
      viewportCenter >= sectionTop &&
      viewportCenter < sectionBottom
    ) {
      activeIndex = index;
      closestDistance = 0;
      return;
    }

    // section 중앙과 화면 중앙의 거리
    const sectionCenter =
      sectionTop + section.offsetHeight / 2;

    const distance = Math.abs(
      viewportCenter - sectionCenter
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  items.forEach((item, index) => {
    item.el.classList.toggle(
      "is-active",
      index === activeIndex
    );
  });
}

// 최초 실행
updateActiveSection();

// 스크롤할 때 변경
let ticking = false;

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;

    window.requestAnimationFrame(() => {
      updateActiveSection();
      ticking = false;
    });

    ticking = true;
  },
  { passive: true }
);
  return {
    destroy: () => {
      observer.disconnect();
      nav.remove();
    }
  };
}