"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="container mx-auto px-4 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl glass-card dark:glass-card-dark p-12 md:p-16 lg:p-20 text-center"
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 size-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 size-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass dark:glass-dark border border-primary/30 text-sm font-medium"
          >
            <Sparkles className="size-4 text-primary animate-pulse" />
            <span>Start Your Free Trial Today</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold"
          >
            Your{" "}
            <span className="text-gradient-bloom neon-text">Next Step</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Transform how your team builds, ships, and optimizes cloud applications. 
            Invest in automation that thinks for you.
          </motion.p>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6 justify-center"
          >
            {[
              "30-day money-back guarantee",
              "Free onboarding with DevOps Architects",
              "Pre-built Terraform modules included"
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <CheckCircle className="size-5 text-primary glow-cyan" />
                <span>{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="gradient-primary text-white hover-lift glow-green-lg text-lg px-8 py-6" asChild>
              <Link href="/chat">
                Get Started Today
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="glass dark:glass-dark hover-lift text-lg px-8 py-6" asChild>
              <Link href="#demo">
                Book a Demo
              </Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="pt-8 border-t border-primary/20"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Built by cloud specialists with large-scale deployments across
            </p>
            <div className="flex flex-wrap gap-8 justify-center items-center">
              {[
                { name: "Azure", icon: "☁️" },
                { name: "AWS", icon: "🔧" },
                { name: "GCP", icon: "🌐" }
              ].map((tech) => (
                <div key={tech.name} className="flex items-center gap-2">
                  <span className="text-2xl">{tech.icon}</span>
                  <span className="font-bold text-lg text-primary">{tech.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
