import "./styles/fonts.css";
import "./styles/base.css";

import { mountHero, mountSectionNav } from "./sections/hero/hero.js";
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

mountSectionNav([
  { id: "hero",            label: "홈" },
  { id: "clover-start",    label: "시작하기" },
  { id: "pain-point-1",    label: "고민" },
  { id: "clover-value",    label: "가치" },
  { id: "intro",           label: "STEP01" },
  { id: "clover-ai",       label: "STEP02" },
  { id: "clover-gift",     label: "STEP03" },
  { id: "clover-coupon",   label: "마음 쿠폰" },
  { id: "clover-behind",   label: "비하인드" },
  { id: "clover-receive",  label: "선물 받기" },
  { id: "clover-message",  label: "메시지" },
]);

observeReveals();