import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Work from './components/Work';
import Process from './components/Process';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Cursor from './components/ui/Cursor';
import PrivacyPolicy from './pages/PolicyPage';
import TermsOfService from './pages/TermsPage';
import WebApps from './pages/WebApps';
import MobileApps from './pages/MobileApps';
import WebsitesPage from './pages/WebsitesPage';
import DesignPage from './pages/DesignPage';
import AboutPage from './pages/AboutPage';
import WorkPage from './pages/WorkPage';
import ProcessPage from './pages/ProcessPage';
import ContactPage from './pages/InquiryPage';
import NotFound from './pages/NotFound';

function Home() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <Cursor />
      <Navbar />
      <Hero />
      <Services />
      <Work />
      <About />
      <Process />
      <CTA />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/web-applications" element={<WebApps />} />
      <Route path="/mobile-apps" element={<MobileApps />} />
      <Route path="/websites" element={<WebsitesPage />} />
      <Route path="/ui-ux-design" element={<DesignPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/process" element={<ProcessPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
