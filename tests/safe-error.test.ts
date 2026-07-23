import { describe, expect, it } from "vitest";

import { classifySafeError, toAuthErrorMessage, toProjectErrorMessage } from "@/lib/errors/safe-error";
import { safeApiError } from "@/lib/errors/api-error";

describe("safe error mapping", () => {
  it("does not expose internal API errors", () => {
    expect(safeApiError(new Error("database host and token"))).toBe("We could not complete that request. Please try again.");
    expect(safeApiError({ code: "23505", message: "private detail" })).toBe("That request has already been received.");
  });
  it("maps known authentication failures to friendly messages", () => {
    expect(toAuthErrorMessage({ code: "invalid_credentials" })).toBe(
      "Email or password is incorrect.",
    );
  });

  it("maps account, provider, and rate boundaries without returning provider text", () => {
    expect(toAuthErrorMessage({ code: "email_address_invalid", message: "internal" })).toBe("Enter a valid email address.");
    expect(toAuthErrorMessage({ code: "email_not_confirmed" })).toBe("Confirm your email before signing in.");
    expect(toAuthErrorMessage({ code: "email_exists" })).toBe("We could not complete that request. Please try again.");
    expect(toAuthErrorMessage({ code: "weak_password" })).toBe("Choose a stronger password and try again.");
    expect(toAuthErrorMessage({ code: "signup_disabled" })).toBe("New account creation is currently unavailable.");
    expect(toAuthErrorMessage({ code: "provider_disabled" })).toBe("Email sign-in is currently unavailable.");
    expect(toAuthErrorMessage({ status: 429, message: "provider detail" })).toBe("Too many attempts. Wait a moment and try again.");
  });

  it("does not expose unknown server details", () => {
    const sensitive = "relation projects does not exist at postgres://internal";
    const message = toProjectErrorMessage(new Error(sensitive));

    expect(message).not.toContain("postgres");
    expect(message).not.toContain("relation");
    expect(message).toBe("The project could not be saved. Please try again.");
  });

  it("separates network, authentication, permission, database, and unknown failures", () => {
    expect(classifySafeError(new TypeError("fetch failed"))).toBe("network");
    expect(classifySafeError({ status: 401 })).toBe("authentication");
    expect(classifySafeError({ status: 403 })).toBe("permission");
    expect(classifySafeError({ code: "23505" })).toBe("database");
    expect(classifySafeError(new Error("private internal detail"))).toBe("unknown");
  });
});
