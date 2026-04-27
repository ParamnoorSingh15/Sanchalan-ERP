/**
 * Reusable Framer Motion variants for structured, consistent UI transitions.
 * Utilizing the standard 0.22, 1, 0.36, 1 bezier curve (Apple-style smoothness).
 */

export const EASE = [0.22, 1, 0.36, 1];

export const fadeVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: EASE } }
};

export const slideVariant = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.4, ease: EASE } }
};

export const scaleVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
    hover: { scale: 1.02, transition: { duration: 0.2, ease: 'easeInOut' } }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05
        }
    }
};

export const staggerChildren = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } }
};

// Route wrapper transition optimized for App Router
export const pageTransitionVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};
