"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "DevOps Lead at TechCorp",
    avatar: "https://i.pravatar.cc/150?img=1",
    content: "This AI agent reduced our deployment time from 2 hours to 15 minutes. It's like having a senior DevOps engineer on call 24/7.",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO at StartupXYZ",
    avatar: "https://i.pravatar.cc/150?img=12",
    content: "We cut our cloud costs by 40% in the first month. The AI-powered recommendations are incredibly accurate and actionable.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Site Reliability Engineer",
    avatar: "https://i.pravatar.cc/150?img=5",
    content: "The automated incident response saved us during a critical outage. It detected and resolved the issue before most of our team even woke up.",
    rating: 5
  },
  {
    name: "David Kim",
    role: "Platform Engineer at FinanceApp",
    avatar: "https://i.pravatar.cc/150?img=15",
    content: "Security scanning caught vulnerabilities we didn't even know existed. The compliance reports made our SOC2 audit a breeze.",
    rating: 5
  },
  {
    name: "Aisha Patel",
    role: "Engineering Manager",
    avatar: "https://i.pravatar.cc/150?img=9",
    content: "Our team's productivity increased by 60%. Junior engineers can now deploy complex infrastructure without senior oversight.",
    rating: 5
  },
  {
    name: "James Turner",
    role: "Cloud Architect",
    avatar: "https://i.pravatar.cc/150?img=13",
    content: "Multi-cloud management has never been easier. We seamlessly run workloads across AWS, Azure, and GCP without the headache.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="container mx-auto px-4 py-24 md:py-32 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold">
          Loved by{" "}
          <span className="text-gradient">DevOps Teams Worldwide</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Join thousands of engineers who have transformed their workflow with our AI agent.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
          >
            <Card className="h-full glass-card dark:glass-card-dark hover-lift relative">
              <Quote className="absolute top-4 right-4 size-8 text-primary/20" />
              
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 ring-2 ring-primary/20">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-primary text-lg">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
