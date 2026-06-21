import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const WhyTrustUs = () => {
  const headerRef = useScrollAnimation();

  const reasons = [
    {
      title: "100% Verified Hostels",
      description: "Every single property listed on our platform undergoes a rigorous multi-point physical inspection by our ground team to ensure complete safety and premium quality.",
      features: ["Physical background checks", "Safety protocol audits", "Verified owner identities"],
      pill1: "Bank-Grade Secure",
      pill2: "Verified Partners",
      // Abstract Art: The "Verification Core"
      renderArt: () => (
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Rotating glowing orb in background */}
          <div className="absolute w-40 h-40 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full blur-2xl animate-[spin_8s_linear_infinite] opacity-60" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
          
          {/* Frosted Glass Overlay */}
          <div className="relative z-10 w-48 h-56 bg-white/30 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center overflow-hidden">
            {/* Inner subtle noise */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            {/* High-end biometric/scan lines */}
            <div className="w-24 h-24 relative flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-800/70 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
              <div className="absolute top-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-wtu-scan" />
            </div>

            {/* Verification Text block UI */}
            <div className="mt-6 flex flex-col items-center space-y-2 z-10">
              <div className="w-16 h-1.5 rounded-full bg-gray-300/50 overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-full bg-yellow-400 animate-[wtu-scan-line_2s_ease-in-out_infinite]" />
              </div>
              <div className="w-10 h-1.5 rounded-full bg-gray-300/50" />
            </div>
          </div>

          {/* Accent floating rings */}
          <div className="absolute -top-4 -right-4 w-20 h-20 border-2 border-yellow-400/40 rounded-full animate-ping z-0" style={{ animationDuration: '3s' }} />
        </div>
      )
    },
    {
      title: "50,000+ Happy Students",
      description: "Join the largest community of students who have found their perfect home away from home. Our platform is built on trust, transparency, and wellbeing.",
      features: ["Vibrant student community", "Genuine resident reviews", "Community support events"],
      pill1: "Active Community",
      pill2: "4.9/5 Average Rating",
      // Abstract Art: The "Community Cards"
      renderArt: () => (
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Animated gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200 via-orange-100 to-rose-100 rounded-full blur-3xl opacity-50 animate-pulse" />
          
          {/* Network lines - super thin, elegant */}
          <svg className="absolute inset-0 w-full h-full text-gray-400/20" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1" className="animate-[spin_20s_linear_infinite]" strokeDasharray="4 12" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" className="animate-[spin_30s_linear_infinite_reverse]" strokeDasharray="2 15" />
          </svg>

          {/* Center Glass Node */}
          <div className="absolute z-20 w-24 h-24 bg-white/40 backdrop-blur-xl border border-white/70 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full shadow-inner flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
            </div>
          </div>

          {/* Orbiting Glass Nodes */}
          <div className="absolute inset-0 flex items-center justify-center animate-[spin_15s_linear_infinite]">
            <div className="absolute -top-6 w-14 h-14 bg-white/50 backdrop-blur-lg border border-white/60 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-rose-400 rounded-full shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
            </div>
            <div className="absolute -bottom-4 w-10 h-10 bg-white/60 backdrop-blur-lg border border-white/70 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center animate-[spin_25s_linear_infinite_reverse]">
            <div className="absolute -left-8 w-16 h-16 bg-white/40 backdrop-blur-lg border border-white/50 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            </div>
            <div className="absolute -right-2 w-10 h-10 bg-white/70 backdrop-blur-lg border border-white/80 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Best Price Guarantee",
      description: "We negotiate directly with property owners to secure exclusive rates. What you see is exactly what you pay—absolutely zero hidden fees or brokerage.",
      features: ["Zero hidden charges", "Transparent pricing structure", "Exclusive student discounts"],
      pill1: "Lowest Rates",
      pill2: "Zero Brokerage",
      // Abstract Art: The "Value Metrics"
      renderArt: () => (
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Glow */}
          <div className="absolute inset-4 bg-gradient-to-b from-yellow-200 to-green-100 rounded-full blur-2xl opacity-50" />

          {/* Main Glass Panel (Chart) */}
          <div className="relative z-10 w-48 h-40 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-end justify-between p-6 overflow-hidden animate-wtu-float-slow">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            
            {/* Chart Bars */}
            <div className="relative z-10 w-7 bg-gray-400/40 rounded-t-sm animate-[wtu-bar-1_4s_ease-in-out_infinite]" />
            <div className="relative z-10 w-7 bg-gray-400/40 rounded-t-sm animate-[wtu-bar-2_4s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
            <div className="relative z-10 w-7 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-sm shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-[wtu-bar-3_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
          </div>

          {/* Floating % Glass Badge */}
          <div className="absolute -right-4 -top-4 z-20 w-20 h-20 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-full shadow-2xl flex items-center justify-center animate-wtu-float-delayed">
            <span className="text-3xl font-black text-gray-800 bg-clip-text text-transparent bg-gradient-to-br from-gray-700 to-gray-900">%</span>
          </div>

          {/* Floating Down Arrow Badge */}
          <div className="absolute -left-6 bottom-4 z-20 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 border-2 border-white rounded-full shadow-xl flex items-center justify-center animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )
    },
    {
      title: "24/7 Dedicated Support",
      description: "Whether it's a midnight booking query or a weekend maintenance issue, our rapid-response support team is always awake, alert, and ready to resolve your problems.",
      features: ["Round-the-clock availability", "Instant query resolution", "Dedicated relationship managers"],
      pill1: "< 2m Response",
      pill2: "Always Online",
      // Abstract Art: The "Pulse Radar"
      renderArt: () => (
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Ethereal Glow */}
          <div className="absolute inset-0 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" />

          {/* Radar Sweep Background */}
          <div className="absolute w-56 h-56 border border-gray-200/50 rounded-full overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute w-1/2 h-1/2 bg-gradient-to-br from-yellow-400/20 to-transparent origin-bottom-right animate-[spin_4s_linear_infinite]" style={{ top: 0, left: 0 }} />
          </div>

          {/* Central Glass Status Pill */}
          <div className="relative z-20 w-48 h-20 bg-white/50 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center px-6 animate-wtu-float-slow">
            {/* Live Dot */}
            <div className="relative flex items-center justify-center w-4 h-4 mr-4">
              <div className="absolute w-full h-full bg-green-500 rounded-full animate-ping opacity-75" />
              <div className="relative w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </div>
            
            {/* Soundwave/Pulse visualization */}
            <div className="flex items-center space-x-1.5 h-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-1.5 bg-gray-700/80 rounded-full animate-[wtu-soundwave_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>

          {/* Floating Support Ring Component */}
          <div className="absolute -bottom-6 -right-2 z-10 w-20 h-20 bg-white/70 backdrop-blur-2xl border border-white/90 rounded-full shadow-2xl flex items-center justify-center animate-wtu-float-delayed">
            <div className="absolute inset-1 rounded-full border border-gray-100/50 border-dashed animate-[spin_10s_linear_infinite]" />
            <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-white font-sans overflow-hidden">
      <style>{`
        @keyframes wtu-float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes wtu-scan-line {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes wtu-orbit-cw {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        @keyframes wtu-orbit-ccw {
          0% { transform: rotate(0deg) translateX(112px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(112px) rotate(360deg); }
        }
        @keyframes wtu-pulse-ring {
          0% { transform: scale(0.6); opacity: 0.8; border-width: 4px; }
          100% { transform: scale(1.5); opacity: 0; border-width: 1px; }
        }
        @keyframes wtu-bar-1 { 0%, 100% { height: 40%; } 50% { height: 70%; } }
        @keyframes wtu-bar-2 { 0%, 100% { height: 60%; } 50% { height: 40%; } }
        @keyframes wtu-bar-3 { 0%, 100% { height: 20%; } 50% { height: 90%; } }
        @keyframes wtu-soundwave { 0%, 100% { height: 20%; } 50% { height: 100%; } }

        .animate-wtu-float-slow { animation: wtu-float-slow 4s ease-in-out infinite; }
        .animate-wtu-float-delayed { animation: wtu-float-slow 4s ease-in-out infinite 2s; }
        .animate-wtu-scan { animation: wtu-scan-line 3s ease-in-out infinite; }
        .animate-wtu-orbit-1 { animation: wtu-orbit-cw 8s linear infinite; }
        .animate-wtu-orbit-2 { animation: wtu-orbit-ccw 12s linear infinite; }
        .animate-wtu-pulse-ring { animation: wtu-pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Minimalist Header */}
        <div className="text-center mb-20 lg:mb-32 max-w-3xl mx-auto">
          <div ref={headerRef} className="scroll-fade-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Why Students <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">Trust Us</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed px-4 font-medium">
              We are committed to revolutionizing your hostel search. Making it safer, completely transparent, and absolutely hassle-free.
            </p>
          </div>
        </div>

        {/* Alternating Layout */}
        <div className="space-y-32 lg:space-y-48">
          {reasons.map((reason, index) => {
            const isEven = index % 2 === 0;

            return (
              <ReasonBlock key={index} reason={reason} index={index} isEven={isEven} />
            );
          })}
        </div>

      </div>
    </section>
  );
};

/* Extracted into a component so each block gets its own scroll observer */
const ReasonBlock = ({ reason, index, isEven }) => {
  const artRef = useScrollAnimation();
  const textRef = useScrollAnimation();

  return (
    <div 
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}
    >
      
      {/* Visual "Pro" Object Side */}
      <div 
        ref={artRef}
        className="w-full lg:w-1/2 scroll-fade-up"
      >
        <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#FAFAFA] rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex items-center justify-center group cursor-pointer">
          
          {/* Minimalist Subtle Dot Grid Background */}
          <div 
            className="absolute inset-0 opacity-[0.15]" 
            style={{ 
              backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }}
          />

          {/* Ambient Glow tied to hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:bg-yellow-400/10" />
          </div>

          {/* Inject Custom Abstract Art */}
          <div className="relative z-10">
            {reason.renderArt()}
          </div>

          {/* Floating UI Pill 1 — solid bg instead of  */}
          <div className={`absolute top-[15%] ${isEven ? 'left-[10%]' : 'right-[10%]'} bg-white border border-gray-100 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 shadow-sm flex items-center gap-2.5 z-20 transform transition-transform duration-500 group-hover:-translate-y-2`}>
            <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
            <span className="text-xs sm:text-sm font-bold text-gray-800 tracking-wide">{reason.pill1}</span>
          </div>

          {/* Floating UI Pill 2 — solid bg instead of  */}
          <div className={`absolute bottom-[15%] ${isEven ? 'right-[10%]' : 'left-[10%]'} bg-white border border-gray-100 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 shadow-sm flex items-center gap-2.5 z-20 transform transition-transform duration-500 group-hover:translate-y-2`}>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs sm:text-sm font-bold text-gray-600 tracking-wide">{reason.pill2}</span>
          </div>

          {/* Bottom fade out line */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#FAFAFA] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Details/Text Side */}
      <div 
        ref={textRef}
        className="w-full lg:w-1/2 flex flex-col justify-center relative scroll-fade-up stagger-2"
      >
        {/* Giant Minimal Watermark Number */}
        <div className="absolute -top-16 -left-8 text-[12rem] font-black text-gray-50/80 pointer-events-none select-none z-0 hidden sm:block">
          0{index + 1}
        </div>
        
        <div className="relative z-10 space-y-6">
          {/* Small Step Indicator for Mobile */}
          <span className="sm:hidden text-yellow-500 font-bold tracking-widest text-sm uppercase">
            Step 0{index + 1}
          </span>

          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {reason.title}
          </h3>
          <p className="text-lg text-gray-500 leading-relaxed font-medium max-w-lg">
            {reason.description}
          </p>

          <ul className="space-y-4 pt-4">
            {reason.features.map((feature, fIndex) => (
              <li 
                key={fIndex}
                className="flex items-center space-x-4 group/item cursor-default"
              >
                {/* Sleek CSS Glowing Dot instead of an icon */}
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/item:bg-yellow-500 group-hover/item:ring-4 ring-yellow-500/20 transition-all duration-300" />
                <span className="text-gray-700 font-semibold group-hover/item:text-gray-900 transition-colors duration-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default WhyTrustUs;