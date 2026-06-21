import { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = memo(() => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Privacy Policy - Kaunsa Hostel</title>
        <meta name="description" content="Privacy Policy for Kaunsa Hostel" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gray-900 py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-custom/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="w-20 h-20 mx-auto mb-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-xl">
              <svg className="w-10 h-10 text-yellow-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              How we collect, use, and protect your personal information at Kaunsa Hostel.
            </p>
            <div className="w-24 h-1 bg-yellow-custom mx-auto rounded"></div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-sm">1</span>
              Information We Collect
            </h2>
            <p className="mb-4">
              We collect information that you provide directly to us when you register for an account, 
              book a hostel, subscribe to our newsletter, or contact our support team.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Name, email address, and phone number</li>
              <li>Government ID (for verification purposes)</li>
              <li>Payment and transaction details</li>
              <li>Communication history with our support team</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-sm">2</span>
              How We Use Your Information
            </h2>
            <p className="mb-4">
              We use the information we collect to operate, maintain, and provide you with the features and functionality of the Service, as well as to communicate directly with you.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>To process your bookings and payments securely</li>
              <li>To send booking confirmations and updates</li>
              <li>To respond to your inquiries and support requests</li>
              <li>To improve our services and user experience</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-sm">3</span>
              Data Security
            </h2>
            <p className="mb-6">
              We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
            </p>

            <div className="bg-yellow-50 rounded-xl p-6 mt-10 border border-yellow-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Contact Us About Privacy
              </h3>
              <p className="text-gray-700 text-sm m-0">
                If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@kaunsahostel.com" className="text-blue-600 hover:underline font-medium">privacy@kaunsahostel.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

PrivacyPolicy.displayName = 'PrivacyPolicy';

export default PrivacyPolicy;
