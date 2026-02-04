import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { usePoems, type Poem } from "@/hooks/use-poems";
import { ArtistryLoader } from "@/components/artistry-loader.tsx";

function PoemCard({ poem, index }: { poem: Poem; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className="border-t border-foreground/10 py-16 group"
    >
      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left: Number and Title */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: index * 0.2 + 0.2 }}
          className="md:col-span-5"
        >
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-6xl font-mono text-muted-foreground">
              {poem.number}
            </span>
            <div className="h-px flex-1 bg-foreground/20 group-hover:bg-foreground transition-colors duration-500" />
          </div>
          <h3 className="text-4xl md:text-5xl font-serif font-light tracking-tight">
            {poem.title}
          </h3>
        </motion.div>

        {/* Right: Content */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
          className="md:col-span-7"
        >
          <p className="text-lg md:text-xl font-serif leading-relaxed whitespace-pre-line text-foreground/80">
            {poem.content}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function PoetrySection() {
  const { data: poems, isLoading, error } = usePoems();

  if (isLoading) {
    return (
      <section id="poetry" className="min-h-screen py-32 md:py-40">
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
      <section id="poetry" className="min-h-screen py-32 md:py-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading poems</p>
              <p className="text-sm text-muted-foreground">
                Leslie is writing poems or probably coding -.- .
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!poems || poems.length === 0) {
    return (
      <section id="poetry" className="min-h-screen py-32 md:py-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No poems found</p>
              <p className="text-sm text-muted-foreground">
                Leslie is writing poems or probably coding -.- .
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="poetry" className="min-h-screen py-32 md:py-40">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-8 mb-8">
            <h2 className="text-6xl md:text-8xl font-serif font-light tracking-tighter">
              Poetry
            </h2>
            <div className="h-px flex-1 bg-foreground" />
          </div>
          <p className="text-lg text-muted-foreground max-w-xl font-light tracking-wide">
            LINES FILLED WITH EMOTION.
          </p>
        </motion.div>

        {/* Poems list */}
        <div className="max-w-6xl">
          {poems.map((poem, index) => (
            <PoemCard key={poem._id} poem={poem} index={index} />
          ))}
        </div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="h-px bg-foreground/10 mt-16"
        />
      </div>
    </section>
  );
}
