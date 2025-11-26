"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const testimonials = [
  {
    name: "Naser Allahyany",
    role: "Full Stack Engineer",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4E03AQGKIkQkmy_8Ow/profile-displayphoto-shrink_100_100/B4EZffRzZhHsAY-/0/1751797676843?e=1765411200&v=beta&t=5PhRPx5lOcmq8yGsI2AsJ-D8gTPaeot4Vs4ejj1iFQ4",
    content:
      "This AI agent reduced our deployment time from 2 hours to 15 minutes. It's like having a senior DevOps engineer on call 24/7.",
    rating: 5,
  },
  {
    name: "Anas Alzahrani",
    role: "AI & Data Expert",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4E03AQHh9sif_wXqSg/profile-displayphoto-scale_400_400/B4EZpFLeM3KcAg-/0/1762097227428?e=1765411200&v=beta&t=hF-LnMW2J1uiNCMzdma3Ci-q9E6XkB3RfPRLhPLbal8",
    content:
      "We cut our cloud costs by 40% in the first month. The AI-powered recommendations are incredibly accurate and actionable.",
    rating: 5,
  },
  {
    name: "Ibrahim Alkheraji",
    role: "DevOps Engineer",
    avatar:
      "https://media.licdn.com/dms/image/v2/D5603AQEijO9lsoDZZQ/profile-displayphoto-shrink_400_400/B56ZPyIOV4H0Ag-/0/1734934065325?e=1765411200&v=beta&t=1HkmDwIBabEAyrkDbSm3jjH0ptBIHNO3zdwSoV3zASE",
    content:
      "The automated incident response saved us during a critical outage. It detected and resolved the issue before most of our team even woke up.",
    rating: 5,
  },
  {
    name: "Abdullah Alotaibi",
    role: "AWS Certified Solutions Architect",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4E03AQEDSMqUII8Imw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1729114532745?e=1765411200&v=beta&t=O3-1GoRu94lfWX5mx6LfhQqPU4Ap-VaxLxqF3K1Gy1Y",
    content:
      "Security scanning caught vulnerabilities we didn't even know existed. The compliance reports made our SOC2 audit a breeze.",
    rating: 5,
  },
  // {
  //   name: "Aisha Patel",
  //   role: "Engineering Manager",
  //   avatar: "https://i.pravatar.cc/150?img=9",
  //   content: "Our team's productivity increased by 60%. Junior engineers can now deploy complex infrastructure without senior oversight.",
  //   rating: 5
  // },
  // {
  //   name: "James Turner",
  //   role: "Cloud Architect",
  //   avatar: "https://i.pravatar.cc/150?img=13",
  //   content: "Multi-cloud management has never been easier. We seamlessly run workloads across AWS, Azure, and GCP without the headache.",
  //   rating: 5
  // }
];

export function Testimonials() {
  return (
    <section
      className="container mx-auto bg-muted/30 px-4 py-24 md:py-32"
      id="testimonials"
    >
      <motion.div
        className="mb-16 space-y-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-bold text-4xl md:text-5xl">
          Loved by <span className="text-gradient">DevOps Teams Worldwide</span>
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground text-xl">
          Join thousands of engineers who have transformed their workflow with
          our AI agent.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            key={index}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card dark:glass-card-dark hover-lift relative h-full">
              <Quote className="absolute top-4 right-4 size-8 text-primary/20" />

              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 ring-2 ring-primary/20">
                    <AvatarImage
                      alt={testimonial.name}
                      src={testimonial.avatar}
                    />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span className="text-lg text-primary" key={i}>
                      ★
                    </span>
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
