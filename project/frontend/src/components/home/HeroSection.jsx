import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
// Make sure this path matches your actual API service file
import { hostelAPI } from '../../services/api';
import PriceDisplay from '../common/PriceDisplay';

/* -------------------------------------------------------------------------- */
/* STATIC STYLES (No Animations Here)                                         */
/* -------------------------------------------------------------------------- */
const StaticStyles = () => (
  <style>{`
    .bg-grid-matrix {
      background-image: radial-gradient(circle, #e4e4e7 1px, transparent 1px);
      background-size: 24px 24px;
    }
  `}</style>
);

/* -------------------------------------------------------------------------- */
/* MICRO-COMPONENTS                                                           */
/* -------------------------------------------------------------------------- */

const DEFAULT_TEXTS = ['Premium Hostels', 'Safe Accommodations', 'Modern PGs'];
const DEFAULT_HOSTELS = [];

// 1. 100% GSAP Text Rotator (Absolute Stack, Bug-Free)
const AnimatedTitle = memo(({ texts = DEFAULT_TEXTS }) => {
  const containerRef = useRef(null);

  // Added `texts` to dependencies. If your texts load from an API later, 
  // GSAP will automatically recalculate without breaking.
  useGSAP(() => {
    const words = gsap.utils.toArray('.animated-word');
    if (!words.length) return;

    // Reset setup: Put all words below and hidden, except the first one
    gsap.set(words, { y: 40, opacity: 0 });
    gsap.set(words[0], { y: 0, opacity: 1 });

    const tl = gsap.timeline({ repeat: -1 });

    words.forEach((word, i) => {
      const nextWord = words[(i + 1) % words.length];

      // Slide current word up and fade out
      tl.to(word, {
        y: -40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.inOut',
        delay: 2.5
      })
        // Simultaneously slide the next word in from the bottom
        .to(nextWord, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.inOut'
        }, "<"); // The "<" symbol tells GSAP to run this at the exact same time
    });
  }, { scope: containerRef, dependencies: [texts] });

  return (
    <span ref={containerRef} className="relative block h-[1.2em] w-full overflow-hidden sm:inline-block sm:w-auto sm:min-w-[400px] align-bottom">
      {texts.map((text, i) => (
        <span
          key={i}
          className="animated-word absolute left-0 top-0 w-full text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 will-change-transform pb-2"
        >
          {text}
        </span>
      ))}
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
    <div className="relative z-30 mb-8 w-full max-w-xl mx-auto lg:mx-0 search-widget opacity-0">
      <div className="flex items-center rounded-2xl bg-white p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-200/80 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="pl-4 pr-2">
          <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search colleges, areas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full border-none bg-transparent py-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400"
        />
        <button
          onClick={handleSearch}
          className="rounded-xl bg-gradient-to-b from-yellow-400 to-yellow-500 px-6 py-2.5 text-sm font-bold text-zinc-900 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Search
        </button>
      </div>
    </div>
  );
});

const HostelSlider = memo(({ hostels, loading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const displayHostels = useMemo(() => hostels?.slice(0, 5) || [], [hostels]);

  // Logical interval triggers React state
  useEffect(() => {
    if (displayHostels.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % displayHostels.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [displayHostels.length]);

  // GSAP entirely handles the DOM manipulation when activeIndex changes
  useGSAP(() => {
    const len = displayHostels.length;
    if (!len) return;

    displayHostels.forEach((_, i) => {
      const relIndex = (i - activeIndex + len) % len;
      const isExiting = relIndex === len - 1;

      const yOffset = isExiting ? -60 : relIndex * 24;
      const scale = isExiting ? 1.05 : 1 - (relIndex * 0.06);
      const opacity = isExiting ? 0 : relIndex < 3 ? 1 - (relIndex * 0.15) : 0;
      const zIndex = 20 - relIndex;

      gsap.to(`.card-${i}`, {
        y: yOffset,
        scale: scale,
        opacity: opacity,
        zIndex: zIndex,
        duration: 0.85,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  }, { scope: containerRef, dependencies: [activeIndex, displayHostels] });

  if (loading) return <div className="h-[24rem] sm:h-[28rem] w-full max-w-sm sm:max-w-md mx-auto animate-pulse rounded-[2rem] bg-zinc-200 mt-8" />;
  if (!displayHostels.length) return null;

  return (
    <div ref={containerRef} className="slider-container relative h-[24rem] sm:h-[28rem] w-full max-w-sm sm:max-w-md mx-auto opacity-0 pt-8 perspective-1000">
      <div className="relative h-full w-full transform-gpu">
        {displayHostels.map((hostel, i) => {
          const hasImage = hostel.images && hostel.images.length > 0;
          return (
            <div
              key={hostel._id}
              className={`card-${i} absolute top-0 left-0 w-full h-full will-change-transform`}
              style={{
                opacity: i === 0 ? 1 : 0,
                pointerEvents: i === activeIndex ? 'auto' : 'none'
              }}
            >
              <div className="w-full h-full overflow-hidden rounded-[2rem] bg-zinc-900 shadow-2xl relative group ring-1 ring-white/10">
                {hasImage ? (
                  <img src={hostel.images[0]} alt={hostel.name} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out" />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-90" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-extrabold tracking-tight text-white leading-tight line-clamp-2 drop-shadow-md">
                      {hostel.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 text-xs font-bold tracking-wide text-emerald-400 ring-1 ring-emerald-400/30">
                      {hostel.availability || 'Available'}
                    </span>
                  </div>
                  <p className="flex items-center text-sm font-medium text-zinc-300 mb-5 line-clamp-1">
                    <svg className="w-4 h-4 mr-1.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {hostel.location}
                  </p>
  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-white drop-shadow-sm">
                      <PriceDisplay price={hostel.price} />
                    </div>
  
                    <Link
                      to={`/hostel/${hostel.slug || hostel._id}`}
                      className="rounded-xl bg-white/10 backdrop-blur-md px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white hover:text-black hover:scale-[1.02] active:scale-[0.98]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* MAIN HERO COMPONENT                                                        */
/* -------------------------------------------------------------------------- */

const HeroSection = memo(({ hostels = DEFAULT_HOSTELS, loading, content }) => {
  const container = useRef(null);

  useGSAP(() => {
    // 1. Continuous Floating Ambient Glow
    gsap.to('.ambient-glow', {
      x: 'random(-40, 40)',
      y: 'random(-20, 20)',
      scale: 'random(0.95, 1.05)',
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // 2. Main Entrance Sequence (overrides Tailwind opacity-0 classes securely)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-badge', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
      .fromTo('.hero-title', { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
      .fromTo('.hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
      .fromTo('.search-widget', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
      .fromTo('.hero-buttons > *', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.6")
      .fromTo('.slider-container', { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'expo.out' }, "-=0.8");
  }, { scope: container });

  return (
    <section ref={container} className="relative min-h-[90vh] flex items-center overflow-hidden bg-white py-20 lg:py-0">
      <StaticStyles />

      {/* Vercel-style dotted grid and Glow */}
      <div className="absolute inset-0 z-0 bg-grid-matrix opacity-40 pointer-events-none" />
      <div className="ambient-glow absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[30rem] bg-yellow-100/50 rounded-full blur-[120px] pointer-events-none z-0 will-change-transform" />

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">

          {/* Left Text Content */}
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left mt-8 lg:mt-0 w-full">

            <div className="hero-badge inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200 shadow-sm mb-8 opacity-0">
              <span className="flex h-2 w-2 rounded-full bg-yellow-500"></span>
              {content?.trustBadge || 'Trusted by 1200+ Students'}
            </div>

            <h1 className="hero-title mb-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1] opacity-0 flex flex-col sm:block">
              <span className="block sm:inline">{content?.mainTitle || 'Find Your Perfect '}</span>
              <AnimatedTitle texts={content?.typewriterTexts} />
            </h1>

            <p className="hero-desc mb-10 text-lg leading-relaxed text-zinc-500 max-w-lg mx-auto lg:mx-0 opacity-0">
              {content?.description || 'Curated premium spaces featuring modern amenities and vibrant communities. Experience world-class living without the hassle.'}
            </p>

            <SearchWidget content={content} />

            <div className="hero-buttons flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link to="/hostels" className="opacity-0 w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]">
                {content?.primaryButton?.text || 'Explore Hostels'}
              </Link>
              <Link to="/contact" className="opacity-0 w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-zinc-900 ring-1 ring-inset ring-zinc-200 transition-colors hover:bg-zinc-50 hover:ring-zinc-300">
                {content?.secondaryButton?.text || 'Contact Us'}
              </Link>
            </div>
          </div>

          {/* Right Slider */}
          <div className="relative z-10 flex w-full items-center justify-center lg:justify-end">
            <HostelSlider hostels={hostels} loading={loading} />
          </div>

        </div>
      </div>
    </section>
  );
});

export default HeroSection;