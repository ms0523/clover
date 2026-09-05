// Small shared animation helpers. Any section can `import` these instead of
// redefining its own lerp/easing every time.

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// fast through the start and middle, only easing off right at the very end —
// used by the hero tear animation, but generic enough to reuse anywhere.
export function easeFastMiddle(t) {
  const cut = 0.7;
  if (t < cut) return (t / cut) * 0.88;
  const localT = (t - cut) / (1 - cut);
  return 0.88 + 0.12 * (1 - Math.pow(1 - localT, 3));
}

// runs a tween from `progress` toward `target` over `duration` ms, calling
// `onUpdate(value)` every frame. Returns a promise that resolves at the end.
export function animateValue({ from, to, duration, ease = easeFastMiddle, onUpdate }) {
  return new Promise((resolve) => {
    const start = performance.now();
    let rafId;
    function frame(now) {
      const t = clamp((now - start) / duration, 0, 1);
      onUpdate(from + (to - from) * ease(t));
      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  });
}
