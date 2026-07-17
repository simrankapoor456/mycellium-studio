import { describe, expect, it } from "vitest";

import { toAuthErrorMessage, toProjectErrorMessage } from "@/lib/errors/safe-error";

describe("safe error mapping", () => {
  it("maps known authentication failures to friendly messages", () => {
    expect(toAuthErrorMessage({ code: "invalid_credentials" })).toBe(
      "Email or password is incorrect.",
    );
  });

  it("does not expose unknown server details", () => {
    const sensitive = "relation projects does not exist at postgres://internal";
    const message = toProjectErrorMessage(new Error(sensitive));

    expect(message).not.toContain("postgres");
    expect(message).not.toContain("relation");
    expect(message).toBe("The project could not be saved. Please try again.");
  });
});
