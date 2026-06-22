import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
// Make sure this path matches your actual API service file
import { hostelAPI } from '../../services/api';
import PriceDisplay from '../common/PriceDisplay';
import { optimizeImageUrl } from '../../utils/imageOptimization';
import DiscoveryEngine from './DiscoveryEngine/DiscoveryEngine';
import './HeroSection.css';

/* -------------------------------------------------------------------------- */
/* STATIC STYLES (No Animations Here)                                         */
/* -------------------------------------------------------------------------- */
const StaticStyles = () => (
  <style>{`
    .bg-grid-matrix {
      background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle at center, black, transparent 80%);
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
    }
    .text-gradient {
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-image: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
    }
  `}</style>
);

/* -------------------------------------------------------------------------- */
/* MICRO-COMPONENTS                                                           */
/* -------------------------------------------------------------------------- */

const DEFAULT_TEXTS = ['Second Home', 'Dream Hostel', 'Campus Stay', 'Study Haven', 'Comfort Zone'];
const DEFAULT_HOSTELS = [];

// 1. Premium Conveyor-Belt Text Rotator
const AnimatedTitle = memo(({ texts = DEFAULT_TEXTS }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!texts || texts.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [texts]);

  if (!texts || !texts.length) return null;

  // Find longest text for placeholder to reserve exact max height
  const longestText = useMemo(() => {
    return texts.reduce((a, b) => a.length > b.length ? a : b, '');
  }, [texts]);

  return (
    <span className="relative inline-block w-full sm:w-auto sm:min-w-[420px] align-bottom overflow-hidden">
      {/* Invisible placeholder to establish max height, perfectly wraps on mobile */}
      <span className="invisible block w-full pb-2 text-center sm:text-left font-black break-words whitespace-normal">
        {longestText}
      </span>
      
      {texts.map((text, i) => {
        const isCurrent = i === index;
        const isPrev = i === (index - 1 + texts.length) % texts.length;
        
        // Incoming from Left, Outgoing to Right
        let positionClass = 'opacity-0 -translate-x-16 scale-95 blur-md'; // Waiting (left)
        if (isCurrent) {
          positionClass = 'opacity-100 translate-x-0 scale-100 blur-none'; // Active (center)
        } else if (isPrev) {
          positionClass = 'opacity-0 translate-x-16 scale-105 blur-md'; // Leaving (right)
        }

        return (
          <span
            key={i}
            className={`absolute left-0 top-0 w-full h-full flex flex-col justify-center sm:justify-start sm:pt-0 text-gradient font-black pb-2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] text-center sm:text-left ${positionClass}`}
            style={{ 
               pointerEvents: isCurrent ? 'auto' : 'none'
            }}
          >
            {text}
          </span>
        );
      })}
    </span>
  );
});

// 2. Search Widget
const SearchWidget = memo(({ content }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) navigate(`/hostels?search=${encodeURIComponent(searchQuery)}`);
  }, [searchQuery, navigate]);

  return (
    <div className="relative z-30 mb-8 sm:mb-10 w-[94%] sm:w-full max-w-xl mx-auto lg:mx-0 search-widget opacity-0">
      <div className="glass-panel flex flex-col sm:flex-row items-center rounded-2xl sm:rounded-full p-2 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 group gap-2 sm:gap-0">
        <div className="hidden sm:block pl-4 pr-2">
          <svg className="h-6 w-6 text-yellow-400 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search colleges, areas, or cities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full border-none bg-transparent py-3 sm:py-3.5 px-4 sm:px-0 text-base sm:text-lg font-medium text-zinc-900 outline-none placeholder:text-zinc-400 placeholder:font-normal text-center sm:text-left"
        />
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto rounded-xl sm:rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-yellow-500/25 transition-all hover:scale-105 hover:shadow-yellow-500/40 active:scale-95"
        >
          Search
        </button>
      </div>
    </div>
  );
});

// 3. Social Proof / Avatars
const SocialProof = () => (
  <div className="social-proof opacity-0 flex items-center gap-4 mt-8 pt-6 border-t border-zinc-200/50">
    <div className="flex -space-x-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-zinc-200 shadow-sm overflow-hidden z-[${10 - i}]`}>
          <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt={`Student ${i}`} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="w-10 h-10 rounded-full border-2 border-white bg-yellow-100 flex items-center justify-center shadow-sm z-0">
        <span className="text-xs font-bold text-yellow-600">+2k</span>
      </div>
    </div>
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-medium text-zinc-600">Loved by 2,000+ students</span>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* MAIN HERO COMPONENT                                                        */
/* -------------------------------------------------------------------------- */

const HeroSection = memo(({ hostels = DEFAULT_HOSTELS, loading, content }) => {
  const container = useRef(null);

  useGSAP(() => {
    // 1. Ambient Glows Animation (More organic movement)
    gsap.to('.ambient-glow-1', {
      x: 'random(-50, 50)',
      y: 'random(-30, 30)',
      rotation: 'random(-15, 15)',
      scale: 'random(0.8, 1.2)',
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.ambient-glow-2', {
      x: 'random(-60, 60)',
      y: 'random(-40, 40)',
      rotation: 'random(-20, 20)',
      scale: 'random(0.9, 1.3)',
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1
    });

    // 2. Entrance Sequence (Staggered fade up)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-badge', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
      .fromTo('.hero-title-part', { y: 30, opacity: 0, rotationX: -20 }, { y: 0, opacity: 1, rotationX: 0, duration: 0.8, stagger: 0.15 }, "-=0.2")
      .fromTo('.hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
      .fromTo('.search-widget', { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }, "-=0.2")
      .fromTo('.hero-buttons > *', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, "-=0.4")
      .fromTo('.social-proof', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3");
  }, { scope: container });

  return (
    <section ref={container} className="relative min-h-[100svh] lg:min-h-[95vh] flex items-center overflow-hidden bg-[#fafafa] py-12 lg:py-0 perspective-1000">
      <StaticStyles />

      {/* Grid and Glows */}
      <div className="absolute inset-0 z-0 bg-grid-matrix pointer-events-none" />

      {/* Multiple glowing orbs for richer background */}
      <div className="ambient-glow-1 absolute top-[10%] left-[20%] w-[20rem] lg:w-[30rem] h-[20rem] lg:h-[30rem] bg-yellow-300/30 rounded-full blur-[80px] lg:blur-[100px] pointer-events-none z-0 mix-blend-multiply" />
      <div className="ambient-glow-2 absolute top-[30%] right-[20%] w-[30rem] lg:w-[40rem] h-[30rem] lg:h-[40rem] bg-yellow-200/40 rounded-full blur-[100px] lg:blur-[120px] pointer-events-none z-0 mix-blend-multiply" />
      <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[20rem] bg-gradient-to-t from-[#fafafa] via-[#fafafa]/80 to-transparent pointer-events-none z-0" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] flex flex-col justify-center">
        {/* 12-column grid to let the DiscoveryEngine dominate (4 columns text, 8 columns engine) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center lg:min-h-[85vh]">

          {/* Left Content (Takes 5 columns to balance content size) */}
          <div className="col-span-1 lg:col-span-5 flex w-full flex-col items-center lg:items-start text-center lg:text-left z-20 relative">
            <div className="hero-badge opacity-0 inline-flex items-center gap-2.5 rounded-full border border-yellow-200 bg-yellow-50/80 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 shadow-[0_4px_20px_rgb(234,179,8,0.1)] mb-6 lg:mb-8 transition-transform hover:scale-105">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-yellow-800 uppercase tracking-wide">Rated #1 Hostel Network</span>
            </div>

            <h1 className="mb-4 lg:mb-6 text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-extrabold tracking-tight text-zinc-900 leading-[1.1] flex flex-col sm:block w-full" style={{ perspective: '1000px' }}>
              <span className="hero-title-part block sm:inline opacity-0">Find Your Perfect </span>
              <span className="hero-title-part block opacity-0 mt-1 sm:mt-0">
                <AnimatedTitle texts={content?.animatedText || DEFAULT_TEXTS} />
              </span>
            </h1>

            <p className="hero-desc opacity-0 mb-8 lg:mb-10 text-base sm:text-lg lg:text-xl leading-relaxed text-zinc-600 max-w-lg font-medium px-2 sm:px-0">
              {content?.subtitle || 'Experience premium living with modern amenities, 24/7 security, high-speed WiFi, and a vibrant community.'}
            </p>

            <SearchWidget content={content} />

            <div className="hero-buttons flex flex-col items-center gap-3 sm:gap-4 sm:flex-row w-[94%] max-w-[340px] sm:max-w-none sm:w-auto mt-2 mx-auto lg:mx-0">
              <Link to="/hostels" className="opacity-0 w-full sm:w-auto inline-flex items-center justify-center rounded-2xl sm:rounded-full bg-zinc-900 px-6 sm:px-8 py-3.5 sm:py-4 text-base font-bold text-white shadow-xl shadow-zinc-900/20 transition-all hover:scale-105 hover:bg-zinc-800 hover:shadow-zinc-900/30 active:scale-95 group">
                {content?.primaryButton?.text || 'Explore Hostels'}
                <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link to="/contact" className="opacity-0 w-full sm:w-auto inline-flex items-center justify-center rounded-2xl sm:rounded-full bg-white/80 backdrop-blur-md px-6 sm:px-8 py-3.5 sm:py-4 text-base font-bold text-zinc-900 ring-2 ring-inset ring-zinc-200 shadow-sm transition-all hover:bg-white hover:ring-zinc-300 hover:scale-105 active:scale-95">
                {content?.secondaryButton?.text || 'Contact Us'}
              </Link>
            </div>

            <SocialProof />
          </div>

          {/* Right: Living Discovery Engine (Takes 7 columns for dominance) */}
          <div className="col-span-1 lg:col-span-7 relative w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-0 h-[450px] sm:h-[600px] lg:h-[750px] xl:h-[800px] rounded-[2.5rem] overflow-visible transform-gpu transition-transform duration-700 hover:scale-[1.01] xl:translate-x-10 -mt-8 sm:-mt-12 lg:-mt-16 flex items-center justify-center">
            <div className="w-full h-full pointer-events-auto">
              <DiscoveryEngine />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});

export default HeroSection;