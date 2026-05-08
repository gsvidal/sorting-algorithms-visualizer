import { sleep } from "./helpers.mjs";

export const insertionSort = async (unsortedArray, callback, control) => {
  const array = [...unsortedArray];

  for (let i = 1; i < array.length; i++) {
    if (control.stop) return;

    const key = array[i];
    let j = i - 1;

    callback("insertion", array, i, j);
    await sleep(control.time);

    while (j >= 0 && array[j] > key) {
      if (control.stop) return;
      array[j + 1] = array[j];
      callback("insertion-shift", array, j + 1, j);
      await sleep(control.time);
      j--;
    }

    array[j + 1] = key;
    callback("insertion", array, j + 1, i);
    await sleep(control.time);
  }

  return array;
};
