import "./intro.css";
import introHtml from "./intro.html?raw";
import clueBoardDotsUrl from "../../assets/images/clue-board-dots.png";
import phoneUrl from "../../assets/images/phone-mockup.svg";
import blueUrl from "../../assets/images/blue-sticky.png";
import flowerUrl from "../../assets/images/intro-image-1.png";
import picnicUrl from "../../assets/images/intro-image-2.png";
import pinkUrl from "../../assets/images/pink-sticky.png";

const MAIN_SEGMENTS = [
  { text: "먼저, ", cls: "ink" },
  { text: "선물받을 사람", cls: "accent" },
  { text: "을 ", cls: "ink" },
  { text: "\n", cls: "br" },
  { text: "떠올리는 것부터 시작합니다.", cls: "ink" },
];

const clamp = (v, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

const lerp = (a, b, t) =>
  a + (b - a) * t;

const easeOutCubic = (t) =>
  1 - Math.pow(1 - t, 3);


/* =========================================================
   Typing
========================================================= */

function buildGhostText(el, segments) {
  el.innerHTML = "";

  segments.forEach(({ text, cls }) => {
    if (text === "\n") {
      el.appendChild(document.createElement("br"));
      return;
    }

    [...text].forEach((ch) => {
      const span = document.createElement("span");

      span.className = `type-ch ${cls}`;
      span.textContent = ch;

      el.appendChild(span);
    });
  });

  const cursor = document.createElement("span");

  cursor.className = "type-cursor";
  cursor.style.visibility = "hidden";

  el.appendChild(cursor);

  return {
    chars: [...el.querySelectorAll(".type-ch")],
    cursor,
  };
}


function typeChars({ chars, cursor }, speedMs) {
  return new Promise((resolve) => {
    cursor.style.visibility = "visible";

    let i = 0;

    function step() {
      if (i >= chars.length) {
        resolve();
        return;
      }

      chars[i].classList.add("typed");
      chars[i].after(cursor);

      i++;

      setTimeout(step, speedMs);
    }

    step();
  });
}


/* =========================================================
   Intro 이미지 등장
========================================================= */

/*
 * 기존에 사용하던 방식 그대로
 *
 * 1 → 2 → 3 → 4
 *
 * 각각 130ms 간격으로 .landed 추가
 */
function landPhotos(els, staggerMs = 130) {
  els.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("landed");
    }, i * staggerMs);
  });
}


/* =========================================================
   사진 → Phone
========================================================= */

function setupScrollFly(section, pairs, targetEl) {
  if (!section || !pairs.length || !targetEl) {
    return;
  }

  let ticking = false;


  /*
   * Phone이 화면에 15% 들어왔을 때
   * fly 시작
   */
  const START_VISIBLE = 0.15;


  /*
   * Phone이 화면에 65% 들어왔을 때
   * fly 종료
   */
  const END_VISIBLE = 0.85;


  /*
   * 각각의 사진이 날아가기 시작하는 간격
   */
  const STAGGER = 0.12;


  /*
   * 사진 하나의 이동 시간
   */
  const PHOTO_DURATION = 0.30;


  /*
   * Phone으로 들어갈 때 크기
   */
  const END_SCALE = 0.72;


  /*
   * 각 사진의 최초 위치
   */
  let sourcePositions = [];


  function measureSources() {
    sourcePositions = pairs.map(({ photo }) => {
      const rect =
        photo.getBoundingClientRect();

      return {
        x:
          rect.left +
          rect.width / 2 +
          window.scrollX,

        y:
          rect.top +
          rect.height / 2 +
          window.scrollY,
      };
    });
  }


  /*
   * =======================================================
   * 최초 위치 측정
   * =======================================================
   */
  measureSources();


  function update() {

    const phone =
      section.querySelector(".phone");


    if (!phone) {
      ticking = false;
      return;
    }


    const phoneRect =
      phone.getBoundingClientRect();


    const boardRect =
      targetEl.getBoundingClientRect();


    /*
     * ===============================================
     * Fly 시작 위치
     * ===============================================
     *
     * phone이 화면에 15% 들어온 순간
     */
    const startY =
      window.innerHeight *
      (1 - START_VISIBLE);


    /*
     * ===============================================
     * Fly 종료 위치
     * ===============================================
     */
    const endY =
      window.innerHeight *
      (1 - END_VISIBLE);


    /*
     * phone top 기준
     *
     * 0 → 1
     */
    const rawProgress =
      (startY - phoneRect.top) /
      (startY - endY);


    const progress =
      clamp(rawProgress);


    /*
     * ===============================================
     * Phone board 중심
     * ===============================================
     */
    const targetCenterX =
      boardRect.left +
      boardRect.width / 2 +
      window.scrollX;


    const targetCenterY =
      boardRect.top +
      boardRect.height / 2 +
      window.scrollY;


    /* =====================================================
       사진 각각 이동
    ===================================================== */

    pairs.forEach(({ photo, note }, i) => {

      const source =
        sourcePositions[i];


      if (!source) return;


      /*
       * 사진마다 조금씩 늦게 출발
       */
      const start =
        i * STAGGER;


      const individualProgress =
        clamp(
          (progress - start) /
          PHOTO_DURATION
        );


      const eased =
        easeOutCubic(
          individualProgress
        );


      /*
       * ===============================================
       * 원래 위치 → Phone
       * ===============================================
       */

      const dx =
        targetCenterX -
        source.x;


      const dy =
        targetCenterY -
        source.y;


      const moveX =
        dx * eased;


      const moveY =
        dy * eased;


      /*
       * 점점 작아짐
       */
      const scale =
        lerp(
          1,
          END_SCALE,
          eased
        );


      /*
       * 마지막에 사라짐
       */
      const fade =
        clamp(
          (individualProgress - 0.82) /
          0.18
        );


      const opacity =
        lerp(
          1,
          0,
          fade
        );


      /*
       * ===============================================
       * 아직 fly 시작 전
       * ===============================================
       *
       * 중요:
       * 사진 등장 상태는 .landed CSS에 맡긴다.
       *
       * fly가 시작되기 전에는
       * JS가 transform / opacity를 건드리지 않는다.
       */
      if (progress <= 0) {

        photo.style.transform = "";
        photo.style.opacity = "";

      } else {

        photo.style.transform =
          `translate3d(${moveX}px, ${moveY}px, 0) ` +
          `scale(${scale})`;

        photo.style.opacity =
          opacity;
      }


      /*
       * ===============================================
       * Phone 내부 note
       * ===============================================
       */
      if (note) {

        if (individualProgress >= 0.96) {
          note.classList.add("landed");
        } else {
          note.classList.remove("landed");
        }

      }

    });


    ticking = false;
  }


  function onScroll() {

    if (!ticking) {

      requestAnimationFrame(update);

      ticking = true;
    }
  }


  window.addEventListener(
    "scroll",
    onScroll,
    { passive: true }
  );


  window.addEventListener(
    "resize",
    () => {

      measureSources();

      onScroll();
    }
  );


  update();
}


/* =========================================================
   Mount
========================================================= */

export function mountIntro(mountEl) {

  const html =
    introHtml
      .replaceAll(
        "__CLUEBOARD_DOTS_URL__",
        clueBoardDotsUrl
      )
      .replaceAll(
        "__PHONE_URL__",
        phoneUrl
      )
      .replaceAll(
        "__BLUE_URL__",
        blueUrl
      )
      .replaceAll(
        "__FLOWER_URL__",
        flowerUrl
      )
      .replaceAll(
        "__PICNIC_URL__",
        picnicUrl
      )
      .replaceAll(
        "__PINK_URL__",
        pinkUrl
      );


  mountEl.insertAdjacentHTML(
    "beforeend",
    html
  );


  /* =======================================================
     Elements
  ======================================================= */

  const section =
    mountEl.querySelector(".intro");


  const copy =
    section.querySelector("[data-copy]");


  const phoneBoard =
    section.querySelector(
      "[data-phone-board]"
    );


  const main =
    buildGhostText(
      section.querySelector(
        '[data-type="main"]'
      ),
      MAIN_SEGMENTS
    );


  const photos = [
    ...section.querySelectorAll(
      "[data-photo]"
    ),
  ];


  const pairs =
    photos.map((photo) => ({
      photo,

      note:
        section.querySelector(
          `[data-note="${photo.dataset.photoKey}"]`
        ),
    }));


  /* =======================================================
     ★ 중요 ★
     처음에는 사진을 전부 숨긴다.
     
     CSS에서 .photo-el이 기본적으로 보이는 상태여도
     JS가 시작하기 전에 강제로 숨겨놓는다.
  ======================================================= */

  photos.forEach((photo) => {

    photo.style.opacity = "0";

    /*
     * 기존 CSS transform을 깨지 않기 위해
     * translate만 추가하지 않고
     * 등장 전 상태를 명확하게 지정
     */
    photo.style.transform =
      "translate3d(0, 20px, 0) scale(0.96)";

  });


  /* =======================================================
     1. Intro text typing
  ======================================================= */

  let typingStarted = false;
  let photosStarted = false;


  const typeIO =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (
            !entry.isIntersecting ||
            typingStarted
          ) {
            return;
          }


          typingStarted = true;


          /*
           * ===============================================
           * 타이핑 시작
           * ===============================================
           */
          typeChars(
            main,
            30
          );


          /*
           * ===============================================
           * 타이핑 중간부터 사진 등장
           * ===============================================
           *
           * 450ms 후 첫 번째 등장
           *
           * 이후 130ms 간격으로
           * 차례차례 등장
           */
          setTimeout(() => {

            if (photosStarted) {
              return;
            }

            photosStarted = true;


            /*
             * 사진 등장 시작
             */
            landPhotos(
              photos,
              130
            );


          }, 450);


          /*
           * 한 번만 실행
           */
          typeIO.unobserve(
            entry.target
          );

        });

      },
      {
        threshold: 0.5,
      }
    );


  typeIO.observe(copy);


  /* =======================================================
     2. Scroll-driven photo → phone
  ======================================================= */

  setupScrollFly(
    section,
    pairs,
    phoneBoard
  );
}