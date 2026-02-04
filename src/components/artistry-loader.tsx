import { motion } from "motion/react";

export function ArtistryLoader({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-12 h-12",
    large: "w-16 h-16",
  };

  const dotSizeClasses = {
    small: "w-1.5 h-1.5",
    default: "w-3 h-3",
    large: "w-4 h-4",
  };

  const textSizeClasses = {
    small: "text-[10px]",
    default: "text-xs",
    large: "text-sm",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-3">
        <div className={`${sizeClasses[size]} border border-foreground flex items-center justify-center`}>
          <motion.div
            className={`${dotSizeClasses[size]} bg-foreground`}
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
        {/* <motion.span
          className={`${textSizeClasses[size]} font-light tracking-[0.3em] uppercase`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Artistry
        </motion.span> */}
      </div>
    </div>
  );
}
