import "./hero.css";
import heroHtml from "./hero.html?raw";
import logoUrl from "../../assets/images/hero-wordmark.svg";
import whiteLogoUrl from "../../assets/images/hero-wordmark-white.svg";
import ribbonUrl from "../../assets/images/ribbon-red.svg";
import { lerp, wait, easeFastMiddle } from "../../utils/animate.js";

export function mountHero(mountEl) {
  mountEl.insertAdjacentHTML(
    "beforeend",
    heroHtml
      .replace("__LOGO_URL__", logoUrl)
      .replace("__WHITE_LOGO_URL__", whiteLogoUrl)
      .replace("__RIBBON_URL__", ribbonUrl)
  );

  const stage = mountEl.querySelector(".hero-stage");
  stage.id = "hero"; 
  const paper = stage.querySelector(".paper");
  const track = stage.querySelector(".track");
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

  // 개봉 전까지 페이지 스크롤 잠금 — 다음 섹션들이 미리 보이지 않도록
  function lockScroll() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
  function unlockScroll() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }
  lockScroll();

  let progress = 0;
  let rafId = null;
  let dragging = false;
  let opened = false;

  const REACH = 62;
  const OPEN_TARGET = 1;
  const OPEN_THRESHOLD = 0.6; // 이 지점까지 찢으면 나머지는 자동으로 완전히 열림
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

    openLabel.style.setProperty("--label-op", progress > 0.88 ? 0 : 1);
    dragHint.style.setProperty("--hint-op", progress > INITIAL_PROGRESS + 0.02 ? 0 : 1);

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

  function progressFromClientX(clientX) {
    const rect = stage.getBoundingClientRect();
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(1, Math.max(0, xPct / 100));
  }

  function completeOpen() {
    if (opened) return;
    opened = true;
    dragging = false;
    paper.classList.remove("is-dragging");
    glideTo(OPEN_TARGET, 320).then(() => {
      unlockScroll();
      window.dispatchEvent(new CustomEvent("hero:opened"));
    });
  }

  function onPointerDown(e) {
    if (opened) return;
    dragging = true;
    paper.classList.add("is-dragging");
    paper.setPointerCapture?.(e.pointerId);
    render(progressFromClientX(e.clientX));
    if (progress >= OPEN_THRESHOLD) completeOpen();
  }

  function onPointerMove(e) {
    if (!dragging) return;
    render(progressFromClientX(e.clientX));
    // 임계값을 넘는 순간 손을 떼지 않아도 자동으로 끝까지 열림
    if (progress >= OPEN_THRESHOLD) completeOpen();
  }

  function finishDrag() {
    if (!dragging) return;
    dragging = false;
    paper.classList.remove("is-dragging");
    glideTo(INITIAL_PROGRESS, 260);
  }

  paper.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", finishDrag);
  window.addEventListener("pointercancel", finishDrag);

  cta.addEventListener("click", (e) => e.stopPropagation());

  render(INITIAL_PROGRESS);

  return {
    replay: () => {
      window.dispatchEvent(new CustomEvent("hero:closed"));
      opened = false;
      lockScroll();
      return glideTo(INITIAL_PROGRESS, 500);
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

  const targets = sections.map(({ id }) => document.getElementById(id));
// filter(Boolean) 제거 — 못 찾은 섹션도 자리(인덱스)는 유지

function updateActiveSection() {
  const viewportCenter = window.scrollY + window.innerHeight / 2;

  let activeIndex = 0;
  let closestDistance = Infinity;

  targets.forEach((section, index) => {
    if (!section) return; // 못 찾은 섹션은 계산에서만 건너뜀, 인덱스는 그대로

    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (viewportCenter >= sectionTop && viewportCenter < sectionBottom) {
      activeIndex = index;
      closestDistance = 0;
      return;
    }

    const sectionCenter = sectionTop + section.offsetHeight / 2;
    const distance = Math.abs(viewportCenter - sectionCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  items.forEach((item, index) => {
    item.el.classList.toggle("is-active", index === activeIndex);
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
      window.removeEventListener("scroll", updateActiveSection);
      nav.remove();
    }
  };
}