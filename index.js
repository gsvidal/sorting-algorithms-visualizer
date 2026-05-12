import { selectionSort } from "./selectionSort.mjs";
import { bubbleSort } from "./bubbleSort.mjs";
import { mergeSort } from "./mergeSort.mjs";
import { insertionSort } from "./insertionSort.mjs";
import { animateHorizontalShift, animateHorizontalSwap } from "./animations.mjs";

const CANVAS_MAX_HEIGHT = 500;
const CANVAS_MAX_WIDTH = 1000;
const CANVAS_PADDING_X = 15;

const generateArray = (size = 20) => {
  // console.log("generate");
  const ar = new Array(size)
    .fill(0)
    .map(
      (el) => el + 20 + Math.floor((CANVAS_MAX_HEIGHT - 100) * Math.random())
    );
  return ar;
};

let defaultArray = generateArray();
/** Copia del array al pulsar Run; Reset restaura esto y para el sort sin regenerar. */
let snapshotBeforeRun = null;

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

  // Bar properties — gap scales down as sample count goes up (same canvas width).
  canvas.height = CANVAS_MAX_HEIGHT;
  const barColor = "#9c7eff";
  const redColor = "#ff8383";
  const greenColor = "#85ff85";

  const getBarSpacing = (dataLength) => {
    const n = Math.min(80, Math.max(1, dataLength));
    const minN = Number(sampleSizeInput.min) || 6;
    const maxN = Number(sampleSizeInput.max) || 50;
    const t = Math.min(1, Math.max(0, (n - minN) / (maxN - minN || 1)));
    const maxGap = 24;
    const minGap = 2;
    return maxGap - t * (maxGap - minGap);
  };

  const getBarMetrics = (dataLength) => {
    const barSpacing = getBarSpacing(dataLength);
    const barWidth =
      (CANVAS_MAX_WIDTH - CANVAS_PADDING_X * 2 - barSpacing * (dataLength - 2.5)) /
      dataLength;
    const stepX = barWidth + barSpacing;
    return { barWidth, stepX };
  };

  const drawBars = (data, colorForIndex, xOffsetByIndex = {}, skipIndex = null) => {
    const { barWidth, stepX } = getBarMetrics(data.length);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < data.length; i++) {
      if (i === skipIndex) continue;
      const x = i * stepX + (xOffsetByIndex[i] ?? 0);
      const y = canvas.height - data[i];
      ctx.fillStyle = colorForIndex(i);
      ctx.fillRect(x, y, barWidth, data[i]);
    }
  };

  const swapAnimator = (data, leftIdx, rightIdx) =>
    animateHorizontalSwap({
      data,
      leftIdx,
      rightIdx,
      control,
      getBarMetrics,
      drawBars,
      highlightColor: redColor,
      defaultColor: barColor,
    });
  const shiftAnimator = (data, fromIdx, toIdx) =>
    animateHorizontalShift({
      data,
      fromIdx,
      toIdx,
      control,
      getBarMetrics,
      drawBars,
      highlightColor: redColor,
      defaultColor: barColor,
    });

  const renderCanvas = (alg, data, minIdx, currentIdx) => {
    if (alg === "merge") {
      const mergeLo = minIdx ?? 0;
      const mergeHi = currentIdx ?? data.length;
      drawBars(data, (i) => (i >= mergeLo && i < mergeHi ? barColor : "#e1d7ff"));
    } else {
      /** After insertion copies A[j]->A[j+1], both hold same value briefly; omit left slot visually. */
      const skipInsertionDuplicate =
        alg === "insertion-shift" &&
        typeof currentIdx === "number" &&
        !Number.isNaN(currentIdx)
          ? currentIdx
          : null;

      drawBars(
        data,
        (i) => {
        if (alg === "selection") {
          if (i === minIdx) return redColor;
          if (i === currentIdx) return greenColor;
          return barColor;
        }
        if (alg === "selection-swap") {
          return i === minIdx || i === currentIdx ? redColor : barColor;
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
        },
        {},
        skipInsertionDuplicate
      );
    }
  };

  renderCanvas(alg, defaultArray, minIdx, currentIdx);

  const selectElement = document.querySelector("select");
  const runButton = document.querySelector(".button--run");
  const randomDataButton = document.querySelector(".button--random-data");
  const resetAllButton = document.querySelector(".button--reset-all");

  const control = {
    time: +delayInput.value,
    stop: false,
  };

  let sortInProgress = false;

  const syncRunAvailability = () => {
    runButton.disabled =
      sortInProgress || selectElement.value === "none";
    /** Reset solo cuando Run no se puede pulsar (durante sort) y hay snapshot. */
    resetAllButton.disabled =
      !snapshotBeforeRun?.length || !runButton.disabled;
  };

  const disableResetUntilNextRun = () => {
    snapshotBeforeRun = null;
    syncRunAvailability();
  };

  /**
   * Regenera valores aleatorios. Si preserveSortChoice es true, mantiene método y leyenda.
   */
  const regenerateData = (size, preserveSortChoice) => {
    disableResetUntilNextRun();
    defaultArray = [...generateArray(size)];
    selectElement.removeAttribute("disabled");
    control.stop = true;
    renderCanvas("none", defaultArray);

    if (preserveSortChoice) {
      const selected = selectElement.value;
      if (selected !== "none") {
        legend.innerHTML = legendText[selected];
      }
    } else {
      selectElement.value = "none";
      legend.innerHTML = "";
    }
    syncRunAvailability();
  };

  randomDataButton.addEventListener("click", () =>
    regenerateData(+sampleSizeInput.value, true)
  );

  resetAllButton.addEventListener("click", () => {
    if (!snapshotBeforeRun?.length) return;
    control.stop = true;
    defaultArray = [...snapshotBeforeRun];
    selectElement.removeAttribute("disabled");
    selectElement.value = "none";
    legend.innerHTML = "";
    renderCanvas("none", defaultArray);
    disableResetUntilNextRun();
  });

  const runSelectedSort = async () => {
    const selectedAlgorithm = selectElement.value;
    if (selectedAlgorithm === "none") return;

    snapshotBeforeRun = [...defaultArray];
    sortInProgress = true;
    syncRunAvailability();

    selectElement.setAttribute("disabled", "true");

    try {
      legend.innerHTML = legendText[selectedAlgorithm];
      control.stop = false;
      const sortedArray = await algorithms[selectedAlgorithm](
        defaultArray,
        renderCanvas,
        control,
        { swap: swapAnimator, shift: shiftAnimator }
      );
      if (!control.stop && sortedArray?.length > 0) {
        defaultArray = [...sortedArray];
        renderCanvas("none", defaultArray);
      }
    } finally {
      sortInProgress = false;
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
    regenerateData(+event.target.value, true);
  });
});
