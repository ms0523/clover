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

const CAPTIONS = [
  "터치해서 친구가<br>보낸 선물을 확인해보세요!",
  "[푸딩도트] 포켓북커버<br>A6 B6 A5 윅스",
  "",
];

const DESCS = [
  "상품을 보여주기전 블라인드 된 이미지로<br>더욱 더 선물에 대한 설렘과 기대감을 증폭시켜줍니다",
  "포장을 열어보면 진짜 선물이 짠!<br>기다렸던 순간이 눈앞에 펼쳐집니다",
  "정성껏 눌러 담은 편지 한 장이<br>선물만큼 큰 감동을 전합니다",
];

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

  const faces = [
    ...section.querySelectorAll("[data-face]"),
  ];

  const captionEl = section.querySelector("[data-caption]");
  const descEl = section.querySelector("[data-desc]");

  const cardEl = section.querySelector(".receive-card");
  const bg = section.querySelector(".receive-bg");

  /* =========================================================
     STATE
  ========================================================= */

  let backgroundFilled = false;

  let step = 0;

  let stickersShown = false;

  let locked = false;

  let armedTop = true;
  let armedBottom = true;

  let lockedScrollY = 0;

  let lastScrollY = window.scrollY;

  /* =========================================================
     WHEEL
  ========================================================= */

  /*
    한 번의 스크롤 제스처에서 발생하는 여러 wheel 이벤트를
    하나의 이벤트로 처리하기 위한 설정

    wheel 이벤트가 멈춘 뒤 180ms가 지나야
    다음 스크롤을 새로운 제스처로 인식함
  */

  const WHEEL_END_DELAY = 180;

  /*
    카드 전환 후 최소 대기 시간

    트랙패드에서 스크롤을 빠르게 해도
    카드가 연속으로 넘어가지 않도록 여유를 둠
  */

  const STEP_COOLDOWN_MS = 900;

  let wheelEndTimer = null;
  let wheelGestureLocked = false;
  let stepCooldownUntil = 0;

  /* =========================================================
     STICKER
  ========================================================= */

  const STICKER_DELAY = 850;

  let stickerTimer = null;

  /* =========================================================
     UI
  ========================================================= */

  function setActive(index) {
    faces.forEach((face, i) => {
      face.classList.toggle(
        "is-active",
        i === index
      );
    });

    captionEl.innerHTML = CAPTIONS[index];

    const isEmpty = index === 2;

    captionEl.classList.toggle(
      "is-empty",
      isEmpty
    );

    cardEl?.classList.toggle(
      "is-no-caption",
      isEmpty
    );

    if (descEl) {
      descEl.innerHTML = DESCS[index];
    }
  }

  /* =========================================================
     BACKGROUND
  ========================================================= */

  function setBackgroundFilled(value) {
    backgroundFilled = value;

    bg.classList.toggle(
      "is-filled",
      value
    );

    if (stickerTimer) {
      clearTimeout(stickerTimer);
      stickerTimer = null;
    }

    if (!value) {
      stickersShown = false;

      stage.classList.remove(
        "stickers-auto"
      );

      return;
    }

    stickerTimer = setTimeout(() => {
      stickersShown = true;

      stage.classList.add(
        "stickers-auto"
      );
    }, STICKER_DELAY);
  }

  /* =========================================================
     LOCK
  ========================================================= */

  function engageLock() {
    if (locked) return;

    locked = true;

    lockedScrollY = window.scrollY;

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.overflow =
      "hidden";
  }

  function releaseLock() {
    locked = false;

    document.documentElement.style.overflow =
      "";

    document.body.style.overflow =
      "";
  }

  /* =========================================================
     ENTRY
  ========================================================= */

  function checkEntry() {
    if (locked) return;

    const currentScrollY =
      window.scrollY;

    const scrollingDown =
      currentScrollY > lastScrollY;

    const scrollingUp =
      currentScrollY < lastScrollY;

    const rect =
      section.getBoundingClientRect();

    const reachedTop =
      rect.top <= 0 &&
      rect.bottom > 0;

    const reachedBottom =
      rect.bottom >= window.innerHeight &&
      rect.top < 0;

    if (
      armedTop &&
      scrollingDown &&
      reachedTop
    ) {
      armedTop = false;

      step = 0;

      setActive(step);

      engageLock();

      setBackgroundFilled(true);

      stepCooldownUntil =
        performance.now() +
        STEP_COOLDOWN_MS;

      /*
        진입 자체가 하나의 스크롤이므로
        바로 다음 카드로 넘어가지 않도록
        현재 wheel 제스처를 잠금
      */

      wheelGestureLocked = true;
    } else if (
      armedBottom &&
      scrollingUp &&
      reachedBottom
    ) {
      armedBottom = false;

      step = 2;

      setActive(step);

      engageLock();

      setBackgroundFilled(true);

      stepCooldownUntil =
        performance.now() +
        STEP_COOLDOWN_MS;

      wheelGestureLocked = true;
    }

    if (
      !armedTop &&
      rect.top >= window.innerHeight
    ) {
      armedTop = true;
    }

    if (
      !armedBottom &&
      rect.bottom <= 0
    ) {
      armedBottom = true;
    }

    lastScrollY = currentScrollY;
  }

  /* =========================================================
     WHEEL GESTURE
  ========================================================= */

  function startNewWheelGesture() {
    wheelGestureLocked = false;
  }

  function markWheelGesture() {
    wheelGestureLocked = true;

    if (wheelEndTimer) {
      clearTimeout(wheelEndTimer);
    }

    wheelEndTimer = setTimeout(() => {
      startNewWheelGesture();
    }, WHEEL_END_DELAY);
  }

  /* =========================================================
     WHEEL
  ========================================================= */

  function onWheel(e) {
    /*
      Receive 인터랙션에 진입하지 않았다면
      기본 스크롤 허용
    */

    if (!locked) {
      return;
    }

    /*
      Receive 인터랙션 중에는
      브라우저 기본 스크롤 막기
    */

    e.preventDefault();

    const deltaY = e.deltaY;

    if (deltaY === 0) {
      return;
    }

    /* =======================================================
       CARD 1에서 위로 스크롤
    ======================================================= */

    if (deltaY < 0 && step === 0) {
      releaseLock();

      setBackgroundFilled(false);

      wheelGestureLocked = true;

      window.scrollTo({
        top: Math.max(
          0,
          lockedScrollY - 600
        ),
        behavior: "smooth",
      });

      markWheelGesture();

      return;
    }

    /* =======================================================
       스티커가 전부 등장하기 전에는
       카드 전환 금지
    ======================================================= */

    if (!stickersShown) {
      markWheelGesture();
      return;
    }

    /* =======================================================
       ⭐ 핵심
       하나의 wheel 제스처에서는
       카드 하나만 전환
    ======================================================= */

    if (wheelGestureLocked) {
      markWheelGesture();
      return;
    }

    /* =======================================================
       COOLDOWN
    ======================================================= */

    const now = performance.now();

    if (now < stepCooldownUntil) {
      markWheelGesture();
      return;
    }

    /* =======================================================
       지금 들어온 스크롤을 하나의 제스처로 확정
    ======================================================= */

    markWheelGesture();

    stepCooldownUntil =
      now + STEP_COOLDOWN_MS;

    /* =======================================================
       DOWN
       CARD 1 → 2 → 3 → 다음 섹션
    ======================================================= */

    if (deltaY > 0) {
      if (step === 0) {
        step = 1;

        setActive(step);

        return;
      }

      if (step === 1) {
        step = 2;

        setActive(step);

        return;
      }

      if (step === 2) {
        releaseLock();

        window.scrollTo({
          top: lockedScrollY + 600,
          behavior: "smooth",
        });

        return;
      }

      return;
    }

    /* =======================================================
       UP
       CARD 3 → 2 → 1
    ======================================================= */

    if (deltaY < 0) {
      if (step === 2) {
        step = 1;

        setActive(step);

        return;
      }

      if (step === 1) {
        step = 0;

        setActive(step);

        return;
      }
    }
  }

  /* =========================================================
     SCROLL
  ========================================================= */

  function onScroll() {
    /*
      Lock 중에는
      현재 Receive 위치를 유지
    */

    if (locked) {
      if (
        Math.abs(
          window.scrollY -
          lockedScrollY
        ) > 1
      ) {
        window.scrollTo({
          top: lockedScrollY,
          behavior: "instant",
        });
      }

      return;
    }

    checkEntry();
  }

  /* =========================================================
     RESIZE
  ========================================================= */

  function onResize() {
    if (!locked) return;

    lockedScrollY =
      window.scrollY;

    window.scrollTo({
      top: lockedScrollY,
      behavior: "instant",
    });
  }

  /* =========================================================
     EVENTS
  ========================================================= */

  window.addEventListener(
    "wheel",
    onWheel,
    {
      passive: false,
    }
  );

  window.addEventListener(
    "scroll",
    onScroll,
    {
      passive: true,
    }
  );

  window.addEventListener(
    "resize",
    onResize
  );

  /* =========================================================
     INITIAL
  ========================================================= */

  setBackgroundFilled(false);

  setActive(0);
}