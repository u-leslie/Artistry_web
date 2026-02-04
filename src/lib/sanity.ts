import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

// Sanity configuration - uses environment variables
export const sanityConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "",
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true, // Use CDN for faster image delivery
};

// Create Sanity client
export const sanityClient = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: sanityConfig.useCdn,
});

// Image URL builder for optimized images
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// GROQ queries to fetch content
export const poemsQuery = `*[_type == "poem"] | order(order asc) {
  _id,
  number,
  title,
  content,
  order
}`;

export const photosQuery = `*[_type == "photo"] | order(order asc) {
  _id,
  title,
  number,
  year,
  image,
  order
}`;
