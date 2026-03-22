import { defineCliConfig } from "sanity/cli";

// Get project ID from environment
const projectId =
  process.env.VITE_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  "";

const dataset = process.env.VITE_SANITY_DATASET || 
                process.env.SANITY_STUDIO_DATASET || 
                "production";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
