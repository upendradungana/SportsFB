import { describe, it, expect, beforeAll } from "vitest";
beforeAll(() => { process.env.AUTH_SECRET = "test-secret"; process.env.TOTP_ENC_KEY = "00".repeat(32); });
describe("totp helpers", () => {
  it("seals and opens a secret", async () => { const t = await import("./totp"); expect(t.open(t.seal("JBSWY3DPEHPK3PXP"))).toBe("JBSWY3DPEHPK3PXP"); });
  it("accepts an MFA cookie only for the same user and rejects tampering", async () => {
    const t = await import("./totp"), c = t.mfaCookie("u1");
    expect(t.mfaValid(c, "u1")).toBe(true); expect(t.mfaValid(c, "u2")).toBe(false); expect(t.mfaValid(c + "x", "u1")).toBe(false); expect(t.mfaValid(undefined, "u1")).toBe(false);
  });
});
