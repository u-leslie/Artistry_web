import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef, useState, useMemo } from "react";
import { usePhotos, type Photo } from "@/hooks/use-photos";
import { CustomCursor } from "@/components/custom-cursor.tsx";
import { ArtistryLoader } from "@/components/artistry-loader.tsx";
import { GalleryShuffleMode } from "./_components/gallery-shuffle-mode.tsx";
import { GalleryImmersiveTrigger } from "./_components/gallery-immersive-trigger.tsx";
import Navbar from "./_components/navbar.tsx";

function GalleryPhotoCard({ photo, index }: { photo: Photo; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden bg-muted w-full h-80">
        {photo.url && (
          <motion.img
            src={photo.url}
            alt={photo.title}
            className="w-full h-full object-cover grayscale transition-all duration-700"
            animate={{
              scale: isHovered ? 1.1 : 1,
              filter: isHovered ? "grayscale(0%)" : "grayscale(100%)",
            }}
            transition={{ duration: 0.6 }}
          />
        )}
        
        {/* Overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-foreground/20"
        />
        
        {/* Border on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 border-4 border-foreground pointer-events-none"
        />
        
        {/* Info overlay */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: isHovered ? 0 : 20,
            opacity: isHovered ? 1 : 0 
          }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-foreground/90 to-transparent"
        >
          <div className="flex items-baseline justify-between text-background">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-mono opacity-80">
                {photo.number}
              </span>
              <span className="text-xl font-serif font-light">
                {photo.title}
              </span>
            </div>
            <span className="text-xs font-mono opacity-80">
              {photo.year}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const { data: photos, isLoading, error } = usePhotos();
  const [currentPage, setCurrentPage] = useState(1);
  const [shuffleOpen, setShuffleOpen] = useState(false);
  const itemsPerPage = 8;

  // Calculate pagination
  const photosLength = photos?.length ?? 0;
  
  const totalPages = useMemo(() => {
    if (photosLength === 0) return 0;
    return Math.ceil(photosLength / itemsPerPage);
  }, [photosLength, itemsPerPage]);

  const paginatedPhotos = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return photos.slice(startIndex, endIndex);
  }, [photos, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomCursor />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <ArtistryLoader size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <CustomCursor />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading gallery</p>
            <p className="text-sm text-muted-foreground">
              Please check your Sanity configuration
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <CustomCursor />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No photos found</p>
            <p className="text-sm text-muted-foreground">
              Check back later, Leslie is still working on the gallery -.- .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomCursor />
      <Navbar />

      {photos && photos.length > 0 && (
        <GalleryShuffleMode
          photos={photos}
          open={shuffleOpen}
          onClose={() => setShuffleOpen(false)}
        />
      )}

      <main className="pt-24">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 py-20"
        >
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="pointer-events-none absolute right-0 top-0 z-10 md:-top-1">
              <div className="pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <GalleryImmersiveTrigger
                    onOpen={() => setShuffleOpen(true)}
                  />
                </motion.div>
              </div>
            </div>
            <div className="flex items-baseline justify-center gap-8 mb-8 pr-12 md:pr-14">
              <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tighter">
                Shots
              </h1>
              <div className="h-px flex-1 max-w-md bg-foreground" />
            </div>
            <p className="text-lg text-muted-foreground font-light tracking-wide">
              A TOUR THROUGH MY GALLERY
            </p>
          </div>
        </motion.section>

        {/* Gallery Grid */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedPhotos.map((photo, index) => (
              <GalleryPhotoCard 
                key={photo._id} 
                photo={photo} 
                index={(currentPage - 1) * itemsPerPage + index} 
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-20 flex flex-col items-center gap-8"
            >
              {/* Page Numbers - Elegant Design */}
              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <motion.button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border border-foreground/20 hover:border-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all group"
                >
                  <span className="text-xs uppercase tracking-[0.3em] font-light flex items-center gap-2">
                    <motion.span
                      animate={{ x: currentPage === 1 ? 0 : [-2, 0, -2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ←
                    </motion.span>
                    <span className="hidden sm:inline">Prev</span>
                  </span>
                </motion.button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 mx-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-3 py-3 text-muted-foreground/50 font-mono text-xs">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    const isActive = currentPage === page;

                    return (
                      <motion.button
                        key={page}
                        onClick={() => goToPage(page)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-3 min-w-[3rem] border transition-all font-mono text-sm ${
                          isActive
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground/20 hover:border-foreground/40 text-foreground"
                        }`}
                      >
                        {page}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <motion.button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border border-foreground/20 hover:border-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all group"
                >
                  <span className="text-xs uppercase tracking-[0.3em] font-light flex items-center gap-2">
                    <span className="hidden sm:inline">Next</span>
                    <motion.span
                      animate={{ x: currentPage === totalPages ? 0 : [2, 0, 2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              </div>

              {/* Page Info - Minimalist */}
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                <div className="h-px w-12 bg-foreground/20" />
                <span>
                  {currentPage} / {totalPages}
                </span>
                <div className="h-px w-12 bg-foreground/20" />
              </div>
            </motion.div>
          )}
        </section>

      </main>
    </div>
  );
}
