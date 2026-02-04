import { useQuery } from "@tanstack/react-query";
import { sanityClient, photosQuery, urlFor } from "@/lib/sanity";

export interface Photo {
  _id: string;
  title: string;
  number: string;
  year: string;
  image: any;
  order?: number;
  url?: string;
}

export function usePhotos() {
  return useQuery<Photo[]>({
    queryKey: ["photos"],
    queryFn: async () => {
      if (!sanityClient.config().projectId) {
        throw new Error("Sanity project ID not configured");
      }
      const photos = await sanityClient.fetch<Photo[]>(photosQuery);
      return photos.map((photo) => ({
        ...photo,
        url: photo.image ? urlFor(photo.image).width(1200).url() : "",
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
  });
}
