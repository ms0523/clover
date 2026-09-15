import "./pain-point-1.css";
import painPointFlowHtml from "./pain-point-1.html?raw";

import notebookUrl from "../../assets/images/pain-point-1-notebook.png";
import gloveUrl from "../../assets/images/pain-point-1-glove.png";
import handcreamUrl from "../../assets/images/pain-point-1-handcream.png";
import fanUrl from "../../assets/images/pain-point-1-fan.png";
import tumblerUrl from "../../assets/images/pain-point-1-tumbler.png";


/* =========================================================
   01. PAIN POINT 1
   말풍선 5세트, 원래대로 자동 순차 등장
========================================================= */

function initPainPoint1(section) {
  if (
    !section ||
    section.dataset.painPoint1Ready === "true"
  ) {
    return () => {};
  }

  section.dataset.painPoint1Ready = "true";

  const pairs = [1, 2, 3, 4, 5].map(
    (pairNumber) => [
      ...section.querySelectorAll(
        `[data-pp1-pair="${pairNumber}"]`
      ),
    ]
  );

  /* ---------------------------------------------------------
     초기화
  --------------------------------------------------------- */

  section.classList.remove("is-visible");
  section.dataset.sequenceDone = "false";

  pairs.flat().forEach((el) => {
    el.classList.remove("is-pair-visible");
  });

  const reducedMotion =
    window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

  let sequenceStarted = false;

  const timers = [];


  /* ---------------------------------------------------------
     말풍선 등장
  --------------------------------------------------------- */

  const revealPair = (index) => {
    const pair = pairs[index];

    if (!pair) {
      return;
    }

    pair.forEach((el) => {
      el.classList.add("is-pair-visible");
    });

    if (index === pairs.length - 1) {
      const doneTimer = window.setTimeout(() => {
        section.dataset.sequenceDone = "true";
      }, 520);

      timers.push(doneTimer);
    }
  };


  const startSequence = () => {
    if (sequenceStarted) {
      return;
    }

    sequenceStarted = true;

    section.classList.add("is-visible");

    if (reducedMotion) {
      pairs.forEach((_, index) => {
        revealPair(index);
      });

      return;
    }

    /*
      타이틀 → 책 → 선풍기 → 장갑 → 텀블러 → 핸드크림
    */

    const firstDelay = 360;
    const pairGap = 700;

    pairs.forEach((_, index) => {
      const timer = window.setTimeout(
        () => {
          revealPair(index);
        },
        firstDelay + index * pairGap
      );

      timers.push(timer);
    });
  };


  /* ---------------------------------------------------------
     Intersection
  --------------------------------------------------------- */

  const observer =
    new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        startSequence();

        observer.disconnect();
      },
      {
        threshold: 0.20,
      }
    );

  observer.observe(section);


  /* ---------------------------------------------------------
     말풍선 등장 중에는 아래 스크롤 잠금
  --------------------------------------------------------- */

  if (reducedMotion) {
    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      observer.disconnect();
    };
  }


  const isInControlZone = () => {
    if (!section.isConnected) {
      return false;
    }

    const rect =
      section.getBoundingClientRect();

    const vh =
      window.innerHeight ||
      document.documentElement.clientHeight;

    return (
      rect.top <= vh * 0.5 &&
      rect.bottom >= vh * 0.5
    );
  };


  const sequenceFinished = () =>
    section.dataset.sequenceDone === "true";


  const blockIfScrollingDown = (
    event,
    deltaY
  ) => {
    if (sequenceFinished()) {
      return;
    }

    if (deltaY <= 0) {
      return;
    }

    if (!isInControlZone()) {
      return;
    }

    event.preventDefault();
  };


  const onWheel = (event) => {
    blockIfScrollingDown(
      event,
      event.deltaY
    );
  };


  let touchY = null;


  const onTouchStart = (event) => {
    if (
      !event.touches ||
      event.touches.length !== 1
    ) {
      return;
    }

    touchY =
      event.touches[0].clientY;
  };


  const onTouchMove = (event) => {
    if (
      touchY == null ||
      !event.touches ||
      event.touches.length !== 1
    ) {
      return;
    }

    const nextY =
      event.touches[0].clientY;

    const deltaY =
      touchY - nextY;

    blockIfScrollingDown(
      event,
      deltaY
    );

    touchY = nextY;
  };


  const onTouchEnd = () => {
    touchY = null;
  };


  const onKeyDown = (event) => {
    if (sequenceFinished()) {
      return;
    }

    if (!isInControlZone()) {
      return;
    }

    const target =
      event.target;

    if (
      target &&
      /INPUT|TEXTAREA|SELECT|BUTTON/.test(
        target.tagName
      )
    ) {
      return;
    }

    if (
      event.key === "ArrowDown" ||
      event.key === "PageDown" ||
      event.key === " "
    ) {
      event.preventDefault();
    }
  };


  window.addEventListener(
    "wheel",
    onWheel,
    {
      passive: false,
      capture: true,
    }
  );

  window.addEventListener(
    "touchstart",
    onTouchStart,
    {
      passive: true,
      capture: true,
    }
  );

  window.addEventListener(
    "touchmove",
    onTouchMove,
    {
      passive: false,
      capture: true,
    }
  );

  window.addEventListener(
    "touchend",
    onTouchEnd,
    {
      passive: true,
      capture: true,
    }
  );

  window.addEventListener(
    "keydown",
    onKeyDown,
    {
      capture: true,
    }
  );


  return () => {
    timers.forEach((timer) => {
      window.clearTimeout(timer);
    });

    observer.disconnect();

    window.removeEventListener(
      "wheel",
      onWheel,
      {
        capture: true,
      }
    );

    window.removeEventListener(
      "touchstart",
      onTouchStart,
      {
        capture: true,
      }
    );

    window.removeEventListener(
      "touchmove",
      onTouchMove,
      {
        capture: true,
      }
    );

    window.removeEventListener(
      "touchend",
      onTouchEnd,
      {
        capture: true,
      }
    );

    window.removeEventListener(
      "keydown",
      onKeyDown,
      {
        capture: true,
      }
    );
  };
}


/* =========================================================
   02. PAIN POINTS
   취향 → 가격 → 마음 전달

   ★ Receive 섹션과 같은 실제 Scroll Lock 방식 사용

   진입
   ↓
   section top이 viewport top에 닿음
   ↓
   locked = true
   ↓
   html/body overflow hidden
   ↓
   lockedScrollY 저장
   ↓
   wheel은 브라우저 스크롤을 하지 않고
   카드 step만 변경
   ↓
   카드 3 + 마지막 문장 완료
   ↓
   다음 wheel에서 unlock
========================================================= */

const clamp = (
  value,
  min,
  max
) =>
  Math.min(
    max,
    Math.max(min, value)
  );


const mix = (
  a,
  b,
  t
) =>
  a + (b - a) * t;


const easeInOutCubic = (t) =>
  t < 0.5
    ? 4 * t * t * t
    : 1 -
      Math.pow(
        -2 * t + 2,
        3
      ) / 2;


function initPainPoints(section) {
  if (
    !section ||
    section.dataset.painPointsReady ===
      "true"
  ) {
    return () => {};
  }

  section.dataset.painPointsReady =
    "true";


  /* =======================================================
     DOM
  ======================================================= */

  const points = [
    ...section.querySelectorAll(
      "[data-point]"
    ),
  ];

  const cardParts = [
    ...section.querySelectorAll(
      "[data-card-part]"
    ),
  ];

  const statement =
    section.querySelector(
      ".pain-points-statement"
    );


  if (
    points.length !== 3 ||
    cardParts.length !== 3 ||
    !statement
  ) {
    return () => {};
  }


  const prefersReduced =
    window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;


  /* =======================================================
     SETTINGS
  ======================================================= */

  const FOLLOW_SPEED = 14;

  const STATEMENT_DURATION = 450;

  const FINAL_FOCUS_PROGRESS = 0.74;


  /*
    0 = 취향
    1 = 가격
    2 = 마음 전달
  */

  const STEP_PROGRESS = [
    0,
    FINAL_FOCUS_PROGRESS / 2,
    FINAL_FOCUS_PROGRESS,
  ];

  const LAST_STEP =
    STEP_PROGRESS.length - 1;


  /*
    Receive와 동일한 wheel 감도
  */

  const WHEEL_END_DELAY = 180;

  const STEP_COOLDOWN_MS = 900;


  /* =======================================================
     STATE
  ======================================================= */

  let step = 0;

  let targetProgress =
    STEP_PROGRESS[0];

  let visualProgress =
    targetProgress;

  let statementVisual = 0;

  let touchY = null;

  let rafId = 0;

  let lastFrame =
    performance.now();


  /*
    카드 3개 완료 여부
  */

  let cardsDone = false;

  let statementStartTime = 0;

  let statementReleaseReady = false;


  /*
    ⭐ 실제 scroll lock 상태
  */

  let locked = false;

  let lockedScrollY = 0;


  /*
    위/아래 진입 재무장
  */

  let armedTop = true;

  let armedBottom = true;


  /*
    마지막 scroll 위치
  */

  let lastScrollY =
    window.scrollY;


  /*
    wheel gesture
  */

  let wheelEndTimer = null;

  let wheelGestureLocked = false;

  let stepCooldownUntil = 0;


  /* =======================================================
     FLOW
  ======================================================= */

  const flow =
    section.closest(
      "[data-pain-point-flow]"
    );


  const gloveTransitionFinished =
    () => {
      if (!flow) {
        return true;
      }

      return (
        flow.dataset
          .gloveTransitionReady ===
        "true"
      );
    };


  /* =======================================================
     WHEEL GESTURE
  ======================================================= */

  const startNewWheelGesture =
    () => {
      wheelGestureLocked = false;
    };


  const markWheelGesture =
    () => {
      wheelGestureLocked = true;

      if (wheelEndTimer) {
        clearTimeout(
          wheelEndTimer
        );
      }

      wheelEndTimer =
        window.setTimeout(
          () => {
            startNewWheelGesture();
          },
          WHEEL_END_DELAY
        );
    };


  /* =======================================================
     FOCUS WEIGHTS
  ======================================================= */

  const focusWeights = (p) => {
    const stepProgress =
      clamp(
        p / FINAL_FOCUS_PROGRESS,
        0,
        1
      );

    const position =
      stepProgress * 2;

    const left =
      Math.floor(position);

    const rawFrac =
      position - left;

    const frac =
      easeInOutCubic(
        rawFrac
      );

    const weights = [
      0,
      0,
      0,
    ];


    if (left >= 2) {
      weights[2] = 1;
    } else {
      weights[left] =
        1 - frac;

      weights[left + 1] =
        frac;
    }

    return weights;
  };


  /* =======================================================
     RENDER
  ======================================================= */

  const render = (
    progressValue,
    statementValue =
      statementVisual
  ) => {

    const p =
      clamp(
        progressValue,
        0,
        1
      );


    section.dataset.progress =
      p.toFixed(4);


    const weights =
      focusWeights(p);


    const dominant =
      weights.indexOf(
        Math.max(...weights)
      );


    section.dataset.step =
      String(dominant);


    /* -----------------------------------------------------
       POINTS
    ----------------------------------------------------- */

    points.forEach(
      (point, index) => {

        const w =
          easeInOutCubic(
            weights[index]
          );


        point.classList.toggle(
          "is-focus",
          index === dominant
        );


        point.style.opacity =
          mix(
            0.34,
            1,
            w
          ).toFixed(4);


        point.style.transform =
          `translate3d(${mix(
            0,
            9,
            w
          ).toFixed(2)}px, 0, 0) scale(${mix(
            1,
            1.045,
            w
          ).toFixed(4)})`;
      }
    );


    /* -----------------------------------------------------
       CARDS
    ----------------------------------------------------- */

    cardParts.forEach(
      (part, index) => {

        const w =
          easeInOutCubic(
            weights[index]
          );


        part.classList.toggle(
          "is-focus",
          index === dominant
        );


        part.style.opacity =
          mix(
            0.38,
            1,
            w
          ).toFixed(4);


        part.style.transform =
          `translate3d(0, ${mix(
            7,
            0,
            w
          ).toFixed(2)}px, 0) scale(${mix(
            0.982,
            1,
            w
          ).toFixed(4)})`;
      }
    );


    /* -----------------------------------------------------
       STATEMENT
    ----------------------------------------------------- */

    const statementAmount =
      clamp(
        statementValue,
        0,
        1
      );


    statement.style.opacity =
      statementAmount.toFixed(4);


    statement.style.transform =
      `translate3d(0, ${mix(
        30,
        0,
        statementAmount
      ).toFixed(2)}px, 0)`;
  };


  /* =======================================================
     ANIMATION
  ======================================================= */

  const animate = (now) => {

    const dt =
      Math.min(
        (now - lastFrame) / 1000,
        0.05
      );


    lastFrame = now;


    const follow =
      1 -
      Math.exp(
        -FOLLOW_SPEED * dt
      );


    visualProgress +=
      (
        targetProgress -
        visualProgress
      ) * follow;


    if (
      Math.abs(
        targetProgress -
        visualProgress
      ) < 0.00015
    ) {
      visualProgress =
        targetProgress;
    }


    /* -----------------------------------------------------
       CARD 3 완료
    ----------------------------------------------------- */

    if (
      !cardsDone &&
      visualProgress >=
        FINAL_FOCUS_PROGRESS
    ) {

      cardsDone = true;

      statementStartTime =
        now;
    }


    /* -----------------------------------------------------
       마지막 문장 자동 등장
    ----------------------------------------------------- */

    if (cardsDone) {

      const t =
        clamp(
          (
            now -
            statementStartTime
          ) /
            STATEMENT_DURATION,
          0,
          1
        );


      statementVisual =
        easeInOutCubic(t);


      if (t >= 1) {
        statementReleaseReady =
          true;
      }
    }


    render(
      visualProgress,
      statementVisual
    );


    const progressMoving =
      Math.abs(
        targetProgress -
        visualProgress
      ) >= 0.00015;


    const statementAnimating =
      cardsDone &&
      !statementReleaseReady;


    if (
      progressMoving ||
      statementAnimating
    ) {

      rafId =
        requestAnimationFrame(
          animate
        );

    } else {

      rafId = 0;
    }
  };


  const requestAnimation =
    () => {

      if (rafId) {
        return;
      }

      lastFrame =
        performance.now();

      rafId =
        requestAnimationFrame(
          animate
        );
    };


  /* =======================================================
     STEP
  ======================================================= */

  const goToStep = (
    nextStep
  ) => {

    step =
      clamp(
        nextStep,
        0,
        LAST_STEP
      );


    targetProgress =
      STEP_PROGRESS[step];


    requestAnimation();
  };


  /* =======================================================
     ⭐ REAL SCROLL LOCK
     
     Receive에서 잘 붙잡히던 방식 그대로
  ======================================================= */

  const engageLock = () => {

    if (locked) {
      return;
    }


    locked = true;


    /*
      현재 페이지 위치 저장
    */

    lockedScrollY =
      window.scrollY;


    /*
      ⭐ 브라우저 자체 스크롤 차단
    */

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.overflow =
      "hidden";
  };


  const releaseLock = () => {

    if (!locked) {
      return;
    }


    locked = false;


    /*
      브라우저 스크롤 복구
    */

    document.documentElement.style.overflow =
      "";

    document.body.style.overflow =
      "";
  };


  /* =======================================================
     ENTRY
     
     Receive의 checkEntry 방식과 동일
  ======================================================= */

  const checkEntry = () => {

    if (locked) {
      return;
    }


    /*
      장갑 이동이 아직 끝나지 않았다면
      카드 영역을 잡지 않는다.
    */

    if (
      !gloveTransitionFinished()
    ) {
      lastScrollY =
        window.scrollY;

      return;
    }


    const currentScrollY =
      window.scrollY;


    const scrollingDown =
      currentScrollY >
      lastScrollY;


    const scrollingUp =
      currentScrollY <
      lastScrollY;


    const rect =
      section.getBoundingClientRect();


    /*
      ⭐ 카드 영역 상단이
         viewport 상단에 닿았는지
    */

    const reachedTop =
      rect.top <= 0 &&
      rect.bottom > 0;


    /*
      아래쪽에서 위로 다시 들어오는 경우
    */

    const reachedBottom =
      rect.bottom >=
        window.innerHeight &&
      rect.top < 0;


    /* =====================================================
       DOWN ENTRY

       말풍선
       ↓
       장갑
       ↓
       카드 영역
       ↓
       ⭐ LOCK
    ===================================================== */

    if (
      armedTop &&
      scrollingDown &&
      reachedTop
    ) {

      armedTop = false;


      /*
        첫 카드부터 시작
      */

      step = 0;

      targetProgress =
        STEP_PROGRESS[0];

      visualProgress =
        targetProgress;


      cardsDone = false;

      statementVisual = 0;

      statementReleaseReady =
        false;


      setActiveStepOnly();


      /*
        ⭐ 바로 lock
      */

      engageLock();


      /*
        진입 자체가 하나의 wheel gesture이므로
        바로 카드 2로 넘어가지 않게 함
      */

      markWheelGesture();


      stepCooldownUntil =
        performance.now() +
        STEP_COOLDOWN_MS;


      requestAnimation();


    } else if (
      /*
        카드 영역 아래까지 내려갔다가
        다시 위로 올라오는 경우
      */

      armedBottom &&
      scrollingUp &&
      reachedBottom
    ) {

      armedBottom = false;


      /*
        카드 3부터 시작
      */

      step = LAST_STEP;

      targetProgress =
        STEP_PROGRESS[step];

      visualProgress =
        targetProgress;


      cardsDone = true;

      statementVisual = 1;

      statementReleaseReady =
        true;


      setActiveStepOnly();


      engageLock();


      markWheelGesture();


      stepCooldownUntil =
        performance.now() +
        STEP_COOLDOWN_MS;


      requestAnimation();
    }


    /*
      위에서 완전히 벗어나면
      다시 아래 진입 가능
    */

    if (
      !armedTop &&
      rect.top >=
        window.innerHeight
    ) {

      armedTop = true;
    }


    /*
      아래에서 완전히 벗어나면
      다시 위 진입 가능
    */

    if (
      !armedBottom &&
      rect.bottom <= 0
    ) {

      armedBottom = true;
    }


    lastScrollY =
      currentScrollY;
  };


  /* =======================================================
     ENTRY에서 현재 step만 즉시 반영
  ======================================================= */

  const setActiveStepOnly =
    () => {

      render(
        visualProgress,
        statementVisual
      );
    };


  /* =======================================================
     WHEEL
     
     ⭐ LOCK 상태에서는 무조건 preventDefault
  ======================================================= */

  const onWheel = (event) => {

    /*
      아직 카드 영역에 들어오지 않았다면
      브라우저 기본 스크롤
    */

    if (!locked) {
      return;
    }


    /*
      ⭐⭐⭐ 핵심 ⭐⭐⭐

      Receive처럼
      lock 상태에서는
      브라우저 스크롤을 무조건 차단
    */

    event.preventDefault();


    let deltaY =
      event.deltaY;


    /*
      mouse wheel / line mode 대응
    */

    if (
      event.deltaMode === 1
    ) {
      deltaY *= 16;
    }


    if (
      event.deltaMode === 2
    ) {
      deltaY *=
        window.innerHeight;
    }


    if (!deltaY) {
      return;
    }


    /* =====================================================
       CARD 1에서 위로
       
       → lock 해제
       → 이전 영역으로 이동
    ===================================================== */

    if (
      deltaY < 0 &&
      step === 0
    ) {

      releaseLock();


      wheelGestureLocked =
        true;


      markWheelGesture();


      window.scrollTo({
        top: Math.max(
          0,
          lockedScrollY - 600
        ),
        behavior:
          prefersReduced
            ? "auto"
            : "smooth",
      });


      return;
    }


    /* =====================================================
       마지막 문장 등장 중
       
       → 계속 붙잡음
    ===================================================== */

    if (
      cardsDone &&
      !statementReleaseReady
    ) {

      markWheelGesture();

      return;
    }


    /* =====================================================
       같은 wheel gesture
       
       → 추가 카드 전환 금지
    ===================================================== */

    if (wheelGestureLocked) {

      markWheelGesture();

      return;
    }


    /* =====================================================
       STEP COOLDOWN
    ===================================================== */

    const now =
      performance.now();


    if (
      now <
      stepCooldownUntil
    ) {

      markWheelGesture();

      return;
    }


    /* =====================================================
       현재 wheel을
       하나의 gesture로 확정
    ===================================================== */

    markWheelGesture();


    stepCooldownUntil =
      now +
      STEP_COOLDOWN_MS;


    /* =====================================================
       DOWN
       
       카드 1
       ↓
       카드 2
       ↓
       카드 3
       ↓
       마지막 문장
       ↓
       다음 섹션
    ===================================================== */

    if (
      deltaY > 0
    ) {

      /* 카드 1 → 카드 2 */

      if (step === 0) {

        goToStep(1);

        return;
      }


      /* 카드 2 → 카드 3 */

      if (step === 1) {

        goToStep(2);

        return;
      }


      /*
        카드 3 + 문장까지 완료된 후
        다음 섹션으로 이동
      */

      if (
        step === 2 &&
        statementReleaseReady
      ) {

        releaseLock();


        window.scrollTo({
          top:
            lockedScrollY + 600,
          behavior:
            prefersReduced
              ? "auto"
              : "smooth",
        });


        return;
      }


      return;
    }


    /* =====================================================
       UP
       
       카드 3 → 카드 2 → 카드 1
    ===================================================== */

    if (
      deltaY < 0
    ) {

      if (step === 2) {

        goToStep(1);

        return;
      }


      if (step === 1) {

        goToStep(0);

        return;
      }
    }
  };


  /* =======================================================
     TOUCH
  ======================================================= */

  const onTouchStart = (
    event
  ) => {

    if (
      !event.touches ||
      event.touches.length !== 1
    ) {
      return;
    }


    touchY =
      event.touches[0].clientY;
  };


  const onTouchMove = (
    event
  ) => {

    if (
      touchY == null ||
      !event.touches ||
      event.touches.length !== 1
    ) {
      return;
    }


    /*
      lock이 아니면
      일반 touch scroll
    */

    if (!locked) {

      touchY =
        event.touches[0].clientY;

      return;
    }


    const nextY =
      event.touches[0].clientY;


    /*
      손가락 위로
      = 화면 아래로
      = 양수
    */

    const delta =
      (
        touchY -
        nextY
      ) * 2.15;


    touchY =
      nextY;


    if (!delta) {
      return;
    }


    const consumed =
      consumeTouchDelta(
        delta
      );


    if (consumed) {
      event.preventDefault();
    }
  };


  const onTouchEnd = () => {
    touchY = null;
  };


  /* =======================================================
     TOUCH용 consume
  ======================================================= */

  const consumeTouchDelta = (
    delta
  ) => {

    if (!locked) {
      return false;
    }


    const direction =
      Math.sign(delta);


    /*
      마지막 문장 등장 중
    */

    if (
      direction > 0 &&
      cardsDone &&
      !statementReleaseReady
    ) {

      markWheelGesture();

      return true;
    }


    /*
      첫 카드에서 위
    */

    if (
      direction < 0 &&
      step === 0
    ) {

      releaseLock();


      window.scrollTo({
        top: Math.max(
          0,
          lockedScrollY - 600
        ),
        behavior:
          prefersReduced
            ? "auto"
            : "smooth",
      });


      markWheelGesture();

      return false;
    }


    /*
      이미 같은 gesture
    */

    if (
      wheelGestureLocked
    ) {

      markWheelGesture();

      return true;
    }


    const now =
      performance.now();


    if (
      now <
      stepCooldownUntil
    ) {

      markWheelGesture();

      return true;
    }


    markWheelGesture();


    stepCooldownUntil =
      now +
      STEP_COOLDOWN_MS;


    /*
      DOWN
    */

    if (
      direction > 0
    ) {

      if (step === 0) {

        goToStep(1);

        return true;
      }


      if (step === 1) {

        goToStep(2);

        return true;
      }


      if (
        step === 2 &&
        statementReleaseReady
      ) {

        releaseLock();

        window.scrollTo({
          top:
            lockedScrollY + 600,
          behavior:
            prefersReduced
              ? "auto"
              : "smooth",
        });

        return false;
      }


      return true;
    }


    /*
      UP
    */

    if (
      direction < 0
    ) {

      if (step === 2) {

        goToStep(1);

        return true;
      }


      if (step === 1) {

        goToStep(0);

        return true;
      }
    }


    return true;
  };


  /* =======================================================
     KEYBOARD
  ======================================================= */

  const onKeyDown = (
    event
  ) => {

    if (!locked) {
      return;
    }


    const target =
      event.target;


    if (
      target &&
      /INPUT|TEXTAREA|SELECT|BUTTON/.test(
        target.tagName
      )
    ) {
      return;
    }


    let delta = 0;


    if (
      event.key ===
        "ArrowDown" ||
      event.key ===
        "PageDown" ||
      event.key === " "
    ) {

      delta = 150;
    }


    if (
      event.key ===
        "ArrowUp" ||
      event.key ===
        "PageUp"
    ) {

      delta = -150;
    }


    if (!delta) {
      return;
    }


    /*
      wheel과 동일하게 처리
    */

    event.preventDefault();


    if (
      delta > 0 &&
      cardsDone &&
      !statementReleaseReady
    ) {
      markWheelGesture();
      return;
    }


    if (
      delta < 0 &&
      step === 0
    ) {

      releaseLock();

      window.scrollTo({
        top: Math.max(
          0,
          lockedScrollY - 600
        ),
        behavior:
          prefersReduced
            ? "auto"
            : "smooth",
      });

      markWheelGesture();

      return;
    }


    if (
      wheelGestureLocked
    ) {

      markWheelGesture();

      return;
    }


    const now =
      performance.now();


    if (
      now <
      stepCooldownUntil
    ) {

      markWheelGesture();

      return;
    }


    markWheelGesture();


    stepCooldownUntil =
      now +
      STEP_COOLDOWN_MS;


    if (delta > 0) {

      if (step === 0) {
        goToStep(1);
        return;
      }


      if (step === 1) {
        goToStep(2);
        return;
      }


      if (
        step === 2 &&
        statementReleaseReady
      ) {

        releaseLock();

        window.scrollTo({
          top:
            lockedScrollY + 600,
          behavior:
            prefersReduced
              ? "auto"
              : "smooth",
        });
      }

      return;
    }


    if (delta < 0) {

      if (step === 2) {
        goToStep(1);
        return;
      }


      if (step === 1) {
        goToStep(0);
        return;
      }
    }
  };


  /* =======================================================
     SCROLL
     
     ⭐ Receive와 동일한 핵심 부분
  ======================================================= */

  const onScroll = () => {

    /*
      ⭐ LOCK 상태에서는
      페이지가 조금이라도 움직이면
      저장해둔 위치로 즉시 복귀
    */

    if (locked) {

      if (
        Math.abs(
          window.scrollY -
          lockedScrollY
        ) > 1
      ) {

        window.scrollTo({
          top:
            lockedScrollY,
          behavior:
            "instant",
        });
      }


      return;
    }


    /*
      LOCK 전에는
      자연 스크롤 진입 체크
    */

    checkEntry();
  };


  /* =======================================================
     RESIZE
  ======================================================= */

  const onResize = () => {

    if (!locked) {
      return;
    }


    /*
      현재 위치 유지
    */

    lockedScrollY =
      window.scrollY;


    window.scrollTo({
      top:
        lockedScrollY,
      behavior:
        "instant",
    });
  };


  /* =======================================================
     EVENTS
  ======================================================= */

  window.addEventListener(
    "wheel",
    onWheel,
    {
      passive: false,
      capture: true,
    }
  );


  window.addEventListener(
    "touchstart",
    onTouchStart,
    {
      passive: true,
      capture: true,
    }
  );


  window.addEventListener(
    "touchmove",
    onTouchMove,
    {
      passive: false,
      capture: true,
    }
  );


  window.addEventListener(
    "touchend",
    onTouchEnd,
    {
      passive: true,
      capture: true,
    }
  );


  window.addEventListener(
    "keydown",
    onKeyDown,
    {
      capture: true,
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


  /* =======================================================
     INITIAL
  ======================================================= */

  render(
    visualProgress,
    statementVisual
  );


  /* =======================================================
     CLEANUP
  ======================================================= */

  return () => {

    if (rafId) {
      cancelAnimationFrame(
        rafId
      );
    }


    if (wheelEndTimer) {
      clearTimeout(
        wheelEndTimer
      );
    }


    /*
      혹시 lock 상태에서
      마운트가 제거되는 경우
      반드시 overflow 복구
    */

    releaseLock();


    window.removeEventListener(
      "wheel",
      onWheel,
      {
        capture: true,
      }
    );


    window.removeEventListener(
      "touchstart",
      onTouchStart,
      {
        capture: true,
      }
    );


    window.removeEventListener(
      "touchmove",
      onTouchMove,
      {
        capture: true,
      }
    );


    window.removeEventListener(
      "touchend",
      onTouchEnd,
      {
        capture: true,
      }
    );


    window.removeEventListener(
      "keydown",
      onKeyDown,
      {
        capture: true,
      }
    );


    window.removeEventListener(
      "scroll",
      onScroll
    );


    window.removeEventListener(
      "resize",
      onResize
    );
  };
}


/* =========================================================
   03. SHARED ELEMENT — GLOVE
========================================================= */

function initSharedGloveTransition(
  flow,
  firstSection,
  detailSection
) {
  if (
    !flow ||
    !firstSection ||
    !detailSection
  ) {
    return () => {};
  }


  const sourceImage =
    firstSection.querySelector(
      "[data-shared-glove-source-image]"
    );


  const targetImage =
    detailSection.querySelector(
      "[data-shared-glove-target-image]"
    );


  if (
    !sourceImage ||
    !targetImage
  ) {

    flow.dataset.gloveTransitionReady =
      "true";

    return () => {};
  }


  const reducedMotion =
    window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    );


  if (
    reducedMotion?.matches
  ) {

    flow.dataset.gloveTransitionReady =
      "true";

    return () => {};
  }


  /*
    wrapper/card를 복제하지 않고
    장갑 IMG 자체만 복제
  */

  const flight =
    sourceImage.cloneNode(true);


  flight.className =
    "pain-point-glove-flight";


  flight.removeAttribute(
    "data-shared-glove-source-image"
  );


  flight.removeAttribute(
    "data-shared-glove-target-image"
  );


  document.body.appendChild(
    flight
  );


  let metrics = null;

  let targetProgress = 0;

  let visualProgress = 0;

  let rafId = 0;

  let lastFrame =
    performance.now();


  const clamp01 = (v) =>
    Math.min(
      1,
      Math.max(0, v)
    );


  const mix = (
    a,
    b,
    t
  ) =>
    a + (b - a) * t;


  const smoothstep = (t) =>
    t * t * (3 - 2 * t);


  const easeOutCubic = (t) =>
    1 -
    Math.pow(
      1 - t,
      3
    );


  const docRect = (el) => {

    const r =
      el.getBoundingClientRect();


    return {
      left:
        r.left +
        window.scrollX,

      top:
        r.top +
        window.scrollY,

      width:
        r.width,

      height:
        r.height,
    };
  };


  const refreshMetrics = () => {

    const vh =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      1;


    const detailTop =
      detailSection
        .getBoundingClientRect()
        .top +
      window.scrollY;


    /*
      pain-point-1이 끝나고
      다음 섹션이 아래에서 올라오기 시작할 때 출발
    */

    const startScroll =
      detailTop -
      vh * 0.94;


    /*
      pain-points가 화면에 충분히 들어오면
      카드 속 이미지 위치에 도착
    */

    const endScroll =
      detailTop -
      vh * 0.18;


    const sourceDoc =
      docRect(
        sourceImage
      );


    const targetDoc =
      docRect(
        targetImage
      );


    metrics = {
      startScroll,

      endScroll:
        Math.max(
          startScroll + 1,
          endScroll
        ),

      sourceDoc,

      targetDoc,
    };
  };


  const getProgress = () => {

    if (!metrics) {
      return 0;
    }


    /*
      5세트 순차 등장 전에는
      절대 장갑을 빼지 않음
    */

    if (
      firstSection.dataset
        .sequenceDone !==
      "true"
    ) {
      return 0;
    }


    return clamp01(
      (
        window.scrollY -
        metrics.startScroll
      ) /
        (
          metrics.endScroll -
          metrics.startScroll
        )
    );
  };


  const setVisibility = (p) => {

    if (p <= 0.001) {

      flight.style.display =
        "none";


      sourceImage.style.visibility =
        "visible";


      sourceImage.style.opacity =
        "";


      targetImage.style.visibility =
        "visible";


      targetImage.style.opacity =
        "";


      flow.dataset.gloveTransitionReady =
        "false";


      return;
    }


    if (p >= 0.999) {

      flight.style.display =
        "none";


      /*
        원래 pain-point-1 카드 자체는 그대로 두고
        장갑 이미지만 빠져나간 상태
      */

      sourceImage.style.visibility =
        "hidden";


      sourceImage.style.opacity =
        "0";


      /*
        도착 후에는 pain-points 카드 안의 장갑으로 전환
      */

      targetImage.style.visibility =
        "visible";


      targetImage.style.opacity =
        "1";


      flow.dataset.gloveTransitionReady =
        "true";


      return;
    }


    /*
      이동 중에는 원본/도착 장갑만 숨김
      카드들은 전혀 건드리지 않음
    */

    sourceImage.style.visibility =
      "hidden";


    sourceImage.style.opacity =
      "0";


    targetImage.style.visibility =
      "hidden";


    targetImage.style.opacity =
      "0";


    flight.style.display =
      "block";


    flight.style.opacity =
      "1";


    flow.dataset.gloveTransitionReady =
      p >= 0.965
        ? "true"
        : "false";
  };


  const renderFlight = (p) => {

    if (!metrics) {
      return;
    }


    setVisibility(p);


    if (
      p <= 0.001 ||
      p >= 0.999
    ) {
      return;
    }


    const travel =
      easeOutCubic(p);


    const sizeT =
      smoothstep(p);


    const sourceViewport = {
      left:
        metrics.sourceDoc.left -
        window.scrollX,

      top:
        metrics.sourceDoc.top -
        window.scrollY,
    };


    const targetViewport = {
      left:
        metrics.targetDoc.left -
        window.scrollX,

      top:
        metrics.targetDoc.top -
        window.scrollY,
    };


    /*
      오직 장갑 이미지 bounding box끼리 이동
    */

    const left =
      mix(
        sourceViewport.left,
        targetViewport.left,
        travel
      );


    const baseTop =
      mix(
        sourceViewport.top,
        targetViewport.top,
        travel
      );


    /*
      미세한 곡선
    */

    const arc =
      Math.sin(
        Math.PI * p
      ) * 14;


    const top =
      baseTop + arc;


    const width =
      mix(
        metrics.sourceDoc.width,
        metrics.targetDoc.width,
        sizeT
      );


    const height =
      mix(
        metrics.sourceDoc.height,
        metrics.targetDoc.height,
        sizeT
      );


    flight.style.left =
      `${left.toFixed(2)}px`;


    flight.style.top =
      `${top.toFixed(2)}px`;


    flight.style.width =
      `${width.toFixed(2)}px`;


    flight.style.height =
      `${height.toFixed(2)}px`;


    /*
      내려가는 동안 앞/뒤가 한 번 보이도록
      Y축으로 1회전
    */

    const flip =
      360 *
      smoothstep(p);


    flight.style.transform =
      `rotate(140deg) rotateY(${flip.toFixed(
        2
      )}deg) scale(.92)`;
  };


  const animateFlight = (
    now
  ) => {

    const dt =
      Math.min(
        (now - lastFrame) /
          1000,
        0.05
      );


    lastFrame = now;


    const follow =
      1 -
      Math.exp(
        -8.4 * dt
      );


    visualProgress +=
      (
        targetProgress -
        visualProgress
      ) * follow;


    if (
      Math.abs(
        targetProgress -
        visualProgress
      ) < 0.00025
    ) {

      visualProgress =
        targetProgress;
    }


    renderFlight(
      visualProgress
    );


    if (
      Math.abs(
        targetProgress -
        visualProgress
      ) >= 0.00025
    ) {

      rafId =
        requestAnimationFrame(
          animateFlight
        );

    } else {

      rafId = 0;
    }
  };


  const requestRender = () => {

    targetProgress =
      getProgress();


    if (!rafId) {

      lastFrame =
        performance.now();


      rafId =
        requestAnimationFrame(
          animateFlight
        );
    }
  };


  const onResize = () => {

    refreshMetrics();

    targetProgress =
      getProgress();

    visualProgress =
      targetProgress;

    renderFlight(
      visualProgress
    );
  };


  refreshMetrics();

  targetProgress = 0;

  visualProgress = 0;

  renderFlight(0);


  window.addEventListener(
    "scroll",
    requestRender,
    {
      passive: true,
    }
  );


  window.addEventListener(
    "resize",
    onResize
  );


  /*
    순차 등장 완료 직후
    현재 스크롤 위치를 다시 계산
  */

  const sequenceWatcher =
    window.setInterval(
      () => {

        if (
          firstSection.dataset
            .sequenceDone ===
          "true"
        ) {

          window.clearInterval(
            sequenceWatcher
          );


          refreshMetrics();

          requestRender();
        }
      },
      120
    );


  if (document.fonts?.ready) {

    document.fonts.ready.then(
      () => {

        if (
          !flow.isConnected
        ) {
          return;
        }


        refreshMetrics();

        requestRender();
      }
    );
  }


  return () => {

    if (rafId) {
      cancelAnimationFrame(
        rafId
      );
    }


    window.clearInterval(
      sequenceWatcher
    );


    window.removeEventListener(
      "scroll",
      requestRender
    );


    window.removeEventListener(
      "resize",
      onResize
    );


    flight.remove();


    sourceImage.style.visibility =
      "";


    sourceImage.style.opacity =
      "";


    targetImage.style.visibility =
      "";


    targetImage.style.opacity =
      "";


    delete flow.dataset
      .gloveTransitionReady;
  };
}


/* =========================================================
   MOUNT
========================================================= */

export function mountPainPoint1(
  mountEl
) {
  if (!mountEl) {
    return;
  }


  /*
    기존 마운트 제거
  */

  if (
    typeof window.__cloverPainPointsCleanup ===
    "function"
  ) {

    window.__cloverPainPointsCleanup();

    window.__cloverPainPointsCleanup =
      null;
  }


  mountEl
    .querySelectorAll(
      ".pain-point-flow, .pain-point-1, .pain-points, .gift-pain"
    )
    .forEach(
      (node) =>
        node.remove()
    );


  /*
    HTML
  */

  const html =
    painPointFlowHtml
      .replaceAll(
        "__NOTEBOOK__",
        notebookUrl
      )
      .replaceAll(
        "__GLOVE__",
        gloveUrl
      )
      .replaceAll(
        "__HANDCREAM__",
        handcreamUrl
      )
      .replaceAll(
        "__FAN__",
        fanUrl
      )
      .replaceAll(
        "__TUMBLER__",
        tumblerUrl
      );


  mountEl.insertAdjacentHTML(
    "beforeend",
    html
  );


  /*
    FLOW
  */

  const flow =
    mountEl.querySelector(
      ".pain-point-flow:last-of-type"
    );


  if (!flow) {
    return;
  }


  flow.id =
    "pain-point-1";


  const firstSection =
    flow.querySelector(
      ".pain-point-1"
    );


  const detailSection =
    flow.querySelector(
      ".pain-points"
    );


  /*
    INIT
  */

  const cleanupPainPoint1 =
    initPainPoint1(
      firstSection
    );


  const cleanupSharedGlove =
    initSharedGloveTransition(
      flow,
      firstSection,
      detailSection
    );


  const cleanupPainPoints =
    initPainPoints(
      detailSection
    );


  /*
    CLEANUP
  */

  window.__cloverPainPointsCleanup =
    () => {

      cleanupPainPoint1();

      cleanupSharedGlove();

      cleanupPainPoints();
    };
}