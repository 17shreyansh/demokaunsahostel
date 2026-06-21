import { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const TermsOfService = memo(() => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Terms of Service - KaunsaHostel</title>
        <meta name="description" content="Read KaunsaHostel's Terms of Service. By using our website and services, you agree to these terms and conditions." />
        <link rel="canonical" href="https://kaunsahostel.com/terms" />
        <meta property="og:title" content="Terms of Service - KaunsaHostel" />
        <meta property="og:description" content="Read KaunsaHostel's Terms of Service." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kaunsahostel.com/terms" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Please read these terms carefully before using our services.
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
              Agreement to Terms
            </h2>
            <p className="mb-6">
              By accessing our website and using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-sm">2</span>
              User Accounts
            </h2>
            <p className="mb-4">
              When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You are responsible for safeguarding the password that you use to access the Service.</li>
              <li>You agree not to disclose your password to any third party.</li>
              <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-sm">3</span>
              Booking and Payments
            </h2>
            <p className="mb-6">
              All bookings made through our platform are subject to availability and acceptance by the respective hostel owners. We facilitate the booking process but the actual accommodation agreement is directly between you and the hostel owner. Prices are subject to change without notice.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-sm">4</span>
              Prohibited Activities
            </h2>
            <p className="mb-4">
              You may not access or use the Service for any purpose other than that for which we make the Service available. As a user, you agree not to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Systematically retrieve data or other content from the Service to create or compile a collection, compilation, database, or directory.</li>
              <li>Trick, defraud, or mislead us and other users.</li>
              <li>Interfere with, disrupt, or create an undue burden on the Service or the networks or services connected to the Service.</li>
            </ul>

            <div className="bg-yellow-50 rounded-xl p-6 mt-10 border border-yellow-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Questions?
              </h3>
              <p className="text-gray-700 text-sm m-0">
                If you have any questions about these Terms, please contact us at <a href="mailto:support@kaunsahostel.com" className="text-blue-600 hover:underline font-medium">support@kaunsahostel.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

TermsOfService.displayName = 'TermsOfService';

export default TermsOfService;
