import { useQuery } from "@tanstack/react-query";
import { sanityClient, poemsQuery } from "@/lib/sanity";

export interface Poem {
  _id: string;
  number: string;
  title: string;
  content: string;
  order?: number;
}

export function usePoems() {
  return useQuery<Poem[]>({
    queryKey: ["poems"],
    queryFn: async () => {
      if (!sanityClient.config().projectId) {
        throw new Error("Sanity project ID not configured");
      }
      const poems = await sanityClient.fetch<Poem[]>(poemsQuery);
      return poems;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
