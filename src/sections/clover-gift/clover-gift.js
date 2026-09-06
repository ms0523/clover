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

  // enough repeats to comfortably fill wide viewports, duplicated once
  // more so the loop point is invisible
  const CARD_COUNT = 6;
  const cards = Array.from({ length: CARD_COUNT }, cardHtml).join("");
  track.innerHTML = cards + cards;

  // Drive the slide manually, frame by frame, instead of a CSS animation.
  // This guarantees the transform is ALWAYS translate3d(x, 0, 0) — the Y
  // value is never touched, so there's no way for it to drift or bob.
  const SPEED = 40; // px per second
  let x = 0;
  let rafId = null;
  let running = false;

  function frame(now) {
    if (!frame.last) frame.last = now;
    const dt = (now - frame.last) / 1000;
    frame.last = now;

    if (running) {
      x -= SPEED * dt;
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0 && -x >= halfWidth) x += halfWidth;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    }
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  async function playSequence() {
    for (const [i, dot] of dots.entries()) {
      setTimeout(() => dot.classList.add("show"), i * 220);
    }
    await wait(dots.length * 220 + 250);
    phone.classList.add("enter");

    // the cards don't exist visually at all until the phone has actually
    // landed — no floating cards before the phone shows up
    await wait(650);
    cardsViewport.classList.add("show");

    // give the fade-in a beat to actually register before it starts
    // sliding, then move
    await wait(400);
    running = true;
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
    { threshold: 0.4 }
  );
  io.observe(section);
}
