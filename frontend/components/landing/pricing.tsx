"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Rocket, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import "@emran-alhaddad/saudi-riyal-font/index.css";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "499",
    currency: "﷼",
    period: "month/",
    description: "Perfect for small teams getting started with AI-powered DevOps",
    idealFor: "Small teams",
    features: [
      "Core AI advice & recommendations",
      "1 cloud integration (Azure, AWS, or GCP)",
      "Up to 5 team members",
      "Basic Terraform support",
      "Email support",
      "Community access",
      "Monthly cost reports",
      "Basic security scanning"
    ],
    cta: "Start Free Trial",
    popular: false,
    gradient: "from-cyan-500 to-blue-500"
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
      "Custom integrations"
    ],
    cta: "Start Free Trial",
    popular: true,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    currency: "",
    period: "",
    description: "Private LLM deployment with advanced security for large organizations",
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
      "Training & workshops"
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-green-500 to-emerald-500"
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="container mx-auto px-4 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold">
          Plans & <span className="text-gradient-bloom neon-text">Pricing</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          All plans include 24/7 support and a 30-day money-back guarantee
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="px-4 py-1 rounded-full gradient-primary text-white text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              </div>
            )}
            
            <Card className={`h-full glass-card dark:glass-card-dark hover-lift relative overflow-hidden ${plan.popular ? 'border-2 border-primary' : ''}`}>
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-linear-to-br ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardHeader className="space-y-4">
                {/* Icon */}
                <div className={`size-14 rounded-xl bg-linear-to-br ${plan.gradient} flex items-center justify-center text-white shadow-lg`}>
                  <plan.icon size={28} />
                </div>

                {/* Plan Name & Price */}
                <div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-2">
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    {plan.currency && <span className="icon-saudi_riyal_new text-3xl text-primary]" />}
                    <span className="text-4xl font-bold text-gradient-bloom neon-text">{plan.price}</span>
                  </div>
                </div>

                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>

                <div className="pt-2 pb-4">
                  <div className="text-xs text-muted-foreground mb-1">Ideal for:</div>
                  <div className="text-sm font-semibold">{plan.idealFor}</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`size-5 shrink-0 mt-0.5 ${feature.includes('Everything') ? 'text-primary glow-cyan' : 'text-primary'}`} />
                      <span className={`text-sm ${feature.includes('Everything') ? 'font-semibold text-primary' : ''}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  className={`w-full ${plan.popular ? 'gradient-primary text-white hover-lift glow-green-lg' : 'glass dark:glass-dark hover-lift'}`}
                  size="lg"
                  asChild
                >
                  <Link href={plan.cta === "Contact Sales" ? "#contact" : "/chat"}>
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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-16 text-center"
      >
        <div className="glass-card dark:glass-card-dark p-8 rounded-2xl max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-muted-foreground mb-6">
            We offer flexible enterprise plans with custom pricing, private deployments, and dedicated support. 
            Contact our sales team to discuss your specific requirements.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" className="glass dark:glass-dark hover-lift" size="lg" asChild>
              <Link href="#contact">
                Schedule a Call
              </Link>
            </Button>
            <Button variant="outline" className="glass dark:glass-dark hover-lift" size="lg" asChild>
              <Link href="#demo">
                Request Custom Quote
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
