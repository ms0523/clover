import "./hero.css";
import heroHtml from "./hero.html?raw";
import logoUrl from "../../assets/images/clover-logo.png";
import { lerp, wait, easeFastMiddle } from "../../utils/animate.js";

// Renders the hero section into `mountEl` and wires up the tear animation.
// The markup itself lives in ./hero.html — this file only injects it and
// handles behaviour. Edit hero.html for structure/copy, hero.css for style,
// and this file for interaction logic.
// Usage (see src/main.js):
//   import { mountHero } from "./sections/hero/hero.js";
//   mountHero(document.querySelector("#app"));
export function mountHero(mountEl) {
  mountEl.insertAdjacentHTML("beforeend", heroHtml.replace("__LOGO_URL__", logoUrl));

  const stage = mountEl.querySelector(".hero-stage");
  const paper = stage.querySelector(".paper");
  const track = stage.querySelector(".track");
  const scissors = stage.querySelector(".scissors");
  const openLabel = stage.querySelector(".open-label");
  const cta = stage.querySelector(".hero-cta");

  let progress = 0; // 0..1 — how far the wedge's TIP has travelled
  let rafId = null;

  // the wedge spans the full height of the frame (top to bottom), and is
  // pushed in from the left as one rigid shape. REACH controls how deep
  // (and therefore how sharp) it is — bigger REACH = sharper, narrower point.
  const REACH = 62;      // % of stage width
  const OPEN_TARGET = 1; // fully tears away, revealing everything behind it

  function render(p) {
    progress = Math.min(1, Math.max(0, p));
    const tipX = lerp(-REACH, 100 + REACH, progress);
    const backX = tipX - REACH;

    paper.style.clipPath = `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%,
      ${backX}% 100%, ${tipX}% 50%, ${backX}% 0%, 0% 0%
    )`;

    const cutPct = Math.min(100, Math.max(0, tipX));
    track.style.setProperty("--cut-pct", cutPct + "%");
    scissors.style.setProperty("--cut-pct", cutPct + "%");

    openLabel.style.setProperty("--label-op", progress > 0.88 ? 0 : 1);
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

  async function autoPlay() {
    render(0);
    await wait(150);
    await glideTo(OPEN_TARGET, 2600);
  }

  cta.addEventListener("click", (e) => e.stopPropagation());

  autoPlay();

  // no visible "replay" button anymore, but the capability stays available
  // programmatically if a future section wants to trigger it again.
  return { replay: () => glideTo(0, 900).then(() => wait(250)).then(autoPlay) };
}
