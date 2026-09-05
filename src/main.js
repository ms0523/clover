import "./styles/fonts.css";
import "./styles/base.css";

import { mountHero } from "./sections/hero/hero.js";
import { mountAbout } from "./sections/about/about.js";
// import { mountFeatures } from "./sections/features/features.js";
// import { mountCta } from "./sections/cta/cta.js";

const app = document.querySelector("#app");

mountHero(app);
mountAbout(app);
// mountFeatures(app);
// mountCta(app);
