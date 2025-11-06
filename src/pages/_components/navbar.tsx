import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "../../components/theme-toogle";

const navItems = [
  { name: "01", label: "Home", href: "#home" },
  { name: "02", label: "Poetry", href: "#poetry" },
  { name: "03", label: "Photography", href: "#photography" },
  { name: "04", label: "About", href: "#about" },
  { name: "05", label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border" : ""
        }`}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo - Minimalist */}
            <motion.button
              onClick={() => scrollToSection("#home")}
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 border border-foreground flex items-center justify-center">
                <motion.div
                  className="w-2 h-2 bg-foreground"
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
              <span className="text-xs font-light tracking-[0.3em] uppercase">
                Artistry
              </span>
            </motion.button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-12">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="group flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {item.name}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] font-light group-hover:translate-x-1 transition-transform">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 6 : 0 }}
                  className="w-6 h-px bg-foreground"
                />
                <motion.div
                  animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                  className="w-6 h-px bg-foreground"
                />
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -6 : 0 }}
                  className="w-6 h-px bg-foreground"
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-40 w-full bg-background md:hidden"
          >
            <div className="flex flex-col items-start justify-center h-full px-8 space-y-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-baseline gap-4 text-left"
                >
                  <span className="text-sm text-muted-foreground font-mono">
                    {item.name}
                  </span>
                  <span className="text-4xl font-serif">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
