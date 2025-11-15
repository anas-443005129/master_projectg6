"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Connect",
    description: "Connect your cloud environment via secure APIs. Integrate with Azure, AWS, or GCP in minutes without exposing sensitive data.",
    image: "/images/devops-1.png"
  },
  {
    number: "02",
    title: "Analyze",
    description: "Analyze IaC, metrics, and pipelines using fine-tuned LLMs. Our models understand Terraform, CloudFormation, and Kubernetes manifests.",
    image: "/images/devops-2.png"
  },
  {
    number: "03",
    title: "Advise",
    description: "Advise on scaling, cost, and performance improvements. Get actionable recommendations backed by DevOps best practices.",
    image: "/images/devops-3.png"
  },
  {
    number: "04",
    title: "Automate & Monitor",
    description: "Automate changes through Terraform and GitHub Actions. Monitor outcomes in real-time through Prometheus and Grafana dashboards.",
    image: "/images/devops-4.png"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container mx-auto px-4 py-24 md:py-32 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-16"
      >
        <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
          Simple Process
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold">
          How It{" "}
          <span className="text-gradient">Works</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Get started in minutes, not weeks. Our AI guides you every step of the way.
        </p>
      </motion.div>

      <div className="space-y-16">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <Card className={`glass-card dark:glass-card-dark overflow-hidden ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Text Content */}
                <div className="p-8 lg:p-12 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg pulse-glow">
                      {step.number}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl">{step.title}</CardTitle>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Image */}
                <div className="relative h-64 lg:h-96 overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover rounded-r-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
