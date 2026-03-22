import type { FormEvent } from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Instagram, Github, Link, Star, Bell, Sparkles } from "lucide-react";
import { toast } from "sonner";

const socialLinks = [
  {
    name: "Email",
    icon: Mail,
    href: "mailto:anneuhiriwe@gmail.com",
    label: "anneuhiriwe@gmail.com",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/_u.leslie_",
    label: "@uleslie",
  },
  {
    name: "Github",
    icon: Github,
    href: "https://github.com/u-leslie",
    label: "@uleslie",
  },
  {
    name: "Works",
    icon: Link,
    href: "https://lslie.space/",
    label: "@uleslie",
  },
];

export default function ContactSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Empty = same origin (use when the Node server serves `dist`; see server/index.ts). Otherwise set VITE_API_BASE to your API URL at build time. */
  const apiBase = (import.meta.env.VITE_API_BASE as string | undefined)?.trim().replace(/\/$/, "") ?? "";

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    const loadingId = toast.loading("Subscribing…");

    try {
      const res = await fetch(`${apiBase}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          name: trimmedName || undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        welcomeSent?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Subscription failed. Please try again.");
      }

      if (data.alreadySubscribed) {
        toast.info("You’re already on this list — thank you for staying close.");
      } else if (data.welcomeSent) {
        toast.success("You’re in — check your inbox for a note from Leslie.");
      } else {
        toast.success("You’re subscribed. Welcome to the list.");
      }
      setEmail("");
      setName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      toast.dismiss(loadingId);
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="min-h-screen py-32 md:py-40">
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
              Connect
            </h2>
            <div className="h-px flex-1 bg-foreground" />
          </div>
          <p className="text-lg text-muted-foreground max-w-xl font-light tracking-wide">
            LET'S CONNECT AND SHARE STORIES
          </p>
        </motion.div>

        {/* Content */}
        <div className="max-w-4xl">
          {/* Large CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          ></motion.div>

          {/* Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-20 relative overflow-hidden rounded-2xl border border-foreground/15 bg-gradient-to-br from-background/80 via-background/40 to-[#d4b990]/[0.07] backdrop-blur-xl"
          >
            {/* <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#d4b990]/25" /> */}

            <div className="relative p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                    <Bell className="w-3.5 h-3.5" aria-hidden />
                    Newsletter
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif font-light tracking-tight">
                    Stay close to what’s new
                  </h3>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    Subscribe and let your heart catch the little wonders as
                    they appear.
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                      Your name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Leslie"
                      autoComplete="name"
                      className="h-[46px] w-full bg-background/20 border border-foreground/15 focus:border-foreground focus:bg-background/25 outline-none rounded-lg px-4 text-lg font-serif placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                      Email
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="you@example.com"
                      autoComplete="email"
                      inputMode="email"
                      className="h-[46px] w-full bg-background/20 border border-foreground/15 focus:border-foreground focus:bg-background/25 outline-none rounded-lg px-4 text-lg font-serif placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.99 }}
                    disabled={isSubmitting}
                    type="submit"
                    className="inline-flex items-center justify-center gap-3 px-8 h-[48px] rounded-full bg-foreground text-background text-[11px] uppercase tracking-[0.22em] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-foreground/90 transition-colors"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/15 border border-background/20">
                      <Bell className="w-3.5 h-3.5" />
                    </span>
                    Notify me
                  </motion.button>
                  <p className="text-xs text-muted-foreground font-light max-w-md leading-relaxed">
                    By subscribing, you agree to receive occasional emails from
                    Artistry by Leslie.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>

          <h3 className="text-3xl md:text-4xl pb-3 font-serif font-light tracking-tight">
            Social Links
          </h3>
          {/* Social icons (minimal) */}
          <div className="mb-20 flex items-center gap-5">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center w-12 h-12 border border-foreground/20 hover:border-foreground transition-colors duration-300"
              >
                <link.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="pt-12 border-t border-foreground/10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Artistry. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <motion.a
                  href="https://github.com/u-leslie/Artistry_web"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Star className="w-4 h-4 group-hover:fill-foreground transition-all" />
                  <span className="uppercase text-xs tracking-wider">
                    Star on GitHub
                  </span>
                </motion.a>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Shots meeting stanzas
                  </span>
                </div>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </section>
  );
}
