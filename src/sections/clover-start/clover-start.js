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
import chevronUrl from "../../assets/images/clover-start-chevron.png";


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
    .replaceAll("__CHARACTER__",characterUrl)
    .replaceAll("__CHEVRON__",chevronUrl);

  mountEl.insertAdjacentHTML("beforeend",html);

  const sections=mountEl.querySelectorAll(
    ".clover-start:not([data-clover-start-ready])"
  );

  sections.forEach(initCloverStart);
}


function initCloverStart(section){
  if(!section) return;
  section.dataset.cloverStartReady="true";

  const world=section.querySelector("[data-clover-start-world]");
  const center=section.querySelector("[data-clover-start-center]");
  const secondary=section.querySelector("[data-start-secondary]");
  const arrow=section.querySelector("[data-start-arrow]");
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

  arrow?.addEventListener("click",goToNextSection);

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

  const render=(p)=>{
    const viewportHeight=window.innerHeight || 800;

    /*
      내부 이미지 이동속도를 실제 페이지 스크롤과 거의 1:1로 맞춥니다.
      그래서 sticky가 끝나고 다음 섹션으로 넘어갈 때
      갑자기 빨라졌다가 돌아오는 느낌을 줄입니다.
    */
    const scrollRange=Math.max(1,section.offsetHeight-viewportHeight);
    const worldTravel=scrollRange*.94;

    const worldY=-worldTravel*p;
    world.style.transform=
      `translate3d(-50%,${worldY.toFixed(2)}px,0)`;

    /*
      각 이미지마다 아주 미세하게 다른 속도를 줘
      완전히 같은 판이 움직이는 느낌을 줄입니다.
    */
    media.forEach((item,index)=>{
      const direction=index%2===0 ? 1 : -1;
      const driftX=direction*Math.sin(p*Math.PI)*6;
      const driftY=Math.sin((p*Math.PI*1.25)+(index*.7))*5;

      item.style.transform=
        `translate3d(${driftX.toFixed(2)}px,${driftY.toFixed(2)}px,0)`;
    });

    /*
      두 번째 문장 reveal:
      전체 section progress가 아니라 service 이미지의 실제 Y 위치를 기준으로 합니다.
      service가 화면 아래쪽에서 위로 지나가기 시작할 때 reveal이 시작되고,
      중앙 부근에 도달하면 "상품에서 사람으로"가 완전히 보입니다.
    */
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

    /*
      마지막 구간:
      opacity로 사라지는 대신, 아래쪽부터 잘려 올라오면서
      다음 섹션 안으로 "묻히는" 느낌으로 사라집니다.
    */
    // 카드가 거의 모두 위로 빠진 뒤부터 퇴장 시작.
    // smoothstep으로 확 가속하지 않고 linear하게 진행해
    // 문장과 다음 섹션의 속도가 따로 노는 느낌을 줄입니다.
    const exit=clamp01((p-.75)/.15);
    const titleScale=lerp(1,.992,exit);
    const titleY=lerp(0,28,exit);
    const cover=exit*100;

    center.style.opacity=(1-exit).toFixed(3);
    center.style.clipPath=`inset(0 0 ${cover.toFixed(2)}% 0)`;
    center.style.transform=
      `translate3d(-50%,calc(-50% + ${titleY.toFixed(2)}px),0) scale(${titleScale.toFixed(4)})`;

    // 화살표는 화면 하단에 고정하고 마지막에만 같은 속도로 천천히 사라짐
    if(arrow){
      arrow.style.opacity=(1-exit).toFixed(3);
      arrow.style.transform=
        `translateX(-50%) translateY(${lerp(0,10,exit).toFixed(2)}px)`;
    }
  };

  const animate=(now)=>{
    const dt=Math.min((now-lastFrame)/1000,.05);
    lastFrame=now;

    // 휠에 딱 붙지 않고 부드럽게 따라오는 damping
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
