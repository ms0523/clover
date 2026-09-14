import "./clover-start.css";
import cloverStartHtml from "./clover-start.html?raw";

import memoryUrl from "../../assets/images/clover-start-memory.png";
import phoneUrl from "../../assets/images/clover-start-phone.png";
import coupleUrl from "../../assets/images/clover-start-couple.png";
import friendsUrl from "../../assets/images/clover-start-friends.png";
import giftUrl from "../../assets/images/clover-start-gift.png";
import serviceUrl from "../../assets/images/clover-start-service.png";
import logoUrl from "../../assets/images/clover-start-logo.png";
import characterUrl from "../../assets/images/clover-start-character.png";


export function mountCloverStart(mountEl){
  if(!mountEl) return;

  const html=cloverStartHtml
    .replaceAll("__MEMORY__",memoryUrl)
    .replaceAll("__PHONE__",phoneUrl)
    .replaceAll("__COUPLE__",coupleUrl)
    .replaceAll("__FRIENDS__",friendsUrl)
    .replaceAll("__GIFT__",giftUrl)
    .replaceAll("__SERVICE__",serviceUrl)
    .replaceAll("__LOGO__",logoUrl)
    .replaceAll("__CHARACTER__",characterUrl);

  mountEl.insertAdjacentHTML("beforeend",html);

  const sections=mountEl.querySelectorAll(
    ".clover-start:not([data-clover-start-ready])"
  );

  sections.forEach(initCloverStart);
}


function initCloverStart(section){
  if(!section) return;
  section.dataset.cloverStartReady="true";
  section.id = "clover-start";

  const world=section.querySelector("[data-clover-start-world]");
  const center=section.querySelector("[data-clover-start-center]");
  const secondary=section.querySelector("[data-start-secondary]");
  const service=section.querySelector(".clover-start__media--service");
  const media=[...section.querySelectorAll("[data-start-media]")];

  if(!world || !center) return;

  const goToNextSection=()=>{
    const nextSection=section.nextElementSibling;
    if(!nextSection) return;

    const prefersReduced=window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

    nextSection.scrollIntoView({
      behavior:prefersReduced ? "auto" : "smooth",
      block:"start"
    });
  };

  const reduceMotion=window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  );

  if(reduceMotion?.matches) return;

  let targetProgress=0;
  let smoothProgress=0;
  let rafId=0;
  let lastFrame=performance.now();

  const clamp01=(value)=>Math.max(0,Math.min(1,value));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smoothstep=(t)=>t*t*(3-2*t);

  const getProgress=()=>{
    const rect=section.getBoundingClientRect();
    const scrollable=Math.max(1,section.offsetHeight-window.innerHeight);

    return clamp01((-rect.top)/scrollable);
  };

  // ---------------------------------------------------------------
  // ① 스크롤 감도 조절
  // 섹션이 sticky로 고정돼 있는 동안만 휠/터치를 가로채서 일부만 반영
  // → 한 번 스크롤할 때 올라오는 양 자체가 줄어듭니다.
  // ---------------------------------------------------------------
  const SCROLL_DAMPING=0.75;

  const isPinned=()=>{
    const rect=section.getBoundingClientRect();
    return rect.top<=0 && rect.bottom>=window.innerHeight;
  };

  const onWheel=(event)=>{
    if(!isPinned()) return;
    event.preventDefault();
    window.scrollBy(0,event.deltaY*SCROLL_DAMPING);
  };

  let touchStartY=0;

  const onTouchStart=(event)=>{
    touchStartY=event.touches[0].clientY;
  };

  const onTouchMove=(event)=>{
    if(!isPinned()){
      touchStartY=event.touches[0].clientY;
      return;
    }

    const currentY=event.touches[0].clientY;
    const delta=touchStartY-currentY;
    touchStartY=currentY;

    event.preventDefault();
    window.scrollBy(0,delta*SCROLL_DAMPING);
  };

  window.addEventListener("wheel",onWheel,{passive:false});
  window.addEventListener("touchstart",onTouchStart,{passive:true});
  window.addEventListener("touchmove",onTouchMove,{passive:false});
  // ---------------------------------------------------------------

  // ---------------------------------------------------------------
  // ② 퇴장 스냅
  // 진행률이 97%를 넘으면 pain-point-1 시작 위치로 정확히 한 번 스냅
  // ---------------------------------------------------------------
  const SNAP_THRESHOLD=0.97;
  let hasSnapped=false;
  let prevProgress=null; // 새로고침 등으로 이미 이 지점을 지나친 채 로드된 경우를 구분하기 위함

  const maybeSnapToNext=(p)=>{
    if(prevProgress===null){
      prevProgress=p;
      return;
    }

    const crossedForward=prevProgress<SNAP_THRESHOLD && p>=SNAP_THRESHOLD;

    if(crossedForward && !hasSnapped){
      hasSnapped=true;
      goToNextSection();
    }else if(p<0.5){
      hasSnapped=false;
    }

    prevProgress=p;
  };
  // ---------------------------------------------------------------

  // ---------------------------------------------------------------
  // ③ 타이틀 등장(enter)
  // 페이지에 막 들어왔을 땐(progress 0) 타이틀이 완전히 숨어 있다가,
  // 스크롤이 시작되어 섹션에 진입하는 초반 구간(0 ~ ENTER_END)에서만
  // 서서히 나타납니다. 이후 섹션이 빠질 때(exit)는 기존 로직 그대로 사라짐.
  // ---------------------------------------------------------------
  const ENTER_END=.1;
  // ---------------------------------------------------------------

  const render=(p)=>{
    const viewportHeight=window.innerHeight || 800;

    const scrollRange=Math.max(1,section.offsetHeight-viewportHeight);
    const worldTravel=scrollRange*.94;

    const worldY=-worldTravel*p;
    world.style.transform=
      `translate3d(-50%,${worldY.toFixed(2)}px,0)`;

    media.forEach((item,index)=>{
      const direction=index%2===0 ? 1 : -1;
      const driftX=direction*Math.sin(p*Math.PI)*6;
      const driftY=Math.sin((p*Math.PI*1.25)+(index*.7))*5;

      item.style.transform=
        `translate3d(${driftX.toFixed(2)}px,${driftY.toFixed(2)}px,0)`;
    });

    if(secondary){
      const serviceTop=service
        ? service.offsetTop + worldY
        : viewportHeight;

      const revealStart=viewportHeight*.72;
      const revealEnd=viewportHeight*.52;

      const rawSecondary=clamp01(
        (revealStart-serviceTop) / Math.max(1,revealStart-revealEnd)
      );
      const secondaryProgress=smoothstep(rawSecondary);

      const secondaryY=lerp(18,0,secondaryProgress);
      const secondaryBlur=lerp(3,0,secondaryProgress);

      secondary.style.opacity=secondaryProgress.toFixed(3);
      secondary.style.transform=
        `translate3d(0,${secondaryY.toFixed(2)}px,0)`;
      secondary.style.filter=`blur(${secondaryBlur.toFixed(2)}px)`;
    }

    const enter=smoothstep(clamp01(p/ENTER_END));
    const exit=clamp01((p-.75)/.15);

    const titleScale=lerp(1,.992,exit);
    const enterY=lerp(18,0,enter);
    const exitY=lerp(0,28,exit);
    const titleY=enterY+exitY;
    const titleBlur=lerp(3,0,enter);
    const cover=exit*100;

    center.style.opacity=(enter*(1-exit)).toFixed(3);
    center.style.clipPath=`inset(0 0 ${cover.toFixed(2)}% 0)`;
    center.style.filter=`blur(${titleBlur.toFixed(2)}px)`;
    center.style.transform=
      `translate3d(-50%,calc(-50% + ${titleY.toFixed(2)}px),0) scale(${titleScale.toFixed(4)})`;
  };

  const animate=(now)=>{
    const dt=Math.min((now-lastFrame)/1000,.05);
    lastFrame=now;

    const follow=1-Math.exp(-10.5*dt);
    smoothProgress+=(targetProgress-smoothProgress)*follow;

    if(Math.abs(targetProgress-smoothProgress)<.0002){
      smoothProgress=targetProgress;
    }

    render(smoothProgress);

    if(Math.abs(targetProgress-smoothProgress)>=.0002){
      rafId=requestAnimationFrame(animate);
    }else{
      rafId=0;
    }
  };

  const requestRender=()=>{
    targetProgress=getProgress();
    maybeSnapToNext(targetProgress);

    if(!rafId){
      lastFrame=performance.now();
      rafId=requestAnimationFrame(animate);
    }
  };

  const onResize=()=>{
    targetProgress=getProgress();
    smoothProgress=targetProgress;
    render(smoothProgress);
  };

  targetProgress=getProgress();
  smoothProgress=targetProgress;
  render(smoothProgress);

  window.addEventListener("scroll",requestRender,{passive:true});
  window.addEventListener("resize",onResize);

  if(document.fonts?.ready){
    document.fonts.ready.then(requestRender);
  }
}