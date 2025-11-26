"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, Check, Rocket, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "@emran-alhaddad/saudi-riyal-font/index.css";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "499",
    currency: "﷼",
    period: "month/",
    description:
      "Perfect for small teams getting started with AI-powered DevOps",
    idealFor: "Small teams",
    features: [
      "Core AI advice & recommendations",
      "1 cloud integration (Azure, AWS, or GCP)",
      "Up to 5 team members",
      "Basic Terraform support",
      "Email support",
      "Community access",
      "Monthly cost reports",
      "Basic security scanning",
    ],
    cta: "Start Free Trial",
    popular: false,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    name: "Professional",
    icon: Rocket,
    price: "1,199",
    currency: "﷼",
    period: "month/",
    description: "Full CI/CD automation for growing DevOps teams",
    idealFor: "Growing DevOps teams",
    features: [
      "Everything in Starter, plus:",
      "Full CI/CD automation",
      "3 cloud integrations",
      "Up to 20 team members",
      "Advanced IaC management",
      "Custom metrics & dashboards",
      "Priority support (24/7)",
      "Advanced security & compliance",
      "API access",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    popular: true,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    currency: "",
    period: "",
    description:
      "Private LLM deployment with advanced security for large organizations",
    idealFor: "Large organizations",
    features: [
      "Everything in Professional, plus:",
      "Private LLM deployment",
      "Unlimited cloud integrations",
      "Unlimited team members",
      "Advanced security & compliance",
      "Dedicated DevOps Architect",
      "Custom SLA agreements",
      "On-premise deployment option",
      "White-label options",
      "Training & workshops",
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-green-500 to-emerald-500",
  },
];

export function Pricing() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32" id="pricing">
      <motion.div
        className="mb-16 space-y-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-bold text-4xl md:text-5xl">
          Plans & <span className="neon-text text-gradient-bloom">Pricing</span>
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground text-xl">
          All plans include 24/7 support and a 30-day money-back guarantee
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan, index) => (
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            key={index}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {plan.popular && (
              <div className="-top-4 -translate-x-1/2 absolute left-1/2 z-10">
                <div className="gradient-primary rounded-full px-4 py-1 font-bold text-sm text-white shadow-lg">
                  Most Popular
                </div>
              </div>
            )}

            <Card
              className={`glass-card dark:glass-card-dark hover-lift relative h-full overflow-hidden ${plan.popular ? "border-2 border-primary" : ""}`}
            >
              {/* Animated gradient background */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${plan.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
              />

              <CardHeader className="space-y-4">
                {/* Icon */}
                <div
                  className={`size-14 rounded-xl bg-linear-to-br ${plan.gradient} flex items-center justify-center text-white shadow-lg`}
                >
                  <plan.icon size={28} />
                </div>

                {/* Plan Name & Price */}
                <div>
                  <CardTitle className="mb-2 text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-2">
                    {plan.period && (
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                    {plan.currency && (
                      <span className="icon-saudi_riyal_new text-primary] text-3xl" />
                    )}
                    <span className="neon-text font-bold text-4xl text-gradient-bloom">
                      {plan.price}
                    </span>
                  </div>
                </div>

                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>

                <div className="pt-2 pb-4">
                  <div className="mb-1 text-muted-foreground text-xs">
                    Ideal for:
                  </div>
                  <div className="font-semibold text-sm">{plan.idealFor}</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li className="flex items-start gap-3" key={idx}>
                      <Check
                        className={`mt-0.5 size-5 shrink-0 ${feature.includes("Everything") ? "glow-cyan text-primary" : "text-primary"}`}
                      />
                      <span
                        className={`text-sm ${feature.includes("Everything") ? "font-semibold text-primary" : ""}`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  asChild
                  className={`w-full ${plan.popular ? "gradient-primary hover-lift glow-green-lg text-white" : "glass dark:glass-dark hover-lift"}`}
                  size="lg"
                >
                  <Link
                    href={plan.cta === "Contact Sales" ? "#contact" : "/chat"}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <div className="glass-card dark:glass-card-dark mx-auto max-w-4xl rounded-2xl p-8">
          <h3 className="mb-4 font-bold text-2xl">Need a Custom Solution?</h3>
          <p className="mb-6 text-muted-foreground">
            We offer flexible enterprise plans with custom pricing, private
            deployments, and dedicated support. Contact our sales team to
            discuss your specific requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="glass dark:glass-dark hover-lift"
              size="lg"
              variant="outline"
            >
              <Link href="#contact">Schedule a Call</Link>
            </Button>
            <Button
              asChild
              className="glass dark:glass-dark hover-lift"
              size="lg"
              variant="outline"
            >
              <Link href="#demo">Request Custom Quote</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
