import "./clover-scene.css";
import cloverSceneHtml from "./clover-scene.html?raw";
import logoUrl from "../../assets/images/hero-wordmark-white.svg";
import ribbonUrl from "../../assets/images/hero-ribbon.svg";
import card1Url from "../../assets/images/scene-card1-gift.svg";
import card2Url from "../../assets/images/scene-card2-photo.png";

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

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

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ticking = false;

  function update() {
    const rect = scene.getBoundingClientRect();
    const total = scene.offsetHeight - window.innerHeight;
    const raw = total > 0 ? -rect.top / total : 0;
    const progress = reduceMotion ? 1 : clamp(raw);

    const SPLIT = 0.45;
    const HIDE_Y = window.innerHeight / 2 + 380; 

    const p1 = easeOutCubic(clamp(progress / SPLIT));
    const vw = window.innerWidth,
      vh = window.innerHeight,
      cx = vw / 2;
    glowSvg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
    // a plain rectangle (not a trapezoid) — same half-width top and
    // bottom — that grows upward from a thin strip at the bottom to
    // fill the screen. A touch wider than the viewport itself so the
    // heavy blur below doesn't fade the visible edges before they
    // reach the true left/right edge of the screen.
    const halfW = vw * 0.58;
    const topY = lerp(vh * 0.82, vh * -0.35, p1);
    glowPoly.setAttribute(
      "points",
      `${cx - halfW},${vh} ${cx + halfW},${vh} ${cx + halfW},${topY} ${cx - halfW},${topY}`
    );

    glowPoly.setAttribute("opacity", clamp(p1 / 0.2).toFixed(2));

    glowBlurAmount.setAttribute("stdDeviation", clamp(vw * 0.09, 45, 130));

    const headlineT = clamp((p1 - 0.15) / 0.85);
    headline.style.opacity = headlineT;
    headline.style.transform = `translateY(${lerp(24, 0, headlineT)}px)`;
  
    kickerEl.style.filter = `blur(${lerp(0, 3, p1).toFixed(2)}px)`;

    const p2 = clamp((progress - SPLIT) / (1 - SPLIT));
    const ROTATE_FROM = 180;
    const fromRotateZ = [-6, 5, -4];

    const STAGGER = 0.12;
    const SPAN = 0.82;
    const RISE_END = 0.35;
    const HOLD_END = 0.55;

    cards.forEach((card, i) => {
      if (!card) return;
      const start = i * STAGGER;
      const u = clamp((p2 - start) / SPAN);

      const riseT = easeOutCubic(clamp(u / RISE_END));
      const flipT = easeOutCubic(clamp((u - HOLD_END) / (1 - HOLD_END)));

      card.style.transform =
        `perspective(1000px) translateY(${lerp(HIDE_Y, 0, riseT)}px) ` +
        `rotateY(${lerp(ROTATE_FROM, 0, flipT)}deg) rotateZ(${lerp(fromRotateZ[i], 0, riseT)}deg) ` +
        `scale(${lerp(0.9, 1, riseT)})`;
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}