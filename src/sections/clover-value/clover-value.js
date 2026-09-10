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

function initCloverValue(section){
  if(!section || section.dataset.valueReady==="true") return;
  section.dataset.valueReady="true";

  const track=section.querySelector(".clover-value__track");
  const cards=[...section.querySelectorAll("[data-value-card]")];
  if(!track || cards.length!==3) return;

  let targetProgress=0;
  let visualProgress=0;
  let rafId=0;
  let lastTime=performance.now();

  const readProgress=()=>{
    const rect=track.getBoundingClientRect();
    const distance=Math.max(track.offsetHeight-window.innerHeight,1);
    targetProgress=clamp01(-rect.top/distance);
  };

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

  const animate=(now)=>{
    const dt=Math.min(now-lastTime,50);
    lastTime=now;

    const follow=1-Math.exp(-dt/90);
    visualProgress+=(targetProgress-visualProgress)*follow;

    if(Math.abs(targetProgress-visualProgress)<0.0001){
      visualProgress=targetProgress;
    }

    apply(visualProgress);

    if(Math.abs(targetProgress-visualProgress)>0.0001){
      rafId=requestAnimationFrame(animate);
    }else{
      rafId=0;
    }
  };

  const requestUpdate=()=>{
    readProgress();
    if(!rafId){
      lastTime=performance.now();
      rafId=requestAnimationFrame(animate);
    }
  };

  readProgress();
  visualProgress=targetProgress;
  apply(visualProgress);

  window.addEventListener("scroll",requestUpdate,{passive:true});
  window.addEventListener("resize",requestUpdate);
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
