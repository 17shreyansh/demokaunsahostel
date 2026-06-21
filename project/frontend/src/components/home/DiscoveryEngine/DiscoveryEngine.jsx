import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapLayer from './MapLayer';
import './DiscoveryEngine.css';

// ─── Static Data (Moved outside to prevent re-allocation) ────────────────────
const TEXTS_1 = ["✓ 2 min from College", "✓ Fully Furnished", "✓ Attached Washroom"];
const TEXTS_2 = ["✓ High Speed WiFi", "✓ 24/7 Security", "✓ Food Included"];



// ─── Custom Hook for Cycling Texts ──────────────────────────────────────────
const useTextCycle = (length, intervalTime, delay = 0) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let interval;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % length);
      }, intervalTime);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [length, intervalTime, delay]);

  return index;
};

// ─── Sub-Components ─────────────────────────────────────────────────────────
const FloatingCard = memo(({ index, texts, x, y, className }) => (
  <g className={className}>
    <foreignObject x={x} y={y} width="220" height="80" className="hero-foreign-obj">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="hero-float-card"
        >
          <span className="hero-float-check">{texts[index].split(' ')[0]}</span>
          <span>{texts[index].substring(2)}</span>
        </motion.div>
      </AnimatePresence>
    </foreignObject>
  </g>
));
FloatingCard.displayName = 'FloatingCard';

// ─── Main Component ─────────────────────────────────────────────────────────
const DiscoveryEngine = memo(() => {
  // Cycle states utilizing the custom hook
  const index1 = useTextCycle(TEXTS_1.length, 4000, 0);
  const index2 = useTextCycle(TEXTS_2.length, 4500, 2000);

  return (
    <div
      className="discovery-engine-container"
      aria-label="Animated 3D Greater Noida Scene"
    >
      <svg
        className="w-full h-full hero-scene-drift"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Particles Layer Removed as per user request */}

        {/* Layer 3: Main Scene (Buildings, Roads, Trees) */}
        <MapLayer />

        {/* Layer 4: Animated Vehicles */}
        <g className="hero-parallax-4">
          {/* Car 1 */}
          <g>
            <animateMotion
              dur="18s"
              repeatCount="indefinite"
              rotate="auto"
              path="M 175,338 C 255,365 335,385 420,400 C 465,395 510,385 548,375 C 578,388 602,418 625,440"
            />
            <g transform="translate(-4, -4.5)">
              <rect width={8} height={4} rx={1} fill="#ef4444" />
              <rect x={1.5} y={0.5} width={1.5} height={3} fill="#1e293b" opacity={0.7} />
              <rect x={4.5} y={0.5} width={2} height={3} fill="#1e293b" opacity={0.7} />
              <circle cx={7.5} cy={0.8} r={0.5} fill="#fde047" />
              <circle cx={7.5} cy={3.2} r={0.5} fill="#fde047" />
            </g>
          </g>

          {/* Car 2 */}
          <g>
            <animateMotion
              dur="14s"
              repeatCount="indefinite"
              rotate="auto"
              path="M 175,338 C 255,365 335,385 420,400 C 465,395 510,385 548,375 C 578,388 602,418 625,440"
            />
            <g transform="translate(-4, 0.5)">
              <rect width={8} height={4} rx={1} fill="#10b981" />
              <rect x={1.5} y={0.5} width={1.5} height={3} fill="#1e293b" opacity={0.7} />
              <rect x={4.5} y={0.5} width={2} height={3} fill="#1e293b" opacity={0.7} />
              <circle cx={7.5} cy={0.8} r={0.5} fill="#fde047" />
              <circle cx={7.5} cy={3.2} r={0.5} fill="#fde047" />
            </g>
          </g>

          {/* Metro Train */}
          <g>
            <animateMotion
              dur="12s"
              repeatCount="indefinite"
              rotate="auto"
              path="M 130,488 C 190,480 250,474 300,470 C 380,462 480,452 640,435"
            />
            <g transform="translate(-15, -2.5)">
              {/* First Car */}
              <rect x={21} y={0} width={10} height={5} rx={1} fill="#f8fafc" stroke="#64748b" strokeWidth={0.5} />
              <rect x={28} y={1} width={2} height={3} rx={0.5} fill="#1e293b" />
              <rect x={23} y={1} width={3} height={3} fill="#3b82f6" />
              
              {/* Middle Car */}
              <rect x={10.5} y={0} width={9.5} height={5} rx={0.5} fill="#f8fafc" stroke="#64748b" strokeWidth={0.5} />
              <rect x={12.5} y={1} width={5} height={3} fill="#3b82f6" /> 
              
              {/* Last Car */}
              <rect x={0} y={0} width={9.5} height={5} rx={0.5} fill="#f8fafc" stroke="#64748b" strokeWidth={0.5} />
              <rect x={2.5} y={1} width={5} height={3} fill="#3b82f6" />
            </g>
          </g>
        </g>

        {/* Layer 5: Floating HTML Cards */}
        <FloatingCard
          index={index1}
          texts={TEXTS_1}
          x="120"
          y="210"
          className="hero-parallax-4 mobile-card-1"
        />

        <FloatingCard
          index={index2}
          texts={TEXTS_2}
          x="480"
          y="330"
          className="hero-parallax-5 mobile-card-2"
        />
      </svg>
    </div>
  );
});

DiscoveryEngine.displayName = 'DiscoveryEngine';

export default DiscoveryEngine;