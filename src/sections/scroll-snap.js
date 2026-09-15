/* =========================================================
   스크롤 스냅 유틸 (공용)
   ========================================================================
   intro.js에 있던 setupSnapToNext를 그대로 떼어내서 공용 함수로 만든 것.
   특정 섹션을 threshold(기본 92%) 이상 스크롤하면, 남은 구간은 자동으로
   부드럽게 이어서 다음 섹션 시작 지점까지 스크롤해준다.

   intro(step1) → clover-ai(step2) → clover-gift(step3)처럼 이어지는
   스텝 섹션들 사이의 전환마다 이 함수를 한 번씩 호출해서 붙여쓰면 된다.

   ⚠️ 프로젝트 폴더 구조에 맞게 import 경로를 조정하세요.
   (예: src/sections/intro/intro.js, src/sections/clover-ai/clover-ai.js
   처럼 sections 아래 각 폴더에 있고, 이 파일을 src/sections/scroll-snap.js
   에 둔다면 각 파일에서는 "../scroll-snap.js"로 가져오면 됩니다.)
========================================================= */

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export function setupSnapToNext(section, { threshold = 0.92 } = {}) {
  const nextSection = section.nextElementSibling;

  if (!nextSection) return;

  // section을 이 비율만큼 스크롤하면(기본 92%) 나머지 구간은 자동으로
  // 부드럽게 이어서 다음 섹션 시작 지점까지 스크롤합니다.
  const SNAP_THRESHOLD = threshold;

  let hasSnapped = false;
  let prevProgress = null; // 새로고침 등으로 이미 그 지점을 지나친 채 로드된 경우 방지

  const getProgress = () => {
    const rect = section.getBoundingClientRect();
    const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);

    return clamp((-rect.top) / scrollable);
  };

  const goToNextSection = () => {
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

    nextSection.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  };

  const onScroll = () => {
    const p = getProgress();

    // 최초 호출(페이지 로드 시점)은 기준값만 기록하고 강제 이동은 하지 않음
    if (prevProgress === null) {
      prevProgress = p;
      return;
    }

    const crossedForward = prevProgress < SNAP_THRESHOLD && p >= SNAP_THRESHOLD;

    if (crossedForward && !hasSnapped) {
      hasSnapped = true;
      goToNextSection();
    } else if (p < 0.5) {
      hasSnapped = false;
    }

    prevProgress = p;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}