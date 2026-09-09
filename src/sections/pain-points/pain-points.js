import "./pain-points.css";
import painPointsHtml from "./pain-points.html?raw";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function initPainPoints(section) {
  if (!section || section.dataset.painPointsReady === "true") return () => {};
  section.dataset.painPointsReady = "true";

  const points = [...section.querySelectorAll("[data-point]")];
  const cardParts = [...section.querySelectorAll("[data-card-part]")];
  const statement = section.querySelector(".pain-points-statement");

  if (points.length !== 3 || cardParts.length !== 3 || !statement) return () => {};

  // 전체 스크롤 체감 속도는 유지하면서, 실제 화면은 목표 진행도를 부드럽게 따라갑니다.
  const SCROLL_BUDGET = 4200;
  const MAX_WHEEL_DELTA = 150;
  const FOLLOW_SPEED = 6.2; // 카드/문장 전환의 기존 부드러움은 유지합니다.
  const STATEMENT_FOLLOW_SPEED = 1.5; // 결론 문장은 약 2초에 걸쳐 천천히 따라옵니다.

  let targetProgress = clamp(Number(section.dataset.progress || 0), 0, 1);
  let visualProgress = targetProgress;
  let statementVisual = easeInOutCubic(clamp((visualProgress - 0.755) / 0.205, 0, 1));
  let touchY = null;
  let rafId = 0;
  let lastFrame = performance.now();

  const focusWeights = (p) => {
    // 앞 74%에서 취향 → 가격 → 마음 전달을 서로 겹치듯 전환합니다.
    const stepProgress = clamp(p / 0.74, 0, 1);
    const position = stepProgress * 2;
    const left = Math.floor(position);
    const rawFrac = position - left;
    const frac = easeInOutCubic(rawFrac);
    const weights = [0, 0, 0];

    if (left >= 2) {
      weights[2] = 1;
    } else {
      weights[left] = 1 - frac;
      weights[left + 1] = frac;
    }

    return weights;
  };

  const render = (progressValue, statementValue = statementVisual) => {
    const p = clamp(progressValue, 0, 1);
    section.dataset.progress = p.toFixed(4);

    const weights = focusWeights(p);
    const dominant = weights.indexOf(Math.max(...weights));
    section.dataset.step = String(dominant);

    points.forEach((point, index) => {
      const w = easeInOutCubic(weights[index]);
      point.classList.toggle("is-focus", index === dominant);
      point.style.opacity = mix(0.34, 1, w).toFixed(4);
      point.style.transform = `translate3d(${mix(0, 9, w).toFixed(2)}px, 0, 0) scale(${mix(1, 1.045, w).toFixed(4)})`;
    });

    cardParts.forEach((part, index) => {
      const w = easeInOutCubic(weights[index]);
      part.classList.toggle("is-focus", index === dominant);
      part.style.opacity = mix(0.38, 1, w).toFixed(4);
      part.style.transform = `translate3d(0, ${mix(7, 0, w).toFixed(2)}px, 0) scale(${mix(0.982, 1, w).toFixed(4)})`;
    });

    // 결론 문장은 별도 감쇠값으로 천천히 올라오며 등장합니다.
    const statementAmount = clamp(statementValue, 0, 1);
    statement.style.opacity = statementAmount.toFixed(4);
    statement.style.transform = `translate3d(0, ${mix(30, 0, statementAmount).toFixed(2)}px, 0)`;
  };

  const animate = (now) => {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    // 카드/문장 전환은 기존 감쇠를 유지합니다.
    const follow = 1 - Math.exp(-FOLLOW_SPEED * dt);
    visualProgress += (targetProgress - visualProgress) * follow;

    if (Math.abs(targetProgress - visualProgress) < 0.00015) {
      visualProgress = targetProgress;
    }

    // 결론 문장만 한 단계 더 느리게 따라오게 해서 약 2초 정도의 부드러운 페이드/상승을 만듭니다.
    const statementTarget = easeInOutCubic(
      clamp((visualProgress - 0.755) / 0.205, 0, 1)
    );
    const statementFollow = 1 - Math.exp(-STATEMENT_FOLLOW_SPEED * dt);
    statementVisual += (statementTarget - statementVisual) * statementFollow;

    if (Math.abs(statementTarget - statementVisual) < 0.00015) {
      statementVisual = statementTarget;
    }

    render(visualProgress, statementVisual);

    const progressMoving = Math.abs(targetProgress - visualProgress) >= 0.00015;
    const statementMoving = Math.abs(statementTarget - statementVisual) >= 0.00015;

    if (progressMoving || statementMoving) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = 0;
    }
  };

  const requestAnimation = () => {
    if (rafId) return;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(animate);
  };

  const isSectionInControlZone = () => {
    if (!section.isConnected) return false;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
    const ratio = visible / Math.max(1, Math.min(vh, rect.height));
    const spansCenter = rect.top <= vh * 0.42 && rect.bottom >= vh * 0.58;

    return ratio >= 0.55 && spansCenter;
  };

  const consumeDelta = (delta) => {
    if (!delta) return false;

    const limitedDelta = clamp(delta, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA);
    const direction = Math.sign(limitedDelta);

    // 끝에 도착했더라도 화면 모션이 아직 따라오는 중이면 다음 페이지로 바로 넘기지 않습니다.
    if (direction > 0 && targetProgress >= 0.999 && visualProgress >= 0.992) return false;
    if (direction < 0 && targetProgress <= 0.001 && visualProgress <= 0.008) return false;

    targetProgress = clamp(targetProgress + limitedDelta / SCROLL_BUDGET, 0, 1);
    requestAnimation();
    return true;
  };

  const onWheel = (event) => {
    if (!isSectionInControlZone()) return;

    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    if (event.deltaMode === 2) delta *= window.innerHeight;

    if (consumeDelta(delta)) event.preventDefault();
  };

  const onTouchStart = (event) => {
    if (!event.touches || event.touches.length !== 1) return;
    touchY = event.touches[0].clientY;
  };

  const onTouchMove = (event) => {
    if (touchY == null || !event.touches || event.touches.length !== 1) return;
    if (!isSectionInControlZone()) {
      touchY = event.touches[0].clientY;
      return;
    }

    const nextY = event.touches[0].clientY;
    const delta = (touchY - nextY) * 2.15;
    touchY = nextY;

    if (consumeDelta(delta)) event.preventDefault();
  };

  const onTouchEnd = () => {
    touchY = null;
  };

  const onKeyDown = (event) => {
    if (!isSectionInControlZone()) return;
    const target = event.target;
    if (target && /INPUT|TEXTAREA|SELECT|BUTTON/.test(target.tagName)) return;

    let delta = 0;
    if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") delta = 150;
    if (event.key === "ArrowUp" || event.key === "PageUp") delta = -150;
    if (!delta) return;

    if (consumeDelta(delta)) event.preventDefault();
  };

  const onResize = () => render(visualProgress, statementVisual);

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.addEventListener("resize", onResize);

  render(visualProgress, statementVisual);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("wheel", onWheel, { capture: true });
    window.removeEventListener("touchstart", onTouchStart, { capture: true });
    window.removeEventListener("touchmove", onTouchMove, { capture: true });
    window.removeEventListener("touchend", onTouchEnd, { capture: true });
    window.removeEventListener("keydown", onKeyDown, { capture: true });
    window.removeEventListener("resize", onResize);
  };
}

export function mountPainPoints(mountEl) {
  if (typeof window.__cloverPainPointsCleanup === "function") {
    window.__cloverPainPointsCleanup();
    window.__cloverPainPointsCleanup = null;
  }

  mountEl
    .querySelectorAll(".pain-points, .gift-pain")
    .forEach((node) => node.remove());

  mountEl.insertAdjacentHTML("beforeend", painPointsHtml);

  const section = mountEl.querySelector(".pain-points:last-of-type");
  window.__cloverPainPointsCleanup = initPainPoints(section);
}
