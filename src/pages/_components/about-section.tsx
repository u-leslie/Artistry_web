import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="about" className="min-h-screen py-32 md:py-40">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-8 mb-8">
            <h2 className="text-6xl md:text-8xl font-serif font-light tracking-tighter">
              About
            </h2>
            <div className="h-px flex-1 bg-foreground" />
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="grid md:grid-cols-2 gap-16 max-w-6xl">
          {/* Left: Large quote/intro */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="text-6xl font-serif text-muted-foreground">"</div>
              <p className="text-3xl md:text-4xl font-serif font-light leading-tight">
                Poetry and photography are two sides of the same coin
              </p>
            </div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative aspect-square overflow-hidden bg-muted"
            >
              <img
                src="https://res.cloudinary.com/dq1u0hfev/image/upload/v1762440297/B08B9B5B-4C43-4C69-9705-94E2F5DD0D3F_mvfyur.jpg"
                alt="Artist"
                className="w-full h-full object-cover grayscale"
              />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-foreground" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-foreground" />
            </motion.div>
          </motion.div>

          {/* Right: Text content */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8 flex flex-col justify-center"
          >
            <div className="space-y-6 text-lg leading-relaxed text-foreground/80">
              <p>
                I’m Leslie, a software developer by profession, but beyond the
                code, I see the world through a different lens. Poetry and
                photography are my ways of capturing moments that often go
                unnoticed, finding beauty in the quiet and meaning in the
                ordinary.
              </p>

              <p>
                I use words to capture the world around me. Each verse becomes a
                small poem, painting images of moments, feelings, and
                reflections I notice every day.
              </p>

              <p>
                Through this space, I share fragments of my other side,moments
                of calm, reflections on nature, and the gentle play between
                light and shadow, words and silence. It’s my way of connecting
                with the world beyond lines of code.
              </p>
            </div>

            {/* Stats/Info */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-foreground/10">
              <div>
                <div className="text-3xl font-mono mb-2">10+</div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">
                  Poems Written
                </div>
              </div>
              <div>
                <div className="text-3xl font-mono mb-2">200+</div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">
                  Photos Captured
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4 text-sm">
              <div className="h-px w-12 bg-foreground" />
              <span className="uppercase tracking-[0.2em] text-muted-foreground">
                Based in the Nature
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
