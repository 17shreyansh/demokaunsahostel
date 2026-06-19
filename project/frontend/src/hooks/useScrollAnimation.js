import { useEffect, useRef } from 'react';

/**
 * Lightweight replacement for Framer Motion's `whileInView`.
 * Uses a single IntersectionObserver per component and toggles CSS classes
 * instead of running JS animation loops.
 *
 * Usage:
 *   const ref = useScrollAnimation();
 *   <div ref={ref} className="scroll-fade-up"> ... </div>
 *
 * The element starts hidden (via CSS class) and gets `is-visible` added
 * when it enters the viewport.
 */
export function useScrollAnimation(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el); // Once animated, stop observing
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '-50px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}

/**
 * Observe multiple children of a container for staggered scroll animations.
 * Add `scroll-fade-up` class to each child, and this hook will add `is-visible`
 * to each as they enter the viewport.
 */
export function useScrollAnimationContainer(selector = '.scroll-fade-up') {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.querySelectorAll(selector);
    if (!children.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [selector]);

  return containerRef;
}

export default useScrollAnimation;
