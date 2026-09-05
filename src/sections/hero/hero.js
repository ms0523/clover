import "./hero.css";
import logoUrl from "../../assets/images/clover-logo.png";
import { lerp, wait, easeFastMiddle } from "../../utils/animate.js";

// Renders the hero section into `mountEl` and wires up the tear animation.
// Usage (see src/main.js):
//   import { mountHero } from "./sections/hero/hero.js";
//   mountHero(document.querySelector("#app"));
export function mountHero(mountEl) {
  mountEl.insertAdjacentHTML("beforeend", template());

  const stage = mountEl.querySelector(".hero-stage");
  const paper = stage.querySelector(".paper");
  const track = stage.querySelector(".track");
  const scissors = stage.querySelector(".scissors");
  const openLabel = stage.querySelector(".open-label");
  const replayBtn = stage.querySelector(".replay");
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

    replayBtn.classList.toggle("hide", progress < OPEN_TARGET - 0.005);
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

  replayBtn.addEventListener("click", () => {
    glideTo(0, 900).then(() => wait(250)).then(autoPlay);
  });

  cta.addEventListener("click", (e) => e.stopPropagation());

  autoPlay();

  return { replay: () => glideTo(0, 900).then(() => wait(250)).then(autoPlay) };
}

function template() {
  return `
    <section class="hero-stage">
      <div class="reveal" aria-label="Clover hero">
        <div class="hero-line-top"></div>
        <div class="hero-line-bottom"></div>

        <nav class="hero-nav">
          <div class="brand">
            <span>Celebrate</span>
            <span class="plus">+</span>
            <span>Lovers</span>
          </div>
          <span>( Lucky )</span>
        </nav>

        <div class="hero-rule"></div>

        <img class="hero-logo" src="${logoUrl}" alt="CLOVER">

        <p class="hero-copy">
          소중한 사람에게, 더 잘 맞는 선물을 고를 수 있도록<br>
          <span class="accent">기억해둔 단서</span>를 바탕으로
          <span class="accent">선물의 방향성</span>을 함께 찾아드려요
        </p>

        <button class="hero-cta" type="button">클로버와 함께 선물하기</button>

        <div class="hero-dots" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>

      <div class="paper"></div>

      <div class="track">
        <div class="cut-line"></div>
        <div class="ahead-line"></div>
      </div>

      <span class="open-label">open</span>

      <div class="scissors">
        <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
          <line x1="14" y1="14" x2="40" y2="30" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
          <line x1="14" y1="46" x2="40" y2="30" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
          <polygon points="40,30 92,20 78,30" fill="#fff"/>
          <polygon points="40,30 92,40 78,30" fill="#fff"/>
          <circle cx="14" cy="14" r="9" fill="#fff"/>
          <circle cx="14" cy="46" r="9" fill="#fff"/>
          <circle cx="40" cy="30" r="4" fill="#fff"/>
        </svg>
      </div>

      <button class="replay hide" type="button">다시 찢기</button>
    </section>
  `;
}
