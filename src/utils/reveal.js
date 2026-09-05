// Scroll-in reveal: any element with a `data-reveal` attribute starts
// hidden (see the [data-reveal] rules in styles/base.css) and gets an
// `in-view` class the moment it scrolls into the viewport, which triggers
// the CSS transition to fade/slide it in.
//
// Usage in a section's .html file:
//   <div data-reveal>...</div>
//   <div data-reveal style="--reveal-delay: .15s">...</div>  (staggered)
//
// Call observeReveals() once after all sections are mounted (see main.js).
export function observeReveals(root = document) {
  const els = root.querySelectorAll("[data-reveal]:not(.in-view)");

  if (!("IntersectionObserver" in window)) {
    // very old browsers: just show everything immediately
    els.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  els.forEach((el) => io.observe(el));
}