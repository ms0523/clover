import "./clover-receive.css";
import cloverReceiveHtml from "./clover-receive.html?raw";
import cardUrl from "../../assets/images/receive-card.svg";
import logoUrl from "../../assets/images/receive-small-logo.svg";
import phoneFrameUrl from "../../assets/images/phone-mockup.svg";

const WORDS = ["Celebrate", "Lucky", "Thoughtful", "Cherish", "Playful"];

function unitHtml(word) {
  return `
    <span class="marquee-dash"></span>
    <span class="marquee-word">( ${word} )</span>
    <img class="marquee-logo" src="${logoUrl}" alt="CLOVER">
  `;
}

export function mountCloverReceive(mountEl) {
  const html = cloverReceiveHtml
    .replaceAll("__CARD_URL__", cardUrl)
    .replaceAll("__PHONE_FRAME_URL__", phoneFrameUrl);
  mountEl.insertAdjacentHTML("beforeend", html);

  const section = mountEl.querySelector(".receive-band");
  const track = section.querySelector("[data-marquee-track]");

  // build the sequence once, then duplicate it so the animation (which
  // slides exactly -50%) loops with no visible seam
  const sequence = WORDS.map(unitHtml).join("");
  track.innerHTML = sequence + sequence;
}
