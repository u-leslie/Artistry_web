import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef, useState } from "react";

const photos = [
  {
    url: "https://res.cloudinary.com/dq1u0hfev/image/upload/v1762440308/A9458390-59A0-444C-A314-F57D79D97B5A_rqxl2t.jpg",
    title: "Mountain Solitude",
    number: "01",
    year: "2024",
  },
  {
    url: "https://res.cloudinary.com/dq1u0hfev/image/upload/v1762440291/0DCA05E0-E29C-4D56-A3B1-8FC4ABCB2FE9_jnhptb.jpg",
    title: "Ocean Whispers",
    number: "02",
    year: "2024",
  },
  {
    url: "https://res.cloudinary.com/dq1u0hfev/image/upload/v1762440291/3799A371-3C4F-4FDB-8BF7-700E53D4CC02_vbgfmf.jpg",
    title: "Forest Path",
    number: "03",
    year: "2024",
  },
  {
    url: "https://res.cloudinary.com/dq1u0hfev/image/upload/v1762440292/7E39F7A9-307C-4752-9EC6-F86D4BA1BA98_fxgr9w.jpg",
    title: "Golden Hour",
    number: "04",
    year: "2024",
  },
];

function PhotoCard({ photo, index }: { photo: typeof photos[0]; index: number }) {
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

        {/* Masonry grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {photos.map((photo, index) => (
            <PhotoCard key={index} photo={photo} index={index} />
          ))}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 flex justify-end"
        >
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
        </motion.div>
      </div>
    </section>
  );
}
