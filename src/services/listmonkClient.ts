import axios, { type AxiosInstance } from "axios";
import { toListmonkApiError } from "../errors.js";

export interface ListmonkConfig {
  baseUrl: string;
  apiUser: string;
  apiToken: string;
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  params?: Record<string, unknown>;
  data?: unknown;
}

export interface MultipartRequestOptions {
  method: "POST" | "PUT";
  path: string;
  form: FormData;
}

/**
 * Thin wrapper around Listmonk's REST API. Unwraps the `{ data: ... }`
 * envelope Listmonk wraps every successful response in, and converts axios
 * errors into ListmonkApiError with actionable messages.
 */
export class ListmonkClient {
  private readonly http: AxiosInstance;

  constructor(cfg: ListmonkConfig) {
    this.http = axios.create({
      baseURL: `${cfg.baseUrl.replace(/\/+$/, "")}/api`,
      auth: { username: cfg.apiUser, password: cfg.apiToken },
      timeout: 30_000,
      // Listmonk expects repeated bare keys for array query params (?id=1&id=2),
      // not axios's default bracket notation (?id[]=1&id[]=2).
      paramsSerializer: { serialize: serializeParams },
    });
  }

  async request<T>(opts: RequestOptions): Promise<T> {
    try {
      const res = await this.http.request({
        method: opts.method,
        url: opts.path,
        params: opts.params,
        data: opts.data,
      });
      return unwrapEnvelope<T>(res.data);
    } catch (err) {
      throw toListmonkApiError(err);
    }
  }

  async requestMultipart<T>(opts: MultipartRequestOptions): Promise<T> {
    try {
      const res = await this.http.request({
        method: opts.method,
        url: opts.path,
        data: opts.form,
      });
      return unwrapEnvelope<T>(res.data);
    } catch (err) {
      throw toListmonkApiError(err);
    }
  }
}

function serializeParams(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) usp.append(key, String(item));
    } else {
      usp.append(key, String(value));
    }
  }
  return usp.toString();
}

function unwrapEnvelope<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
    return (body as { data: T }).data;
  }
  return body as T;
}
