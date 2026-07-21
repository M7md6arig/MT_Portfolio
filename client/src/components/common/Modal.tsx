import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect } from "react";
import { modalBackdrop, modalPanel } from "@/animations/variants";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, label = "Dialog", children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="glass-strong relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl"
          >
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-neutral-300 transition-colors hover:bg-black/70 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
