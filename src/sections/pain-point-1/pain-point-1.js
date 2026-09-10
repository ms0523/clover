import "./pain-point-1.css";
import painPoint1Html from "./pain-point-1.html?raw";

import notebookUrl from "../../assets/images/pain-point-1-notebook.png";
import gloveUrl from "../../assets/images/pain-point-1-glove.png";
import handcreamUrl from "../../assets/images/pain-point-1-handcream.png";
import fanUrl from "../../assets/images/pain-point-1-fan.png";
import tumblerUrl from "../../assets/images/pain-point-1-tumbler.png";

export function mountPainPoint1(mountEl){
  if(!mountEl) return;

  const html=painPoint1Html
    .replace("__NOTEBOOK__",notebookUrl)
    .replace("__GLOVE__",gloveUrl)
    .replace("__HANDCREAM__",handcreamUrl)
    .replace("__FAN__",fanUrl)
    .replace("__TUMBLER__",tumblerUrl);

  mountEl.insertAdjacentHTML("beforeend",html);

  const sections=mountEl.querySelectorAll(
    ".pain-point-1:not([data-pain-point-1-ready])"
  );

  sections.forEach(initPainPoint1);
}

function initPainPoint1(section){
  if(!section) return;
  section.dataset.painPoint1Ready="true";

  const pairs=[1,2,3,4,5].map((pairNumber)=>[
    ...section.querySelectorAll(`[data-pp1-pair="${pairNumber}"]`)
  ]);

  let sequenceStarted=false;

  const revealPair=(index)=>{
    const pair=pairs[index];
    if(!pair) return;

    pair.forEach((el)=>{
      el.classList.add("is-pair-visible");
    });
  };

  const startSequence=()=>{
    if(sequenceStarted) return;
    sequenceStarted=true;

    section.classList.add("is-visible");

    // v5보다 아주 조금 빠르게:
    // 첫 세트 0.45초 후 / 이후 약 0.82초 간격
    const firstDelay=450;
    const pairGap=820;

    pairs.forEach((_,index)=>{
      window.setTimeout(()=>{
        revealPair(index);
      },firstDelay+(index*pairGap));
    });
  };

  const observer=new IntersectionObserver(
    ([entry])=>{
      if(entry.isIntersecting){
        startSequence();
        observer.disconnect();
      }
    },
    {threshold:.20}
  );

  observer.observe(section);
}
