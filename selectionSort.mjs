// const ar = [5, 2, 4, 4, 3];
// const n = 100000;
// const ar = new Array(n).fill(0).map((_, index) => index + 1);

import { sleep } from "./helpers.mjs";

export const selectionSort = async (
  unsortedArray,
  callback,
  control,
  animators = {}
) => {
  const array = [...unsortedArray];

  for (let i = 0; i < array.length - 1; i++) {
    let min = array[i];
    let minIdx = i;
    for (let j = i + 1; j < array.length; j++) {
      if (control.stop) return;

      if (array[j] < min) {
        min = array[j];
        minIdx = j;
      }
      callback("selection", array, minIdx, j);
      await sleep(control.time);
    }

    if (minIdx !== i) {
      if (typeof animators.swap === "function") {
        await animators.swap(array, i, minIdx);
      }
      const temp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = temp;
      callback("selection-swap", array, i, minIdx);
      await sleep(control.time);
    } else {
      callback("selection", array, minIdx, i);
      await sleep(control.time);
    }
  }
  return array;
};

// i = 0; j = 1; min = 2; [2,5,4,4,3]
// i = 1; j = 2; min = 3; [2,3,4,4,5]
// i = 2; j = 3; min = ; [2,3,4,4,5]

// const start = performance.now();
// const sortedArr = selectionSort(ar);
// const end = performance.now();

// console.log(end - start);
