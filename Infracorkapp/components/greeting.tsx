import { motion } from "framer-motion";

export const Greeting = () => {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-4xl flex-col justify-center"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 font-bold text-3xl md:text-5xl"
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
        className="font-medium text-lg text-muted-foreground md:text-xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        Ask me about cost estimation, architecture design, or deployment
        strategies
      </motion.div>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="mt-6 flex gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.8 }}
      >
        <div className="glass dark:glass-dark flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 font-medium text-sm">
          <div className="size-2 animate-pulse rounded-full bg-primary" />
          <span>AI-Powered</span>
        </div>
        <div className="glass dark:glass-dark flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 font-medium text-sm">
          <div className="size-2 animate-pulse rounded-full bg-primary" />
          <span>Multi-Cloud Support</span>
        </div>
      </motion.div>
    </div>
  );
};
