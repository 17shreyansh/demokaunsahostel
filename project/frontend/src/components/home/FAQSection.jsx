import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/faqs`);
        if (response.data.success) {
          setFaqs(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: "easeOut", duration: 0.5 }
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-[#F9FAFB] font-sans relative overflow-hidden">
      
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: "easeOut", duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-yellow-700 bg-yellow-100 rounded-full shadow-sm">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about finding your perfect hostel, booking process, and our services.
            </p>
          </motion.div>
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-yellow-400 border-t-transparent"></div>
          </div>
        ) : faqs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-500 text-lg font-medium">No FAQs available at the moment.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div 
                  key={faq._id || index} 
                  variants={itemVariants}
                  className={`bg-white border rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-yellow-300 shadow-md shadow-yellow-100/50' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 sm:p-6 sm:px-8 flex items-center justify-between text-left group focus:outline-none"
                  >
                    <span className={`font-bold text-base sm:text-lg pr-6 transition-colors duration-300 ${
                      isOpen ? 'text-yellow-600' : 'text-gray-900 group-hover:text-yellow-600'
                    }`}>
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen ? 'bg-yellow-100 text-yellow-600 rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-yellow-50 group-hover:text-yellow-500'
                    }`}>
                      <ChevronDown size={20} strokeWidth={2.5} />
                    </div>
                  </button>
                  
                  {/* Smooth Height Animation using Framer Motion */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
                          <div className="h-px w-full bg-gray-100 mb-5"></div>
                          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default FAQSection;