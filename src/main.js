import "./styles/fonts.css";
import "./styles/base.css";

import { mountHero } from "./sections/hero/hero.js";
import { mountWhyHard } from "./sections/why-hard/why-hard.js";
import { mountPainPoints } from "./sections/pain-points/pain-points.js";
import { mountIntro } from "./sections/intro/intro.js";
import { mountCloverAi } from "./sections/clover-ai/clover-ai.js";
import { mountCloverGift } from "./sections/clover-gift/clover-gift.js";
import { mountCloverCoupon } from "./sections/clover-coupon/clover-coupon.js";
import { mountCloverBehind } from "./sections/clover-behind/clover-behind.js";
import { mountCloverReceive } from "./sections/clover-receive/clover-receive.js";
import { mountCloverMessage} from "./sections/clover-message/clover-message.js";
import { observeReveals } from "./utils/reveal.js";

const app = document.querySelector("#app");

mountHero(app);
mountWhyHard(app);
mountPainPoints(app);
mountIntro(app); // includes the clue-board phone sequence
mountCloverAi(app); // STEP 02
mountCloverGift(app); // STEP 03
mountCloverCoupon(app); // 마음 쿠폰 + 선물 둘러보기
mountCloverBehind(app); // 선물 비하인드
mountCloverReceive(app); // 선물을 받을 때
mountCloverMessage(app); // 선물을 받을 때

observeReveals();