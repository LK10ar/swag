import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Splash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex"
        >
          <div className="flex w-1/2 flex-col">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-full flex-1"
                style={{ background: ['#39FF14', '#FF6B00', '#FF10A0', '#00F0FF', '#39FF14'][i] }}
                initial={{ y: 0 }}
                animate={{ y: '-100%' }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.05, ease: [0.96, -0.02, 0.38, 1.01] }}
              />
            ))}
          </div>
          <div className="flex w-1/2 flex-col">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-full flex-1"
                style={{ background: ['#FF6B00', '#FF10A0', '#00F0FF', '#39FF14', '#FF6B00'][i] }}
                initial={{ y: 0 }}
                animate={{ y: '100%' }}
                transition={{ duration: 0.8, delay: 0.55 + i * 0.05, ease: [0.96, -0.02, 0.38, 1.01] }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
