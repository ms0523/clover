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

  let progress = 0;
  let rafId = null;
  let dragging = false;
  let opened = false;
  let nudgeActive = true;

  const REACH = 62;
  const OPEN_TARGET = 1;
  const OPEN_THRESHOLD = 0.92;

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
    scissors.style.setProperty("--cut-pct", cutPct + "%");   // 추가

    openLabel.style.setProperty("--label-op", progress > 0.88 ? 0 : 1);
    dragHint.style.setProperty("--hint-op", progress > 0.04 ? 0 : 1);
    scissors.style.opacity = cutPct >= 100 ? 0 : 1;           // 추가: 다 열리면 가위도 사라짐
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
      await glideTo(0.05, 550);
      if (!nudgeActive || dragging || opened) break;
      await glideTo(0, 550);
      if (!nudgeActive || dragging || opened) break;
      await wait(900);
    }
  }

  function stopNudge() {
    nudgeActive = false;
    cancelAnimationFrame(rafId);
  }

  // 화면 0~100%를 진행률 0~1로 그대로 매핑 (버그 수정 지점)
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
    render(progressFromClientX(e.clientX)); // 클릭 지점부터 바로 반응
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
      glideTo(OPEN_TARGET, 320);
    } else {
      glideTo(0, 260).then(() => {
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
    render(0);
    await wait(400);
    nudgeLoop();
  }

  intro();

  return {
    replay: () => {
      opened = false;
      stopNudge();
      return glideTo(0, 500).then(() => {
        nudgeActive = true;
        intro();
      });
    },
  };
}