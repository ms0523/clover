import "./clover-ai.css";
import cloverAiHtml from "./clover-ai.html?raw";
import bgUrl from "../../assets/images/clover-ai-bg.png";
import badgeUrl from "../../assets/images/clobunny-badge.png";
import phoneFrameUrl from "../../assets/images/phone-mockup.svg";
import phoneScreenUrl from "../../assets/images/clover-ai-phone-screen.svg";

const GAP = 10; // px kept clear at both ends so the line never touches the pin/dot

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Where a line should actually touch an element: for a keyword it's the
// little pin icon beside the text (see [data-target].kw-red::before in the
// CSS) — NOT the text's own centre, so the line runs past the word rather
// than straight through it; for the phone it's near its top-left corner.
function anchorOf(el, containerRect) {
  const r = el.getBoundingClientRect();
  if (el.hasAttribute("data-phone")) {
    return {
      x: r.left - containerRect.left,
      y: r.top + r.height * 0.25 - containerRect.top,
    };
  }
  // keyword: anchor at the little pin icon, ~14px to the left of the text
  return {
    x: r.left - 14 - containerRect.left,
    y: r.top + r.height / 2 - containerRect.top,
  };
}

// Draws one connector line between two anchor points, inset by GAP on both
// ends so it never touches the pin or the little dot — then animates it in
// with a quick snap (the "당구공 탁탁" beat).
function connect(fromEl, toEl, container) {
  const containerRect = container.getBoundingClientRect();
  const a = anchorOf(fromEl, containerRect);
  const b = anchorOf(toEl, containerRect);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const fullLength = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const ux = dx / fullLength;
  const uy = dy / fullLength;

  const x1 = a.x + ux * GAP;
  const y1 = a.y + uy * GAP;
  const length = Math.max(0, fullLength - GAP * 2);

  const line = document.createElement("div");
  line.className = "net-line";
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;
  line.style.width = `${length}px`;
  line.style.transform = `rotate(${angle}deg) scaleX(0)`;
  container.appendChild(line);

  void line.offsetWidth; // force layout so the transition plays from scaleX(0)
  requestAnimationFrame(() => {
    line.style.transform = `rotate(${angle}deg) scaleX(1)`;
    line.classList.add("drawn");
  });

  return line;
}

export function mountCloverAi(mountEl) {
  const html = cloverAiHtml
    .replaceAll("__BG_URL__", bgUrl)
    .replaceAll("__BADGE_URL__", badgeUrl)
    .replaceAll("__PHONE_FRAME_URL__", phoneFrameUrl)
    .replaceAll("__PHONE_SCREEN_URL__", phoneScreenUrl);

  mountEl.insertAdjacentHTML("beforeend", html);

  const section = mountEl.querySelector(".clover-ai");
  const network = section.querySelector("[data-network]");
  const phone = section.querySelector("[data-phone]");

  // every sharp keyword fades/sharpens in (including decorative ones with
  // no line, like "요리") — but only the ones with data-target join the
  // chain. The chain now starts AT the first keyword (독서) — there's no
  // separate standalone "origin" pin anymore.
  const allSharp = [...section.querySelectorAll(".kw-red")];
  const chain = [...section.querySelectorAll("[data-target]")].sort(
    (a, b) => Number(a.dataset.node) - Number(b.dataset.node)
  );

  async function playSequence() {
    // 1) keywords sharpen + rise, staggered
    for (const [i, el] of allSharp.entries()) {
      setTimeout(() => el.classList.add("revealed"), i * 140);
    }
    await wait(allSharp.length * 140 + 350);

    // 2) the path snaps together one link at a time: 독서→빈티지→아이보리,
    // only 3 pins / 2 movements total before reaching the phone
    for (let i = 0; i < chain.length - 1; i++) {
      connect(chain[i], chain[i + 1], network);
      await wait(180);
    }
    await wait(200);

    // 3) the last link continues from the final keyword to the phone, then
    // the phone pops in with a bounce + glow the instant it "arrives"
    connect(chain[chain.length - 1], phone, network);
    await wait(180);
    phone.classList.add("enter");
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
