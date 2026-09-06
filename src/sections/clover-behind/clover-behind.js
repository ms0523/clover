import "./clover-behind.css";
import cloverBehindHtml from "./clover-behind.html?raw";
import ribbonUrl from "../../assets/images/behind-ribbon.svg";
import card1Url from "../../assets/images/behind-card1.svg";
import card2Url from "../../assets/images/behind-card2.svg";
import card3Url from "../../assets/images/behind-card3.svg";

const TYPING_TEXT = "이 선물은 클로버에서 최초로 고민하게되어..";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function typeText(el, text, speedMs) {
  return new Promise((resolve) => {
    let i = 0;
    function step() {
      if (i >= text.length) {
        resolve();
        return;
      }
      el.textContent = text.slice(0, i + 1);
      i++;
      setTimeout(step, speedMs);
    }
    step();
  });
}

export function mountCloverBehind(mountEl) {
  const html = cloverBehindHtml
    .replaceAll("__RIBBON_URL__", ribbonUrl)
    .replaceAll("__CARD1_URL__", card1Url)
    .replaceAll("__CARD2_URL__", card2Url)
    .replaceAll("__CARD3_URL__", card3Url);
  mountEl.insertAdjacentHTML("beforeend", html);

  const section = mountEl.querySelector(".gb-band");
  const cards = [...section.querySelectorAll("[data-card]")];
  const typingEl = section.querySelector("[data-typing]");

  async function playSequence() {
    // cards slide up smoothly, staggered (transition-delay handles the
    // stagger itself via the --i custom property; here we just wait long
    // enough for the LAST one to fully finish before starting the type)
    cards.forEach((card) => card.classList.add("show"));
    const lastDelay = (cards.length - 1) * 180;
    await wait(lastDelay + 600 + 200);

    await typeText(typingEl, TYPING_TEXT, 55);
    typingEl.classList.add("done");
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
    { threshold: 0.3 }
  );
  io.observe(section);
}
