import "./styles/fonts.css";
import "./styles/base.css";

import { mountHero } from "./sections/hero/hero.js";
import { mountSectionNav } from "./sections/hero/hero.js";
import { mountWhyHard } from "./sections/why-hard/why-hard.js";
import { mountPainPoints } from "./sections/pain-points/pain-points.js";
import { mountIntro } from "./sections/intro/intro.js";
import { mountCloverAi } from "./sections/clover-ai/clover-ai.js";
import { mountCloverGift } from "./sections/clover-gift/clover-gift.js";
import { mountCloverCoupon } from "./sections/clover-coupon/clover-coupon.js";
import { mountCloverBehind } from "./sections/clover-behind/clover-behind.js";
import { mountCloverReceive } from "./sections/clover-receive/clover-receive.js";
import { mountCloverScene } from "./sections/clover-scene/clover-scene.js";
import { observeReveals } from "./utils/reveal.js";

const app = document.querySelector("#app");

mountHero(app);
mountWhyHard(app);
mountPainPoints(app);
mountIntro(app);
mountCloverAi(app);
mountCloverGift(app);
mountCloverCoupon(app);
mountCloverBehind(app);
mountCloverReceive(app);
mountCloverScene(app);

// 모든 섹션이 다 마운트된 "다음"에 호출해야 id들이 전부 정상 인식됨
mountSectionNav([
  { id: "hero", label: "클로버" },
  { id: "why-hard", label: "이런 고민" },
  { id: "pain-points", label: "선물 고민" },
  { id: "intro", label: "소개" },
  { id: "clover-ai", label: "AI 추천" },
  { id: "clover-gift", label: "선물 찾기" },
  { id: "clover-coupon", label: "쿠폰" },
  { id: "clover-behind", label: "비하인드" },
  { id: "clover-receive", label: "선물 받기" },
  { id: "clover-scene", label: "마무리" },
]);

observeReveals();