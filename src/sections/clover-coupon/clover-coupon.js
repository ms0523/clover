import "./clover-coupon.css";
import cloverCouponHtml from "./clover-coupon.html?raw";
import phoneFrameUrl from "../../assets/images/phone-mockup.png";
import screenUrl from "../../assets/images/coupon-screen.svg";
import barcodeUrl from "../../assets/images/coupon-barcode.svg";

export function mountCloverCoupon(mountEl) {
  const html = cloverCouponHtml
    .replaceAll("__PHONE_FRAME_URL__", phoneFrameUrl)
    .replaceAll("__SCREEN_URL__", screenUrl)
    .replaceAll("__BARCODE_URL__", barcodeUrl);
  mountEl.insertAdjacentHTML("beforeend", html);

  const section = mountEl.querySelector(".clover-coupon");
  const cardsWrap = section.querySelector("[data-cards]");
  const cards = [...section.querySelectorAll("[data-card]")];

  function stackCards() {
    const base = cards[0].offsetLeft;
    cards.forEach((card) => {
      const delta = card.offsetLeft - base;
      card.style.transform = `translateX(${-delta}px)`;
    });
  }

  function fanOut() {
    cards.forEach((card) => {
      card.style.transform = "translateX(0)";
    });
  }

  // measure real pixel positions once laid out, then pin every card onto
  // card 0's spot so they read as a single stacked deck
  stackCards();
  window.addEventListener("resize", () => {
    if (!cardsWrap.classList.contains("fanned")) stackCards();
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          cardsWrap.classList.add("fanned");
          fanOut();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(section);
}