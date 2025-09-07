import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges class names and resolves conflicts", () => {
    const result = cn(
      "p-2",
      "p-4",
      false && "hidden",
      (null as unknown) as string,
      (undefined as unknown) as string,
      "text-white",
    );
    expect(result).toContain("p-4");
    expect(result).toContain("text-white");
    expect(result).not.toContain("hidden");
  });
});
