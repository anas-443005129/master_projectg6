"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Rocket,
  GitBranch,
  Shield,
  Zap,
  Cloud,
  BarChart3,
  Terminal,
  Lock,
  Gauge
} from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "AI-Driven Recommendations",
    description: "Smart insights backed by DevOps best practices. Get precise, actionable guidance automatically."
  },
  {
    icon: GitBranch,
    title: "Full IaC Integration",
    description: "Works seamlessly with Terraform and AKS. Automate changes through GitHub Actions."
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "Encryption, access control, and private container execution. Data never leaves your infrastructure."
  },
  {
    icon: Zap,
    title: "Continuous Optimization",
    description: "Learns from your workloads over time. Delivers improvements based on real patterns."
  },
  {
    icon: Cloud,
    title: "Multi-Cloud Platform",
    description: "Azure (AKS), AWS (EKS), and GCP (GKE) support. Deploy anywhere with confidence."
  },
  {
    icon: BarChart3,
    title: "Unified Monitoring",
    description: "Visualized through Grafana dashboards. Monitor outcomes in real-time with Prometheus."
  },
  {
    icon: Terminal,
    title: "LLM-Powered Analysis",
    description: "Fine-tuned models analyze IaC, metrics, and pipelines to find optimization opportunities."
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "SOC 2 compliant with private LLM deployment options for sensitive workloads."
  },
  {
    icon: Gauge,
    title: "Cost Intelligence",
    description: "Cut cloud waste by up to 30%. Predict spending and optimize resource allocation."
  }
];

export function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold">
          Key{" "}
          <span className="text-gradient-bloom neon-text">Capabilities</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Built for Engineers, Trusted by Teams. Merges the intelligence of AI with the discipline of DevOps.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="h-full glass-card dark:glass-card-dark hover-lift animated-border">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg gradient-primary flex items-center justify-center text-white shadow-lg">
                    <feature.icon size={24} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
