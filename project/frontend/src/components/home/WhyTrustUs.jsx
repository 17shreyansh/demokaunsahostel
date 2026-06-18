import { motion } from 'framer-motion';

const WhyTrustUs = () => {
  const reasons = [
    {
      title: "100% Verified Hostels",
      description: "Every single property listed on our platform undergoes a rigorous multi-point physical inspection by our ground team to ensure complete safety and premium quality.",
      features: ["Physical background checks", "Safety protocol audits", "Verified owner identities"],
      pill1: "Bank-Grade Secure",
      pill2: "Verified Partners",
      // Abstract Art: The "Verification Core"
      renderArt: () => (
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Outer rotating dashed ring */}
          <div className="absolute inset-0 rounded-full border border-gray-200 border-dashed group-hover:rotate-180 transition-transform duration-1000 ease-in-out" />
          {/* Inner solid ring */}
          <div className="absolute inset-4 rounded-full border border-gray-100 group-hover:scale-110 transition-transform duration-500 ease-out" />
          {/* Central glowing core */}
          <div className="w-12 h-12 bg-white rounded-full border border-gray-100 shadow-md flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all duration-500 z-10">
            <div className="w-4 h-4 bg-gray-200 rounded-full group-hover:bg-yellow-400 group-hover:scale-125 transition-all duration-500" />
          </div>
          {/* Floating particle */}
          <div className="absolute top-0 right-2 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-500" />
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
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Back Card */}
          <div className="absolute w-20 h-28 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm transform -rotate-6 group-hover:-rotate-12 group-hover:-translate-x-8 group-hover:translate-y-4 transition-all duration-500 ease-out" />
          {/* Middle Card */}
          <div className="absolute w-20 h-28 bg-white border border-gray-100 rounded-2xl shadow-md transform rotate-6 group-hover:rotate-12 group-hover:translate-x-8 group-hover:translate-y-4 transition-all duration-500 ease-out" />
          {/* Front Premium Card */}
          <div className="absolute w-24 h-32 bg-white border border-gray-100 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-3 group-hover:-translate-y-4 transition-all duration-500 ease-out z-10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-300 to-yellow-500" />
            <div className="w-12 h-1.5 rounded-full bg-gray-100" />
            <div className="w-8 h-1.5 rounded-full bg-gray-100" />
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
        <div className="relative flex items-end justify-center space-x-3 w-32 h-32 pb-4">
          {/* Bar 1 - Cost */}
          <div className="w-6 bg-gray-100 rounded-t-lg h-16 group-hover:h-8 transition-all duration-700 ease-out" />
          {/* Bar 2 - Market Average */}
          <div className="w-6 bg-gray-200 rounded-t-lg h-20 group-hover:h-12 transition-all duration-700 ease-out delay-75" />
          {/* Bar 3 - Our Value */}
          <div className="w-6 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-lg h-10 group-hover:h-24 transition-all duration-700 ease-out delay-150 relative shadow-sm group-hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]">
            {/* Glowing indicator line */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300" />
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
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Ripple 2 */}
          <div className="absolute inset-0 rounded-full border border-yellow-200 opacity-0 group-hover:animate-[ping_3s_ease-out_infinite]" />
          {/* Ripple 1 */}
          <div className="absolute inset-4 rounded-full border border-yellow-300 opacity-0 group-hover:animate-[ping_3s_ease-out_infinite_1s]" />
          {/* Base Platform */}
          <div className="absolute inset-8 bg-gray-50 rounded-full border border-gray-100" />
          {/* Core Status Dot */}
          <div className="relative z-10 w-6 h-6 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full group-hover:bg-yellow-500 transition-colors duration-500" />
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-white font-sans overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Minimalist Header */}
        <div className="text-center mb-20 lg:mb-32 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: "easeOut", duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Why Students <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">Trust Us</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed px-4 font-medium">
              We are committed to revolutionizing your hostel search. Making it safer, completely transparent, and absolutely hassle-free.
            </p>
          </motion.div>
        </div>

        {/* Alternating Layout */}
        <div className="space-y-32 lg:space-y-48">
          {reasons.map((reason, index) => {
            const isEven = index % 2 === 0;

            return (
              <div 
                key={index} 
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}
              >
                
                {/* Visual "Pro" Object Side (No Images, Pure Interactive UI Art) */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full lg:w-1/2"
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

                    {/* Floating UI Pill 1 */}
                    <div className={`absolute top-[15%] ${isEven ? 'left-[10%]' : 'right-[10%]'} bg-white/90 backdrop-blur-md border border-gray-100 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 shadow-sm flex items-center gap-2.5 z-20 transform transition-transform duration-500 group-hover:-translate-y-2`}>
                      <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                      <span className="text-xs sm:text-sm font-bold text-gray-800 tracking-wide">{reason.pill1}</span>
                    </div>

                    {/* Floating UI Pill 2 */}
                    <div className={`absolute bottom-[15%] ${isEven ? 'right-[10%]' : 'left-[10%]'} bg-white/90 backdrop-blur-md border border-gray-100 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 shadow-sm flex items-center gap-2.5 z-20 transform transition-transform duration-500 group-hover:translate-y-2`}>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs sm:text-sm font-bold text-gray-600 tracking-wide">{reason.pill2}</span>
                    </div>

                    {/* Bottom fade out line */}
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#FAFAFA] to-transparent pointer-events-none" />
                  </div>
                </motion.div>

                {/* Details/Text Side */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="w-full lg:w-1/2 flex flex-col justify-center relative"
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
                        <motion.li 
                          key={fIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + (fIndex * 0.1), ease: "easeOut" }}
                          className="flex items-center space-x-4 group/item cursor-default"
                        >
                          {/* Sleek CSS Glowing Dot instead of an icon */}
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/item:bg-yellow-500 group-hover/item:ring-4 ring-yellow-500/20 transition-all duration-300" />
                          <span className="text-gray-700 font-semibold group-hover/item:text-gray-900 transition-colors duration-300">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyTrustUs;