import "./why-hard.css";
import whyHardHtml from "./why-hard.html?raw";

const CARD_DATA = [
  { name: "겨울 장갑", price: "₩29,500", reason: "겨울에는 손이 시리니까" },
  { name: "핸드크림", price: "₩18,000", reason: "매일 손을 씻으니까" },
  { name: "무릎담요", price: "₩32,000", reason: "재택할 때 춥다고 했으니까" },
  { name: "텀블러", price: "₩24,900", reason: "카페인 없인 못 사니까" },
  { name: "니트 목도리", price: "₩41,000", reason: "목이 허전하다고 했으니까" },
  { name: "손난로", price: "₩15,500", reason: "출퇴근길이 춥다고 했으니까" },
];

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const applyReveal = (element, progress) => {
  if (!element) return;

  const p = clamp01(progress);
  element.style.opacity = p.toFixed(3);
  element.style.transform = `translateY(${(-26 * (1 - p)).toFixed(1)}px)`;
};

export function mountWhyHard(mountEl) {
  mountEl.insertAdjacentHTML("beforeend", whyHardHtml);

  const section = mountEl.querySelector(".why-hard:last-of-type");
  if (!section) return;

  const track = section.querySelector('[data-slot="cards"]');
  const thoughtLeft = section.querySelector('[data-thought="left"]');
  const thoughtRight = section.querySelector('[data-thought="right"]');

  if (track) {
    const cards = [...CARD_DATA, ...CARD_DATA];

    track.innerHTML = cards
      .map(
        (card, index) => `
          <div class="gift-card" style="--i:${index % CARD_DATA.length}">
            <div class="gift-card-img"></div>
            <div class="gift-card-name">${card.name}</div>
            <div class="gift-card-price">${card.price}</div>
            <div class="gift-card-reason">
              <span>이유</span>
              <span>${card.reason}</span>
            </div>
          </div>
        `
      )
      .join("");
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const updateThoughts = () => {
    if (prefersReducedMotion.matches) {
      applyReveal(thoughtLeft, 1);
      applyReveal(thoughtRight, 1);
      return;
    }

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const entered = viewportHeight - rect.top;

    const leftProgress =
      (entered - viewportHeight * 0.1) / (viewportHeight * 0.42);
    const rightProgress =
      (entered - viewportHeight * 0.3) / (viewportHeight * 0.48);

    applyReveal(thoughtLeft, leftProgress);
    applyReveal(thoughtRight, rightProgress);
  };

  let rafId = 0;

  const requestThoughtUpdate = () => {
    if (rafId) return;

    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      updateThoughts();
    });
  };

  window.addEventListener("scroll", requestThoughtUpdate, { passive: true });
  window.addEventListener("resize", requestThoughtUpdate);
  prefersReducedMotion.addEventListener?.("change", requestThoughtUpdate);

  updateThoughts();
}
