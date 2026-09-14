import "./section-nav.css";

export function mountSectionNav(sections) {
  const nav = document.createElement("nav");
  nav.className = "section-nav";
  nav.setAttribute("aria-label", "섹션 이동");

  const list = document.createElement("ul");
  list.className = "section-nav-list";

  const items = sections.map(({ id, label }) => {
    const li = document.createElement("li");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "section-nav-item";
    btn.dataset.target = id;

    const labelSpan = document.createElement("span");
    labelSpan.className = "section-nav-label";
    labelSpan.textContent = label;

    const dash = document.createElement("span");
    dash.className = "section-nav-dash";

    btn.append(labelSpan, dash);

    btn.addEventListener("click", () => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    li.appendChild(btn);
    list.appendChild(li);

    return {
      id,
      el: btn
    };
  });

  nav.appendChild(list);
  document.body.appendChild(nav);

  /* hover */
  nav.addEventListener("mouseenter", () => {
    nav.classList.add("is-expanded");
  });

  nav.addEventListener("mouseleave", () => {
    nav.classList.remove("is-expanded");
  });

  /* 표시 상태 */
  window.addEventListener("hero:opened", () => {
    nav.classList.add("is-visible");
  });

  window.addEventListener("hero:closed", () => {
    nav.classList.remove("is-visible");
  });

  const targets = sections.map(({ id }) => document.getElementById(id));
  // filter(Boolean) 제거 — 못 찾은 섹션도 자리(인덱스)는 유지

  function updateActiveSection() {
    const viewportCenter = window.scrollY + window.innerHeight / 2;

    let activeIndex = 0;
    let closestDistance = Infinity;

    targets.forEach((section, index) => {
      if (!section) return; // 못 찾은 섹션은 계산에서만 건너뜀, 인덱스는 그대로

      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (viewportCenter >= sectionTop && viewportCenter < sectionBottom) {
        activeIndex = index;
        closestDistance = 0;
        return;
      }

      const sectionCenter = sectionTop + section.offsetHeight / 2;
      const distance = Math.abs(viewportCenter - sectionCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });

    items.forEach((item, index) => {
      item.el.classList.toggle("is-active", index === activeIndex);
    });
  }

  // 최초 실행
  updateActiveSection();

  // 스크롤할 때 변경
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;

      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });

      ticking = true;
    },
    { passive: true }
  );

  return {
    destroy: () => {
      window.removeEventListener("scroll", updateActiveSection);
      nav.remove();
    }
  };
}