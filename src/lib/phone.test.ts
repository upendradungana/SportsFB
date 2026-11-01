import { describe, it, expect } from "vitest"; import { toBhutanE164 } from "./phone";
describe("toBhutanE164", () => {
  it("accepts 77/17/16 plus six digits in several shapes", () => { for (const x of ["17123456", "+97517123456", "975 17-123-456", "77123456", "16123456"]) expect(toBhutanE164(x)).toMatch(/^\+975(77|17|16)\d{6}$/); });
  it("rejects other prefixes and lengths", () => { for (const x of ["18123456", "1712345", "171234567", "abc", "", "+97618123456"]) expect(toBhutanE164(x)).toBeNull(); });
});
