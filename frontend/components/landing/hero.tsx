"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Code } from "lucide-react";

export function Hero() {
  return (
    <section className="relative container mx-auto px-4 py-12 md:py-20 min-h-[85vh] flex items-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 size-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 size-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative grid lg:grid-cols-2 gap-8 items-center w-full">
        {/* Left Column - Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass dark:glass-dark border border-primary/30 text-xs font-medium"
          >
            <Sparkles className="size-3 text-primary animate-pulse" />
            <span>AI-Powered Cloud Optimization</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
          >
            Accelerate <span className="text-gradient-bloom neon-text">Cloud Efficiency</span> with Intelligent Insights
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0"
          >
            Production-grade platform using LLMs to deliver expert guidance on cloud cost, performance, and reliability—automatically.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2"
          >
            <Button size="lg" className="gradient-primary text-white hover-lift glow-green-lg px-6" asChild>
              <Link href="/chat">
                Try the Demo
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="glass dark:glass-dark hover-lift px-6" asChild>
              <Link href="#how-it-works">
                See How It Works
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-4 pt-4"
          >
            {[
              { value: "30%", label: "Cost Savings" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "AI Monitor" }
            ].map((stat, index) => (
              <div key={index} className="text-center lg:text-left">
                <div className="text-xl md:text-2xl font-bold text-gradient-bloom neon-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column - Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative lg:block hidden"
        >
          <div className="relative glass-card dark:glass-card-dark p-4 rounded-2xl overflow-hidden border-glow">
            {/* Video/Image */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto rounded-xl shadow-2xl"
              poster="/images/demo-thumbnail.png"
            >
              <source src="/images/devops-video.mp4" type="video/mp4" />
            </video>

            {/* Floating Stat Card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 glass-card dark:glass-card-dark p-3 rounded-xl shadow-xl border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg gradient-primary flex items-center justify-center text-white">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm">Cost Optimized</div>
                  <div className="text-xs text-primary">$12.4k saved this month</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
