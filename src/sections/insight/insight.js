import "./insight.css";
import insightHtml from "./insight.html?raw";

export function mountInsight(mountEl) {
  mountEl.insertAdjacentHTML("beforeend", insightHtml);
}
