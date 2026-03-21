import { motion, useReducedMotion } from "motion/react";
import { Maximize2 } from "lucide-react";

type Props = {
  onOpen: () => void;
};

/** Compact fullscreen-style control: pulsing ring + breathing icon. */
export function GalleryImmersiveTrigger({ onOpen }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={reduceMotion ? undefined : { scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-11 md:w-11"
      aria-label="Open immersive shuffle"
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full border border-foreground/25 bg-background/90 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_28px_rgba(0,0,0,0.1)] backdrop-blur-[2px]"
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: [
                  "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 28px rgba(0,0,0,0.1)",
                  "0 1px 0 rgba(255,255,255,0.08) inset, 0 12px 36px rgba(168,152,122,0.16)",
                  "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 28px rgba(0,0,0,0.1)",
                ],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-[-2px] rounded-full border border-[#a8987a]/35"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.12, 1], opacity: [0.5, 0.1, 0.5] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 2.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }
        }
      />
      <motion.span
        className="relative flex items-center justify-center text-foreground"
        animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <Maximize2 className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={1.35} />
      </motion.span>
    </motion.button>
  );
}
