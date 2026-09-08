import "./styles/fonts.css";
import "./styles/base.css";

import { mountHero } from "./sections/hero/hero.js";
import { mountWhyHard } from "./sections/why-hard/why-hard.js";
import { mountPainPoints } from "./sections/pain-points/pain-points.js";
import { mountInsight } from "./sections/insight/insight.js";
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
mountInsight(app);
mountIntro(app); // includes the clue-board phone sequence
mountCloverAi(app); // STEP 02
mountCloverGift(app); // STEP 03
mountCloverCoupon(app); // 마음 쿠폰 + 선물 둘러보기
mountCloverBehind(app); // 선물 비하인드
mountCloverReceive(app); // 선물을 받을 때
mountCloverScene(app); // 스크롤 스크럽: 카드 3장 플립 (위치 옮기고 싶으면 이 줄만 이동)

observeReveals();