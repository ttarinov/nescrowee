export function yoctoToNear(yocto: string, decimals = 2): string {
  const val = BigInt(yocto || "0");
  return (Number(val) / 1e24).toFixed(decimals);
}
