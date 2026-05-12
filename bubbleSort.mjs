// const ar = [5, 2, 4, 4, 3];
// const n = 100000;

// const ar = new Array(n).fill(0).map((_, index) => index + 1);
// i = 0; j = 0; [2,5,4,4,3]
// i = 0; j = 1; [2,4,5,4,3]
// i = 0; j = 2; [2,4,4,5,3]
// i = 0; j = 3; [2,4,4,3,5]

// i = 1; j = 0; [2,4,4,3,5]
// i = 1; j = 1; [2,4,4,3,5]
// i = 1; j = 2; [2,4,3,4,5]
// i = 1; j = 3; exit

// i = 2; j = 0; [2,4,3,4,5]
// i = 2; j = 1; [2,3,4,4,5]
// i = 2; j = 2; exit

// i = 3; j = 0; [2,3,4,4,5]
// i = 3; j = 1; exit

// i = 4; j = 0; exit

import { sleep } from "./helpers.mjs";

// ascending order
export const bubbleSort = async (
  unsortedArray,
  callback,
  control,
  animators = {}
) => {
  const array = [...unsortedArray];

  for (let i = 0; i < array.length; i++) {
    let swapped = false;
    for (let j = 0; j < array.length - i - 1; j++) {
      if (control.stop) return;
      if (array[j] > array[j + 1]) {
        const leftValue = array[j];
        const rightValue = array[j + 1];
        swapped = true;

        // Animate using pre-swap positions/values; mutating first causes
        // visual mismatches where bar heights seem to belong to wrong indices.
        if (typeof animators.swap === "function") {
          await animators.swap(array, j, j + 1);
        }

        if (control.stop) return;

        // Commit swap after animation.
        array[j] = rightValue;
        array[j + 1] = leftValue;
        callback("bubble-swap", array, j, j + 1);
        await sleep(control.time);
      } else {
        callback("bubble", array, j, j + 1);
        await sleep(control.time);
      }
    }

    if (!swapped) {
      break;
    }
  }
  return array;
};

// const start = performance.now();

// const sortedArr = bubbleSort(ar);
// console.log(sortedArr);
// const end = performance.now();

// console.log(end - start);
