import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

let client: SanityClient | null = null;

export function getSanityServer(): SanityClient | null {
  const projectId =
    process.env.SANITY_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID ?? "";
  const dataset =
    process.env.SANITY_DATASET ?? process.env.VITE_SANITY_DATASET ?? "production";
  if (!projectId) return null;
  if (!client) {
    client = createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
    });
  }
  return client;
}

export function photoUrlFor(image: unknown, width = 640): string {
  const c = getSanityServer();
  if (!c || !image) return "";
  const builder = imageUrlBuilder(c);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return builder.image(image as any).width(width).url();
}
