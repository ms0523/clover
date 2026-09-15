import "./styles/fonts.css";
import "./styles/base.css";
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
// TODO: 실제 프로젝트의 경로가 다르면 아래 한 줄만 맞게 고쳐주세요.
import { mountStickyCta } from "./sections/sticky-cta/sticky-cta.js";
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

// position:fixed라서 #app이 아니라 body에 붙입니다(sticky-cta.js 기본값과 동일).
mountStickyCta(document.body);

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