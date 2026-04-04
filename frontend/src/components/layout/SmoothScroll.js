'use client';

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

/**
 * Wraps the application with smooth-scroll behaviour via Lenis.
 * Only the options supported by the installed version are used to
 * avoid deprecation warnings.
 */
export default function SmoothScroll({ children }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothTouch: false,
            touchMultiplier: 2,
        });

        let rafId;
        const raf = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
