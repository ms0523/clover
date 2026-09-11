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


  // 처음에는 카드 겹쳐놓기
  stackCards();

  // -----------------------------
  // 전체 등장 시퀀스
  // -----------------------------

  async function playSequence() {

  // 1. 제목 등장
  heading.classList.add("show");

  await wait(120);

  // 2. 설명 등장
  desc.classList.add("show");

  await wait(1000);

  // 3. 쿠폰 등장
  showStack();

  await wait(750);

  // 4. 쿠폰 오른쪽으로 펼쳐짐
  fanOut();

  // 중요:
  // fanOut 애니메이션이 끝난 뒤 휴대폰 등장
  await wait(750);

  // 5. 휴대폰 등장
  if (phone) {
    phone.classList.add("enter");
  }

  // 6. 휴대폰 등장 완료 후 마지막 텍스트
  await wait(850);

  browseHeading.classList.add("show");

  await wait(120);

  browseDesc.classList.add("show");
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