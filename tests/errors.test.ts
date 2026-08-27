import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { ListmonkApiError, toListmonkApiError } from "../src/errors.js";

function makeAxiosError(opts: { status?: number; data?: unknown; code?: string; message?: string }): AxiosError {
  const err = new AxiosError(
    opts.message ?? "request failed",
    opts.code,
    undefined,
    undefined,
    opts.status
      ? {
          status: opts.status,
          statusText: "Error",
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() } as never,
          data: opts.data,
        }
      : undefined
  );
  if (opts.code) err.code = opts.code;
  return err;
}

describe("toListmonkApiError", () => {
  it("maps 401 to an authentication message", () => {
    const result = toListmonkApiError(makeAxiosError({ status: 401 }));
    expect(result).toBeInstanceOf(ListmonkApiError);
    expect(result.status).toBe(401);
    expect(result.message).toContain("Authentication failed");
    expect(result.message).toContain("LISTMONK_API_USER");
  });

  it("maps 403 to a permission-denied message including the listmonk message", () => {
    const result = toListmonkApiError(makeAxiosError({ status: 403, data: { message: "no scope" } }));
    expect(result.status).toBe(403);
    expect(result.listmonkMessage).toBe("no scope");
    expect(result.message).toContain("Permission denied: no scope");
  });

  it("maps 403 without a listmonk message gracefully", () => {
    const result = toListmonkApiError(makeAxiosError({ status: 403 }));
    expect(result.message).toBe(
      "Permission denied. The configured API user's token may be missing a required permission scope " +
        "(check Listmonk Admin → Users)."
    );
  });

  it("maps 404 to a not-found message", () => {
    const result = toListmonkApiError(makeAxiosError({ status: 404, data: { message: "list not found" } }));
    expect(result.status).toBe(404);
    expect(result.message).toContain("Not found: list not found");
    expect(result.message).toContain("Check that the id/uuid is correct.");
  });

  it("maps 400 to a validation-error message", () => {
    const result = toListmonkApiError(makeAxiosError({ status: 400, data: { message: "email is required" } }));
    expect(result.status).toBe(400);
    expect(result.message).toBe("Validation error: email is required");
  });

  it("maps 400 without a listmonk message to a generic validation message", () => {
    const result = toListmonkApiError(makeAxiosError({ status: 400 }));
    expect(result.message).toBe("Validation error: the request was rejected by Listmonk.");
  });

  it("maps other status codes to a generic message carrying the status", () => {
    const result = toListmonkApiError(makeAxiosError({ status: 500, data: { message: "boom" } }));
    expect(result.status).toBe(500);
    expect(result.message).toBe("boom");
  });

  it("falls back to a status-only message for other codes without a listmonk message", () => {
    const result = toListmonkApiError(makeAxiosError({ status: 502 }));
    expect(result.message).toBe("Listmonk API request failed with status 502.");
  });

  it("maps a timeout (ECONNABORTED) with no response to a timeout message", () => {
    const result = toListmonkApiError(makeAxiosError({ code: "ECONNABORTED" }));
    expect(result.status).toBeUndefined();
    expect(result.message).toBe("Request to Listmonk timed out. Please try again.");
  });

  it("maps a network error with no response to an unreachable message", () => {
    const result = toListmonkApiError(makeAxiosError({ message: "connect ECONNREFUSED" }));
    expect(result.message).toBe("Could not reach Listmonk: connect ECONNREFUSED");
  });

  it("wraps a generic Error as an unexpected error", () => {
    const result = toListmonkApiError(new Error("something else broke"));
    expect(result.message).toBe("Unexpected error: something else broke");
  });

  it("wraps a non-Error thrown value as an unexpected error", () => {
    const result = toListmonkApiError("just a string");
    expect(result.message).toBe("Unexpected error: just a string");
  });

  it("sets the error name to ListmonkApiError", () => {
    const result = toListmonkApiError(new Error("x"));
    expect(result.name).toBe("ListmonkApiError");
  });
});
