export const hello = () => "hello from changelog sandbox";
export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;
export const mul = (a, b) => a * b;
export const div = (a, b) => {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
};
export const round = (n, decimals = 0) =>
  Math.round(n * 10 ** decimals) / 10 ** decimals;

export const average = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const percent = (part, whole) => (whole === 0 ? 0 : (part / whole) * 100);
export const ratio = (a, b) => (b === 0 ? 0 : a / b);

export const toFixed2 = (n) => Math.round(n * 100) / 100;
