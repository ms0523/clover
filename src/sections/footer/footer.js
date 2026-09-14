import "./footer.css";
import footerHtml from "./footer.html?raw";
import bgUrl from "../../assets/images/footer-bg.png";
import logoUrl from "../../assets/images/white-logo.svg";

export function mountFooter(mountEl) {
  const html = footerHtml
    .replaceAll("__BG_URL__", bgUrl)
    .replaceAll("__LOGO_URL__", logoUrl);
  mountEl.insertAdjacentHTML("beforeend", html);

  const totop = mountEl.querySelector("[data-totop]");
  totop?.addEventListener("click", () => {
    const root = document.documentElement;
    const prevSnap = root.style.scrollSnapType;

    // html에 scroll-snap-type: y mandatory가 걸려 있으면, 맨 위(0)까지
    // 한 번에 smooth 스크롤할 때 브라우저가 중간에 스냅 지점을 다시 계산하다가
    // 목적지(hero)에 닿기 전에 가까운 다른 섹션에서 멈춰버리는 경우가 있음.
    // → 스크롤하는 동안만 스냅을 잠깐 꺼서 hero까지 확실히 도달하게 하고,
    //   스크롤이 멎으면 원래 상태로 복원함.
    root.style.scrollSnapType = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });

    let restoreTimer = setTimeout(restoreSnap, 1200); // 스크롤 이벤트가 안 붙는 경우 대비 안전장치

    function restoreSnap() {
      root.style.scrollSnapType = prevSnap;
      window.removeEventListener("scroll", onScroll);
    }

    function onScroll() {
      clearTimeout(restoreTimer);
      restoreTimer = setTimeout(restoreSnap, 120); // 스크롤이 실제로 멈춘 뒤 복원
    }

    window.addEventListener("scroll", onScroll, { passive: true });
  });
}