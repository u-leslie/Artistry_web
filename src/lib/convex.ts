import { ConvexReactClient } from "convex/react";

export const convexUrl =
  import.meta.env.VITE_CONVEX_URL ?? "http://localhost:3000";
export const convex = new ConvexReactClient(convexUrl);
