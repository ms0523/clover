import "./pain-points.css";
import painPointsHtml from "./pain-points.html?raw";

// Static section — no data-driven parts, so this just injects the markup.
export function mountPainPoints(mountEl) {
  mountEl.insertAdjacentHTML("beforeend", painPointsHtml);
}
