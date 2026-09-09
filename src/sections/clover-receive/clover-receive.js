import "./clover-receive.css";
import cloverReceiveHtml from "./clover-receive.html?raw";

import card1Url from "../../assets/images/scene-card1-gift.svg";
import card2Url from "../../assets/images/scene-card2-photo.png";

import stickerCloud from "../../assets/icons/receive-cloud.png";
import stickerStar from "../../assets/icons/receive-star.png";
import stickerButton from "../../assets/icons/receive-button.png";
import stickerBerry from "../../assets/icons/receive-berry.png";
import stickerApple from "../../assets/icons/receive-apple.png";
import stickerHeart from "../../assets/icons/receive-heart.png";


/* =========================================================
   CAPTIONS
========================================================= */
 
const CAPTIONS = [
  "터치해서 친구가<br>보낸 선물을 확인해보세요!",
  "[푸딩도트] 포켓북커버<br>A6 B6 A5 윅스",
  "직접 쓴 편지 한 장,<br>마음이 그대로 전해져요",
];
 
/* =========================================================
   MOUNT
========================================================= */
 
export function mountCloverReceive(mountEl) {
  const html = cloverReceiveHtml
    .replaceAll("__CARD1_URL__", card1Url)
    .replaceAll("__CARD2_URL__", card2Url)
    .replaceAll("__STICKER_CLOUD__", stickerCloud)
    .replaceAll("__STICKER_STAR__", stickerStar)
    .replaceAll("__STICKER_BUTTON__", stickerButton)
    .replaceAll("__STICKER_BERRY__", stickerBerry)
    .replaceAll("__STICKER_APPLE__", stickerApple)
    .replaceAll("__STICKER_HEART__", stickerHeart);
 
  mountEl.insertAdjacentHTML("beforeend", html);
 
  const section = mountEl.querySelector(".receive-band");
  const stage = section.querySelector(".receive-stage");
  const faces = [...section.querySelectorAll("[data-face]")];
  const captionEl = section.querySelector("[data-caption]");
 
  /* =======================================================
     STATE
  ======================================================= */
 
  let step = 0; // 0 = card 1, 1 = card 2, 2 = card 3
  let stickersShown = false; // separate stage after card 3 — the
    // stickers pop in first, and only the wheel AFTER that releases
  let locked = false;
  let interactionFinished = false;
  let lockedScrollY = 0;
 
  // ★ this is the fix: trackpad momentum fires MANY wheel events for a
  // single physical swipe (a mechanical mouse wheel fires roughly one
  // per "click", but a trackpad can easily fire 10–20+ for one swipe).
  // Without this, one continuous gesture blows straight through
  // step 0→1→2→release before the person even sees card 2, let alone
  // card 3 — which is exactly "그냥 넘어가져". This cooldown makes each
  // wheel-driven step require its own distinct gesture: after handling
  // one step, further wheel events are ignored until enough time has
  // passed for trackpad momentum to have settled.
  const STEP_COOLDOWN_MS = 550;
  let stepCooldownUntil = 0;
 
  function setActive(index) {
    faces.forEach((face, i) => face.classList.toggle("is-active", i === index));
    captionEl.innerHTML = CAPTIONS[index];
  }
 
  function getSectionBottom() {
    const rect = section.getBoundingClientRect();
    return window.scrollY + rect.bottom;
  }
 
  function engageLock() {
    if (locked) return;
    locked = true;
 
    lockedScrollY = getSectionBottom() - window.innerHeight;
    window.scrollTo({ top: lockedScrollY, behavior: "instant" });
 
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
 
  function releaseLock() {
    locked = false;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }
 
  function onWheel(e) {
    if (interactionFinished) return;
 
    if (!locked) {
      if (e.deltaY > 0) {
        const rect = section.getBoundingClientRect();
        const nearEnd = rect.bottom <= window.innerHeight + 150 && rect.bottom >= window.innerHeight - 150;
        const alreadyPast = rect.bottom < window.innerHeight - 150 && rect.bottom > window.innerHeight - 400;
 
        if (nearEnd || alreadyPast) {
          e.preventDefault();
          engageLock();
          stepCooldownUntil = performance.now() + STEP_COOLDOWN_MS;
          return; // first wheel only locks the position
        }
      }
      return;
    }
 
    e.preventDefault();
 
    // still cooling down from the last step — swallow this wheel event
    // entirely (still part of the same physical gesture as the last
    // step, most likely) rather than letting it advance anything
    if (performance.now() < stepCooldownUntil) return;
 
    if (e.deltaY > 0) {
      if (step === 0) {
        step = 1;
        setActive(step);
        stepCooldownUntil = performance.now() + STEP_COOLDOWN_MS;
        return;
      }
      if (step === 1) {
        step = 2;
        setActive(step);
        stepCooldownUntil = performance.now() + STEP_COOLDOWN_MS;
        return;
      }
      if (step === 2) {
        if (!stickersShown) {
          // "타다다닥" — stickers pop in around the card first, one
          // more wheel is needed before the section actually releases
          stickersShown = true;
          stage.classList.add("stickers-in");
          stepCooldownUntil = performance.now() + STEP_COOLDOWN_MS;
          return;
        }
 
        releaseLock();
        interactionFinished = true;
        // deliberately a big, fixed jump (not just this wheel's own
        // delta) — small nudges left us still inside the "alreadyPast"
        // catch zone below, which would just re-trigger the lock on
        // the very next wheel event before any real progress happened
        window.scrollTo({ top: lockedScrollY + 600, behavior: "smooth" });
        return;
      }
    }
 
    if (e.deltaY < 0) {
      if (step === 2) {
        if (stickersShown) {
          stickersShown = false;
          stage.classList.remove("stickers-in");
          stepCooldownUntil = performance.now() + STEP_COOLDOWN_MS;
          return;
        }
        step = 1;
        setActive(step);
        stepCooldownUntil = performance.now() + STEP_COOLDOWN_MS;
        return;
      }
      if (step === 1) {
        step = 0;
        setActive(step);
        stepCooldownUntil = performance.now() + STEP_COOLDOWN_MS;
        return;
      }
      if (step === 0) {
        releaseLock();
        window.scrollTo({ top: lockedScrollY - 600, behavior: "smooth" });
        return;
      }
    }
  }
 
  function onScroll() {
    if (locked && !interactionFinished) {
      if (Math.abs(window.scrollY - lockedScrollY) > 1) {
        window.scrollTo({ top: lockedScrollY, behavior: "instant" });
      }
    }
  }
 
  function onResize() {
    if (!locked) return;
    lockedScrollY = getSectionBottom() - window.innerHeight;
    window.scrollTo({ top: lockedScrollY, behavior: "instant" });
  }
 
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
 
  setActive(0);
}
 