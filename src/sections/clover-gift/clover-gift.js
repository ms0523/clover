import "./clover-gift.css";
import cloverGiftHtml from "./clover-gift.html?raw";
import phoneFrameUrl from "../../assets/images/phone-mockup.svg";
import phoneScreenUrl from "../../assets/images/clover-gift-screen.svg";

/* =========================================================
   상품 4종 설정
   ========================================================================
   전부 "메디테디" 하나로 반복되던 걸 상품별로 각각 이름/설명/가격/이미지를
   따로 지정할 수 있게 배열로 뺐다. 실제 상품 이미지 4장을 assets/images에
   넣고 아래 import 경로만 실제 파일명으로 바꿔서 쓰면 된다.
   상품을 4개보다 늘리거나 줄이고 싶으면 이 배열에 추가/삭제만 하면 되고,
   슬라이드는 아래 CARD_COUNT 로직이 알아서 이 배열을 순환하며 채운다.
========================================================= */

import product1Url from "../../assets/images/clover-gift-product-1.png";
import product2Url from "../../assets/images/clover-gift-product-2.png";
import product3Url from "../../assets/images/clover-gift-product-3.png";
import product4Url from "../../assets/images/clover-gift-product-4.png";

const PRODUCTS = [
  {
    name: "메디테디",
    desc: "가벼운 레트로 타원 볼 접시",
    price: "34,000원",
    img: product1Url,
  },
  {
    name: "알럽하우스",
    desc: "워터드롭 머그컵 세트",
    price: "26,900원",
    img: product2Url,
  },
  {
    name: "타블도트",
    desc: "슬로우 3단 머그 세트",
    price: "32,000원",
    img: product3Url,
  },
  {
    name: "빠다앤마가린",
    desc: "홈브런치 식기 3p",
    price: "33,400원",
    img: product4Url,
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cardHtml(product) {
  return `
    <div class="gc-card">
      <img src="${product.img}" alt="">
      <div class="gc-card-info">
        <div class="gc-card-name">${product.name}</div>
        <div class="gc-card-desc">${product.desc}</div>
        <div class="gc-card-price">${product.price}</div>
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
  section.id = "clover-gift";
  const dots = [...section.querySelectorAll(".dot")];
  const phone = section.querySelector("[data-phone]");
  const cardsViewport = section.querySelector(".gift-cards-viewport");
  const track = section.querySelector("[data-cards-track]");

  // ---------------------------------------------------------
  // 카드 생성
  // ---------------------------------------------------------

  // PRODUCTS(4개)를 2바퀴 돌려서 한 세트(8장)를 만든다. 상품 개수를
  // 늘리거나 줄여도 이 로직은 그대로 PRODUCTS.length에 맞춰 순환한다.
  const SET_REPEAT = 2;
  const CARD_COUNT = PRODUCTS.length * SET_REPEAT;

  const cards = Array.from(
    { length: CARD_COUNT },
    (_, i) => cardHtml(PRODUCTS[i % PRODUCTS.length])
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
  // ---------------------------------------------------------
  // 1. ... 점 3개 순서대로 등장
  // ---------------------------------------------------------

  for (const [i, dot] of dots.entries()) {
    setTimeout(() => {
      dot.classList.add("show");
    }, i * 220);
  }

  // 점 3개가 모두 등장할 때까지 대기
  await wait(dots.length * 220 + 250);


  // ---------------------------------------------------------
  // 2. 휴대폰 등장
  // ---------------------------------------------------------

  phone.classList.add("enter");

  // 휴대폰 뿅 애니메이션이 끝날 때까지 대기
  await wait(800);


  // ---------------------------------------------------------
  // 3. 타이포 등장
  // STEP 03 → 제목 → 설명
  // ---------------------------------------------------------

  const label = section.querySelector(".gift-label");
  const heading = section.querySelector(".gift-heading");
  const desc = section.querySelector(".gift-desc");

  // STEP 03
  label.classList.add("show");

  await wait(120);

  // 메인 타이틀
  heading.classList.add("show");

  await wait(120);

  // 설명
  desc.classList.add("show");


  // ---------------------------------------------------------
  // 4. 타이포가 충분히 보인 후 카드 viewport 등장
  // ---------------------------------------------------------

  await wait(1200);

  cardsViewport.classList.add("show");


  // ---------------------------------------------------------
  // 5. 카드가 나타난 후 슬라이드 시작
  // ---------------------------------------------------------

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