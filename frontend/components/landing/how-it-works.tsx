"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Connect",
    description:
      "Connect your cloud environment via secure APIs. Integrate with Azure, AWS, or GCP in minutes without exposing sensitive data.",
    image: "/images/devops-1.png",
  },
  {
    number: "02",
    title: "Analyze",
    description:
      "Analyze IaC, metrics, and pipelines using fine-tuned LLMs. Our models understand Terraform, CloudFormation, and Kubernetes manifests.",
    image: "/images/devops-2.png",
  },
  {
    number: "03",
    title: "Advise",
    description:
      "Advise on scaling, cost, and performance improvements. Get actionable recommendations backed by DevOps best practices.",
    image: "/images/devops-3.png",
  },
  {
    number: "04",
    title: "Automate & Monitor",
    description:
      "Automate changes through Terraform and GitHub Actions. Monitor outcomes in real-time through Prometheus and Grafana dashboards.",
    image: "/images/devops-4.png",
  },
];

export function HowItWorks() {
  return (
    <section
      className="container mx-auto bg-muted/30 px-4 py-24 md:py-32"
      id="how-it-works"
    >
      <motion.div
        className="mb-16 space-y-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <Badge className="mb-4 px-4 py-1 text-sm" variant="secondary">
          Simple Process
        </Badge>
        <h2 className="font-bold text-4xl md:text-5xl">
          How It <span className="text-gradient">Works</span>
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground text-xl">
          Get started in minutes, not weeks. Our AI guides you every step of the
          way.
        </p>
      </motion.div>

      <div className="space-y-16">
        {steps.map((step, index) => (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            key={index}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Card
              className={`glass-card dark:glass-card-dark overflow-hidden ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className="grid items-center gap-8 lg:grid-cols-2">
                {/* Text Content */}
                <div className="space-y-4 p-8 lg:p-12">
                  <div className="flex items-center gap-4">
                    <div className="gradient-primary pulse-glow flex size-16 items-center justify-center rounded-full font-bold text-2xl text-white shadow-lg">
                      {step.number}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl">
                      {step.title}
                    </CardTitle>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Image */}
                <div className="relative h-64 overflow-hidden lg:h-96">
                  <Image
                    alt={step.title}
                    className="rounded-r-xl object-cover"
                    fill
                    src={step.image}
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
