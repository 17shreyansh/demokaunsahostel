import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageCircle, 
  FiX, 
  FiSend, 
  FiMapPin, 
  FiDollarSign, 
  FiStar, 
  FiSearch, 
  FiPhone,
  FiHome
} from 'react-icons/fi';
import { BsWhatsapp, BsRobot } from 'react-icons/bs';
import './Chatbot.css';

/* -------------------------------------------------------------------------- */
/* STATIC ASSETS (Prevents Memory Reallocation on every keystroke)            */
/* -------------------------------------------------------------------------- */
const INITIAL_MESSAGE = { 
  id: 'init-1', 
  text: "Hi! I'm your Greater Noida hostel assistant. How can I help you find accommodation near your college?", 
  sender: 'bot', 
  timestamp: new Date() 
};

const QUICK_REPLIES = [
  { id: 'qr-1', text: "Hostels near my college", icon: FiHome },
  { id: 'qr-2', text: "Budget options", icon: FiDollarSign },
  { id: 'qr-3', text: "Premium hostels", icon: FiStar },
  { id: 'qr-4', text: "Greater Noida areas", icon: FiMapPin },
  { id: 'qr-5', text: "Compare hostels", icon: FiSearch },
  { id: 'qr-6', text: "Talk to expert", icon: FiPhone }
];

const ADVANCED_RESPONSES = {
  "hostels near my college": {
    text: "Which college in Greater Noida are you studying at?",
    followUp: ["Sharda University", "Bennett University", "Galgotias University", "GNIOT", "Other college"]
  },
  "budget options": {
    text: "What's your monthly budget for hostel in Greater Noida?",
    followUp: ["₹4,000-6,000", "₹6,000-8,000", "₹8,000-12,000", "Above ₹12,000"]
  },
  "premium hostels": {
    text: "Which amenities do you need in Greater Noida hostels?",
    followUp: ["AC Rooms", "Wi-Fi & Study Area", "Mess Facility", "All Amenities"]
  },
  "greater noida areas": {
    text: "Which area in Greater Noida do you prefer?",
    followUp: ["Knowledge Park", "Techzone", "Sector Omega", "Sector Alpha", "Near Metro"]
  },
  "compare hostels": {
    text: "What's most important for your Greater Noida stay?",
    followUp: ["Price vs Amenities", "Distance to College", "Safety & Security", "Food Quality"]
  },
  "talk to expert": {
    text: "I'll connect you with our Greater Noida hostel expert!",
    isWhatsApp: true
  }
};

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

// Memoized to prevent re-renders when user types in the input box
const ChatMessage = memo(({ message, onSendMessage, onWhatsAppRedirect }) => (
  <div className={`message ${message.sender}`}>
    {message.sender === 'bot' && (
      <div className="bot-avatar">
        <BsRobot size={14} />
      </div>
    )}
    <div className="message-content">
      <div className="message-bubble">
        {message.text}
        {message.isWhatsApp && (
          <button 
            className="whatsapp-btn transform-gpu will-change-transform"
            onClick={onWhatsAppRedirect}
          >
            <BsWhatsapp size={14} />
            Continue on WhatsApp
          </button>
        )}
      </div>
      {message.followUp && (
        <div className="follow-up-buttons">
          {message.followUp.map((option, index) => (
            <button
              key={`followup-${message.id}-${index}`}
              className="follow-up-btn transform-gpu will-change-transform"
              onClick={() => onSendMessage(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
));
ChatMessage.displayName = 'ChatMessage';

const TypingIndicator = memo(() => (
  <div className="message bot transform-gpu">
    <div className="bot-avatar">
      <BsRobot size={14} />
    </div>
    <div className="typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  </div>
));
TypingIndicator.displayName = 'TypingIndicator';

const QuickRepliesGrid = memo(({ onQuickReply }) => (
  <div className="quick-replies">
    <div className="quick-replies-grid">
      {QUICK_REPLIES.map((reply) => {
        const IconComponent = reply.icon;
        return (
          <button
            key={reply.id}
            className="quick-reply-btn transform-gpu will-change-transform"
            onClick={() => onQuickReply(reply)}
          >
            <IconComponent size={16} />
            <span>{reply.text}</span>
          </button>
        );
      })}
    </div>
  </div>
));
QuickRepliesGrid.displayName = 'QuickRepliesGrid';


/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [conversationStep, setConversationStep] = useState(0);
  
  const messagesEndRef = useRef(null);
  const isMountedRef = useRef(true);

  // Track mount status to prevent async memory leaks
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const simulateTyping = useCallback(() => {
    setIsTyping(true);
    return new Promise(resolve => {
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsTyping(false);
          resolve();
        }
      }, 1000);
    });
  }, []);

  const handleWhatsAppRedirect = useCallback(() => {
    const message = "Hi! I was chatting with your Greater Noida hostel assistant and I'm interested in finding accommodation near my college.";
    const whatsappUrl = `https://wa.me/918595948615?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, []);

  const handleCallRedirect = useCallback(() => {
    window.open('tel:+918595948615', '_self');
  }, []);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    
    const userMessage = { 
      id: `msg-${Date.now()}`, 
      text, 
      sender: 'user', 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    await simulateTyping();
    if (!isMountedRef.current) return;
    
    let botResponse = "Let me connect you with our Greater Noida hostel expert for detailed assistance.";
    
    if (conversationStep >= 2) {
      botResponse = "Perfect! Our Greater Noida expert can help you with college-specific hostel recommendations and bookings.";
    }
    
    const botMessage = { 
      id: `msg-${Date.now() + 1}`, 
      text: botResponse, 
      sender: 'bot', 
      timestamp: new Date(),
      isWhatsApp: conversationStep >= 1
    };
    
    setMessages(prev => [...prev, botMessage]);
    setConversationStep(prev => prev + 1);
  }, [conversationStep, simulateTyping]);

  const handleQuickReply = useCallback(async (reply) => {
    const userMessage = { 
      id: `msg-${Date.now()}`, 
      text: reply.text, 
      sender: 'user', 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setShowQuickReplies(false);
    
    await simulateTyping();
    if (!isMountedRef.current) return;
    
    const response = ADVANCED_RESPONSES[reply.text.toLowerCase()];
    if (response) {
      const botMessage = { 
        id: `msg-${Date.now() + 1}`, 
        text: response.text, 
        sender: 'bot', 
        timestamp: new Date(),
        followUp: response.followUp,
        isWhatsApp: response.isWhatsApp
      };
      setMessages(prev => [...prev, botMessage]);
      setConversationStep(prev => prev + 1);
    }
  }, [simulateTyping]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
    }
  }, [inputValue, handleSendMessage]);

  return (
    <>
      <motion.div 
        className={`chat-icon ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ willChange: 'transform, background-color' }}
      >
        {isOpen ? <FiX size={20} /> : <FiMessageCircle size={20} />}
        {!isOpen && <div className="notification-dot"></div>}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="chat-header">
              <div className="avatar">
                <BsRobot size={18} />
              </div>
              <div className="header-info">
                <h4>Greater Noida Hostels</h4>
                <span className="status">Online</span>
              </div>
              <button 
                className="call-icon-btn"
                onClick={handleCallRedirect}
                aria-label="Call us"
              >
                <FiPhone size={18} />
              </button>
            </div>
          
            <div className="chat-messages">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onSendMessage={handleSendMessage}
                  onWhatsAppRedirect={handleWhatsAppRedirect}
                />
              ))}
              
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
            
            {showQuickReplies && (
              <QuickRepliesGrid onQuickReply={handleQuickReply} />
            )}
            
            <div className="chat-input">
              <div className="input-container">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isTyping}
                />
                <button
                  className="send-btn transform-gpu will-change-transform"
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  aria-label="Send message"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(Chatbot);