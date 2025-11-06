import { motion } from "motion/react";
import { Mail, Instagram, Github } from "lucide-react";

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
];

export default function ContactSection() {
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
              Contact
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
          >
            <p className="text-2xl md:text-3xl font-serif font-light leading-relaxed mb-8 max-w-2xl">
              I'd love to hear from you. Whether you want to collaborate, share
              feedback, or just say hello.
            </p>

            <motion.a
              href="mailto:hello@example.com"
              whileHover={{ x: 10 }}
              className="inline-flex items-center gap-4 text-lg uppercase tracking-[0.3em] border-b-2 border-foreground pb-2"
            >
              Get in Touch
              <motion.div
                className="h-px w-16 bg-foreground"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          </motion.div>

          {/* Social links */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="border border-foreground/20 p-8 space-y-4 group-hover:border-foreground transition-colors duration-300">
                  <link.icon className="w-6 h-6" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {link.name}
                    </div>
                    <div className="text-sm font-light">{link.label}</div>
                  </div>
                </div>
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
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Shots meeting stanzas 
                </span>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </section>
  );
}
