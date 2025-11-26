import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "Pricing", href: "#pricing" },
      { label: "Documentation", href: "/docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Press Kit", href: "/press" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "API Reference", href: "/api" },
      { label: "CLI Documentation", href: "/cli" },
      { label: "Integrations", href: "/integrations" },
      { label: "Status", href: "/status" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Compliance", href: "/compliance" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-primary/20 border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link
              className="mb-4 flex items-center gap-2 font-bold text-xl"
              href="/"
            >
              <div className="flex w-14 items-center justify-center overflow-hidden">
                <img
                  alt="InfraTech logo"
                  className="h-full w-full object-cover"
                  src="/images/logo.svg"
                />
              </div>
              <span className="text-gradient">InfraTech</span>
            </Link>
            <p className="mb-6 max-w-xs text-muted-foreground text-sm">
              AI-powered DevOps automation that helps teams ship faster with
              confidence.
            </p>
            <div className="flex gap-3">
              <a
                className="glass dark:glass-dark hover-lift flex size-10 items-center justify-center rounded-lg"
                href="https://github.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Github size={20} />
              </a>
              <a
                className="glass dark:glass-dark hover-lift flex size-10 items-center justify-center rounded-lg"
                href="https://twitter.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Twitter size={20} />
              </a>
              <a
                className="glass dark:glass-dark hover-lift flex size-10 items-center justify-center rounded-lg"
                href="https://linkedin.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Linkedin size={20} />
              </a>
              <a
                className="glass dark:glass-dark hover-lift flex size-10 items-center justify-center rounded-lg"
                href="mailto:hello@devopsai.com"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="mb-4 font-bold text-sm">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      className="text-muted-foreground text-sm transition-colors hover:text-primary"
                      href={link.href}
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
        <div className="flex flex-col items-center justify-between gap-4 border-primary/20 border-t pt-8 md:flex-row">
          <p className="text-center text-muted-foreground text-sm md:text-left">
            © 2025 InfraTech. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              className="text-muted-foreground text-sm transition-colors hover:text-primary"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="text-muted-foreground text-sm transition-colors hover:text-primary"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="text-muted-foreground text-sm transition-colors hover:text-primary"
              href="/security"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
