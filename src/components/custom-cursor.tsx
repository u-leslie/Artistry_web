import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useTheme } from "next-themes";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const { resolvedTheme } = useTheme(); 
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", moveCursor);

    const interactiveElements = document.querySelectorAll(
      "a, button, input, textarea, select, [role='button'], [data-cursor='hover']",
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [cursorX, cursorY]);

  const isDark = resolvedTheme === "dark";

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999]"
        style={{
          backgroundColor: isDark ? "#fff" : "#000",
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Cursor ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9998] border-2"
        style={{
          borderColor: isDark ? "#fff" : "#000",
          opacity: isDark ? 0.5 : 0.8,
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? (isDark ? 0.8 : 1) : isDark ? 0.5 : 0.8,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 28,
        }}
      />
    </>
  );
}
