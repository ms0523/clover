import "./clover-scene.css";
import cloverSceneHtml from "./clover-scene.html?raw";
import logoUrl from "../../assets/images/hero-wordmark-white.svg";
import ribbonUrl from "../../assets/images/hero-ribbon.svg";
import card1Url from "../../assets/images/scene-card1-gift.svg";
import card2Url from "../../assets/images/scene-card2-photo.svg";

const clamp = (v, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

const lerp = (a, b, t) =>
  a + (b - a) * t;

const easeOutCubic = (t) =>
  1 - Math.pow(1 - t, 3);

export function mountCloverScene(mountEl) {
  const html = cloverSceneHtml
    .replaceAll("__LOGO_URL__", logoUrl)
    .replaceAll("__RIBBON_URL__", ribbonUrl)
    .replaceAll("__CARD1_URL__", card1Url)
    .replaceAll("__CARD2_URL__", card2Url);

  mountEl.insertAdjacentHTML("beforeend", html);

  const scene = mountEl.querySelector(".clover-scene");
  const glowPoly = mountEl.querySelector("#sceneGlowPoly");
  const glowBlurAmount = mountEl.querySelector("#sceneGlowBlurAmount");
  const glowSvg = mountEl.querySelector(".scene-bg-glow");
  const headline = mountEl.querySelector(".scene-headline");
  const kickerEl = mountEl.querySelector(".scene-kicker");

  const cards = [
    mountEl.querySelector("#sceneCard0"),
    mountEl.querySelector("#sceneCard1"),
    mountEl.querySelector("#sceneCard2"),
  ];

  if (!scene) return;

  const reduceMotion = window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  let ticking = false;

  function update() {
    const rect = scene.getBoundingClientRect();
    const total = scene.offsetHeight - window.innerHeight;

    // section이 화면에 들어오기 시작하는 지점
    const startOffset = window.innerHeight * 0.3;

    const raw =
      total > 0
        ? (startOffset - rect.top) / (total + startOffset)
        : 0;

    const progress = reduceMotion ? 1 : clamp(raw);

    /* =========================================================
       BACKGROUND
    ========================================================= */

    const SPLIT = 0.38;

    const HIDE_Y =
      window.innerHeight / 2 + 380;

    const p1 = easeOutCubic(
      clamp(progress / SPLIT)
    );

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = vw / 2;

    glowSvg.setAttribute(
      "viewBox",
      `0 0 ${vw} ${vh}`
    );

    const halfW = vw * 0.58;

    const topY = lerp(
      vh * 0.82,
      vh * 0.25,
      p1
    );

    glowPoly.setAttribute(
      "points",
      `${cx - halfW},${vh} ` +
      `${cx + halfW},${vh} ` +
      `${cx + halfW},${topY} ` +
      `${cx - halfW},${topY}`
    );

    glowPoly.setAttribute(
      "opacity",
      clamp(p1 / 0.6).toFixed(2)
    );

    glowBlurAmount.setAttribute(
      "stdDeviation",
      clamp(vw * 0.09, 45, 130)
    );

    /* =========================================================
       HEADLINE
    ========================================================= */

    const headlineT = clamp(
      (p1 - 0.15) / 0.85
    );

    headline.style.opacity = headlineT;

    headline.style.transform =
      `translateY(${lerp(
        24,
        0,
        headlineT
      )}px)`;

    /* =========================================================
       KICKER BLUR
    ========================================================= */

    kickerEl.style.filter =
      `blur(${lerp(
        0,
        1,
        p1
      ).toFixed(2)}px)`;


    /* =========================================================
       CARD ANIMATION
    ========================================================= */

    const p2 = clamp(
      (progress - SPLIT) / (1 - SPLIT)
    );

    const ROTATE_FROM = 180;

    const fromRotateZ = [
      -6,
      5,
      -4
    ];


    /*
     * 카드가 하나씩 올라오는 간격
     *
     * 기존 0.12
     * → 0.10
     *
     * 너무 벌어지지 않으면서 자연스럽게 순차 등장
     */
    const STAGGER = 0.10;


    /*
     * 카드가 올라오는 전체 속도
     *
     * 기존 SPAN 0.82 / RISE_END 0.35
     * 에서는 실제 rise 구간이 너무 짧았음.
     *
     * 이제 각 카드가 올라오는 시간을 늘려서
     * 조금 더 천천히 올라오게 함.
     */
    const RISE_DURATION = 0.48;


    /*
     * 마지막 카드까지 올라오는 시간을 계산하면
     *
     * card 0 : 0    + 0.48 = 0.48
     * card 1 : 0.10 + 0.48 = 0.58
     * card 2 : 0.20 + 0.48 = 0.68
     *
     * 따라서 p2 약 0.68 지점에서
     * 세 카드가 모두 도착.
     */


    /*
     * 모든 카드가 도착한 뒤 잠깐 멈추는 구간.
     *
     * 0.68에서 도착
     * 0.76부터 첫 번째 카드 플립 시작
     *
     * → 약 0.08만큼 뒷면 상태 유지
     */
    const FLIP_START = 0.76;


    /*
     * 플립도 너무 급하게 돌아가지 않도록
     * 마지막 구간에서 충분한 시간을 사용.
     */
    const FLIP_STAGGER = 0.08;


    /*
     * 카드마다 플립이 순차적으로 진행되도록 함.
     *
     * 첫 번째
     * → 두 번째
     * → 세 번째
     *
     * 하지만 중요한 점은
     * 세 카드가 모두 올라온 다음에야
     * 첫 번째 플립이 시작된다는 것.
     */

    cards.forEach((card, i) => {
      if (!card) return;

      /* -----------------------------------------
         1. 카드 등장 위치
      ----------------------------------------- */

      const start = i * STAGGER;

      const riseProgress =
        clamp(
          (p2 - start) / RISE_DURATION
        );

      const riseT =
        easeOutCubic(riseProgress);


      /* -----------------------------------------
         2. 플립 시작 시점
      ----------------------------------------- */

      const cardFlipStart =
        FLIP_START + i * FLIP_STAGGER;

      const flipProgress =
        clamp(
          (p2 - cardFlipStart) /
          (1 - cardFlipStart)
        );

      const flipT =
        easeOutCubic(flipProgress);


      /* -----------------------------------------
         3. 카드 움직임
      ----------------------------------------- */

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

      const rotateY =
        lerp(
          ROTATE_FROM,
          0,
          flipT
        );

      const scale =
        lerp(
          0.9,
          1,
          riseT
        );


      card.style.transform =
        `perspective(1000px) ` +
        `translateY(${translateY}px) ` +
        `rotateY(${rotateY}deg) ` +
        `rotateZ(${rotateZ}deg) ` +
        `scale(${scale})`;
    });


    /* =========================================================
       KICKER SECOND BLUR
    ========================================================= */

    /*
     * 카드가 올라오고
     * 플립이 시작되는 시점부터
     * kicker를 조금 더 흐리게 처리.
     */

    const kickerBlurT =
      clamp(
        (p2 - FLIP_START) /
        (1 - FLIP_START)
      );

    kickerEl.style.filter =
      `blur(${lerp(
        0,
        2,
        kickerBlurT
      ).toFixed(2)}px)`;


    ticking = false;
  }


  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }


  window.addEventListener(
    "scroll",
    onScroll,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    onScroll
  );

  update();
}