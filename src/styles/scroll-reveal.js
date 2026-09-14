export function initScrollReveal(root=document){
  const targets=[...root.querySelectorAll("[data-reveal]:not([data-reveal-ready])")];
  if(!targets.length) return;

  targets.forEach((el)=>{ el.dataset.revealReady="true"; });

  const prefersReduced=window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  )?.matches;

  if(prefersReduced){
    targets.forEach((el)=>el.classList.add("is-visible"));
    return;
  }

  const observer=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },{
    threshold:0.2,
    rootMargin:"0px 0px -10% 0px" // 섹션이 화면 아래에서 10% 정도 더 들어와야 트리거
  });

  targets.forEach((el)=>observer.observe(el));
}