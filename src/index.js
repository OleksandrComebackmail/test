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
