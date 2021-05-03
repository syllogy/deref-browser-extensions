export function numberWithCommas(num: number, decimals = 2) {
  return num
    .toFixed(decimals)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
