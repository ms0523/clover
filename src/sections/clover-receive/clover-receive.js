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

/*
  타이틀("선물을 받을 때") 아래 설명 문구도 카드가 넘어갈 때마다
  같이 바뀌도록 카드별 문구를 따로 둠. 문구 내용은 원하는 대로
  바꿔서 쓰세요.
*/
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

  /*
    캡션이 비는 카드(편지 카드)일 때 카드 전체 높이가
    줄어들지 않도록, 캡션이 들어있는 .receive-card에도
    같이 상태 클래스를 토글해줌 (receive-band.css의
    .receive-card.is-no-caption 규칙과 짝을 이룸)
  */
  const cardEl = section.querySelector(".receive-card");

  const bg = section.querySelector(".receive-bg");

  /* =========================================================
     STATE
  ========================================================= */

  let backgroundFilled = false;

  let step = 0;

  let stickersShown = false;

  let locked = false;

  let interactionFinished = false;

  let lockedScrollY = 0;

  let lastScrollY = window.scrollY;

  /* =========================================================
     TRACKPAD
  ========================================================= */

  const STEP_COOLDOWN_MS = 550;

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

    /*
      파란 배경이 차오르는 동안 기다렸다가
      스티커 등장
    */

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

     Receive 상단이 화면 최상단에 도착했을 때
     인터랙션 시작
  ========================================================= */

  function checkEntry() {
    if (locked) return;

    if (interactionFinished) return;

    const currentScrollY =
      window.scrollY;

    const scrollingDown =
      currentScrollY >
      lastScrollY;

    const rect =
      section.getBoundingClientRect();

    const reachedSectionTop =
      rect.top <= 0 &&
      rect.bottom > 0;

    if (
      scrollingDown &&
      reachedSectionTop
    ) {
      engageLock();

      /*
        진입 즉시
        파란 배경 차오르기 시작
      */

      setBackgroundFilled(true);

      stepCooldownUntil =
        performance.now() +
        STEP_COOLDOWN_MS;
    }

    lastScrollY =
      currentScrollY;
  }

  /* =========================================================
     WHEEL
  ========================================================= */

  function onWheel(e) {
    /*
      이미 모든 인터랙션이 끝났다면
      브라우저 기본 스크롤 사용
    */

    if (interactionFinished) {
      return;
    }

    /*
      아직 Receive 인터랙션에
      진입하지 않았다면 기본 스크롤
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

    /* =======================================================
       UP
    ======================================================= */

    if (deltaY < 0) {
      releaseLock();

      window.scrollTo({
        top: Math.max(
          0,
          lockedScrollY - 600
        ),
        behavior: "smooth",
      });

      return;
    }

    /* =======================================================
       DOWN
    ======================================================= */

    if (deltaY <= 0) {
      return;
    }

    /*
      ⭐ 핵심

      스티커가 전부 등장하기 전에는
      아래 스크롤을 아무리 해도
      카드가 넘어가지 않음
    */

    if (!stickersShown) {
      return;
    }

    /* =======================================================
       COOLDOWN
    ======================================================= */

    const now = performance.now();

    if (now < stepCooldownUntil) {
      return;
    }

    stepCooldownUntil =
      now + STEP_COOLDOWN_MS;

    /* =======================================================
       CARD 1 → CARD 2
    ======================================================= */

    if (step === 0) {
      step = 1;

      setActive(step);

      return;
    }

    /* =======================================================
       CARD 2 → CARD 3
    ======================================================= */

    if (step === 1) {
      step = 2;

      setActive(step);

      return;
    }

    /* =======================================================
       CARD 3 → NEXT SECTION
    ======================================================= */

    if (step === 2) {
      interactionFinished = true;

      releaseLock();

      window.scrollTo({
        top: lockedScrollY + 600,
        behavior: "smooth",
      });

      return;
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

    /*
      아직 인터랙션이 시작되지 않았다면
      진입 여부 확인
    */

    if (!interactionFinished) {
      checkEntry();

      return;
    }

    /*
      인터랙션이 끝난 후에는
      일반 스크롤
    */

    lastScrollY =
      window.scrollY;
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