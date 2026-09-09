import "./clover-coupon.css";
import cloverCouponHtml from "./clover-coupon.html?raw";
import phoneFrameUrl from "../../assets/images/phone-mockup.svg";
import screenUrl from "../../assets/images/coupon-screen.svg";
import barcodeUrl from "../../assets/images/coupon-barcode.svg";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mountCloverCoupon(mountEl) {
  const html = cloverCouponHtml
    .replaceAll("__PHONE_FRAME_URL__", phoneFrameUrl)
    .replaceAll("__SCREEN_URL__", screenUrl)
    .replaceAll("__BARCODE_URL__", barcodeUrl);

  mountEl.insertAdjacentHTML("beforeend", html);

  const section = mountEl.querySelector(".clover-coupon");

  const cardsWrap = section.querySelector("[data-cards]");
  const cards = [...section.querySelectorAll("[data-card]")];

  const phone = section.querySelector(".coupon-phone");

  // 마음 쿠폰 텍스트
  const heading = section.querySelector(".coupon-heading");
  const desc = section.querySelector(".coupon-desc");

  // 선물 둘러보기 텍스트
  const browseHeading = section.querySelector(".browse-copy h3");
  const browseDesc = section.querySelector(".browse-copy p");


  // =========================================================
  // 1. 쿠폰 3장을 처음에 한 곳에 겹쳐놓기
  // =========================================================

  function stackCards() {
    const base = cards[0].offsetLeft;

    cards.forEach((card) => {
      const delta = card.offsetLeft - base;

      card.style.opacity = "0";

      card.style.transform = `
        translateX(${-delta}px)
        translateY(80px)
      `;
    });
  }


  // =========================================================
  // 2. 겹쳐진 쿠폰이 아래 → 위로 등장
  // =========================================================

  function showStack() {
    const base = cards[0].offsetLeft;

    cards.forEach((card) => {
      const delta = card.offsetLeft - base;

      card.style.opacity = "1";

      card.style.transform = `
        translateX(${-delta}px)
        translateY(0)
      `;
    });
  }


  // =========================================================
  // 3. 쿠폰을 왼쪽 → 오른쪽으로 펼치기
  // =========================================================

  function fanOut() {
    cards.forEach((card) => {
      card.style.transform = `
        translateX(0)
        translateY(0)
      `;
    });
  }


  // =========================================================
  // 4. 펼쳐진 쿠폰의 아래쪽을
  //    왼쪽 → 가운데 → 오른쪽 순서로 뜯기
  // =========================================================

  async function tearCards() {
    // 펼쳐진 상태 잠깐 유지
    await wait(900);

    // 왼쪽 → 가운데 → 오른쪽
    for (const card of cards) {
      card.classList.add("torn");

      await wait(220);
    }

    // 마지막 카드 뜯긴 뒤 잠깐 유지
    await wait(500);
  }


  // =========================================================
  // 처음에는 반드시 쿠폰을 겹쳐놓음
  // =========================================================

  stackCards();


  // =========================================================
  // 전체 애니메이션 순서
  // =========================================================

  async function playSequence() {

  // 1. 마음 쿠폰 텍스트
  heading.classList.add("show");

  await wait(120);

  desc.classList.add("show");

  await wait(1000);


  // 2. 쿠폰 3장 겹쳐서 등장
  showStack();

  await wait(750);


  // 3. 왼쪽 → 오른쪽 스프레드
  fanOut();

  await wait(1000);


  // 4. 쿠폰 하단 뜯기
  await tearCards();


  // 5. ★ 모든 쿠폰이 뜯긴 뒤 휴대폰 등장
  if (phone) {
    phone.classList.add("enter");
  }

  // 휴대폰 애니메이션
  await wait(1250);


  // 6. 선물 둘러보기
  browseHeading.classList.add("show");

  await wait(120);

  browseDesc.classList.add("show");
}


  // =========================================================
  // Intersection Observer
  // =========================================================

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