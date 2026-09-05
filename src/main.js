import "./styles/fonts.css";
import "./styles/base.css";

import { mountHero } from "./sections/hero/hero.js";
import { mountWhyHard } from "./sections/why-hard/why-hard.js";
import { mountPainPoints } from "./sections/pain-points/pain-points.js";
import { mountInsight } from "./sections/insight/insight.js";
import { mountIntro } from "./sections/intro/intro.js";
import { observeReveals } from "./utils/reveal.js";

const app = document.querySelector("#app");

mountHero(app);
mountWhyHard(app);
mountPainPoints(app);
mountInsight(app);
mountIntro(app); // now includes the clue-board phone sequence too

// scroll-in reveal for every [data-reveal] element across all sections —
// call this again with a specific root if a section is added dynamically
// later (e.g. infinite-scroll content).
observeReveals();