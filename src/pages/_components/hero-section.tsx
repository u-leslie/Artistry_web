import { motion } from "motion/react";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#d4b990"
                strokeWidth="1"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border-2"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
              borderColor: "#d4b990",
              opacity: 0.25 + i * 0.05,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 z-20">
        <div className="max-w-6xl mx-auto">
          {/* Large typography hero */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              <h1 className="text-[12vw] md:text-[10vw] font-serif font-bold leading-[0.9] tracking-tighter text-foreground">
                <motion.span
                  className="block"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  SHOTS
                </motion.span>
                <motion.span
                  className="block text-right"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  MEET
                </motion.span>
                <motion.span
                  className="block relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                >
                  STANZAS
                  <motion.div
                    className="absolute bottom-2 left-0 right-0 h-1 bg-foreground"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 1.5 }}
                  />
                </motion.span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="flex justify-end"
            >
              <p className="text-xl md:text-2xl max-w-md text-right font-light tracking-wider text-foreground/80">
                A VISUAL EXPLORATION OF POETRY & PHOTOGRAPHY
              </p>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="absolute bottom-10 left-10"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-4"
            >
              <div className="h-px w-12 bg-foreground" />
              <span className="text-xs uppercase tracking-[0.3em] font-light text-foreground">
                Scroll
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
