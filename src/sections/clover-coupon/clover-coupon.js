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

  const cards = [...section.querySelectorAll("[data-card]")];
  const phone = section.querySelector(".coupon-phone");

  const heading = section.querySelector(".coupon-heading");
  const desc = section.querySelector(".coupon-desc");

  const browseHeading = section.querySelector(".browse-copy h3");
  const browseDesc = section.querySelector(".browse-copy p");

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

  function fanOut() {
    cards.forEach((card) => {
      card.style.transform = `
        translateX(0)
        translateY(0)
      `;
    });
  }

  // -----------------------------
  // 쿠폰 클릭 처리
  // -----------------------------

  // 첫 번째 쿠폰을 뜯었는지
  let firstTorn = false;

  async function handleCouponClick(card) {
    // 이미 뜯은 쿠폰은 다시 클릭하지 않음
    if (card.classList.contains("torn")) return;

    // 해당 쿠폰만 뜯기
    card.classList.add("torn");

    // --------------------------------
    // 첫 번째로 뜯었을 때만
    // 휴대폰 + 선물 둘러보기 실행
    // --------------------------------
    if (!firstTorn) {
      firstTorn = true;

      // 뜯기는 애니메이션 기다림
      await wait(700);

      // 조금 더 여유
      await wait(700);

      // 휴대폰 등장
      if (phone) {
        phone.classList.add("enter");
      }

      // 휴대폰 등장 후 둘러보기
      await wait(1250);

      browseHeading.classList.add("show");

      await wait(120);

      browseDesc.classList.add("show");
    }

    // --------------------------------
    // 중요:
    // 여기서는 다른 쿠폰 클릭을 막지 않음
    // --------------------------------
  }

  // 모든 쿠폰에 개별 클릭 이벤트
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      handleCouponClick(card);
    });
  });

  // 처음에는 카드 겹쳐놓기
  stackCards();

  // -----------------------------
  // 전체 등장 시퀀스
  // -----------------------------

  async function playSequence() {
    // 1. 마음 쿠폰 제목
    heading.classList.add("show");

    await wait(120);

    // 2. 설명
    desc.classList.add("show");

    await wait(1000);

    // 3. 카드 한 덩어리로 등장
    showStack();

    await wait(750);

    // 4. 카드 펼치기
    fanOut();

    await wait(1000);

    // 5. 여기서 멈춤
    // 사용자가 원하는 쿠폰을 클릭
  }

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