import { formatMedia, formatMediaList } from "../formatters/media.js";
import * as schemas from "../schemas/media.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";
import type { MediaFileObject, PagedResult } from "../types.js";

const EXTENSION_MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

function guessContentType(fileName: string, explicit: string | undefined): string {
  if (explicit) return explicit;
  const ext = fileName.split(".").pop()?.toLowerCase();
  return (ext && EXTENSION_MIME_TYPES[ext]) || "application/octet-stream";
}

export const mediaTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_list_media",
    category: "media",
    title: "List Media",
    description: "Lists all uploaded media files (images used in campaigns/templates).",
    inputSchema: schemas.listMediaSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const result = await client.request<PagedResult<MediaFileObject>>({
        method: "GET",
        path: "/media",
        params: { page: args.page, per_page: args.per_page, query: args.query },
      });
      const text = formatMediaList(result.results, result.total, result.page, result.per_page, args.response_format);
      return { content: [{ type: "text", text }] };
    },
  }),

  defineTool({
    name: "listmonk_upload_media",
    category: "media",
    title: "Upload Media",
    description: "Uploads an image file to the media library for use in campaigns/templates.",
    inputSchema: schemas.uploadMediaSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const buffer = Buffer.from(args.file_content_base64, "base64");
      const contentType = guessContentType(args.file_name, args.content_type);
      const form = new FormData();
      form.append("file", new Blob([buffer], { type: contentType }), args.file_name);
      const media = await client.requestMultipart<MediaFileObject>({ method: "POST", path: "/media", form });
      return { content: [{ type: "text", text: formatMedia(media, args.response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_get_media",
    category: "media",
    title: "Get Media",
    description: "Retrieves metadata for a single uploaded media file by id.",
    inputSchema: schemas.getMediaSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const media = await client.request<MediaFileObject>({ method: "GET", path: `/media/${args.id}` });
      return { content: [{ type: "text", text: formatMedia(media, args.response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_media",
    category: "media",
    title: "Delete Media",
    description: "Permanently deletes an uploaded media file by id.",
    inputSchema: schemas.deleteMediaSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "DELETE", path: `/media/${args.id}` });
      return { content: [{ type: "text", text: `Media #${args.id} deleted.` }] };
    },
  }),
];
