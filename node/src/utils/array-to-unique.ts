export default function arrayToUnique<T>(a: T[]): T[] {
  a.sort();
  return a.reduce((acc, cur, i, arr) => {
    if (i > 1 && arr[i - 1] == cur) {
      return acc;
    }

    acc.push(cur);
    return acc;
  }, [] as T[]);
}
