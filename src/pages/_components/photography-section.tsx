import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePhotos, type Photo } from "@/hooks/use-photos";
import { ArtistryLoader } from "@/components/artistry-loader.tsx";

// Featured photo titles - defined outside component to prevent re-renders
const FEATURED_PHOTO_TITLES = ["Art fueled", "shadows", "face card", "cozy place"] as const;

function PhotoCard({ photo, index }: { photo: Photo; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-4">
        {/* Image */}
        <div className="relative  overflow-hidden bg-muted">
          {photo.url && (
            <motion.img
              src={photo.url}
              alt={photo.title}
              className="w-full h-full object-cover grayscale"
              animate={{
                scale: isHovered ? 1.05 : 1,
                filter: isHovered ? "grayscale(0%)" : "grayscale(100%)",
              }}
              transition={{ duration: 0.6 }}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 border-4 border-foreground pointer-events-none"
          />
        </div>

        {/* Info */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-mono text-muted-foreground">
              {photo.number}
            </span>
            <span className="text-xl font-serif font-light">{photo.title}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {photo.year}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PhotographySection() {
  const { data: photos, isLoading, error } = usePhotos();

  if (isLoading) {
    return (
      <section id="photography" className="py-6 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <ArtistryLoader />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="photography" className="py-6 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading photos</p>
              <p className="text-sm text-muted-foreground">
                Please check your Sanity configuration in .env file
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <section id="photography" className="py-6 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No photos found</p>
              <p className="text-sm text-muted-foreground">
                Add photos in your Sanity Studio to see them here
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Get specific photos by title
  const featuredPhotos = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    
    // Find photos matching the featured titles (case-insensitive)
    // Maintain the order specified by the user
    return FEATURED_PHOTO_TITLES.map(title => 
      photos.find(photo => 
        photo.title.toLowerCase().trim() === title.toLowerCase().trim()
      )
    ).filter((photo): photo is Photo => photo !== undefined);
  }, [photos]);

  return (
    <section
      id="photography"
      className="py-6 bg-muted/20"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-8 mb-8">
            <h2 className="text-6xl md:text-8xl font-serif font-light tracking-tighter">
              Photography
            </h2>
            <div className="h-px flex-1 bg-foreground" />
          </div>
          <p className="text-lg text-muted-foreground max-w-xl font-light tracking-wide">
            MOMENTS FROZEN IN TIME, STORIES TOLD THROUGH LIGHT
          </p>
        </motion.div>

        {/* Show 4 featured photos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredPhotos.length > 0 ? (
            featuredPhotos.map((photo, index) => (
              <PhotoCard key={photo._id} photo={photo} index={index} />
            ))
          ) : (
            // Fallback: show first 4 photos if featured ones aren't found
            photos.slice(0, 4).map((photo, index) => (
              <PhotoCard key={photo._id} photo={photo} index={index} />
            ))
          )}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 flex justify-end"
        >
          <Link to="/gallery">
            <motion.button
              whileHover={{ x: 10 }}
              className="flex items-center gap-4 text-sm uppercase tracking-[0.3em] font-light"
            >
              View Full Gallery
              <motion.div
                className="h-px w-16 bg-foreground"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
