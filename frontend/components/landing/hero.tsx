"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="container relative mx-auto flex min-h-[85vh] items-center px-4 py-12 md:py-20">
      {/* Animated background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 size-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div
          className="absolute right-1/4 bottom-1/4 size-96 animate-pulse rounded-full bg-primary/10 blur-3xl"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative grid w-full items-center gap-8 lg:grid-cols-2">
        {/* Left Column - Text Content */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="glass dark:glass-dark inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1.5 font-medium text-xs"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="size-3 animate-pulse text-primary" />
            <span>AI-Powered Cloud Optimization</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-4xl leading-tight md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
          >
            Accelerate{" "}
            <span className="neon-text text-gradient-bloom">
              Cloud Efficiency
            </span>{" "}
            with Intelligent Insights
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
          >
            Production-grade platform using LLMs to deliver expert guidance on
            cloud cost, performance, and reliability—automatically.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-center gap-3 pt-2 sm:flex-row lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              asChild
              className="gradient-primary hover-lift glow-green-lg px-6 text-white"
              size="lg"
            >
              <Link href="/chat">
                Try the Demo
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="glass dark:glass-dark hover-lift px-6"
              size="lg"
              variant="outline"
            >
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { value: "30%", label: "Cost Savings" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "AI Monitor" },
            ].map((stat, index) => (
              <div className="text-center lg:text-left" key={index}>
                <div className="neon-text font-bold text-gradient-bloom text-xl md:text-2xl">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column - Hero Visual */}
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative hidden lg:block"
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="glass-card dark:glass-card-dark relative overflow-hidden rounded-2xl border-glow p-4">
            {/* Video/Image */}
            <video
              autoPlay
              className="h-auto w-full rounded-xl shadow-2xl"
              loop
              muted
              playsInline
              poster="/images/demo-thumbnail.png"
            >
              <source src="/images/devops-video.mp4" type="video/mp4" />
            </video>

            {/* Floating Stat Card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              className="-bottom-3 -translate-x-1/2 glass-card dark:glass-card-dark absolute left-1/2 rounded-xl border border-primary/20 p-3 shadow-xl"
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="gradient-primary flex size-10 items-center justify-center rounded-lg text-white">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm">Cost Optimized</div>
                  <div className="text-primary text-xs">
                    $12.4k saved this month
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
