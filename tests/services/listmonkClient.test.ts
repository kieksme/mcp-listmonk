import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestMock, createMock } = vi.hoisted(() => {
  const requestMock = vi.fn();
  const createMock = vi.fn(() => ({ request: requestMock }));
  return { requestMock, createMock };
});

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: { ...actual.default, create: createMock },
  };
});

const { ListmonkClient } = await import("../../src/services/listmonkClient.js");
const { ListmonkApiError } = await import("../../src/errors.js");

describe("ListmonkClient", () => {
  beforeEach(() => {
    requestMock.mockReset();
    createMock.mockClear();
  });

  it("configures axios with a trimmed base URL, basic auth, and a timeout", () => {
    new ListmonkClient({ baseUrl: "https://listmonk.example.com/", apiUser: "user", apiToken: "token" });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://listmonk.example.com/api",
        auth: { username: "user", password: "token" },
        timeout: 30_000,
      })
    );
  });

  it("serializes array query params as repeated bare keys, not bracket notation", () => {
    new ListmonkClient({ baseUrl: "https://listmonk.example.com", apiUser: "u", apiToken: "t" });
    const { paramsSerializer } = createMock.mock.calls[0][0];
    const serialize = (paramsSerializer as { serialize: (p: Record<string, unknown>) => string }).serialize;

    expect(serialize({ id: [1, 2, 3], query: "test" })).toBe("id=1&id=2&id=3&query=test");
  });

  it("omits null/undefined values when serializing query params", () => {
    new ListmonkClient({ baseUrl: "https://listmonk.example.com", apiUser: "u", apiToken: "t" });
    const { paramsSerializer } = createMock.mock.calls[0][0];
    const serialize = (paramsSerializer as { serialize: (p: Record<string, unknown>) => string }).serialize;

    expect(serialize({ page: 1, per_page: undefined, query: null })).toBe("page=1");
  });

  it("unwraps the { data: ... } envelope on request()", async () => {
    requestMock.mockResolvedValue({ data: { data: { id: 1, name: "Test" } } });
    const client = new ListmonkClient({ baseUrl: "https://listmonk.example.com", apiUser: "u", apiToken: "t" });

    const result = await client.request<{ id: number; name: string }>({ method: "GET", path: "/lists/1" });

    expect(result).toEqual({ id: 1, name: "Test" });
    expect(requestMock).toHaveBeenCalledWith({ method: "GET", url: "/lists/1", params: undefined, data: undefined });
  });

  it("returns the raw body from request() when there is no data envelope", async () => {
    requestMock.mockResolvedValue({ data: true });
    const client = new ListmonkClient({ baseUrl: "https://listmonk.example.com", apiUser: "u", apiToken: "t" });

    const result = await client.request<boolean>({ method: "DELETE", path: "/lists/1" });

    expect(result).toBe(true);
  });

  it("converts a thrown axios error into a ListmonkApiError on request()", async () => {
    const axiosErr = new AxiosError("failed", undefined, undefined, undefined, {
      status: 404,
      statusText: "Not Found",
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() } as never,
      data: { message: "list not found" },
    });
    requestMock.mockRejectedValue(axiosErr);
    const client = new ListmonkClient({ baseUrl: "https://listmonk.example.com", apiUser: "u", apiToken: "t" });

    await expect(client.request({ method: "GET", path: "/lists/999" })).rejects.toBeInstanceOf(ListmonkApiError);
    await expect(client.request({ method: "GET", path: "/lists/999" })).rejects.toMatchObject({ status: 404 });
  });

  it("unwraps the { data: ... } envelope on requestMultipart()", async () => {
    requestMock.mockResolvedValue({ data: { data: { id: 5 } } });
    const client = new ListmonkClient({ baseUrl: "https://listmonk.example.com", apiUser: "u", apiToken: "t" });
    const form = new FormData();

    const result = await client.requestMultipart<{ id: number }>({ method: "POST", path: "/media", form });

    expect(result).toEqual({ id: 5 });
    expect(requestMock).toHaveBeenCalledWith({ method: "POST", url: "/media", data: form });
  });

  it("converts a thrown axios error into a ListmonkApiError on requestMultipart()", async () => {
    requestMock.mockRejectedValue(new Error("network down"));
    const client = new ListmonkClient({ baseUrl: "https://listmonk.example.com", apiUser: "u", apiToken: "t" });

    await expect(
      client.requestMultipart({ method: "POST", path: "/media", form: new FormData() })
    ).rejects.toBeInstanceOf(ListmonkApiError);
  });
});
