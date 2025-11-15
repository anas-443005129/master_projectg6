import { motion } from "framer-motion";

export const Greeting = () => {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-bold text-3xl md:text-5xl mb-2"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-gradient">Cloud Infrastructure</span>
        <br />
        <span className="text-foreground">Made Simple</span>
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-lg text-muted-foreground md:text-xl font-medium"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        Ask me about cost estimation, architecture design, or deployment strategies
      </motion.div>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex gap-2"
      >
        <div className="flex items-center gap-2 rounded-full glass dark:glass-dark border border-primary/30 px-4 py-2 text-sm font-medium">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <span>AI-Powered</span>
        </div>
        <div className="flex items-center gap-2 rounded-full glass dark:glass-dark border border-primary/30 px-4 py-2 text-sm font-medium">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <span>Multi-Cloud Support</span>
        </div>
      </motion.div>
    </div>
  );
};
