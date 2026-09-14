import "./clover-ai.css";
import cloverAiHtml from "./clover-ai.html?raw";
import bgUrl from "../../assets/images/clover-ai-bg.png";
import badgeUrl from "../../assets/images/clobunny-badge.png";
import phoneFrameUrl from "../../assets/images/phone-mockup.svg";
import phoneScreenUrl from "../../assets/images/clover-ai-phone-screen.svg";

const GAP = 15; // 핀(30px) 중심점 기준 연결선 단부 간격

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 요소 중심점 계산 함수
function anchorOf(el, containerRect) {
  const r = el.getBoundingClientRect();
  if (el.hasAttribute("data-phone")) {
    return {
      x: r.left - containerRect.left,
      y: r.top + r.height * 0.25 - containerRect.top,
    };
  }
  return {
    x: r.left + r.width / 2 - containerRect.left,
    y: r.top + r.height / 2 - containerRect.top,
  };
}

// 핀과 핀, 핀과 휴대폰 사이를 잇는 선 생성 및 애니메이션
function connect(fromEl, toEl, container, stepClass) {
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
  line.className = `net-line ${stepClass}`;
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`; // y1 미사용 변수 경고 수정
  line.style.width = `${length}px`;
  line.style.transform = `rotate(${angle}deg) scaleX(0)`;
  container.appendChild(line);

  void line.offsetWidth; // DOM 강제 리플로우
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

  const allSharp = [...section.querySelectorAll(".kw-red")];
  const pin1 = section.querySelector("#pin-1");
  const pin2 = section.querySelector("#pin-2");
  const pin3 = section.querySelector("#pin-3");

  async function playSequence() {
    // 1. 키워드 순차적 선명화 (독서, 빈티지, 요리, 아이보리)
    for (const [i, el] of allSharp.entries()) {
      setTimeout(() => el.classList.add("revealed"), i * 140);
    }
    await wait(allSharp.length * 140 + 200);

    // 2. 핀 사이 연결선 애니메이션
    connect(pin1, pin2, network, "line-step-1");
    await wait(180);

    connect(pin2, pin3, network, "line-step-2");
    await wait(180);

    connect(pin3, phone, network, "line-step-3");
    await wait(180);

    // 3. 휴대폰 뿅 등장 ("enter")
    phone.classList.add("enter");

    // 휴대폰 애니메이션 완료 대기
    await wait(800);

    // 4. 텍스트 요소 순차 등장 (.show)
    const label = section.querySelector(".step2-label");
    const badge = section.querySelector(".step2-heading-badge");
    const heading = section.querySelector(".step2-heading-text");
    const desc = section.querySelector(".step2-desc");

    if (label) label.classList.add("show");
    await wait(120);

    if (badge) badge.classList.add("show");
    if (heading) heading.classList.add("show");
    await wait(120);

    if (desc) desc.classList.add("show");
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