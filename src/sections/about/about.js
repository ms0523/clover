import "./about.css";

// Example of the pattern to follow for every new section: import its own
// CSS, export a mount(el) function that inserts markup and wires up any
// interaction, then call it from main.js.
export function mountAbout(mountEl) {
  mountEl.insertAdjacentHTML(
    "beforeend",
    `
      <section class="about">
        <h2>여기에 다음 섹션 제목</h2>
        <p>이 파일(src/sections/about/about.js, about.css)을 복사해서
           features, cta 같은 다음 섹션들을 같은 패턴으로 추가하면 됩니다.</p>
      </section>
    `
  );
}
