const mongoose = require('mongoose');
const FAQ = require('./models/FAQ');
require('dotenv').config();

const defaultFAQs = [
  {
    question: "How do I book a hostel?",
    answer: "Simply browse our verified hostels, select your preferred accommodation, and click on 'Book Now'. You can either book a free visit to check the hostel first or directly book a bed. Fill in your details, make the payment, and you're all set!",
    category: "Booking",
    order: 1
  },
  {
    question: "Are all hostels verified?",
    answer: "Yes, absolutely! Every hostel listed on our platform is personally verified by our team. We check for safety standards, amenities, hygiene, and overall quality before listing them.",
    category: "Safety",
    order: 2
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods including UPI, Credit/Debit Cards, Net Banking, and digital wallets. You can also opt for installment payments for certain hostels.",
    category: "Payment",
    order: 3
  },
  {
    question: "Can I visit the hostel before booking?",
    answer: "Yes! We offer free hostel visits. You can book a visit slot, and our team or the hostel manager will give you a complete tour. This helps you make an informed decision.",
    category: "Booking",
    order: 4
  },
  {
    question: "What is your cancellation policy?",
    answer: "Cancellation policies vary by hostel. Generally, you can cancel up to 48 hours before check-in for a full refund. Please check the specific hostel's cancellation policy on their details page.",
    category: "Policy",
    order: 5
  },
  {
    question: "Is food included in the hostel fees?",
    answer: "Food inclusion varies by hostel. Some hostels include meals in their pricing, while others offer optional meal plans. Check the amenities section on each hostel's page for detailed information.",
    category: "Amenities",
    order: 6
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach us 24/7 through phone, WhatsApp, email, or our chat support. Our team is always ready to assist you with any queries or concerns.",
    category: "Support",
    order: 7
  },
  {
    question: "Can I change my hostel after booking?",
    answer: "Yes, hostel change requests can be submitted through your dashboard. The request will be reviewed by our team, and you'll be notified within 24-48 hours. Terms and conditions apply.",
    category: "Policy",
    order: 8
  }
];

async function seedFAQs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    console.log('Connected to MongoDB');

    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs');

    await FAQ.insertMany(defaultFAQs);
    console.log('Successfully seeded FAQs');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();
