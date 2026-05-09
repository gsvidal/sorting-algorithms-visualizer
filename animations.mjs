/** Movements (swap/shift) stay visible: never faster than this, even if step delay is tiny. */
const SWAP_ANIMATION_MIN_MS = 250;

const motionDurationMs = (control) => {
  const ms = Number(control.time);
  const pacing = Number.isFinite(ms) && ms > 0 ? ms : SWAP_ANIMATION_MIN_MS;
  return Math.max(SWAP_ANIMATION_MIN_MS, pacing);
};

export const animateHorizontalSwap = ({
  data,
  leftIdx,
  rightIdx,
  control,
  getBarMetrics,
  drawBars,
  highlightColor = "#ff8383",
  defaultColor = "#9c7eff",
}) =>
  new Promise((resolve) => {
    const duration = motionDurationMs(control);
    const { stepX } = getBarMetrics(data.length);
    const left = Math.min(leftIdx, rightIdx);
    const right = Math.max(leftIdx, rightIdx);
    const distance = (right - left) * stepX;
    const start = performance.now();

    const tick = (now) => {
      if (control.stop) {
        // Ensure canvas is rendered without transient offsets on stop.
        drawBars(data, () => defaultColor);
        resolve();
        return;
      }

      const progress = Math.min((now - start) / duration, 1);
      const displacement = distance * progress;

      drawBars(
        data,
        (idx) =>
          idx === leftIdx || idx === rightIdx ? highlightColor : defaultColor,
        {
            [left]: displacement,
            [right]: -displacement,
        }
      );

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        drawBars(
          data,
          (idx) =>
            idx === leftIdx || idx === rightIdx ? highlightColor : defaultColor,
          {}
        );
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });

export const animateHorizontalShift = ({
  data,
  fromIdx,
  toIdx,
  control,
  getBarMetrics,
  drawBars,
  highlightColor = "#ff8383",
  defaultColor = "#9c7eff",
}) =>
  new Promise((resolve) => {
    const duration = motionDurationMs(control);
    const { stepX } = getBarMetrics(data.length);
    const distance = (toIdx - fromIdx) * stepX;
    const start = performance.now();

    const tick = (now) => {
      if (control.stop) {
        // Ensure canvas is rendered without transient offsets on stop.
        drawBars(data, () => defaultColor);
        resolve();
        return;
      }

      const progress = Math.min((now - start) / duration, 1);
      const displacement = distance * progress;

      drawBars(
        data,
        (idx) =>
          idx === fromIdx || idx === toIdx ? highlightColor : defaultColor,
        {
          [fromIdx]: displacement,
          [toIdx]: -displacement,
        }
      );

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        drawBars(
          data,
          (idx) =>
            idx === fromIdx || idx === toIdx ? highlightColor : defaultColor,
          {}
        );
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
