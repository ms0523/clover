import "./clover-gift.css";
import cloverGiftHtml from "./clover-gift.html?raw";
import phoneFrameUrl from "../../assets/images/phone-mockup.svg";
import phoneScreenUrl from "../../assets/images/clover-gift-screen.svg";
import productUrl from "../../assets/images/clover-gift-product.png";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CARD = {
  name: "메디테디",
  desc: "가벼운 레트로 타원 볼 접시",
  price: "34,000원",
};

function cardHtml() {
  return `
    <div class="gc-card">
      <img src="${productUrl}" alt="">
      <div class="gc-card-info">
        <div class="gc-card-name">${CARD.name}</div>
        <div class="gc-card-desc">${CARD.desc}</div>
        <div class="gc-card-price">${CARD.price}</div>
        <span class="gc-card-btn">선물하기</span>
      </div>
    </div>
  `;
}

export function mountCloverGift(mountEl) {
  const html = cloverGiftHtml
    .replaceAll("__PHONE_FRAME_URL__", phoneFrameUrl)
    .replaceAll("__PHONE_SCREEN_URL__", phoneScreenUrl);

  mountEl.insertAdjacentHTML("beforeend", html);

  const section = mountEl.querySelector(".clover-gift");
  const dots = [...section.querySelectorAll(".dot")];
  const phone = section.querySelector("[data-phone]");
  const cardsViewport = section.querySelector(".gift-cards-viewport");
  const track = section.querySelector("[data-cards-track]");

  // ---------------------------------------------------------
  // 카드 생성
  // ---------------------------------------------------------

  const CARD_COUNT = 6;

  const cards = Array.from(
    { length: CARD_COUNT },
    cardHtml
  ).join("");

  // 똑같은 카드 세트를 2개 연결
  // → 두 번째 세트가 이어서 나타나기 때문에
  //   무한 루프처럼 보이게 됨
  track.innerHTML = cards + cards;


  // ---------------------------------------------------------
  // 카드 이동
  // 왼쪽 → 오른쪽
  // ---------------------------------------------------------

  const SPEED = 40;

  let x = 0;
  let rafId = null;
  let running = false;

  function initCardPosition() {
    const halfWidth = track.scrollWidth / 2;

    if (halfWidth > 0) {
      // 첫 번째 카드 세트를 왼쪽에 숨겨놓고
      // 두 번째 카드 세트를 현재 위치에 둠
      //
      // 그래서 화면에는
      // 휴대폰 오른쪽 → 카드 → 카드 → 카드
      // 형태로 보이게 됨
      x = -halfWidth;

      track.style.transform = `translate3d(${x}px, 0, 0)`;
    }
  }

  function frame(now) {
    if (!frame.last) {
      frame.last = now;
    }

    const dt = (now - frame.last) / 1000;
    frame.last = now;

    if (running) {
      // 오른쪽으로 이동
      x += SPEED * dt;

      const halfWidth = track.scrollWidth / 2;

      if (halfWidth > 0 && x >= 0) {
        // 첫 번째 세트 길이만큼 다시 왼쪽으로 보내서
        // 똑같은 위치에서 자연스럽게 반복
        x -= halfWidth;
      }

      track.style.transform = `translate3d(${x}px, 0, 0)`;
    }

    rafId = requestAnimationFrame(frame);
  }

  // 카드 위치 먼저 세팅
  initCardPosition();

  // 화면 크기가 바뀌면 위치 다시 계산
  window.addEventListener("resize", initCardPosition);

  rafId = requestAnimationFrame(frame);


  // ---------------------------------------------------------
  // 등장 애니메이션
  // ---------------------------------------------------------

  async function playSequence() {

    // 점 3개 순서대로 등장
    for (const [i, dot] of dots.entries()) {
      setTimeout(() => {
        dot.classList.add("show");
      }, i * 220);
    }

    await wait(dots.length * 220 + 250);

    // 휴대폰 등장
    phone.classList.add("enter");

    // 휴대폰이 완전히 등장할 때까지 대기
    await wait(650);

    // 카드 영역 등장
    cardsViewport.classList.add("show");

    // 카드가 나타난 후 이동 시작
    await wait(400);

    running = true;
  }


  // ---------------------------------------------------------
  // Intersection Observer
  // ---------------------------------------------------------

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playSequence();
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.4,
    }
  );

  io.observe(section);
}