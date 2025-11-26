"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="fixed right-8 bottom-8 z-50"
          exit={{ opacity: 0, scale: 0.5 }}
          initial={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            className="gradient-primary hover-lift glow-green size-12 rounded-full text-white shadow-lg"
            onClick={scrollToTop}
            size="icon"
          >
            <ArrowUp size={20} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
