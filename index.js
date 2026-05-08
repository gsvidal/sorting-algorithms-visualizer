import { selectionSort } from "./selectionSort.mjs";
import { bubbleSort } from "./bubbleSort.mjs";
import { mergeSort } from "./mergeSort.mjs";
import { insertionSort } from "./insertionSort.mjs";

const CANVAS_MAX_HEIGHT = 500;
const CANVAS_MAX_WIDTH = 1000;
const CANVAS_PADDING_X = 15;

const generateArray = (size = 10) => {
  // console.log("generate");
  const ar = new Array(size)
    .fill(0)
    .map(
      (el) => el + 10 + Math.floor((CANVAS_MAX_HEIGHT - 100) * Math.random())
    );
  return ar;
};

let defaultArray = generateArray();

const algorithms = {
  selection: selectionSort,
  bubble: bubbleSort,
  merge: mergeSort,
  insertion: insertionSort,
};

const legendSelection = `
  <div class="legend-content border">
    <p class="legend-description"><strong>How it works:</strong> Repeatedly scans the unsorted suffix to find the smallest remaining element, then swaps it into the correct position at the front. Each pass fixes one slot from left to right.</p>
    <div class="legend-container">
      <span class="legend-color legend-color--red"></span>: <span>Minimum value</span>
    </div>
    <div class="legend-container">
      <span class="legend-color legend-color--green"></span>: <span>Current value</span>
    </div>
    <p class='time-complexity'>Time complexity : O(n²)</p>
  </div>
  `;

const legendBubble = `
  <div class="legend-content border">
    <p class="legend-description"><strong>How it works:</strong> Walks the array many times comparing neighbors; if two adjacent values are in the wrong order, it swaps them. After each outer pass the largest misplaced item tends to drift to its end—“bubbling” upward.</p>
    <div class="legend-container">
      <span class="legend-color legend-color--red"></span>: <span>Comparing values (swap)</span>
    </div>
    <div class="legend-container">
      <span class="legend-color legend-color--green"></span>: <span>Comparing values (no swap)</span>
    </div>
    <p class='time-complexity'>Time complexity : O(n²)</p>
  </div>
  `;
const legendMerge = `
  <div class="legend-content border">
    <p class="legend-description"><strong>How it works:</strong> Splits the range in half recursively until singletons are “sorted”, then merges pairs of sorted runs back together by repeatedly taking the smaller front element from either half.</p>
    <div class="legend-container">
      <span class="legend-color legend-color--main"></span>: <span>Sorting values</span>
    </div>
    <div class="legend-container">
      <span class="legend-color legend-color--main-light"></span>: <span>No sorted values (yet)</span>
    </div>
    <p class='time-complexity'>Time complexity : O(n log n)</p>
  </div>
  `;
const legendInsertion = `
  <div class="legend-content border">
    <p class="legend-description"><strong>How it works:</strong> Builds a sorted prefix from left to right. For each new value, it shifts larger elements one position to the right until it finds the correct insertion point.</p>
    <div class="legend-container">
      <span class="legend-color legend-color--red"></span>: <span>Shifting value</span>
    </div>
    <div class="legend-container">
      <span class="legend-color legend-color--green"></span>: <span>Current insertion target</span>
    </div>
    <p class='time-complexity'>Time complexity : O(n²)</p>
  </div>
  `;

const legendText = {
  selection: legendSelection,
  bubble: legendBubble,
  merge: legendMerge,
  insertion: legendInsertion,
};

let minIdx, currentIdx;
let alg = "none";

document.addEventListener("DOMContentLoaded", function () {
  // Get the Canvas element and its context
  const canvas = document.getElementById("barChart");
  const ctx = canvas.getContext("2d");
  const legend = document.querySelector(".legend");
  const delayInput = document.getElementById("stepDelay");
  const sampleSizeInput = document.getElementById("sampleSize");
  const sampleSizeValue = document.getElementById("sampleSizeValue");
  const stepDelayValue = document.getElementById("stepDelayValue");

  const syncSampleSizeLabel = () => {
    sampleSizeValue.textContent = String(sampleSizeInput.value);
  };
  const syncDelayLabel = () => {
    stepDelayValue.textContent = String(delayInput.value);
  };

  syncSampleSizeLabel();
  syncDelayLabel();

  // Bar properties
  const barSpacing = 20;
  canvas.height = CANVAS_MAX_HEIGHT;
  const barColor = "#9c7eff";
  const redColor = "#ff8383";
  const greenColor = "#85ff85";
  const getBarMetrics = (dataLength) => {
    const barWidth =
      (CANVAS_MAX_WIDTH - CANVAS_PADDING_X * 2 - barSpacing * (dataLength - 2.5)) /
      dataLength;
    const stepX = barWidth + barSpacing;
    return { barWidth, stepX };
  };

  const drawBars = (data, colorForIndex, xOffsetByIndex = {}) => {
    const { barWidth, stepX } = getBarMetrics(data.length);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < data.length; i++) {
      const x = i * stepX + (xOffsetByIndex[i] ?? 0);
      const y = canvas.height - data[i];
      ctx.fillStyle = colorForIndex(i);
      ctx.fillRect(x, y, barWidth, data[i]);
    }
  };

  const animateBubbleSwap = (data, leftIdx, rightIdx, control) =>
    new Promise((resolve) => {
      const duration = Math.max(80, Number(control.time) || 0);
      const { stepX } = getBarMetrics(data.length);
      const start = performance.now();

      const tick = (now) => {
        if (control.stop) {
          resolve();
          return;
        }
        const progress = Math.min((now - start) / duration, 1);
        const displacement = stepX * progress;
        drawBars(
          data,
          (idx) =>
            idx === leftIdx || idx === rightIdx ? redColor : barColor,
          {
            [leftIdx]: displacement,
            [rightIdx]: -displacement,
          }
        );

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(tick);
    });

  const renderCanvas = (alg, data, minIdx, currentIdx) => {
    if (alg === "merge") {
      const mergeLo = minIdx ?? 0;
      const mergeHi = currentIdx ?? data.length;
      drawBars(data, (i) => (i >= mergeLo && i < mergeHi ? barColor : "#e1d7ff"));
    } else {
      drawBars(data, (i) => {
        if (alg === "selection") {
          if (i === minIdx) return redColor;
          if (i === currentIdx) return greenColor;
          return barColor;
        }
        if (alg === "bubble") {
          return i === minIdx || i === currentIdx ? greenColor : barColor;
        }
        if (alg === "bubble-swap") {
          return i === minIdx || i === currentIdx ? redColor : barColor;
        }
        if (alg === "insertion") {
          if (i === minIdx) return greenColor;
          if (i === currentIdx) return redColor;
          return barColor;
        }
        if (alg === "insertion-shift") {
          return i === minIdx || i === currentIdx ? redColor : barColor;
        }
        return barColor;
      });
    }
  };

  renderCanvas(alg, defaultArray, minIdx, currentIdx);

  const selectElement = document.querySelector("select");
  const runButton = document.querySelector(".button--run");

  const control = {
    time: +delayInput.value,
    stop: false,
  };

  const syncRunAvailability = () => {
    runButton.disabled = selectElement.value === "none";
  };

  const reset = (size = 10, reset) => {
    if (reset) {
      sampleSizeInput.value = "10";
      syncSampleSizeLabel();
    }
    selectElement.value = "none";
    defaultArray = [...generateArray(size)];
    selectElement.removeAttribute("disabled");
    control.stop = true;
    renderCanvas("none", defaultArray);
    legend.innerHTML = "";
    syncRunAvailability();
  };

  const resetButton = document.querySelector(".button--reset");

  resetButton.addEventListener("click", () => reset(10, true));

  const runSelectedSort = async () => {
    const selectedAlgorithm = selectElement.value;
    if (selectedAlgorithm === "none") return;

    runButton.disabled = true;
    selectElement.setAttribute("disabled", "true");

    try {
      legend.innerHTML = legendText[selectedAlgorithm];
      control.stop = false;
      const sortedArray = await algorithms[selectedAlgorithm](
        defaultArray,
        renderCanvas,
        control,
        (data, leftIdx, rightIdx) =>
          animateBubbleSwap(data, leftIdx, rightIdx, control)
      );
      if (sortedArray?.length > 0) {
        renderCanvas("none", sortedArray);
      }
    } finally {
      selectElement.removeAttribute("disabled");
      syncRunAvailability();
    }
  };

  selectElement.addEventListener("change", () => {
    const selectedAlgorithm = selectElement.value;
    if (selectedAlgorithm === "none") {
      legend.innerHTML = "";
    } else {
      legend.innerHTML = legendText[selectedAlgorithm];
    }
    syncRunAvailability();
  });

  runButton.addEventListener("click", () => runSelectedSort());

  syncRunAvailability();

  delayInput.addEventListener("input", (event) => {
    syncDelayLabel();
    control.time = +event.target.value;
  });

  sampleSizeInput.addEventListener("input", syncSampleSizeLabel);

  sampleSizeInput.addEventListener("change", (event) => {
    syncSampleSizeLabel();
    reset(+event.target.value);
  });
});
