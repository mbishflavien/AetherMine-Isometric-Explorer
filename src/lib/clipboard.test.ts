import { describe, expect, it, vi } from "vitest";
import { copyText } from "./clipboard";

describe("copyText", () => {
  it("writes the text and reports success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(copyText("0xabc", { writeText })).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("0xabc");
  });

  it("reports failure when the clipboard rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    await expect(copyText("0xabc", { writeText })).resolves.toBe(false);
  });

  it("reports failure when no clipboard is available", async () => {
    await expect(copyText("0xabc", null)).resolves.toBe(false);
  });
});
