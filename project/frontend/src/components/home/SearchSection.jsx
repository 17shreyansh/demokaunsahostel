import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

/* -------------------------------------------------------------------------- */
/* ABSTRACT ART ILLUSTRATIONS (CSS-only, no emojis)                           */
/* -------------------------------------------------------------------------- */

const BrowseArt = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Floating search cards */}
    <div className="absolute w-[70%] h-16 bg-white rounded-2xl shadow-lg border border-gray-100 top-[15%] left-[15%] group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-700 flex items-center px-5 gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-500" />
      <div className="flex-1 space-y-2">
        <div className="w-3/4 h-2 bg-gray-100 rounded-full" />
        <div className="w-1/2 h-2 bg-gray-50 rounded-full" />
      </div>
      <div className="w-6 h-6 rounded-lg bg-yellow-100 group-hover:bg-yellow-400 transition-colors duration-500" />
    </div>
    <div className="absolute w-[65%] h-14 bg-white/80 rounded-xl shadow-md border border-gray-50 top-[42%] left-[18%] group-hover:translate-x-2 transition-all duration-700 delay-75 flex items-center px-4 gap-3">
      <div className="w-6 h-6 rounded-full bg-gray-100" />
      <div className="flex-1 space-y-1.5">
        <div className="w-2/3 h-1.5 bg-gray-100 rounded-full" />
        <div className="w-2/5 h-1.5 bg-gray-50 rounded-full" />
      </div>
    </div>
    <div className="absolute w-[60%] h-12 bg-white/60 rounded-lg shadow-sm border border-gray-50 top-[65%] left-[20%] group-hover:translate-x-3 group-hover:translate-y-1 transition-all duration-700 delay-150 flex items-center px-3 gap-2">
      <div className="w-5 h-5 rounded-full bg-gray-50" />
      <div className="flex-1 space-y-1">
        <div className="w-1/2 h-1.5 bg-gray-50 rounded-full" />
      </div>
    </div>
    {/* Floating accent orbs */}
    <div className="absolute top-[10%] right-[12%] w-4 h-4 bg-yellow-400 rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 blur-[1px]" />
    <div className="absolute bottom-[20%] left-[10%] w-3 h-3 bg-yellow-300 rounded-full opacity-40 group-hover:opacity-80 group-hover:scale-125 transition-all duration-700 delay-200" />
  </div>
);

const VisitArt = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Calendar card */}
    <div className="relative w-[65%] aspect-square bg-white rounded-3xl shadow-lg border border-gray-100 group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-700 overflow-hidden">
      {/* Calendar header */}
      <div className="h-[28%] bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-between px-5">
        <div className="space-y-1">
          <div className="w-12 h-1.5 bg-white/40 rounded-full" />
          <div className="w-8 h-1.5 bg-white/20 rounded-full" />
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
        </div>
      </div>
      {/* Calendar grid */}
      <div className="p-4 grid grid-cols-7 gap-2">
        {Array.from({ length: 21 }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg transition-all duration-500 ${
              i === 10
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md shadow-yellow-200/50 group-hover:scale-125 group-hover:shadow-lg group-hover:shadow-yellow-300/60'
                : i === 9 || i === 11
                  ? 'bg-yellow-100 group-hover:bg-yellow-200'
                  : 'bg-gray-50 group-hover:bg-gray-100'
            }`}
          />
        ))}
      </div>
    </div>
    {/* Floating checkmark badge */}
    <div className="absolute bottom-[12%] right-[8%] w-14 h-14 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 delay-200">
      <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </div>
);

const BookArt = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Price tag / receipt card */}
    <div className="relative w-[60%] bg-white rounded-3xl shadow-lg border border-gray-100 p-6 group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-700">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-md shadow-yellow-200/40">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="w-3/4 h-2 bg-gray-100 rounded-full" />
          <div className="w-1/2 h-1.5 bg-gray-50 rounded-full" />
        </div>
      </div>
      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center">
          <div className="w-20 h-1.5 bg-gray-100 rounded-full" />
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <div className="w-16 h-1.5 bg-gray-100 rounded-full" />
          <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
        </div>
        <div className="h-px bg-gray-100 my-1" />
        <div className="flex justify-between items-center">
          <div className="w-14 h-2 bg-gray-200 rounded-full" />
          <div className="w-16 h-2.5 bg-yellow-400 rounded-full group-hover:bg-yellow-500 transition-colors duration-500" />
        </div>
      </div>
      {/* Zero brokerage badge */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2 group-hover:bg-green-100 transition-colors duration-500">
        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="w-24 h-1.5 bg-green-200 rounded-full" />
      </div>
    </div>
    {/* Floating lock */}
    <div className="absolute top-[8%] left-[10%] w-10 h-10 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center group-hover:-translate-y-2 group-hover:rotate-[-8deg] transition-all duration-500">
      <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
  </div>
);

const MoveInArt = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* House illustration */}
    <div className="relative group-hover:-translate-y-3 transition-all duration-700">
      {/* House body */}
      <div className="w-36 h-28 bg-white rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
        {/* Windows */}
        <div className="absolute top-4 left-4 w-10 h-8 bg-yellow-100 rounded-lg border border-yellow-200 group-hover:bg-yellow-200 transition-colors duration-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-px h-full bg-yellow-300/50" />
            <div className="absolute w-full h-px bg-yellow-300/50" />
          </div>
        </div>
        <div className="absolute top-4 right-4 w-10 h-8 bg-blue-50 rounded-lg border border-blue-100 group-hover:bg-blue-100 transition-colors duration-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-px h-full bg-blue-200/50" />
            <div className="absolute w-full h-px bg-blue-200/50" />
          </div>
        </div>
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-14 bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-lg">
          <div className="absolute top-1/2 right-2 w-1.5 h-1.5 rounded-full bg-yellow-400 group-hover:shadow-[0_0_8px_rgba(250,204,21,0.8)] transition-all duration-500" />
        </div>
      </div>
      {/* Roof */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[80px] border-r-[80px] border-b-[32px] border-l-transparent border-r-transparent border-b-gray-800 group-hover:border-b-gray-700 transition-colors duration-500" />
      {/* Chimney */}
      <div className="absolute -top-12 right-4 w-5 h-8 bg-gray-700 rounded-t-sm" />
      {/* Smoke particles */}
      <div className="absolute -top-16 right-4 w-3 h-3 bg-gray-200 rounded-full opacity-0 group-hover:opacity-60 group-hover:-translate-y-4 transition-all duration-1000 blur-[2px]" />
      <div className="absolute -top-14 right-6 w-2 h-2 bg-gray-200 rounded-full opacity-0 group-hover:opacity-40 group-hover:-translate-y-6 transition-all duration-1000 delay-300 blur-[1px]" />
    </div>
    {/* Floating heart */}
    <div className="absolute top-[10%] right-[15%] w-10 h-10 bg-red-50 rounded-xl border border-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500 delay-300">
      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    </div>
    {/* Ground line */}
    <div className="absolute bottom-[18%] left-[10%] right-[10%] h-px bg-gray-200 group-hover:bg-gray-300 transition-colors duration-500" />
    {/* Little plants */}
    <div className="absolute bottom-[18%] left-[15%] w-3 h-6 border-l-2 border-green-300 rounded-tl-full group-hover:h-8 transition-all duration-700" />
    <div className="absolute bottom-[18%] right-[20%] w-3 h-4 border-r-2 border-green-400 rounded-tr-full group-hover:h-6 transition-all duration-700 delay-100" />
  </div>
);

/* -------------------------------------------------------------------------- */
/* STEP COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
const ProcessStep = memo(({ step, index, isActive, onHover }) => {
  const ref = useScrollAnimation();

  return (
    <div
      ref={ref}
      className="scroll-fade-up"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Visual panel */}
      <div className={`group relative aspect-[4/3] bg-[#FAFAFA] rounded-[2rem] border transition-all duration-700 overflow-hidden cursor-pointer ${
        isActive
          ? 'border-yellow-200 shadow-[0_20px_60px_rgba(250,204,21,0.12)] scale-[1.02]'
          : 'border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]'
      }`}>
        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(#000 0.8px, transparent 0.8px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-48 h-48 rounded-full blur-3xl transition-all duration-700 ${
            isActive ? 'bg-yellow-400/15 scale-125' : 'bg-yellow-400/5'
          }`} />
        </div>

        {/* Art */}
        <div className="relative z-10 w-full h-full">
          {step.art}
        </div>

        {/* Step number watermark */}
        <div className={`absolute top-4 left-5 text-[4rem] font-black leading-none transition-colors duration-500 pointer-events-none select-none ${
          isActive ? 'text-yellow-400/20' : 'text-gray-200/40'
        }`}>
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-[#FAFAFA] to-transparent pointer-events-none" />
      </div>

      {/* Text content */}
      <div className="mt-6 sm:mt-8 px-1">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-500 ${
            isActive
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-md shadow-yellow-200/40'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {index + 1}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {step.title}
          </h3>
        </div>
        <p className="text-gray-500 leading-relaxed font-medium text-[15px] sm:text-base max-w-sm">
          {step.description}
        </p>

        {/* Subtle features list */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
          {step.features.map((f, i) => (
            <span key={i} className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <div className={`w-1 h-1 rounded-full transition-colors duration-500 ${isActive ? 'bg-yellow-500' : 'bg-gray-300'}`} />
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

ProcessStep.displayName = 'ProcessStep';

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
const HowItWorks = memo(({ content }) => {
  const headerRef = useScrollAnimation();
  const [activeStep, setActiveStep] = useState(null);

  const steps = [
    {
      title: 'Browse & Compare',
      description: 'Explore our curated collection of verified hostels. Filter by location, budget, and amenities — see real photos and genuine student reviews.',
      features: ['Smart Filters', 'Verified Listings', 'HD Photos'],
      art: <BrowseArt />
    },
    {
      title: 'Schedule a Visit',
      description: 'Found your match? Book a free physical visit at your convenience. Walk through the rooms, check the vibe, meet the community.',
      features: ['Free Visits', 'Flexible Slots', 'No Obligation'],
      art: <VisitArt />
    },
    {
      title: 'Book with Confidence',
      description: 'Lock in your room at the best rate. Zero brokerage, zero hidden charges — what you see is exactly what you pay.',
      features: ['Zero Brokerage', 'Secure Payment', 'Best Price'],
      art: <BookArt />
    },
    {
      title: 'Move In & Thrive',
      description: 'From day one, enjoy round-the-clock support, a vibrant student community, and a home that truly feels like yours.',
      features: ['24/7 Support', 'Community Events', 'Hassle-Free'],
      art: <MoveInArt />
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden font-sans">
      {/* Subtle ambient background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-yellow-50 to-transparent rounded-full opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-orange-50 to-transparent rounded-full opacity-40 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-20 lg:mb-28 max-w-3xl mx-auto scroll-fade-up">
          <div className="inline-flex items-center px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-full text-sm font-bold mb-8 tracking-wide">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]">
            From Search to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Move-In</span>, Made Effortless
          </h2>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-medium px-4">
            A simple four-step process designed to eliminate every friction point in your hostel search.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-24 lg:mb-32">
          {steps.map((step, index) => (
            <ProcessStep
              key={step.title}
              step={step}
              index={index}
              isActive={activeStep === index}
              onHover={setActiveStep}
            />
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/8 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-500/8 rounded-full blur-3xl" />
              <div className="absolute top-8 right-8 w-20 h-20 border border-white/[0.04] rounded-2xl rotate-12" />
              <div className="absolute bottom-8 left-8 w-14 h-14 border border-white/[0.04] rounded-full" />
              {/* Dot pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />
            </div>

            <div className="relative z-10 py-16 sm:py-20 px-8 sm:px-12 lg:px-16">
              {/* CTA */}
              <div className="text-center mb-14 lg:mb-16">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight">
                  Ready to Find Your Home?
                </h3>
                <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                  Join thousands of students who found their perfect stay through us. Start exploring — it takes less than a minute.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    to="/hostels"
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-2xl hover:shadow-2xl hover:shadow-yellow-400/20 transform hover:-translate-y-1 transition-all duration-300 text-lg"
                  >
                    <svg className="w-5 h-5 mr-2.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explore Hostels
                    <svg className="w-5 h-5 ml-2.5 transform group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/contact"
                    className="group inline-flex items-center px-8 py-4 bg-transparent text-white font-bold rounded-2xl border-2 border-white/15 hover:bg-white/5 hover:border-white/30 transform hover:-translate-y-1 transition-all duration-300 text-lg"
                  >
                    <svg className="w-5 h-5 mr-2.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Talk to Us
                  </Link>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-14 lg:mb-16" />

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
                {[
                  { value: '1200+', label: 'Happy Students' },
                  { value: '50+', label: 'Verified Hostels' },
                  { value: '4.8★', label: 'Average Rating' },
                  { value: '₹0', label: 'Brokerage Fee' }
                ].map((stat, i) => (
                  <div key={i} className="text-center group/s cursor-default">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight group-hover/s:text-yellow-400 transition-colors duration-500">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
});

HowItWorks.displayName = 'HowItWorks';

export default HowItWorks;