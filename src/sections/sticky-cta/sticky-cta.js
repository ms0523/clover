import "./sticky-cta.css";
import stickyCtaHtml from "./sticky-cta.html?raw";

// 심볼 이미지 — 다운로드한 SVG를 src/assets/images/sticky-cta-symbol.svg 로
// 저장하면 이 한 줄만으로 바로 적용됩니다. 파일명/경로를 바꿔도 됨.
import symbolUrl from "../../assets/icons/sticky-cta-symbol.svg";

// 스크롤이 멈췄다고 판단하기까지 기다리는 시간(ms). 짧으면 살짝만 멈춰도
// 바로 다시 올라오고, 길면 완전히 멈춰야 올라옵니다.
const SCROLL_STOP_DELAY = 150;

// 이메일 전송 완료 문구를 보여준 뒤 기본 상태로 자동 복귀하는 시간(ms)
const DONE_RESET_DELAY = 4000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * hero / footer를 제외한 모든 섹션 위에 계속 떠 있는 하단 고정 CTA 바를
 * mount합니다. 스크롤 중엔 숨고, 스크롤이 멈추면 다시 올라오는 동작을
 * 반복하며, hero/footer 구간에서는 스크롤 상태와 무관하게 항상 숨깁니다.
 *
 * @param {HTMLElement} mountEl - 보통 document.body. position:fixed라서
 *   어디에 붙여도 레이아웃엔 영향 없지만, 다른 section의 overflow:hidden
 *   등에 영향받지 않도록 body에 붙이는 걸 권장합니다.
 * @param {Object} [options]
 * @param {string} [options.heroSelector="#hero"]     - 숨겨야 할 히어로 섹션 셀렉터
 * @param {string} [options.footerSelector="footer"]  - 숨겨야 할 푸터 셀렉터
 * @param {(email: string) => Promise<void> | void} [options.onSubmit] -
 *   실제 신청 처리(API 연동)를 여기에 넣으세요. 넘기지 않으면 데모용으로
 *   그냥 완료 상태만 보여줍니다.
 */
export function mountStickyCta(mountEl = document.body, options = {}) {
  const html = stickyCtaHtml.replaceAll("__SYMBOL_URL__", symbolUrl);
  mountEl.insertAdjacentHTML("beforeend", html);

  const root = mountEl.querySelector("[data-sticky-cta]");
  const bar = root.querySelector(".sticky-cta-bar");
  const toggleBtn = root.querySelector("[data-cta-toggle]");
  const closeBtn = root.querySelector("[data-cta-close]");
  const form = root.querySelector("[data-cta-form]");
  const emailInput = root.querySelector("[data-cta-email]");
  const submitBtn = root.querySelector("[data-cta-send]");

  root.hidden = false; // 표시/숨김은 이제부터 .is-hidden 클래스로만 제어

  const heroEl = document.querySelector(options.heroSelector || "#hero");
  const footerEl = document.querySelector(options.footerSelector || "footer");

  let heroVisible = false;
  let footerVisible = false;
  let isScrolling = false;
  let scrollTimer = null;

  function setState(state) {
    bar.dataset.ctaOpen = state; // "off" | "on" | "done"
  }

  function updateVisibility() {
    const isFormOpen = bar.dataset.ctaOpen === "on";
    const inExcludedSection = heroVisible || footerVisible;
    // 이메일을 입력 중일 때는 스크롤 때문에 갑자기 사라지지 않도록 예외 처리
    const hideForScroll = isScrolling && !isFormOpen;
    root.classList.toggle("is-hidden", inExcludedSection || hideForScroll);
  }

  // ---------------------------------------------------------
  // hero / footer 구간에서는 스크롤 상태와 무관하게 항상 숨김
  // ---------------------------------------------------------
  if (heroEl || footerEl) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === heroEl) heroVisible = entry.isIntersecting;
          if (entry.target === footerEl) footerVisible = entry.isIntersecting;
        }
        updateVisibility();
      },
      { threshold: 0 }
    );
    if (heroEl) io.observe(heroEl);
    if (footerEl) io.observe(footerEl);
  }

  // ---------------------------------------------------------
  // 스크롤 중엔 숨기고, 멈추면 다시 보여줌 — 스크롤할 때마다 반복
  // ---------------------------------------------------------
  window.addEventListener(
    "scroll",
    () => {
      if (!isScrolling) {
        isScrolling = true;
        updateVisibility();
      }
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        updateVisibility();
      }, SCROLL_STOP_DELAY);
    },
    { passive: true }
  );

  // ---------------------------------------------------------
  // 베타 신청하기 → 이메일 입력 상태로 전환
  // ---------------------------------------------------------
  toggleBtn?.addEventListener("click", () => {
    setState("on");
    updateVisibility();
    // transform 트랜지션이 끝나길 기다리지 않고 바로 포커스만 이동
    requestAnimationFrame(() => emailInput?.focus());
  });

  closeBtn?.addEventListener("click", () => {
    setState("off");
    emailInput.value = "";
    updateVisibility();
  });

  // ---------------------------------------------------------
  // 이메일 제출 → 완료 상태로 전환 후 자동으로 기본 상태 복귀
  // ---------------------------------------------------------
  let doneTimer = null;

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    if (!EMAIL_RE.test(email) || !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    submitBtn.disabled = true;

    try {
      // 실제 신청 처리(메일 발송/서버 저장)는 onSubmit에서 담당합니다.
      // 예) onSubmit: (email) => fetch("/api/beta-signup", {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({ email }),
      //     })
      await options.onSubmit?.(email);

      setState("done");
      updateVisibility();
      emailInput.value = "";

      clearTimeout(doneTimer);
      doneTimer = setTimeout(() => {
        setState("off");
        updateVisibility();
      }, DONE_RESET_DELAY);
    } catch (err) {
      console.error("[sticky-cta] 베타 신청 처리 중 오류:", err);
      // 실패 시엔 완료 상태로 넘어가지 않고 이메일 입력 상태 그대로 유지
    } finally {
      submitBtn.disabled = false;
    }
  });

  updateVisibility();
}