import "./clover-value.css";
import cloverValueHtml from "./clover-value.html?raw";

import v01Sharp from "../../assets/images/value-01-sharp.png";
import v01Blur from "../../assets/images/value-01-blur.png";
import v02Sharp from "../../assets/images/value-02-sharp.png";
import v02Blur from "../../assets/images/value-02-blur.png";
import v03Sharp from "../../assets/images/value-03-sharp.png";
import v03Blur from "../../assets/images/value-03-blur.png";


const clamp = (v, min, max) =>
  Math.min(max, Math.max(min, v));

const clamp01 = (v) =>
  clamp(v, 0, 1);


function smoothstep(v) {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
}


function easeOutCubic(t) {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
}


function initCloverValue(section) {
  if (!section || section.dataset.valueReady === "true") {
    return () => {};
  }

  section.dataset.valueReady = "true";
  section.id = "clover-value";


  const track =
    section.querySelector(".clover-value__track");

  const cards = [
    ...section.querySelectorAll("[data-value-card]")
  ];


  if (!track || cards.length !== 3) {
    return () => {};
  }


  const prefersReduced =
    window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;


  /* =========================================================
     CARD STEP
     ========================================================= */

  // 카드 1 → 카드 2 → 카드 3
  const STEP_PROGRESS = [
    0,
    0.48,
    1
  ];

  const LAST_STEP =
    STEP_PROGRESS.length - 1;

  const ANIM_MS = 480;


  let step = 0;

  let visualProgress =
    STEP_PROGRESS[0];

  let targetProgress =
    STEP_PROGRESS[0];

  let animFrom =
    STEP_PROGRESS[0];

  let animStart = 0;

  let rafId = null;


  /* =========================================================
     HARD SCROLL LOCK
     ========================================================= */

  let locked = false;
  let lockedScrollY = 0;

  let entered = false;
  let released = false;


  const engageLock = () => {
    if (locked) return;

    locked = true;

    lockedScrollY = window.scrollY;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    section.dataset.valueLocked = "true";
  };


  const releaseLock = () => {
    if (!locked) return;

    locked = false;

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    section.dataset.valueLocked = "false";
  };


  /* =========================================================
     CARD RENDER
     ========================================================= */

  const apply = (p) => {

    const t12 =
      smoothstep((p - 0.18) / 0.20);

    const t23 =
      smoothstep((p - 0.58) / 0.20);


    const weights = [
      1 - t12,
      t12 * (1 - t23),
      t23
    ];


    cards.forEach((card, index) => {

      const w =
        clamp01(weights[index]);


      const basis =
        20.8217 + (37.5350 * w);


      const detail =
        smoothstep((w - 0.38) / 0.34);


      /*
       * 카드가 충분히 줄어든 다음
       * sharp → blur 전환
       */
      const sharpMix =
        smoothstep((w - 0.02) / 0.10);

      const sharpOpacity =
        sharpMix;

      const blurOpacity =
        1 - sharpMix;


      const isTablet =
        window.innerWidth <= 1100;

      const isMobile =
        window.innerWidth <= 760;


      const wideLeft =
        isMobile
          ? 16
          : isTablet
            ? 26
            : 40;


      const wideRight =
        isMobile
          ? 14
          : isTablet
            ? 24
            : 34;


      const collapsedLeft =
        isMobile
          ? 16
          : 25;


      const collapsedRight =
        isMobile
          ? 14
          : 53;


      const textLeft =
        collapsedLeft +
        (wideLeft - collapsedLeft) * w;


      const textRight =
        collapsedRight +
        (wideRight - collapsedRight) * w;


      const wideCategory =
        isMobile
          ? 13
          : isTablet
            ? 16
            : 20;


      const collapsedCategory =
        isMobile
          ? 12
          : isTablet
            ? 14
            : 16;


      const categorySize =
        collapsedCategory +
        (wideCategory - collapsedCategory) * w;


      card.style.flexBasis =
        `${basis.toFixed(4)}%`;

      card.style.setProperty(
        "--weight",
        w.toFixed(4)
      );

      card.style.setProperty(
        "--text-left",
        `${textLeft.toFixed(2)}px`
      );

      card.style.setProperty(
        "--text-right",
        `${textRight.toFixed(2)}px`
      );

      card.style.setProperty(
        "--category-size",
        `${categorySize.toFixed(2)}px`
      );

      card.style.setProperty(
        "--sharp-opacity",
        sharpOpacity.toFixed(4)
      );

      card.style.setProperty(
        "--blur-opacity",
        blurOpacity.toFixed(4)
      );

      card.style.setProperty(
        "--detail-opacity",
        detail.toFixed(4)
      );

      card.style.setProperty(
        "--detail-y",
        `${((1 - detail) * 12).toFixed(2)}px`
      );
    });
  };


  /* =========================================================
     ANIMATION
     ========================================================= */

  const stopAnim = () => {

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };


  const tick = (now) => {

    const t =
      clamp01(
        (now - animStart) / ANIM_MS
      );


    visualProgress =
      animFrom +
      (targetProgress - animFrom) *
      easeOutCubic(t);


    apply(visualProgress);


    if (t < 1) {

      rafId =
        requestAnimationFrame(tick);

    } else {

      rafId = null;
      visualProgress = targetProgress;
      apply(visualProgress);
    }
  };


  const animateTo = (nextProgress) => {

    stopAnim();


    if (prefersReduced) {

      visualProgress =
        nextProgress;

      targetProgress =
        nextProgress;

      apply(nextProgress);

      return;
    }


    targetProgress =
      nextProgress;

    animFrom =
      visualProgress;

    animStart =
      performance.now();


    rafId =
      requestAnimationFrame(tick);
  };


  const goToStep = (nextStep) => {

    step =
      clamp(
        nextStep,
        0,
        LAST_STEP
      );


    animateTo(
      STEP_PROGRESS[step]
    );
  };


  /* =========================================================
     WHEEL GESTURE
     ========================================================= */

  const WHEEL_END_DELAY = 180;

  /*
   * 애니메이션 480ms보다 조금 길게.
   * 한 번의 트랙패드 관성 입력으로
   * 카드가 여러 장 넘어가지 않도록 함.
   */
  const STEP_COOLDOWN_MS = 560;


  let wheelEndTimer = null;

  let wheelGestureLocked = false;

  let stepCooldownUntil = 0;


  const startNewWheelGesture = () => {
    wheelGestureLocked = false;
  };


  const markWheelGesture = () => {

    wheelGestureLocked = true;


    if (wheelEndTimer) {
      clearTimeout(wheelEndTimer);
    }


    wheelEndTimer =
      setTimeout(
        startNewWheelGesture,
        WHEEL_END_DELAY
      );
  };


  /* =========================================================
     SECTION TOP CHECK
     ========================================================= */

  const isAtSectionTop = () => {

    if (!section.isConnected) {
      return false;
    }


    const rect =
      section.getBoundingClientRect();


    /*
     * clover-value의 top이
     * viewport 상단에 거의 붙은 상태.
     *
     * 2px 정도의 오차는 허용.
     */
    return (
      rect.top <= 2 &&
      rect.bottom > 0
    );
  };


  /* =========================================================
     ENTRY
     ========================================================= */

  let lastScrollY =
    window.scrollY;


  const checkEntry = () => {

    if (entered || released) {
      return;
    }


    const currentY =
      window.scrollY;


    const scrollingDown =
      currentY > lastScrollY;


    lastScrollY =
      currentY;


    if (!scrollingDown) {
      return;
    }


    if (!isAtSectionTop()) {
      return;
    }


    entered = true;

    step = 0;

    visualProgress =
      STEP_PROGRESS[0];

    targetProgress =
      STEP_PROGRESS[0];

    apply(visualProgress);


    /*
     * 정확히 clover-value top에 고정
     */
    const rect =
      section.getBoundingClientRect();

    const targetY =
      window.scrollY + rect.top;


    window.scrollTo({
      top: targetY,
      behavior: "instant"
    });


    /*
     * 실제 scrollY를 확정한 다음 lock
     */
    requestAnimationFrame(() => {

      lockedScrollY =
        window.scrollY;

      engageLock();
    });
  };


  /* =========================================================
     LOCKED SCROLL
     ========================================================= */

  const onScroll = () => {

    if (locked) {

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

      return;
    }


    checkEntry();
  };


  /* =========================================================
     CONSUME WHEEL
     ========================================================= */

  const consumeDelta = (delta) => {

    if (!delta) {
      return false;
    }


    const direction =
      Math.sign(delta);


    /*
     * 마지막 카드에서 아래로 내리면
     * 이번에는 value를 놓아준다.
     *
     * 다음 wheel 이벤트부터
     * 다음 section으로 자연스럽게 이동.
     */
    if (
      direction > 0 &&
      step === LAST_STEP
    ) {

      releaseLock();
      released = true;

      return false;
    }


    /*
     * 첫 카드에서 위로 올라가면
     * 이전 section으로 자연스럽게 이동.
     */
    if (
      direction < 0 &&
      step === 0
    ) {

      releaseLock();
      entered = false;

      return false;
    }


    /*
     * 같은 트랙패드 제스처 안에서는
     * 카드 하나만 움직임.
     */
    if (wheelGestureLocked) {

      markWheelGesture();

      return true;
    }


    const now =
      performance.now();


    /*
     * 직전 카드 전환 직후
     * 들어오는 관성 입력 차단
     */
    if (
      now <
      stepCooldownUntil
    ) {

      markWheelGesture();

      return true;
    }


    markWheelGesture();


    stepCooldownUntil =
      now +
      STEP_COOLDOWN_MS;


    goToStep(
      step + direction
    );


    return true;
  };


  /* =========================================================
     WHEEL
     ========================================================= */

  const onWheel = (event) => {

    /*
     * value에 진입하기 전에는
     * 브라우저 기본 스크롤을 그대로 사용.
     */
    if (!locked) {
      return;
    }


    event.preventDefault();


    let delta =
      event.deltaY;


    if (event.deltaMode === 1) {
      delta *= 16;
    }


    if (event.deltaMode === 2) {
      delta *= window.innerHeight;
    }


    consumeDelta(delta);
  };


  /* =========================================================
     TOUCH
     ========================================================= */

  let touchY = null;


  const onTouchStart = (event) => {

    if (
      !event.touches ||
      event.touches.length !== 1
    ) {
      return;
    }


    touchY =
      event.touches[0].clientY;
  };


  const onTouchMove = (event) => {

    if (
      touchY == null ||
      !event.touches ||
      event.touches.length !== 1
    ) {
      return;
    }


    if (!locked) {
      touchY =
        event.touches[0].clientY;

      return;
    }


    const nextY =
      event.touches[0].clientY;


    const delta =
      (touchY - nextY) * 2.15;


    touchY =
      nextY;


    if (
      consumeDelta(delta)
    ) {
      event.preventDefault();
    }
  };


  const onTouchEnd = () => {
    touchY = null;
  };


  /* =========================================================
     KEYBOARD
     ========================================================= */

  const onKeyDown = (event) => {

    if (!locked) {
      return;
    }


    const target =
      event.target;


    if (
      target &&
      /INPUT|TEXTAREA|SELECT|BUTTON/.test(
        target.tagName
      )
    ) {
      return;
    }


    let delta = 0;


    if (
      event.key === "ArrowDown" ||
      event.key === "PageDown" ||
      event.key === " "
    ) {
      delta = 150;
    }


    if (
      event.key === "ArrowUp" ||
      event.key === "PageUp"
    ) {
      delta = -150;
    }


    if (!delta) {
      return;
    }


    if (
      consumeDelta(delta)
    ) {
      event.preventDefault();
    }
  };


  /* =========================================================
     RESIZE
     ========================================================= */

  const onResize = () => {
    apply(visualProgress);
  };


  /* =========================================================
     INITIAL RENDER
     ========================================================= */

  apply(visualProgress);


  /* =========================================================
     EVENT
     ========================================================= */

  window.addEventListener(
    "scroll",
    onScroll,
    { passive: true }
  );


  window.addEventListener(
    "wheel",
    onWheel,
    {
      passive: false,
      capture: true
    }
  );


  window.addEventListener(
    "touchstart",
    onTouchStart,
    {
      passive: true,
      capture: true
    }
  );


  window.addEventListener(
    "touchmove",
    onTouchMove,
    {
      passive: false,
      capture: true
    }
  );


  window.addEventListener(
    "touchend",
    onTouchEnd,
    {
      passive: true,
      capture: true
    }
  );


  window.addEventListener(
    "keydown",
    onKeyDown,
    {
      capture: true
    }
  );


  window.addEventListener(
    "resize",
    onResize
  );


  /* =========================================================
     CLEANUP
     ========================================================= */

  return () => {

    if (wheelEndTimer) {
      clearTimeout(wheelEndTimer);
    }


    stopAnim();


    /*
     * 혹시 cleanup 시 lock 상태라면
     * 반드시 풀어준다.
     */
    releaseLock();


    window.removeEventListener(
      "scroll",
      onScroll
    );


    window.removeEventListener(
      "wheel",
      onWheel,
      { capture: true }
    );


    window.removeEventListener(
      "touchstart",
      onTouchStart,
      { capture: true }
    );


    window.removeEventListener(
      "touchmove",
      onTouchMove,
      { capture: true }
    );


    window.removeEventListener(
      "touchend",
      onTouchEnd,
      { capture: true }
    );


    window.removeEventListener(
      "keydown",
      onKeyDown,
      { capture: true }
    );


    window.removeEventListener(
      "resize",
      onResize
    );
  };
}


/* ===========================================================
   MOUNT
=========================================================== */

export function mountClovervalue(mountEl) {

  if (!mountEl) {
    return;
  }


  const html =
    cloverValueHtml
      .replace(
        "__V01_SHARP__",
        v01Sharp
      )
      .replace(
        "__V01_BLUR__",
        v01Blur
      )
      .replace(
        "__V02_SHARP__",
        v02Sharp
      )
      .replace(
        "__V02_BLUR__",
        v02Blur
      )
      .replace(
        "__V03_SHARP__",
        v03Sharp
      )
      .replace(
        "__V03_BLUR__",
        v03Blur
      );


  mountEl.insertAdjacentHTML(
    "beforeend",
    html
  );


  const sections =
    mountEl.querySelectorAll(
      ".clover-value:not([data-value-ready])"
    );


  sections.forEach(
    initCloverValue
  );
}