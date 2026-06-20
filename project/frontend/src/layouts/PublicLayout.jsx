import { Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Chatbot = lazy(() => import('../components/Chatbot'));

/**
 * PublicLayout — Shared layout wrapper for all public-facing routes.
 * 
 * Benefits:
 * 1. Header and Footer render ONCE and persist across route changes
 *    (no unmount/remount, no repeated API calls from Footer)
 * 2. PageTransition wraps only the page content, enabling smooth
 *    CSS-only fade+slide animation on every route change
 * 3. Chatbot is loaded lazily and persists across navigations
 */
const PublicLayout = () => {
  return (
    <>
      <Header />
      <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
        <PageTransition />
      </Suspense>
      <Footer />
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </>
  );
};

export default PublicLayout;
