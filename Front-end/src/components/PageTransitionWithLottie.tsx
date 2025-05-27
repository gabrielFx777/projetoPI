// src/components/PageTransitionWithLottie.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function PageTransitionWithLottie({ children }) {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowAnimation(false);
    }, 1200); // tempo da animação em ms

    return () => clearTimeout(timeout);
  }, []);

  // if (showAnimation) {
  //   return (
  //     <div className="flex justify-center items-center h-[30vh]">
  //       <DotLottieReact
  //         src="https://lottie.host/bea39de7-5cb4-4972-85da-048547848faf/9uHUvSMkbE.lottie"
  //         autoplay
  //       />
  //     </div>
  //   );
  // }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}


// src/components/PageTransitionWithLottie.js
// import React from "react";
// import { motion } from "framer-motion";

// export function PageTransitionWithLottie({ children }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.4 }}
//     >
//       {children}
//     </motion.div>
//   );
// }
