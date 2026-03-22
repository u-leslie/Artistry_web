import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

const projectId = process.env.VITE_SANITY_PROJECT_ID || 
                  process.env.SANITY_STUDIO_PROJECT_ID || 
                  "";

const dataset = process.env.VITE_SANITY_DATASET || 
                process.env.SANITY_STUDIO_DATASET || 
                "production";


export default defineConfig({
  name: "artistry",
  title: "Artistry CMS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool(),
    visionTool(), 
  ],
  schema: {
    types: [
      {
        name: "poem",
        title: "Poem",
        type: "document",
        fields: [
          {
            name: "number",
            title: "Number",
            type: "string",
            validation: (Rule: any) => Rule.required(),
          },
          {
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule: any) => Rule.required(),
          },
          {
            name: "content",
            title: "Content",
            type: "text",
            validation: (Rule: any) => Rule.required(),
          },
          {
            name: "order",
            title: "Order",
            type: "number",
            validation: (Rule: any) => Rule.required().min(0),
          },
        ],
      },
      {
        name: "newsletterSubscriber",
        title: "Newsletter subscriber",
        type: "document",
        fields: [
          {
            name: "email",
            title: "Email",
            type: "string",
            validation: (Rule: any) => Rule.required().email(),
          },
          {
            name: "name",
            title: "Name",
            type: "string",
          },
          {
            name: "subscribedAt",
            title: "Subscribed at",
            type: "datetime",
            validation: (Rule: any) => Rule.required(),
          },
        ],
        preview: {
          select: { title: "email", subtitle: "name" },
        },
      },
      {
        name: "photo",
        title: "Photo",
        type: "document",
        fields: [
          {
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule: any) => Rule.required(),
          },
          {
            name: "number",
            title: "Number",
            type: "string",
            validation: (Rule: any) => Rule.required(),
          },
          {
            name: "year",
            title: "Year",
            type: "string",
            validation: (Rule: any) => Rule.required(),
          },
          {
            name: "image",
            title: "Image",
            type: "image",
            options: {
              hotspot: true,
            },
            validation: (Rule: any) => Rule.required(),
          },
          {
            name: "order",
            title: "Order",
            type: "number",
            validation: (Rule: any) => Rule.required().min(0),
          },
        ],
      },
    ],
  },
});
