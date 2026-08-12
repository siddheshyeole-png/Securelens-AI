import React from "react";
import { motion } from "framer-motion";

export const Card = ({ children, className = "", hover = true, glow = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`rounded-[16px] border border-zinc-800/80 bg-[#18181B]/80 backdrop-blur-xl p-6 text-zinc-100 shadow-xl shadow-black/40 ${
        hover ? "hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(37,99,235,0.12)] transition-all duration-300" : ""
      } ${glow ? "border-blue-500/50 shadow-[0_0_35px_rgba(37,99,235,0.2)]" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
