import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "Pricing", href: "#pricing" },
      { label: "Documentation", href: "/docs" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Press Kit", href: "/press" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "API Reference", href: "/api" },
      { label: "CLI Documentation", href: "/cli" },
      { label: "Integrations", href: "/integrations" },
      { label: "Status", href: "/status" },
      { label: "Support", href: "/support" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Compliance", href: "/compliance" },
      { label: "Cookie Policy", href: "/cookies" }
    ]
  }
];

export function LandingFooter() {
  return (
    <footer className="border-t border-primary/20 bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="flex size-10 items-center justify-center rounded-lg gradient-primary text-white">
                <Sparkles size={20} />
              </div>
              <span className="text-gradient">DevOps AI</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              AI-powered DevOps automation that helps teams ship faster with confidence.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 rounded-lg glass dark:glass-dark flex items-center justify-center hover-lift"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 rounded-lg glass dark:glass-dark flex items-center justify-center hover-lift"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 rounded-lg glass dark:glass-dark flex items-center justify-center hover-lift"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:hello@devopsai.com"
                className="size-10 rounded-lg glass dark:glass-dark flex items-center justify-center hover-lift"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-sm mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2025 DevOps AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/security" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
