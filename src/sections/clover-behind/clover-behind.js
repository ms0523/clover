import "./clover-behind.css";
import cloverBehindHtml from "./clover-behind.html?raw";
import ribbonUrl from "../../assets/images/ribbon-red.svg";
import titleRibbonUrl from "../../assets/images/ribbon-white.svg";
import card1Url from "../../assets/images/behind-card1.svg";
import card2Url from "../../assets/images/behind-card2.svg";
import card3Url from "../../assets/images/behind-card3.svg";

const TYPING_TEXT = "이 선물은 클로버에서 최초로 고민하게되어..";

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function typeText(el, text, speedMs) {
  return new Promise((resolve) => {
    let i = 0;
    function step() {
      if (i >= text.length) {
        resolve();
        return;
      }
      el.textContent = text.slice(0, i + 1);
      i++;
      setTimeout(step, speedMs);
    }
    step();
  });
}

export function mountCloverBehind(mountEl) {
  const html = cloverBehindHtml
    .replaceAll("__RIBBON_URL__", ribbonUrl)
    .replaceAll("__TITLE_RIBBON_URL__", titleRibbonUrl)
    .replaceAll("__CARD1_URL__", card1Url)
    .replaceAll("__CARD2_URL__", card2Url)
    .replaceAll("__CARD3_URL__", card3Url);
  mountEl.insertAdjacentHTML("beforeend", html);

  const section = mountEl.querySelector(".gb-band");
  const cards = [...section.querySelectorAll("[data-card]")];
  const inners = cards.map((c) => c.querySelector(".gb-card-inner"));
  const typingEl = section.querySelector("[data-typing]");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ROTATE_FROM = 180;
  const fromRotateZ = [-6, 5, -4];
  const STAGGER = 0.13;
  const RISE_DURATION = 0.3;
  const FLIP_START = 0.58;
  const FLIP_STAGGER = 0.1;
  const WHEEL_STEP = 0.035;
  const MAX_WHEEL_STEP = 0.045;

  let progress = 0;
  let animationFrame = null;
  let interactionFinished = false;
  let typingStarted = false;
  let sectionActive = false;
  let lockedScrollY = 0;

  function getHideY() {
    return window.innerHeight * 0.9 + 200;
  }

  function getSectionTop() {
    const rect = section.getBoundingClientRect();
    return window.scrollY + rect.top;
  }

  function render() {
    const p = reduceMotion ? 1 : clamp(progress);
    const HIDE_Y = getHideY();

    cards.forEach((card, i) => {
      const inner = inners[i];

      const riseStart = i * STAGGER;
      const riseProgress = clamp((p - riseStart) / RISE_DURATION);
      const riseT = easeOutCubic(riseProgress);

      const translateY = lerp(HIDE_Y, 0, riseT);
      const rotateZ = lerp(fromRotateZ[i], 0, riseT);
      const scale = lerp(0.9, 1, riseT);

      card.style.transform =
        `translateY(${translateY}px) rotateZ(${rotateZ}deg) scale(${scale})`;

      const flipStart = FLIP_START + i * FLIP_STAGGER;
      const flipProgress = clamp((p - flipStart) / (1 - flipStart));
      const flipT = easeOutCubic(flipProgress);
      const rotateY = lerp(ROTATE_FROM, 0, flipT);

      inner.style.transform = `perspective(1000px) rotateY(${rotateY}deg)`;
    });

    if (!typingStarted && progress >= 0.985) {
      startTyping();
    }
  }

  function requestRender() {
    if (animationFrame !== null) return;
    animationFrame = requestAnimationFrame(() => {
      animationFrame = null;
      render();
    });
  }

  // ★ merged: trigger detection stays close to the teammate's (fires
  // once the section's top is nearly at the viewport's top), but the
  // actual lock uses my getSectionTop()-based snap, since that's the
  // version that was verified not to leave any gap to the next section.
  function activateSection() {
    if (interactionFinished || sectionActive) return;

    sectionActive = true;
    lockedScrollY = getSectionTop();
    window.scrollTo({ top: lockedScrollY, behavior: "instant" });

    // preventDefault() on the wheel event alone doesn't reliably stop
    // trackpad momentum scrolling — the OS/browser can keep feeding
    // inertial scroll through a slightly different path, so the page
    // visibly nudges away from lockedScrollY and our onScroll handler
    // has to keep yanking it back, which is exactly the jerky/janky
    // feeling. Actually disabling scroll at the html/body level removes
    // the possibility of that fight entirely — the page physically
    // cannot move, no matter what momentum is doing, while wheel
    // events are still read normally to drive `progress`.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    requestRender();
  }

  function finishInteraction() {
    interactionFinished = true;
    sectionActive = false;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  async function startTyping() {
    if (typingStarted) return;
    typingStarted = true;

await wait(150);
typingEl.classList.add("typing");
await typeText(typingEl, TYPING_TEXT, 55);
    typingEl.classList.add("done");
    await wait(600);

    finishInteraction();
  }

  function onWheel(e) {
    if (interactionFinished) return;

    if (!sectionActive) {
      if (e.deltaY > 0) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= window.innerHeight) {
          e.preventDefault();
          activateSection();
          return; 
        }
        if (rect.top < -150 && rect.bottom > 0) {
          e.preventDefault();
          activateSection();
          return;
        }
      }
      return;
    }

    e.preventDefault();

    if (e.deltaY < 0) {
      const amount = Math.min(Math.abs(e.deltaY) / 100, MAX_WHEEL_STEP);
      progress = clamp(progress - amount);

      if (progress <= 0) {
        progress = 0;
        sectionActive = false; 
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
      requestRender();
      return;
    }

    const normalized = Math.min(Math.abs(e.deltaY) / 100, 1);
    const step = Math.min(normalized * WHEEL_STEP, MAX_WHEEL_STEP);
    progress = clamp(progress + step);
    requestRender();
  }

  let touchStartY = 0;

  function onTouchStart(e) {
    if (!e.touches?.length) return;
    touchStartY = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    if (interactionFinished || !sectionActive || !e.touches?.length) return;

    const currentY = e.touches[0].clientY;
    const delta = touchStartY - currentY;
    if (Math.abs(delta) < 2) return;

    e.preventDefault();

    const direction = delta > 0 ? 1 : -1;
    const amount = Math.min(Math.abs(delta) / 500, MAX_WHEEL_STEP);
    progress = clamp(progress + direction * amount);
    touchStartY = currentY;
    requestRender();
  }

  function onScroll() {
    if (sectionActive && !interactionFinished) {
      if (Math.abs(window.scrollY - lockedScrollY) > 1) {
        window.scrollTo({ top: lockedScrollY, behavior: "instant" });
      }
    }
  }

  function onResize() {
    if (sectionActive) {
      lockedScrollY = getSectionTop();
      window.scrollTo({ top: lockedScrollY, behavior: "instant" });
    }
    requestRender();
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  render();
}