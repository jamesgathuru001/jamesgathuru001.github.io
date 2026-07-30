import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Lazy: /work and the case studies are separate journeys. Shipping them in the
// landing bundle meant every first-time visitor downloaded both before the hero
// painted. App stays eager — it IS the first paint.
const WorkPage = lazy(() => import('./pages/WorkPage.jsx'));
const CaseStudy = lazy(() => import('./pages/CaseStudy.jsx'));

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      {/* No spinner: these chunks resolve in a frame or two on any real
          connection, and a flash of loading UI reads worse than nothing. */}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          {/* Unknown paths fall back to the landing page rather than a dead end. */}
          <Route path="*" element={<App />} />
        </Routes>
      </Suspense>
    </>
  );
}
