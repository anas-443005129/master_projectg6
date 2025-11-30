"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32" id="cta">
      <motion.div
        className="glass-card dark:glass-card-dark relative overflow-hidden rounded-3xl p-12 text-center md:p-16 lg:p-20"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 size-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
          <div
            className="absolute right-1/4 bottom-0 size-96 animate-pulse rounded-full bg-primary/10 blur-3xl"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl space-y-8">
          {/* Badge */}
          <motion.div
            className="glass dark:glass-dark inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 font-medium text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <Sparkles className="size-4 animate-pulse text-primary" />
            <span>Start Your Free Trial Today</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            className="font-bold text-4xl md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            Your{" "}
            <span className="neon-text text-gradient-bloom">Next Step</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="mx-auto max-w-2xl text-muted-foreground text-xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            Transform how your team builds, ships, and optimizes cloud
            applications. Invest in automation that thinks for you.
          </motion.p>

          {/* Benefits */}
          <motion.div
            className="flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {[
              "30-day money-back guarantee",
              "Free onboarding with DevOps Architects",
              "Pre-built Terraform modules included",
            ].map((benefit) => (
              <div
                className="flex items-center gap-2 font-medium text-sm"
                key={benefit}
              >
                <CheckCircle className="glow-cyan size-5 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Button
              asChild
              className="gradient-primary hover-lift glow-green-lg px-8 py-6 text-lg text-white"
              size="lg"
            >
              <Link href="/chat">
                Get Started Today
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button
              asChild
              className="glass dark:glass-dark hover-lift px-8 py-6 text-lg"
              size="lg"
              variant="outline"
            >
              <Link href="#demo">Book a Demo</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="border-primary/20 border-t pt-8"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.7 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1 }}
          >
            <p className="mb-4 text-muted-foreground text-sm">
              Built by cloud specialists with large-scale deployments across
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { name: "Azure", src: "/images/azure.svg" },
                { name: "AWS", src: "/images/aws.svg" },
                { name: "GCP", src: "/images/gcp.svg" },
              ].map((tech) => (
                <div className="flex items-center gap-3" key={tech.name}>
                  <Image
                    alt={tech.name}
                    className="h-8 w-8"
                    height={32}
                    src={tech.src}
                    width={32}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
