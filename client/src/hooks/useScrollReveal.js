import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useScrollReveal(rootRef, selector = '[data-reveal]') {
  useEffect(() => {
    if (!rootRef?.current) return;

    const ctx = gsap.context(() => {
      const targets = rootRef.current.querySelectorAll(selector);
      if (!targets.length) return;

      targets.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            ease: 'power3.out',
            delay: i * 0.07,
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, [rootRef, selector]);
}
