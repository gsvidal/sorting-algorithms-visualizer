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
  const renderCanvas = (alg, data, minIdx, currentIdx) => {
    if (alg === "merge") {
      const mergeLo = minIdx ?? 0;
      const mergeHi = currentIdx ?? data.length;
      const barWidth =
        (CANVAS_MAX_WIDTH -
          CANVAS_PADDING_X * 2 -
          barSpacing * (data.length - 2.5)) /
        data.length;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < data.length; i++) {
        const x = i * (barWidth + barSpacing);
        const y = canvas.height - data[i];
        if (i >= mergeLo && i < mergeHi) {
          ctx.fillStyle = barColor;
        } else {
          ctx.fillStyle = "#e1d7ff";
        }
        ctx.fillRect(x, y, barWidth, data[i]);
      }
    } else {
      const barWidth =
        (CANVAS_MAX_WIDTH -
          CANVAS_PADDING_X * 2 -
          barSpacing * (data.length - 2.5)) /
        data.length;
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw bars
      for (let i = 0; i < data.length; i++) {
        const x = i * (barWidth + barSpacing);
        const y = canvas.height - data[i];

        if (alg === "selection") {
          // Check if the current bar is the one to highlight as the minimum or the current
          if (i === minIdx) {
            ctx.fillStyle = redColor;
          } else if (i === currentIdx) {
            ctx.fillStyle = greenColor;
          } else {
            ctx.fillStyle = barColor;
          }
        } else if (alg === "bubble") {
          if (i === minIdx || i === currentIdx) {
            ctx.fillStyle = greenColor;
          } else {
            ctx.fillStyle = barColor;
          }
        } else if (alg === "bubble-swap") {
          if (i === minIdx || i === currentIdx) {
            ctx.fillStyle = redColor;
          } else {
            ctx.fillStyle = barColor;
          }
        } else if (alg === "insertion") {
          if (i === minIdx) {
            ctx.fillStyle = greenColor;
          } else if (i === currentIdx) {
            ctx.fillStyle = redColor;
          } else {
            ctx.fillStyle = barColor;
          }
        } else if (alg === "insertion-shift") {
          if (i === minIdx || i === currentIdx) {
            ctx.fillStyle = redColor;
          } else {
            ctx.fillStyle = barColor;
          }
        } else {
          ctx.fillStyle = barColor;
        }
        // Draw the bar
        ctx.fillRect(x, y, barWidth, data[i]);
      }
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
        control
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
