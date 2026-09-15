import "./styles/fonts.css";
import "./styles/base.css";

// ---------------------------------------------------------------------
// 새로고침 시 스크롤이 멈추는 문제 방지
// ---------------------------------------------------------------------
// hero(포장지 드래그), clover-behind(카드 넘기기), clover-receive(카드 열기)
// 섹션은 진입 시 document.documentElement/body의 overflow를 "hidden"으로
// 잠갔다가, 각 섹션의 인터랙션(드래그/휠 시퀀스)이 끝나야 다시 풀어주는
// 방식으로 스크롤을 가로챕니다. 이 로직은 "위에서부터 자연스럽게 스크롤해
// 내려오는 상황"만 가정하고 있어서, 브라우저가 새로고침 시 이전 스크롤
// 위치(예: clover-behind 섹션 중간)를 그대로 복원해버리면 — 그 상태에서
// 첫 휠 이벤트가 "지금 막 섹션에 진입했다"고 오인되어 즉시 잠금만 걸고,
// 정상적으로 끝까지 재생되지 않아 잠금이 영영 풀리지 않는 경우가 있습니다.
// 결과적으로 스크롤만 그 자리에서 완전히 멈추고(버튼 클릭 등은 정상 동작),
// 새로고침할 때마다 반복됩니다.
//
// 근본적으로는 각 섹션의 진입/해제 로직을 더 방어적으로 고치는 게
// 맞지만, 가장 간단하고 안전한 예방책은 "새로고침 시 항상 맨 위에서
// 시작"하도록 만들어 애초에 섹션 중간에서 재생되는 상황 자체를 없애는
// 것입니다 — 브라우저의 스크롤 자동 복원(scrollRestoration)을 끕니다.
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

import { mountHero } from "./sections/hero/hero.js";
import { mountSectionNav } from "./sections/section-nav/section-nav.js";
import { mountCloverStart } from "./sections/clover-start/clover-start.js";
import { mountPainPoint1 } from "./sections/pain-point-1/pain-point-1.js";
import { mountClovervalue } from "./sections/clover-value/clover-value.js";
import { mountIntro } from "./sections/intro/intro.js";
import { mountCloverAi } from "./sections/clover-ai/clover-ai.js";
import { mountCloverGift } from "./sections/clover-gift/clover-gift.js";
import { mountCloverCoupon } from "./sections/clover-coupon/clover-coupon.js";
import { mountCloverBehind } from "./sections/clover-behind/clover-behind.js";
import { mountCloverReceive } from "./sections/clover-receive/clover-receive.js";
import { mountCloverMessage } from "./sections/clover-message/clover-message.js";
import { mountFooter } from "./sections/footer/footer.js";
import { observeReveals } from "./utils/reveal.js";

const app = document.querySelector("#app");

mountHero(app);
mountCloverStart(app);
mountPainPoint1(app);
mountClovervalue(app);   // STEP 04
mountIntro(app);
mountCloverAi(app);      // STEP 02
mountCloverGift(app);    // STEP 03
mountCloverCoupon(app);
mountCloverBehind(app);
mountCloverReceive(app);
mountCloverMessage(app);
mountFooter(app);

mountSectionNav([
  { id: "hero",            label: "홈" },
  { id: "clover-start",    label: "선물의 시작" },
  { id: "pain-point-1",    label: "선물 고민" },
  { id: "clover-value",    label: "다른 기준" },
  { id: "intro",           label: "질문 하나" },
  { id: "clover-ai",       label: "AI 추천" },
  { id: "clover-gift",     label: "맞춤 선물" },
  { id: "clover-coupon",   label: "마음 쿠폰" },
  { id: "clover-behind",   label: "비하인드" },
  { id: "clover-receive",  label: "선물 받기" },
  { id: "clover-message",  label: "진심 전달" },
]);

observeReveals();