import { motion, AnimatePresence } from 'framer-motion';

const sheetVariants = {
  hidden: { y: '100%', transition: { type: 'spring', damping: 30, stiffness: 400 } },
  visible: { y: 0, transition: { type: 'spring', damping: 30, stiffness: 400 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function BottomSheet({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bottom-sheet-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bottom-sheet"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <div className="bottom-sheet-handle" />
            </div>
            <div className="px-4 pb-6 safe-area-bottom">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
