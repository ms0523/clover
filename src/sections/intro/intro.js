import "./intro.css";
import introHtml from "./intro.html?raw";
import dotsUrl from "../../assets/images/intro-dots.png";
import photosUrl from "../../assets/images/intro-photos.png";

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

// Reveals `chars` one at a time (adds .typed, which flips ghost -> real
// color via CSS), moving the cursor to sit right after whichever character
// was just typed — this stays correct across the manual line break since
// it's real DOM position, not a geometric clip.
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

export function mountIntro(mountEl) {
  const html = introHtml
    .replaceAll("__DOTS_URL__", dotsUrl)
    .replaceAll("__PHOTOS_URL__", photosUrl);

  mountEl.insertAdjacentHTML("beforeend", html);

  const section = mountEl.querySelector(".intro");
  const main = buildGhostText(section.querySelector('[data-type="main"]'), MAIN_SEGMENTS);

  async function playTyping() {
    await typeChars(main, 30);
  }

  // photos are picked up by the single global observeReveals() call in
  // main.js, once every section has been mounted.

  // typing only plays once, the moment the section actually enters view
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playTyping();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );
  io.observe(section);
}
