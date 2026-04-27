'use client';

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Initializes Lenis smooth scrolling globally and synchronizes its
 * scroll-frame loop with GSAP's ticker to prevent animation jittering.
 */
export default function SmoothScrollProvider({ children }) {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease-out curve
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Sync GSAP with Lenis
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        // Prevent GSAP's internal lag smoothing from creating conflicts
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove((time) => lenis.raf(time * 1000));
        };
    }, []);

    return <>{children}</>;
}
