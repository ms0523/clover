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

// The static shell (heading, featured panel) lives in ./why-hard.html.
// The wave of cards is data-driven, so it's generated here and dropped
// into the empty [data-slot="cards"] element the HTML file reserves for it.
export function mountWhyHard(mountEl) {
  mountEl.insertAdjacentHTML("beforeend", whyHardHtml);

  const track = mountEl.querySelector('[data-slot="cards"]');
  const cards = [...CARD_DATA, ...CARD_DATA]; // duplicated once for a seamless loop

  track.innerHTML = cards
    .map(
      (c, i) => `
        <div class="gift-card" style="--i:${i % CARD_DATA.length}">
          <div class="gift-card-img"></div>
          <div class="gift-card-name">${c.name}</div>
          <div class="gift-card-price">${c.price}</div>
          <div class="gift-card-reason"><span>이유</span><span>${c.reason}</span></div>
        </div>`
    )
    .join("");
}
