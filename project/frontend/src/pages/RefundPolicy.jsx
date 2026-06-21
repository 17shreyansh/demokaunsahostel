import { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const RefundPolicy = memo(() => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Refund Policy - Kaunsa Hostel</title>
        <meta name="description" content="Refund and Cancellation Policy for Kaunsa Hostel" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Clear and transparent guidelines for cancellations and refunds.
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
              General Cancellation Terms
            </h2>
            <p className="mb-4">
              We understand that plans can change. Our cancellation policy is designed to be fair to both our users and our partner hostels. By making a booking through Kaunsa Hostel, you agree to the following terms:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Cancellations must be made directly through your Kaunsa Hostel account or by contacting our support team.</li>
              <li>The time of cancellation is determined by the time we receive your written notification.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-sm">2</span>
              Refund Eligibility
            </h2>
            <p className="mb-4">
              Refunds are processed based on how far in advance you cancel your booking before the scheduled move-in date:
            </p>
            <ul className="list-none pl-0 mb-6 space-y-4">
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <div className="w-2 h-2 mt-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900 block">15+ Days Before Move-in</strong>
                  <span className="text-gray-600">Full refund of the booking amount, minus a small processing fee.</span>
                </div>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <div className="w-2 h-2 mt-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900 block">7-14 Days Before Move-in</strong>
                  <span className="text-gray-600">50% refund of the booking amount.</span>
                </div>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-lg">
                <div className="w-2 h-2 mt-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <strong className="text-gray-900 block">Less Than 7 Days Before Move-in</strong>
                  <span className="text-gray-600">No refund will be provided for cancellations within this period.</span>
                </div>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-sm">3</span>
              Processing Time
            </h2>
            <p className="mb-6">
              Approved refunds will be processed within 5-7 business days. The amount will be credited back to the original method of payment. Depending on your bank or credit card provider, it may take additional time for the funds to appear in your account.
            </p>

            <div className="bg-yellow-50 rounded-xl p-6 mt-10 border border-yellow-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Need to Cancel?
              </h3>
              <p className="text-gray-700 text-sm m-0">
                To request a cancellation or if you have questions about your eligibility for a refund, please contact us at <a href="mailto:support@kaunsahostel.com" className="text-blue-600 hover:underline font-medium">support@kaunsahostel.com</a> with your booking ID.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

RefundPolicy.displayName = 'RefundPolicy';

export default RefundPolicy;
