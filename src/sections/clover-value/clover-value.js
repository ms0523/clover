import "./clover-value.css";
import cloverValueHtml from "./clover-value.html?raw";

import v01Sharp from "../../assets/images/value-01-sharp.png";
import v01Blur from "../../assets/images/value-01-blur.png";
import v02Sharp from "../../assets/images/value-02-sharp.png";
import v02Blur from "../../assets/images/value-02-blur.png";
import v03Sharp from "../../assets/images/value-03-sharp.png";
import v03Blur from "../../assets/images/value-03-blur.png";

const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const clamp01=(v)=>clamp(v,0,1);

function smoothstep(v){
  const t=clamp01(v);
  return t*t*(3-2*t);
}

function easeOutCubic(t){
  const c=clamp01(t);
  return 1-Math.pow(1-c,3);
}

function initCloverValue(section){
  if(!section || section.dataset.valueReady==="true") return () => {};
  section.dataset.valueReady="true";
  section.id = "clover-value";

  const track=section.querySelector(".clover-value__track");
  const cards=[...section.querySelectorAll("[data-value-card]")];
  if(!track || cards.length!==3) return () => {};

  const prefersReduced=window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  )?.matches;

  /* =======================================================
     카드1 → 카드2 → 카드3, 휠 제스처 하나당 스텝 하나만 전환
     ------------------------------------------------------
     CSS transition에만 맡겼더니 브라우저의 "동작 줄이기"
     (prefers-reduced-motion) 설정이 켜져 있으면 transition이
     통째로 씹혀서 스텝이 순간이동해버리는 문제가 있었습니다.
     그래서 다시 JS가 직접 매 프레임 보간하는 방식으로 되돌리되,
     이번엔 고정 지속시간(480ms) + easeOutCubic 로 한 스텝을
     깔끔하게 한 번만 그려주는 방식입니다. (계속 값이 바뀌는
     스크롤-추종형이 아니라 "목표값까지 480ms 동안 한 번" 애니메이션
     이라서 예전처럼 뚝뚝 끊기지 않습니다)
  ======================================================= */

  // 0=카드1 풀사이즈, 1=카드2 풀사이즈(중간 평평한 구간), 2=카드3 풀사이즈
  const STEP_PROGRESS=[0, .48, 1];
  const LAST_STEP=STEP_PROGRESS.length-1;
  const ANIM_MS=480;

  let step=0;
  let visualProgress=STEP_PROGRESS[0];
  let targetProgress=STEP_PROGRESS[0];
  let animFrom=STEP_PROGRESS[0];
  let animStart=0;
  let rafId=null;

  let settled=false;
  let snapTriggered=false;

  const apply=(p)=>{
    const t12=smoothstep((p-.18)/.20);
    const t23=smoothstep((p-.58)/.20);

    const weights=[
      1-t12,
      t12*(1-t23),
      t23
    ];

    cards.forEach((card,index)=>{
      const w=clamp01(weights[index]);
      const basis=20.8217+(37.5350*w);
      const detail=smoothstep((w-.38)/.34);

      // 카드 폭이 거의 다 줄어든 뒤에만 블러가 들어오게 합니다.
      // 즉, 줄어드는 동안에는 선명 이미지를 유지하고
      // narrow 상태에 가까워졌을 때 선명 → 블러가 천천히 crossfade 됩니다.
      const sharpMix=smoothstep((w-.02)/.10);
      const sharpOpacity=sharpMix;
      const blurOpacity=1-sharpMix;

      // 축소 카드(222×438): left 25px / right 53px.
      // 확장 카드의 기존 여백은 viewport별로 그대로 유지합니다.
      const isTablet=window.innerWidth<=1100;
      const isMobile=window.innerWidth<=760;
      const wideLeft=isMobile?16:(isTablet?26:40);
      const wideRight=isMobile?14:(isTablet?24:34);
      const collapsedLeft=isMobile?16:25;
      const collapsedRight=isMobile?14:53;
      const textLeft=collapsedLeft+(wideLeft-collapsedLeft)*w;
      const textRight=collapsedRight+(wideRight-collapsedRight)*w;

      // 축소 카드에서 카테고리 문구가 잘리지 않도록
      // 카드 폭에 맞춰 글자 크기도 함께 줄입니다.
      const wideCategory=isMobile?13:(isTablet?16:20);
      const collapsedCategory=isMobile?12:(isTablet?14:16);
      const categorySize=collapsedCategory+(wideCategory-collapsedCategory)*w;

      card.style.flexBasis=`${basis.toFixed(4)}%`;
      card.style.setProperty("--weight",w.toFixed(4));
      card.style.setProperty("--text-left",`${textLeft.toFixed(2)}px`);
      card.style.setProperty("--text-right",`${textRight.toFixed(2)}px`);
      card.style.setProperty("--category-size",`${categorySize.toFixed(2)}px`);
      card.style.setProperty("--sharp-opacity",sharpOpacity.toFixed(4));
      card.style.setProperty("--blur-opacity",blurOpacity.toFixed(4));
      card.style.setProperty("--detail-opacity",detail.toFixed(4));
      card.style.setProperty("--detail-y",`${((1-detail)*12).toFixed(2)}px`);
    });
  };

  const stopAnim=()=>{
    if(rafId!=null){
      cancelAnimationFrame(rafId);
      rafId=null;
    }
  };

  const tick=(now)=>{
    const t=clamp01((now-animStart)/ANIM_MS);
    visualProgress=animFrom+(targetProgress-animFrom)*easeOutCubic(t);
    apply(visualProgress);

    if(t<1){
      rafId=requestAnimationFrame(tick);
    } else {
      rafId=null;
    }
  };

  const animateTo=(nextProgress)=>{
    if(prefersReduced){
      visualProgress=nextProgress;
      targetProgress=nextProgress;
      apply(nextProgress);
      return;
    }

    targetProgress=nextProgress;
    animFrom=visualProgress;
    animStart=performance.now();
    stopAnim();
    rafId=requestAnimationFrame(tick);
  };

  const goToStep=(nextStep)=>{
    step=clamp(nextStep,0,LAST_STEP);
    animateTo(STEP_PROGRESS[step]);
  };

  /* ---- 휠 제스처를 하나의 스텝 전환으로 묶기 ---- */
  const WHEEL_END_DELAY=180;   // 휠 이벤트가 멈추고 이 시간 뒤 새 제스처로 인식
  const STEP_COOLDOWN_MS=550;  // 스텝 전환 후 최소 대기 시간(트랙패드 연속 입력 방지, 애니메이션(480ms)보다 살짝 넉넉하게)

  let wheelEndTimer=null;
  let wheelGestureLocked=false;
  let stepCooldownUntil=0;

  const startNewWheelGesture=()=>{ wheelGestureLocked=false; };

  const markWheelGesture=()=>{
    wheelGestureLocked=true;
    if(wheelEndTimer) clearTimeout(wheelEndTimer);
    wheelEndTimer=setTimeout(startNewWheelGesture, WHEEL_END_DELAY);
  };

  const isSectionInControlZone=()=>{
    if(!settled) return false;
    if(!section.isConnected) return false;

    const rect=section.getBoundingClientRect();
    const vh=window.innerHeight || document.documentElement.clientHeight;
    const visible=Math.max(0,Math.min(rect.bottom,vh)-Math.max(rect.top,0));
    const ratio=visible/Math.max(1,Math.min(vh,rect.height));
    const spansCenter=rect.top<=vh*.42 && rect.bottom>=vh*.58;

    return ratio>=.55 && spansCenter;
  };

  const consumeDelta=(delta)=>{
    if(!delta) return false;

    const direction=Math.sign(delta);

    // 마지막 카드까지 다 봤으면 다음 섹션으로 자연스럽게 넘어가도록 놓아줌
    if(direction>0 && step===LAST_STEP) return false;

    // 첫 카드에서 위로 스크롤하면 이전 섹션 쪽으로 자연스럽게 놓아줌
    if(direction<0 && step===0) return false;

    // 같은 휠 제스처 안에서는 스텝 하나만 전환
    if(wheelGestureLocked){
      markWheelGesture();
      return true;
    }

    const now=performance.now();
    if(now<stepCooldownUntil){
      markWheelGesture();
      return true;
    }

    markWheelGesture();
    stepCooldownUntil=now+STEP_COOLDOWN_MS;

    goToStep(step+direction);
    return true;
  };

  const onWheel=(event)=>{
    if(!isSectionInControlZone()) return;

    let delta=event.deltaY;
    if(event.deltaMode===1) delta*=16;
    if(event.deltaMode===2) delta*=window.innerHeight;

    if(consumeDelta(delta)) event.preventDefault();
  };

  let touchY=null;

  const onTouchStart=(event)=>{
    if(!event.touches || event.touches.length!==1) return;
    touchY=event.touches[0].clientY;
  };

  const onTouchMove=(event)=>{
    if(touchY==null || !event.touches || event.touches.length!==1) return;
    if(!isSectionInControlZone()){
      touchY=event.touches[0].clientY;
      return;
    }

    const nextY=event.touches[0].clientY;
    const delta=(touchY-nextY)*2.15;
    touchY=nextY;

    if(consumeDelta(delta)) event.preventDefault();
  };

  const onTouchEnd=()=>{
    touchY=null;
  };

  const onKeyDown=(event)=>{
    if(!isSectionInControlZone()) return;
    const target=event.target;
    if(target && /INPUT|TEXTAREA|SELECT|BUTTON/.test(target.tagName)) return;

    let delta=0;
    if(event.key==="ArrowDown"||event.key==="PageDown"||event.key===" ") delta=150;
    if(event.key==="ArrowUp"||event.key==="PageUp") delta=-150;
    if(!delta) return;

    if(consumeDelta(delta)) event.preventDefault();
  };

  const onResize=()=>apply(visualProgress);

  // 섹션이 자연 스크롤로 화면에 들어오면, 정확한 위치로 한 번 스냅시킨
  // 뒤에만 휠 가로채기(카드 전환)를 켭니다.
  const snapObserver=new IntersectionObserver(
    ([entry])=>{
      if(!entry.isIntersecting) return;
      if(snapTriggered) return;
      snapTriggered=true;

      section.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start"
      });

      window.setTimeout(()=>{
        settled=true;
      }, prefersReduced ? 0 : 650);

      snapObserver.disconnect();
    },
    { threshold: 0.15 }
  );

  snapObserver.observe(section);

  window.addEventListener("wheel", onWheel, {passive:false, capture:true});
  window.addEventListener("touchstart", onTouchStart, {passive:true, capture:true});
  window.addEventListener("touchmove", onTouchMove, {passive:false, capture:true});
  window.addEventListener("touchend", onTouchEnd, {passive:true, capture:true});
  window.addEventListener("keydown", onKeyDown, {capture:true});
  window.addEventListener("resize", onResize);

  apply(visualProgress);

  return ()=>{
    if(wheelEndTimer) clearTimeout(wheelEndTimer);
    stopAnim();
    snapObserver.disconnect();

    window.removeEventListener("wheel", onWheel, {capture:true});
    window.removeEventListener("touchstart", onTouchStart, {capture:true});
    window.removeEventListener("touchmove", onTouchMove, {capture:true});
    window.removeEventListener("touchend", onTouchEnd, {capture:true});
    window.removeEventListener("keydown", onKeyDown, {capture:true});
    window.removeEventListener("resize", onResize);
  };
}

export function mountClovervalue(mountEl){
  if(!mountEl) return;

  const html=cloverValueHtml
    .replace("__V01_SHARP__",v01Sharp)
    .replace("__V01_BLUR__",v01Blur)
    .replace("__V02_SHARP__",v02Sharp)
    .replace("__V02_BLUR__",v02Blur)
    .replace("__V03_SHARP__",v03Sharp)
    .replace("__V03_BLUR__",v03Blur);

  mountEl.insertAdjacentHTML("beforeend",html);

  const sections=mountEl.querySelectorAll(
    ".clover-value:not([data-value-ready])"
  );
  sections.forEach(initCloverValue);
}