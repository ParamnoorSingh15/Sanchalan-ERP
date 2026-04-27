import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Reusable GSAP + ScrollTrigger animation routines.
 * Wraps logic inside gsap.matchMedia() to disable heavy effects on mobile to prevent thrashing.
 */

export const initGsapAnimations = () => {
    // Only conditionally execute in browser
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // Only apply animations on tablet widths and above (>= 768px)
    mm.add("(min-width: 768px)", () => {
        
        // 1. Fade Up (common for cards and sections)
        gsap.utils.toArray('.gsap-fade-up').forEach((el) => {
            gsap.fromTo(el, 
                { opacity: 0, y: 30 },
                {
                    opacity: 1, 
                    y: 0, 
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    }
                }
            );
        });

        // 2. Fade In (subtle entrance)
        gsap.utils.toArray('.gsap-fade-in').forEach((el) => {
            gsap.fromTo(el,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 1,
                    ease: "power1.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });

        // 3. Slide Left (for side panels/widgets)
        gsap.utils.toArray('.gsap-slide-left').forEach((el) => {
            gsap.fromTo(el,
                { opacity: 0, x: 40 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });

        // 4. Stagger Reveal (children within container)
        gsap.utils.toArray('.gsap-stagger-container').forEach((el) => {
            const children = el.querySelectorAll('.gsap-stagger-item');
            if (children.length === 0) return;

            gsap.fromTo(children,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });

    });

    return () => {
        mm.revert(); // Cleanup on unmount/route change
    };
};
