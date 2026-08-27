import { AxiosError } from "axios";

export class ListmonkApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly listmonkMessage?: string
  ) {
    super(message);
    this.name = "ListmonkApiError";
  }
}

/** Converts a thrown axios/unknown error into a ListmonkApiError with an actionable message. */
export function toListmonkApiError(err: unknown): ListmonkApiError {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const listmonkMessage =
      err.response?.data && typeof err.response.data === "object" && "message" in err.response.data
        ? String((err.response.data as { message: unknown }).message)
        : undefined;

    switch (status) {
      case 401:
        return new ListmonkApiError(
          "Authentication failed. Check that LISTMONK_API_USER and LISTMONK_API_TOKEN are correct.",
          status,
          listmonkMessage
        );
      case 403:
        return new ListmonkApiError(
          `Permission denied${listmonkMessage ? `: ${listmonkMessage}` : ""}. The configured API user's ` +
            "token may be missing a required permission scope (check Listmonk Admin → Users).",
          status,
          listmonkMessage
        );
      case 404:
        return new ListmonkApiError(
          `Not found${listmonkMessage ? `: ${listmonkMessage}` : ""}. Check that the id/uuid is correct.`,
          status,
          listmonkMessage
        );
      case 400:
        return new ListmonkApiError(
          `Validation error: ${listmonkMessage ?? "the request was rejected by Listmonk."}`,
          status,
          listmonkMessage
        );
      default:
        if (status) {
          return new ListmonkApiError(
            listmonkMessage ?? `Listmonk API request failed with status ${status}.`,
            status,
            listmonkMessage
          );
        }
        if (err.code === "ECONNABORTED") {
          return new ListmonkApiError("Request to Listmonk timed out. Please try again.");
        }
        return new ListmonkApiError(`Could not reach Listmonk: ${err.message}`);
    }
  }
  return new ListmonkApiError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
}
