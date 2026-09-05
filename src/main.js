import "./styles/fonts.css";
import "./styles/base.css";

import { mountHero } from "./sections/hero/hero.js";
import { mountWhyHard } from "./sections/why-hard/why-hard.js";

const app = document.querySelector("#app");

mountHero(app);
mountWhyHard(app);