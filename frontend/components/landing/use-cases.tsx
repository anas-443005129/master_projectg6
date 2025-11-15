"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const useCases = [
  {
    title: "Kubernetes Orchestration",
    description: "Automated container deployment, scaling, and management",
    benefits: [
      "Auto-scaling based on traffic",
      "Rolling updates & rollbacks",
      "Health monitoring & recovery",
      "Multi-cluster management"
    ],
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "Infrastructure as Code",
    description: "Generate and manage Terraform, CloudFormation, and Pulumi",
    benefits: [
      "AI-generated IaC templates",
      "Cost optimization suggestions",
      "Compliance & security scanning",
      "Multi-cloud provisioning"
    ],
    gradient: "from-purple-500 to-pink-500"
  },
  {
    title: "CI/CD Pipeline Automation",
    description: "Build, test, and deploy with intelligent workflows",
    benefits: [
      "Parallel test execution",
      "Smart caching & artifacts",
      "Environment parity checks",
      "Automated notifications"
    ],
    gradient: "from-green-500 to-emerald-500"
  },
  {
    title: "Monitoring & Observability",
    description: "Full-stack monitoring with AI-powered insights",
    benefits: [
      "Real-time metrics & traces",
      "Anomaly detection",
      "Root cause analysis",
      "Custom dashboards"
    ],
    gradient: "from-orange-500 to-red-500"
  },
  {
    title: "Security & Compliance",
    description: "Automated security scanning and compliance reporting",
    benefits: [
      "Vulnerability scanning",
      "Secret detection",
      "SBOM generation",
      "Compliance reports (SOC2, HIPAA)"
    ],
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    title: "Cost Optimization",
    description: "AI-driven cost analysis and resource optimization",
    benefits: [
      "Cloud cost breakdown",
      "Unused resource detection",
      "Right-sizing recommendations",
      "Budget alerts"
    ],
    gradient: "from-yellow-500 to-orange-500"
  }
];

export function UseCases() {
  return (
    <section id="use-cases" className="container mx-auto px-4 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold">
          Built for{" "}
          <span className="text-gradient">Every DevOps Challenge</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          From startups to enterprises, our AI agent adapts to your unique workflow.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {useCases.map((useCase, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
          >
            <Card className="h-full glass-card dark:glass-card-dark hover-lift relative overflow-hidden group">
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <CardHeader>
                <div className={`size-12 rounded-lg bg-gradient-to-br ${useCase.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <Check size={24} />
                </div>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
                <CardDescription className="text-base">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {useCase.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="size-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mt-12"
      >
        <Button size="lg" className="gradient-primary text-white hover-lift glow-green" asChild>
          <a href="#cta">
            Explore All Features
            <ArrowRight className="ml-2 size-5" />
          </a>
        </Button>
      </motion.div>
    </section>
  );
}
