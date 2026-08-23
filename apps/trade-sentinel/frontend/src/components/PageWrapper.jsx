import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function PageWrapper({ children }) {

  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}

      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}

      transition={{
        duration: 0.45,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
}