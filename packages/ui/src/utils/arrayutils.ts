export function reverseFormArray<T>(fields: T[], swapFn: (indexA: number, indexB: number) => void): void {
  const len = fields.length;
  for (let i = 0; i < Math.floor(len / 2); i++) {
    swapFn(i, len - i - 1);
  }
}
