import "./clover-behind.css";
import cloverBehindHtml from "./clover-behind.html?raw";
import ribbonUrl from "../../assets/images/ribbon-red.svg";
import titleRibbonUrl from "../../assets/images/ribbon-white.svg";
import card1Url from "../../assets/images/behind-card1.svg";
import card2Url from "../../assets/images/behind-card2.svg";
import card3Url from "../../assets/images/behind-card3.svg";

const TYPING_TEXT = "이 선물은 클로버에서 최초로 고민하게되어..";

const clamp = (v, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

const lerp = (a, b, t) =>
  a + (b - a) * t;

const easeOutCubic = (t) =>
  1 - Math.pow(1 - t, 3);

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

  section.id = "clover-behind";

  const cards = [
    ...section.querySelectorAll("[data-card]")
  ];

  const inners = cards.map((card) =>
    card.querySelector(".gb-card-inner")
  );

  const typingEl =
    section.querySelector("[data-typing]");

  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  /* -------------------------------------------------------
     Animation Settings
  ------------------------------------------------------- */

  const ROTATE_FROM = 180;

  const fromRotateZ = [
    -6,
    5,
    -4
  ];

  const STAGGER = 0.13;

  const RISE_DURATION = 0.3;

  const FLIP_START = 0.58;

  const FLIP_STAGGER = 0.1;

  /*
    이전
    WHEEL_STEP = 0.035
    MAX_WHEEL_STEP = 0.045

    ↓ 조금 더 빠르게
  */

  const WHEEL_STEP = 0.045;
  const MAX_WHEEL_STEP = 0.055;

  /*
    progress가 targetProgress를 따라가는 속도.

    숫자가 클수록 빠르게 따라가고,
    작을수록 더 천천히 부드럽게 따라감.
  */

  const PROGRESS_EASE = 0.18;

  /* -------------------------------------------------------
     State
  ------------------------------------------------------- */

  let progress = 0;

  let targetProgress = 0;

  let animationFrame = null;

  let progressAnimationFrame = null;

  let interactionFinished = false;

  let typingStarted = false;

  let sectionActive = false;

  let lockedScrollY = 0;

  /* -------------------------------------------------------
     Hide Position
  ------------------------------------------------------- */

  function getHideY() {
    return window.innerHeight * 0.9 + 200;
  }

  /* -------------------------------------------------------
     Section Position
  ------------------------------------------------------- */

  function getSectionTop() {
    const rect =
      section.getBoundingClientRect();

    return window.scrollY + rect.top;
  }

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */

  function render() {
    const p =
      reduceMotion
        ? 1
        : clamp(progress);

    const HIDE_Y =
      getHideY();

    cards.forEach((card, i) => {
      const inner =
        inners[i];

      /* -----------------------------------------------
         Card Rise
      ------------------------------------------------ */

      const riseStart =
        i * STAGGER;

      const riseProgress =
        clamp(
          (p - riseStart) /
          RISE_DURATION
        );

      const riseT =
        easeOutCubic(
          riseProgress
        );

      const translateY =
        lerp(
          HIDE_Y,
          0,
          riseT
        );

      const rotateZ =
        lerp(
          fromRotateZ[i],
          0,
          riseT
        );

      const scale =
        lerp(
          0.9,
          1,
          riseT
        );

      card.style.transform =
        `translateY(${translateY}px)
         rotateZ(${rotateZ}deg)
         scale(${scale})`;

      /* -----------------------------------------------
         Card Flip
      ------------------------------------------------ */

      const flipStart =
        FLIP_START +
        i * FLIP_STAGGER;

      const flipProgress =
        clamp(
          (p - flipStart) /
          (1 - flipStart)
        );

      const flipT =
        easeOutCubic(
          flipProgress
        );

      const rotateY =
        lerp(
          ROTATE_FROM,
          0,
          flipT
        );

      inner.style.transform =
        `perspective(1000px)
         rotateY(${rotateY}deg)`;
    });

    /* -----------------------------------------------
       Typing
    ------------------------------------------------ */

    if (
      !typingStarted &&
      progress >= 0.985
    ) {
      startTyping();
    }
  }

  /* -------------------------------------------------------
     Render Request
  ------------------------------------------------------- */

  function requestRender() {
    if (animationFrame !== null) {
      return;
    }

    animationFrame =
      requestAnimationFrame(() => {
        animationFrame = null;

        render();
      });
  }

  /* -------------------------------------------------------
     Smooth Progress
  ------------------------------------------------------- */

  function animateProgress() {
    if (progressAnimationFrame !== null) {
      return;
    }

    function step() {
      const diff =
        targetProgress - progress;

      /*
        아주 작은 차이는 바로 맞춰줌.
        이렇게 해야 마지막에 미세하게 떨리는 현상이 없음.
      */

      if (Math.abs(diff) < 0.0005) {
        progress = targetProgress;

        progressAnimationFrame = null;

        requestRender();

        return;
      }

      /*
        targetProgress를 부드럽게 따라감
      */

      progress +=
        diff * PROGRESS_EASE;

      requestRender();

      progressAnimationFrame =
        requestAnimationFrame(step);
    }

    progressAnimationFrame =
      requestAnimationFrame(step);
  }

  /* -------------------------------------------------------
     Activate Section
  ------------------------------------------------------- */

  function activateSection() {
    if (
      interactionFinished ||
      sectionActive
    ) {
      return;
    }

    sectionActive = true;

    lockedScrollY =
      getSectionTop();

    window.scrollTo({
      top: lockedScrollY,
      behavior: "instant"
    });

    /*
      실제 페이지 스크롤을 잠금.

      트랙패드 관성 스크롤이 계속 들어와도
      페이지 자체는 움직이지 않음.
    */

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.overflow =
      "hidden";

    /*
      현재 progress와 targetProgress가
      갑자기 어긋나지 않도록 맞춰줌.
    */

    targetProgress = progress;

    requestRender();
  }

  /* -------------------------------------------------------
     Finish Interaction
  ------------------------------------------------------- */

  function finishInteraction() {
    interactionFinished = true;

    sectionActive = false;

    document.documentElement.style.overflow =
      "";

    document.body.style.overflow =
      "";

    targetProgress = progress;
  }

  /* -------------------------------------------------------
     Typing
  ------------------------------------------------------- */

  async function startTyping() {
    if (typingStarted) {
      return;
    }

    typingStarted = true;

    await wait(150);

    typingEl.classList.add("typing");

    await typeText(
      typingEl,
      TYPING_TEXT,
      55
    );

    typingEl.classList.add("done");

    await wait(600);

    finishInteraction();
  }

  /* -------------------------------------------------------
     Wheel
  ------------------------------------------------------- */

  function onWheel(e) {
    if (interactionFinished) {
      return;
    }

    /* -----------------------------------------------
       Section Activation
    ------------------------------------------------ */

    if (!sectionActive) {
      if (e.deltaY > 0) {
        const rect =
          section.getBoundingClientRect();

        /*
          섹션이 화면에 들어온 상태
        */

        if (
          rect.top <= 150 &&
          rect.bottom >= window.innerHeight
        ) {
          e.preventDefault();

          activateSection();

          return;
        }

        /*
          섹션 상단을 이미 조금 지나친 경우
        */

        if (
          rect.top < -150 &&
          rect.bottom > 0
        ) {
          e.preventDefault();

          activateSection();

          return;
        }
      }

      return;
    }

    /* -----------------------------------------------
       Lock Scroll
    ------------------------------------------------ */

    e.preventDefault();

    /* -----------------------------------------------
       Scroll Up
    ------------------------------------------------ */

    if (e.deltaY < 0) {
      const amount =
        Math.min(
          Math.abs(e.deltaY) / 100,
          MAX_WHEEL_STEP
        );

      targetProgress =
        clamp(
          targetProgress - amount
        );

      /*
        위로 끝까지 올라가면
        즉시 실제 progress도 0으로 맞춤.
      */

      if (targetProgress <= 0) {
        targetProgress = 0;
        progress = 0;

        sectionActive = false;

        document.documentElement.style.overflow =
          "";

        document.body.style.overflow =
          "";
      }

      animateProgress();

      return;
    }

    /* -----------------------------------------------
       Scroll Down
    ------------------------------------------------ */

    const normalized =
      Math.min(
        Math.abs(e.deltaY) / 100,
        1
      );

    const step =
      Math.min(
        normalized * WHEEL_STEP,
        MAX_WHEEL_STEP
      );

    targetProgress =
      clamp(
        targetProgress + step
      );

    animateProgress();
  }

  /* -------------------------------------------------------
     Touch
  ------------------------------------------------------- */

  let touchStartY = 0;

  function onTouchStart(e) {
    if (!e.touches?.length) {
      return;
    }

    touchStartY =
      e.touches[0].clientY;
  }

  function onTouchMove(e) {
    if (
      interactionFinished ||
      !sectionActive ||
      !e.touches?.length
    ) {
      return;
    }

    const currentY =
      e.touches[0].clientY;

    const delta =
      touchStartY - currentY;

    if (Math.abs(delta) < 2) {
      return;
    }

    e.preventDefault();

    const direction =
      delta > 0 ? 1 : -1;

    const amount =
      Math.min(
        Math.abs(delta) / 500,
        MAX_WHEEL_STEP
      );

    targetProgress =
      clamp(
        targetProgress +
        direction * amount
      );

    touchStartY =
      currentY;

    animateProgress();
  }

  /* -------------------------------------------------------
     Scroll Lock
  ------------------------------------------------------- */

  function onScroll() {
    if (
      sectionActive &&
      !interactionFinished
    ) {
      if (
        Math.abs(
          window.scrollY -
          lockedScrollY
        ) > 1
      ) {
        window.scrollTo({
          top: lockedScrollY,
          behavior: "instant"
        });
      }
    }
  }

  /* -------------------------------------------------------
     Resize
  ------------------------------------------------------- */

  function onResize() {
    if (sectionActive) {
      lockedScrollY =
        getSectionTop();

      window.scrollTo({
        top: lockedScrollY,
        behavior: "instant"
      });
    }

    requestRender();
  }

  /* -------------------------------------------------------
     Events
  ------------------------------------------------------- */

  window.addEventListener(
    "wheel",
    onWheel,
    { passive: false }
  );

  window.addEventListener(
    "touchstart",
    onTouchStart,
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    onTouchMove,
    { passive: false }
  );

  window.addEventListener(
    "scroll",
    onScroll,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    onResize
  );

  /* -------------------------------------------------------
     Initial Render
  ------------------------------------------------------- */

  render();
}