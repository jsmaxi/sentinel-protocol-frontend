export const formatLargeNumber = (
  num: BigInt,
  fractionDigits?: number
): string => {
  // Note: This conversion is safe for display purposes, but may lose precision for very large numbers
  const value = Number(num);

  if (value === 0) return "0";

  const scales = [
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
    { value: 1, symbol: "" },
  ];

  const scale = scales.find((scale) => Math.abs(value) >= scale.value);

  if (!scale) return "0";

  const scaledNumber = value / scale.value;

  const formatted = Number.isInteger(scaledNumber)
    ? scaledNumber.toString()
    : scaledNumber
        .toFixed(fractionDigits ? fractionDigits : 1)
        .replace(/\.0$/, "");

  return formatted + scale.symbol;
};

export const formatNumber = (num: number, fractionDigits?: number): string => {
  if (num === 0) return "0";

  const scales = [
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
    { value: 1, symbol: "" },
  ];

  const scale = scales.find((scale) => Math.abs(num) >= scale.value);

  if (!scale) return "0";

  const scaledNumber = num / scale.value;

  const formatted = Number.isInteger(scaledNumber)
    ? scaledNumber.toString()
    : scaledNumber
        .toFixed(fractionDigits ? fractionDigits : 1)
        .replace(/\.0$/, "");

  return formatted + scale.symbol;
};
