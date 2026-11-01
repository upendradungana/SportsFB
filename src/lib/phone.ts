export const BT_LOCAL = /^(77|17|16)\d{6}$/;
/** Accepts "17123456", "+97517123456", "975 17-123-456"; returns "+97517123456" or null. */
export function toBhutanE164(input: string): string | null {
  const d = input.replace(/[\s-]/g, "").replace(/^\+?975/, "");
  return BT_LOCAL.test(d) ? `+975${d}` : null;
}
