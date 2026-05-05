import { sleep } from "./helpers.mjs";

export const mergeSort = async (unsortedArray, callback, control) => {
  if (control.stop) return;
  const array = [...unsortedArray];
  const aux = new Array(array.length);
  await mergeSortRange(array, aux, callback, control, 0, array.length);
  return array;
};

const mergeSortRange = async (arr, aux, callback, control, lo, hi) => {
  if (control.stop) return;
  if (hi - lo <= 1) return;

  const mid = Math.floor((lo + hi) / 2);
  callback("merge", [...arr], lo, hi);
  await sleep(control.time);

  await mergeSortRange(arr, aux, callback, control, lo, mid);
  await mergeSortRange(arr, aux, callback, control, mid, hi);

  await mergeCombined(arr, aux, callback, control, lo, mid, hi);
};

const mergeCombined = async (arr, aux, callback, control, lo, mid, hi) => {
  if (control.stop) return;

  for (let k = lo; k < hi; k++) aux[k] = arr[k];

  let i = lo;
  let j = mid;
  let out = lo;

  const emit = () => {
    callback("merge", [...arr], lo, hi);
  };

  while (i < mid && j < hi) {
    if (aux[j] < aux[i]) {
      arr[out++] = aux[j++];
    } else {
      arr[out++] = aux[i++];
    }
    emit();
    await sleep(control.time);
  }
  while (i < mid) {
    arr[out++] = aux[i++];
    emit();
    await sleep(control.time);
  }
  while (j < hi) {
    arr[out++] = aux[j++];
    emit();
    await sleep(control.time);
  }
};
