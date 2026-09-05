import "./styles/fonts.css";
import "./styles/base.css";

import { mountHero } from "./sections/hero/hero.js";
import { mountWhyHard } from "./sections/why-hard/why-hard.js";
import { mountPainPoints } from "./sections/pain-points/pain-points.js";
import { mountInsight } from "./sections/insight/insight.js";

const app = document.querySelector("#app");

mountHero(app);
mountWhyHard(app);
mountPainPoints(app);
mountInsight(app);