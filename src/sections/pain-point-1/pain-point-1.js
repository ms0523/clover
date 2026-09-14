import "./pain-point-1.css";
import painPointFlowHtml from "./pain-point-1.html?raw";

import notebookUrl from "../../assets/images/pain-point-1-notebook.png";
import gloveUrl from "../../assets/images/pain-point-1-glove.png";
import handcreamUrl from "../../assets/images/pain-point-1-handcream.png";
import fanUrl from "../../assets/images/pain-point-1-fan.png";
import tumblerUrl from "../../assets/images/pain-point-1-tumbler.png";


/* =========================================================
   01. PAIN POINT 1
   ========================================================= */

function initPainPoint1(section){
  if(!section || section.dataset.painPoint1Ready === "true") return;
  section.dataset.painPoint1Ready="true";

  const pairs=[1,2,3,4,5].map((pairNumber)=>[
    ...section.querySelectorAll(`[data-pp1-pair="${pairNumber}"]`)
  ]);

  // HMR/재마운트 상황에서도 처음부터 순차 등장하도록 강제 초기화
  section.classList.remove("is-visible");
  section.dataset.sequenceDone="false";

  pairs.flat().forEach((el)=>{
    el.classList.remove("is-pair-visible");
  });

  const reducedMotion=window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  )?.matches;

  let sequenceStarted=false;
  const timers=[];

  const revealPair=(index)=>{
    const pair=pairs[index];
    if(!pair) return;

    pair.forEach((el)=>{
      el.classList.add("is-pair-visible");
    });

    if(index === pairs.length-1){
      const doneTimer=window.setTimeout(()=>{
        section.dataset.sequenceDone="true";
      },520);
      timers.push(doneTimer);
    }
  };

  const startSequence=()=>{
    if(sequenceStarted) return;
    sequenceStarted=true;

    section.classList.add("is-visible");

    if(reducedMotion){
      pairs.forEach((_,index)=>revealPair(index));
      return;
    }

    // 타이틀 → 책 → 선풍기 → 장갑 → 텀블러 → 핸드크림
    const firstDelay=360;
    const pairGap=700;

    pairs.forEach((_,index)=>{
      const timer=window.setTimeout(()=>{
        revealPair(index);
      },firstDelay+(index*pairGap));
      timers.push(timer);
    });
  };

  const observer=new IntersectionObserver(
    ([entry])=>{
      if(!entry.isIntersecting) return;
      startSequence();
      observer.disconnect();
    },
    {threshold:.20}
  );

  observer.observe(section);
}


/* =========================================================
   02. PAIN POINTS
   ========================================================= */


const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function initPainPoints(section) {
  if (!section || section.dataset.painPointsReady === "true") return () => {};
  section.dataset.painPointsReady = "true";

  const points = [...section.querySelectorAll("[data-point]")];
  const cardParts = [...section.querySelectorAll("[data-card-part]")];
  const statement = section.querySelector(".pain-points-statement");

  if (points.length !== 3 || cardParts.length !== 3 || !statement) return () => {};

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // 전체 스크롤 체감 속도는 유지하면서, 실제 화면은 목표 진행도를 부드럽게 따라갑니다.
  const SCROLL_BUDGET = 4200;
  const MAX_WHEEL_DELTA = 180;
  const FOLLOW_SPEED = 14; // 카드/문장 전환 속도 (기존 6.2 → 더 빠르게)
  const STATEMENT_DURATION = 450; 
  const FINAL_FOCUS_PROGRESS = 0.74; // "마음 전달" 포인트가 완전히 강조되는 지점 (focusWeights와 동일)

  let targetProgress = clamp(Number(section.dataset.progress || 0), 0, 1);
  let visualProgress = targetProgress;
  let statementVisual = 0;
  let touchY = null;
  let rafId = 0;
  let lastFrame = performance.now();

  // 3개 포인트를 다 돈 뒤에만 한 번 켜집니다.
  let cardsDone = false;
  let statementStartTime = 0;
  let statementReleaseReady = false;

  // 섹션이 화면에 정확히 자리잡기 전까지는 휠 가로채기(카드 전환)를 켜지 않습니다.
  let settled = false;
  let snapTriggered = false;

  const focusWeights = (p) => {
    // 앞 74%에서 취향 → 가격 → 마음 전달을 서로 겹치듯 전환합니다.
    const stepProgress = clamp(p / 0.74, 0, 1);
    const position = stepProgress * 2;
    const left = Math.floor(position);
    const rawFrac = position - left;
    const frac = easeInOutCubic(rawFrac);
    const weights = [0, 0, 0];

    if (left >= 2) {
      weights[2] = 1;
    } else {
      weights[left] = 1 - frac;
      weights[left + 1] = frac;
    }

    return weights;
  };

  const render = (progressValue, statementValue = statementVisual) => {
    const p = clamp(progressValue, 0, 1);
    section.dataset.progress = p.toFixed(4);

    const weights = focusWeights(p);
    const dominant = weights.indexOf(Math.max(...weights));
    section.dataset.step = String(dominant);

    points.forEach((point, index) => {
      const w = easeInOutCubic(weights[index]);
      point.classList.toggle("is-focus", index === dominant);
      point.style.opacity = mix(0.34, 1, w).toFixed(4);
      point.style.transform = `translate3d(${mix(0, 9, w).toFixed(2)}px, 0, 0) scale(${mix(1, 1.045, w).toFixed(4)})`;
    });

    cardParts.forEach((part, index) => {
      const w = easeInOutCubic(weights[index]);
      part.classList.toggle("is-focus", index === dominant);
      part.style.opacity = mix(0.38, 1, w).toFixed(4);
      part.style.transform = `translate3d(0, ${mix(7, 0, w).toFixed(2)}px, 0) scale(${mix(0.982, 1, w).toFixed(4)})`;
    });

    // 결론 문장: 카드 3개를 다 돈 뒤, 스크롤과 무관하게 자동으로 나타납니다.
    const statementAmount = clamp(statementValue, 0, 1);
    statement.style.opacity = statementAmount.toFixed(4);
    statement.style.transform = `translate3d(0, ${mix(30, 0, statementAmount).toFixed(2)}px, 0)`;
  };

  const animate = (now) => {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    // 카드/문장 전환은 기존 감쇠를 유지합니다.
    const follow = 1 - Math.exp(-FOLLOW_SPEED * dt);
    visualProgress += (targetProgress - visualProgress) * follow;

    if (Math.abs(targetProgress - visualProgress) < 0.00015) {
      visualProgress = targetProgress;
    }

    // "마음 전달" 포인트 강조가 화면에 실제로 도달하는 순간, 스크롤을 더 안 해도
    // 자동으로 결론 문장 등장을 시작합니다. (휠 이벤트가 더 없어도 매 프레임 체크)
    if (!cardsDone && visualProgress >= FINAL_FOCUS_PROGRESS) {
      cardsDone = true;
      statementStartTime = now;
    }

    if (cardsDone) {
      const t = clamp((now - statementStartTime) / STATEMENT_DURATION, 0, 1);
      statementVisual = easeInOutCubic(t);
      if (t >= 1) statementReleaseReady = true;
    }

    render(visualProgress, statementVisual);

    const progressMoving = Math.abs(targetProgress - visualProgress) >= 0.00015;
    const statementAnimating = cardsDone && !statementReleaseReady;

    if (progressMoving || statementAnimating) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = 0;
    }
  };

  const requestAnimation = () => {
    if (rafId) return;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(animate);
  };

  const isSectionInControlZone = () => {
    if (!settled) return false;
    if (!section.isConnected) return false;

    const flow = section.closest("[data-pain-point-flow]");
    if (flow && flow.dataset.gloveTransitionReady !== "true") return false;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
    const ratio = visible / Math.max(1, Math.min(vh, rect.height));
    const spansCenter = rect.top <= vh * 0.42 && rect.bottom >= vh * 0.58;

    return ratio >= 0.55 && spansCenter;
  };

  const consumeDelta = (delta) => {
    if (!delta) return false;

    const limitedDelta = clamp(delta, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA);
    const direction = Math.sign(limitedDelta);

    // 결론 문장이 자동으로 다 나타날 때까지는 아래로의 스크롤을 붙잡아둡니다.
    if (direction > 0 && cardsDone && !statementReleaseReady) return true;

    // 문장까지 다 보여줬다면 다음 섹션으로 자연스럽게 넘어가도록 풀어줍니다.
    if (direction > 0 && statementReleaseReady) return false;

    if (direction < 0 && targetProgress <= 0.001 && visualProgress <= 0.008) return false;

    targetProgress = clamp(targetProgress + limitedDelta / SCROLL_BUDGET, 0, 1);
    requestAnimation();
    return true;
  };

  const onWheel = (event) => {
    if (!isSectionInControlZone()) return;

    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    if (event.deltaMode === 2) delta *= window.innerHeight;

    if (consumeDelta(delta)) event.preventDefault();
  };

  const onTouchStart = (event) => {
    if (!event.touches || event.touches.length !== 1) return;
    touchY = event.touches[0].clientY;
  };

  const onTouchMove = (event) => {
    if (touchY == null || !event.touches || event.touches.length !== 1) return;
    if (!isSectionInControlZone()) {
      touchY = event.touches[0].clientY;
      return;
    }

    const nextY = event.touches[0].clientY;
    const delta = (touchY - nextY) * 2.15;
    touchY = nextY;

    if (consumeDelta(delta)) event.preventDefault();
  };

  const onTouchEnd = () => {
    touchY = null;
  };

  const onKeyDown = (event) => {
    if (!isSectionInControlZone()) return;
    const target = event.target;
    if (target && /INPUT|TEXTAREA|SELECT|BUTTON/.test(target.tagName)) return;

    let delta = 0;
    if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") delta = 150;
    if (event.key === "ArrowUp" || event.key === "PageUp") delta = -150;
    if (!delta) return;

    if (consumeDelta(delta)) event.preventDefault();
  };

  const onResize = () => render(visualProgress, statementVisual);

  // 섹션이 자연 스크롤로 화면에 들어오면, 정확한 위치(섹션 상단 = 뷰포트 상단)로
  // 한 번 스냅시킨 뒤에만 휠 가로채기(카드 전환)를 켭니다.
  const snapObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      if (snapTriggered) return;
      snapTriggered = true;

      section.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start"
      });

      window.setTimeout(() => {
        settled = true;
      }, prefersReduced ? 0 : 650);

      snapObserver.disconnect();
    },
    { threshold: 0.15 }
  );

  snapObserver.observe(section);

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.addEventListener("resize", onResize);

  render(visualProgress, statementVisual);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    snapObserver.disconnect();
    window.removeEventListener("wheel", onWheel, { capture: true });
    window.removeEventListener("touchstart", onTouchStart, { capture: true });
    window.removeEventListener("touchmove", onTouchMove, { capture: true });
    window.removeEventListener("touchend", onTouchEnd, { capture: true });
    window.removeEventListener("keydown", onKeyDown, { capture: true });
    window.removeEventListener("resize", onResize);
  };
}



/* =========================================================
   SHARED ELEMENT — GLOVE
   ========================================================= */

function initSharedGloveTransition(flow, firstSection, detailSection){
  if(!flow || !firstSection || !detailSection) return () => {};

  const sourceImage=firstSection.querySelector("[data-shared-glove-source-image]");
  const targetImage=detailSection.querySelector("[data-shared-glove-target-image]");

  if(!sourceImage || !targetImage){
    flow.dataset.gloveTransitionReady="true";
    return () => {};
  }

  const reducedMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if(reducedMotion?.matches){
    flow.dataset.gloveTransitionReady="true";
    return () => {};
  }

  // ★ wrapper/card를 복제하지 않고 장갑 IMG 자체만 복제
  const flight=sourceImage.cloneNode(true);
  flight.className="pain-point-glove-flight";
  flight.removeAttribute("data-shared-glove-source-image");
  flight.removeAttribute("data-shared-glove-target-image");
  document.body.appendChild(flight);

  let metrics=null;
  let targetProgress=0;
  let visualProgress=0;
  let rafId=0;
  let lastFrame=performance.now();

  const clamp01=(v)=>Math.min(1,Math.max(0,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smoothstep=(t)=>t*t*(3-2*t);
  const easeOutCubic=(t)=>1-Math.pow(1-t,3);

  const docRect=(el)=>{
    const r=el.getBoundingClientRect();
    return {
      left:r.left+window.scrollX,
      top:r.top+window.scrollY,
      width:r.width,
      height:r.height,
    };
  };

  const refreshMetrics=()=>{
    const vh=window.innerHeight || document.documentElement.clientHeight || 1;
    const detailTop=detailSection.getBoundingClientRect().top+window.scrollY;

    // pain-point-1이 끝나고 다음 섹션이 아래에서 올라오기 시작할 때 출발
    const startScroll=detailTop-(vh*.94);
    // pain-points가 화면에 충분히 들어오면 카드 속 이미지 위치에 도착
    const endScroll=detailTop-(vh*.18);

    const sourceDoc=docRect(sourceImage);
    const targetDoc=docRect(targetImage);

    metrics={
      startScroll,
      endScroll:Math.max(startScroll+1,endScroll),
      sourceDoc,
      targetDoc,
    };
  };

  const getProgress=()=>{
    if(!metrics) return 0;

    // 5세트 순차 등장 전에는 절대 장갑을 빼지 않음
    if(firstSection.dataset.sequenceDone !== "true") return 0;

    return clamp01(
      (window.scrollY-metrics.startScroll) /
      (metrics.endScroll-metrics.startScroll)
    );
  };

  const setVisibility=(p)=>{
    if(p<=.001){
      flight.style.display="none";

      sourceImage.style.visibility="visible";
      sourceImage.style.opacity="";

      // 다음 섹션의 장갑은 아직 화면 밖에 있으므로 원래 상태 유지
      targetImage.style.visibility="visible";
      targetImage.style.opacity="";

      flow.dataset.gloveTransitionReady="false";
      return;
    }

    if(p>=.999){
      flight.style.display="none";

      // 원래 pain-point-1 카드 자체는 그대로 두고 장갑 이미지만 빠져나간 상태
      sourceImage.style.visibility="hidden";
      sourceImage.style.opacity="0";

      // 도착 후에는 pain-points 카드 안의 장갑으로 전환
      targetImage.style.visibility="visible";
      targetImage.style.opacity="1";

      flow.dataset.gloveTransitionReady="true";
      return;
    }

    // 이동 중에는 원본/도착 장갑만 숨기고, 카드들은 전혀 건드리지 않음
    sourceImage.style.visibility="hidden";
    sourceImage.style.opacity="0";

    targetImage.style.visibility="hidden";
    targetImage.style.opacity="0";

    flight.style.display="block";
    flight.style.opacity="1";

    flow.dataset.gloveTransitionReady=p>=.965 ? "true" : "false";
  };

  const render=(p)=>{
    if(!metrics) return;

    setVisibility(p);
    if(p<=.001 || p>=.999) return;

    const travel=easeOutCubic(p);
    const sizeT=smoothstep(p);

    const sourceViewport={
      left:metrics.sourceDoc.left-window.scrollX,
      top:metrics.sourceDoc.top-window.scrollY,
    };

    const targetViewport={
      left:metrics.targetDoc.left-window.scrollX,
      top:metrics.targetDoc.top-window.scrollY,
    };

    // 오직 장갑 이미지의 bounding box끼리 이동
    const left=mix(sourceViewport.left,targetViewport.left,travel);
    const baseTop=mix(sourceViewport.top,targetViewport.top,travel);

    // 레퍼런스처럼 아주 미세한 '슝' 곡선만
    const arc=Math.sin(Math.PI*p)*14;
    const top=baseTop+arc;

    const width=mix(metrics.sourceDoc.width,metrics.targetDoc.width,sizeT);
    const height=mix(metrics.sourceDoc.height,metrics.targetDoc.height,sizeT);

    flight.style.left=`${left.toFixed(2)}px`;
    flight.style.top=`${top.toFixed(2)}px`;
    flight.style.width=`${width.toFixed(2)}px`;
    flight.style.height=`${height.toFixed(2)}px`;

    // 내려가는 동안 앞/뒤가 한 번 보이도록 Y축으로 1회전
    // 시작/도착 각도는 기존 장갑 방향(140deg)을 그대로 유지합니다.
    const flip=360*smoothstep(p);
    flight.style.transform=
      `rotate(140deg) rotateY(${flip.toFixed(2)}deg) scale(.92)`;
  };

  const animate=(now)=>{
    const dt=Math.min((now-lastFrame)/1000,.05);
    lastFrame=now;

    const follow=1-Math.exp(-8.4*dt);
    visualProgress+=(targetProgress-visualProgress)*follow;

    if(Math.abs(targetProgress-visualProgress)<.00025){
      visualProgress=targetProgress;
    }

    render(visualProgress);

    if(Math.abs(targetProgress-visualProgress)>=.00025){
      rafId=requestAnimationFrame(animate);
    }else{
      rafId=0;
    }
  };

  const requestRender=()=>{
    targetProgress=getProgress();

    if(!rafId){
      lastFrame=performance.now();
      rafId=requestAnimationFrame(animate);
    }
  };

  const onResize=()=>{
    refreshMetrics();
    targetProgress=getProgress();
    visualProgress=targetProgress;
    render(visualProgress);
  };

  refreshMetrics();
  targetProgress=0;
  visualProgress=0;
  render(0);

  window.addEventListener("scroll",requestRender,{passive:true});
  window.addEventListener("resize",onResize);

  // 순차 등장 완료 직후 현재 스크롤 위치를 다시 계산
  const sequenceWatcher=window.setInterval(()=>{
    if(firstSection.dataset.sequenceDone === "true"){
      window.clearInterval(sequenceWatcher);
      refreshMetrics();
      requestRender();
    }
  },120);

  if(document.fonts?.ready){
    document.fonts.ready.then(()=>{
      if(!flow.isConnected) return;
      refreshMetrics();
      requestRender();
    });
  }

  return ()=>{
    if(rafId) cancelAnimationFrame(rafId);
    window.clearInterval(sequenceWatcher);

    window.removeEventListener("scroll",requestRender);
    window.removeEventListener("resize",onResize);

    flight.remove();

    sourceImage.style.visibility="";
    sourceImage.style.opacity="";
    targetImage.style.visibility="";
    targetImage.style.opacity="";

    delete flow.dataset.gloveTransitionReady;
  };
}

/* =========================================================
   MOUNT
   두 섹션을 한 번에 삽입하고 각각의 기존 인터랙션을 초기화합니다.
   다음 단계에서 두 섹션 사이 전환 모션은 이 파일 안에서 연결하면 됩니다.
   ========================================================= */

export function mountPainPoint1(mountEl){
  if(!mountEl) return;

  if(typeof window.__cloverPainPointsCleanup === "function"){
    window.__cloverPainPointsCleanup();
    window.__cloverPainPointsCleanup=null;
  }

  mountEl
    .querySelectorAll(".pain-point-flow, .pain-point-1, .pain-points, .gift-pain")
    .forEach((node)=>node.remove());

  const html=painPointFlowHtml
    .replaceAll("__NOTEBOOK__",notebookUrl)
    .replaceAll("__GLOVE__",gloveUrl)
    .replaceAll("__HANDCREAM__",handcreamUrl)
    .replaceAll("__FAN__",fanUrl)
    .replaceAll("__TUMBLER__",tumblerUrl);

  mountEl.insertAdjacentHTML("beforeend",html);

  const flow=mountEl.querySelector(".pain-point-flow:last-of-type");
  if(!flow) return;

  flow.id = "pain-point-1";

  const firstSection=flow.querySelector(".pain-point-1");
  const detailSection=flow.querySelector(".pain-points");

  initPainPoint1(firstSection);

  const cleanupSharedGlove=initSharedGloveTransition(
    flow,
    firstSection,
    detailSection
  );

  const cleanupPainPoints=initPainPoints(detailSection);

  window.__cloverPainPointsCleanup=()=>{
    cleanupSharedGlove();
    cleanupPainPoints();
  };
}