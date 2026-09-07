import "./intro.css";
import introHtml from "./intro.html?raw";
import clueBoardDotsUrl from "../../assets/images/clue-board-dots.png";
import phoneUrl from "../../assets/images/phone-mockup.svg";
import blueUrl from "../../assets/images/blue-sticky.png";
import flowerUrl from "../../assets/images/intro-image-1.png";
import picnicUrl from "../../assets/images/intro-image-2.png";
import pinkUrl from "../../assets/images/pink-sticky.png";

const MAIN_SEGMENTS = [
  { text: "먼저, ", cls: "ink" },
  { text: "선물받을 사람", cls: "accent" },
  { text: "을 ", cls: "ink" },
  { text: "\n", cls: "br" },
  { text: "떠올리는 것부터 시작합니다.", cls: "ink" },
];

function buildGhostText(el, segments) {
  el.innerHTML = "";
  segments.forEach(({ text, cls }) => {
    if (text === "\n") {
      el.appendChild(document.createElement("br"));
      return;
    }
    [...text].forEach((ch) => {
      const span = document.createElement("span");
      span.className = `type-ch ${cls}`;
      span.textContent = ch;
      el.appendChild(span);
    });
  });
  const cursor = document.createElement("span");
  cursor.className = "type-cursor";
  cursor.style.visibility = "hidden";
  el.appendChild(cursor);
  return { chars: [...el.querySelectorAll(".type-ch")], cursor };
}

function typeChars({ chars, cursor }, speedMs) {
  return new Promise((resolve) => {
    cursor.style.visibility = "visible";
    let i = 0;
    function step() {
      if (i >= chars.length) {
        resolve();
        return;
      }
      chars[i].classList.add("typed");
      chars[i].after(cursor);
      i++;
      setTimeout(step, speedMs);
    }
    step();
  });
}

function landPhotos(els, staggerMs = 130) {
  els.forEach((el, i) => {
    setTimeout(() => el.classList.add("landed"), i * staggerMs);
  });
}

// Measures where each photo ACTUALLY is on screen right now (wherever the
// person has scrolled to) and where the phone board actually is, then
// flies it there. Same element the whole time — nothing is swapped in or
// out — so there's no "jump", just this element moving.
function flyIntoPhone(pairs, targetEl, { flightMs = 550, noteDelayRatio = 0.82, staggerMs = 220 } = {}) {
  const targetRect = targetEl.getBoundingClientRect();
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  pairs.forEach(({ photo, note }, i) => {
    setTimeout(() => {
      const r = photo.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      photo.style.setProperty("--fx", `${targetCenterX - cx}px`);
      photo.style.setProperty("--fy", `${targetCenterY - cy}px`);
      photo.classList.add("flying");
      setTimeout(() => note.classList.add("landed"), flightMs * noteDelayRatio);
    }, i * staggerMs);
  });
}

export function mountIntro(mountEl) {
  const html = introHtml
    .replaceAll("__CLUEBOARD_DOTS_URL__", clueBoardDotsUrl)
    .replaceAll("__PHONE_URL__", phoneUrl)
    .replaceAll("__BLUE_URL__", blueUrl)
    .replaceAll("__FLOWER_URL__", flowerUrl)
    .replaceAll("__PICNIC_URL__", picnicUrl)
    .replaceAll("__PINK_URL__", pinkUrl);

  mountEl.insertAdjacentHTML("beforeend", html);

  const section = mountEl.querySelector(".intro");
  const copy = section.querySelector("[data-copy]");
  const phoneBoard = section.querySelector("[data-phone-board]");
  const main = buildGhostText(section.querySelector('[data-type="main"]'), MAIN_SEGMENTS);

  const photos = [...section.querySelectorAll("[data-photo]")];
  const pairs = photos.map((photo) => ({
    photo,
    note: section.querySelector(`[data-note="${photo.dataset.photoKey}"]`),
  }));

  // 1) typing plays once, when the heading scrolls into view
  const typeIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeChars(main, 30).then(() => landPhotos(photos));
          typeIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  typeIO.observe(copy);

  // 2) the fly-into-phone plays once, independently, whenever the phone
  // itself scrolls into view — completely separate scroll trigger, not
  // tied to a timer or to the typing sequence at all.
  const flyIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          flyIntoPhone(pairs, phoneBoard);
          flyIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );
  flyIO.observe(phoneBoard);
}
