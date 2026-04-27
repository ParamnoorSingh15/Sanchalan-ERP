'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { pageTransitionVariants } from '@/lib/motionVariants';
import { useEffect } from 'react';
import { initGsapAnimations } from '@/lib/gsapAnimations';

export default function PageTransition({ children }) {
    const pathname = usePathname();

    // Re-initialize GSAP scroll triggers whenever the route changes and a new DOM is mounted
    useEffect(() => {
        const cleanup = initGsapAnimations();
        return () => {
            if (cleanup) cleanup();
        };
    }, [pathname]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full h-full flex-1"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
