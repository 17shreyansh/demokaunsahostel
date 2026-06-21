import React from 'react';
import { Phone, Mail, MessageCircle, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation, useScrollAnimationContainer } from '../../hooks/useScrollAnimation';

const TalkToUs = () => {
  const headerRef = useScrollAnimation();
  const gridRef = useScrollAnimationContainer('.scroll-fade-up');
  const bannerRef = useScrollAnimation();

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      value: "+91 73032 69615",
      link: "tel:+917303269615",
      isInternal: false,
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "Chat with our team",
      link: "https://wa.me/917303269615",
      isInternal: false,
    },
    {
      icon: Mail,
      title: "Email Us",
      value: "support@kaunsahostel.com",
      link: "mailto:support@kaunsahostel.com",
      isInternal: false,
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: "Book a property tour",
      link: "/contact",
      isInternal: true,
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F9FAFB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-16 max-w-2xl mx-auto text-center">
          <div ref={headerRef} className="scroll-fade-up">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-yellow-700 bg-yellow-100 rounded-full shadow-sm">
              24/7 Support
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight">
              We're Here to Help
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed px-4">
              Have questions about your booking, a property, or our partnership program? Reach out to our dedicated support team anytime.
            </p>
          </div>
        </div>

        {/* Contact Cards Grid */}
        <div 
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {contactMethods.map((method, index) => {
            const CardWrapper = method.isInternal ? Link : 'a';
            const wrapperProps = method.isInternal 
              ? { to: method.link } 
              : { href: method.link, target: method.link.startsWith('http') ? '_blank' : '_self', rel: 'noopener noreferrer' };

            return (
              <div key={index} className={`scroll-fade-up stagger-${Math.min(index + 1, 6)} h-full`}>
                <CardWrapper
                  {...wrapperProps}
                  className="group flex flex-col items-center text-center h-full p-8 bg-white rounded-3xl shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 transition-all duration-300 relative overflow-hidden hover:-translate-y-2 transform-gpu"
                >
                  {/* Subtle Background Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/0 to-yellow-50/0 group-hover:to-yellow-50/50 transition-colors duration-300" />
                  
                  <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-50 text-yellow-500 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-yellow-100/50">
                    <method.icon size={28} strokeWidth={2} />
                  </div>
                  
                  <h3 className="relative text-xl font-bold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="relative text-gray-500 font-medium mb-8">
                    {method.value}
                  </p>
                  
                  <div className="relative mt-auto flex items-center text-sm font-bold text-yellow-500 group-hover:text-yellow-600 transition-colors duration-200">
                    <span>Connect</span>
                    <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
                  </div>
                </CardWrapper>
              </div>
            );
          })}
        </div>

        {/* Premium Banner Bottom */}
        <div 
          ref={bannerRef}
          className="mt-16 lg:mt-24 scroll-fade-up"
        >
          <div className="bg-gray-900 rounded-3xl p-8 sm:p-10 lg:p-12 relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 border border-gray-800">
            
            {/* Background Decorative Blur */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400 opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            
            <div className="relative z-10 text-center sm:text-left max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Need detailed assistance?
              </h3>
              <p className="text-gray-400 text-lg font-medium">
                Create a formal support ticket for complex inquiries and let our experts handle the rest.
              </p>
            </div>
            
            <div className="relative z-10 w-full sm:w-auto flex-shrink-0">
              <Link
                to="/contact"
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(250,204,21,0.39)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.6)] hover:bg-yellow-300 hover:scale-[1.02] active:scale-[0.98] transform-gpu"
              >
                Open Support Ticket <ArrowRight size={20} className="ml-2" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default TalkToUs;