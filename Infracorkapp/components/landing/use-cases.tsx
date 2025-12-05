"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const useCases = [
  {
    title: "Kubernetes Orchestration",
    description: "Automated container deployment, scaling, and management",
    benefits: [
      "Auto-scaling based on traffic",
      "Rolling updates & rollbacks",
      "Health monitoring & recovery",
      "Multi-cluster management",
    ],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Infrastructure as Code",
    description: "Generate and manage Terraform, CloudFormation, and Pulumi",
    benefits: [
      "AI-generated IaC templates",
      "Cost optimization suggestions",
      "Compliance & security scanning",
      "Multi-cloud provisioning",
    ],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "CI/CD Pipeline Automation",
    description: "Build, test, and deploy with intelligent workflows",
    benefits: [
      "Parallel test execution",
      "Smart caching & artifacts",
      "Environment parity checks",
      "Automated notifications",
    ],
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Monitoring & Observability",
    description: "Full-stack monitoring with AI-powered insights",
    benefits: [
      "Real-time metrics & traces",
      "Anomaly detection",
      "Root cause analysis",
      "Custom dashboards",
    ],
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Security & Compliance",
    description: "Automated security scanning and compliance reporting",
    benefits: [
      "Vulnerability scanning",
      "Secret detection",
      "SBOM generation",
      "Compliance reports (SOC2, HIPAA)",
    ],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Cost Optimization",
    description: "AI-driven cost analysis and resource optimization",
    benefits: [
      "Cloud cost breakdown",
      "Unused resource detection",
      "Right-sizing recommendations",
      "Budget alerts",
    ],
    gradient: "from-yellow-500 to-orange-500",
  },
];

export function UseCases() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32" id="use-cases">
      <motion.div
        className="mb-16 space-y-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-bold text-4xl md:text-5xl">
          Built for{" "}
          <span className="text-gradient">Every DevOps Challenge</span>
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground text-xl">
          From startups to enterprises, our AI agent adapts to your unique
          workflow.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {useCases.map((useCase, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            key={useCase.title}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card dark:glass-card-dark hover-lift group relative h-full overflow-hidden">
              {/* Animated gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
              />

              <CardHeader>
                <div
                  className={`size-12 rounded-lg bg-gradient-to-br ${useCase.gradient} mb-4 flex items-center justify-center text-white shadow-lg`}
                >
                  <Check size={24} />
                </div>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
                <CardDescription className="text-base">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {useCase.benefits.map((benefit) => (
                  <div
                    className="flex items-start gap-2"
                    key={`${useCase.title}-${benefit}`}
                  >
                    <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <Button
          asChild
          className="gradient-primary hover-lift glow-green text-white"
          size="lg"
        >
          <a href="#cta">
            Explore All Features
            <ArrowRight className="ml-2 size-5" />
          </a>
        </Button>
      </motion.div>
    </section>
  );
}
