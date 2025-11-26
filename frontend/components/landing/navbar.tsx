"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-cases", label: "Use Cases" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
];

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="glass dark:glass-dark sticky top-0 z-50 w-full border-primary/20 border-b">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link className="flex items-center gap-2 font-bold text-xl" href="/">
          <div className="flex w-14 items-center justify-center overflow-hidden">
            <Image
              alt="DevOps AI logo"
              className="h-full w-full object-cover"
              height={56}
              src="/images/logo.svg"
              width={56}
            />
          </div>
          <span className="text-gradient">InfraTech</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              className="font-medium text-sm transition-colors hover:text-primary"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="gradient-primary glow-green text-white">
            <Link href="/chat">Launch App</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet onOpenChange={setIsOpen} open={isOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button size="icon" variant="ghost">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="glass-dark border-primary/20" side="right">
            <div className="mt-8 flex flex-col gap-6">
              {navItems.map((item) => (
                <a
                  className="font-medium text-lg transition-colors hover:text-primary"
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 border-primary/20 border-t pt-6">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="gradient-primary w-full text-white">
                  <Link href="/chat">Launch App</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
