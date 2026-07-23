import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowUp, 
  ChevronRight, 
  CheckCircle,
  X,
  Sparkles
} from 'lucide-react';

// Custom SVG Brand Icons as Lucide doesn't bundle brand icons in this version
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll listener to toggle "Back to Top" visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000); // Reset message after 5 seconds
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0b0f19] to-[#04050a] text-slate-300 border-t border-white/10 mt-auto pt-16 pb-8 overflow-hidden">
      {/* Dynamic Background Mesh Effect */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full filter blur-[140px] pointer-events-none translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand details */}
          <div className="space-y-6">
            <Link to="/" className="inline-block transition-transform hover:scale-105 duration-300" onClick={scrollToTop}>
              <img
                src="/images/logo.png"
                alt="EventDeco Logo"
                className="h-20 sm:h-24 lg:h-28 w-auto object-contain brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Crafting unforgettable atmospheres for weddings, corporate galas, and private celebrations. Rent premium, industrial-grade decorations and supplies with absolute reliability.
            </p>
            
            {/* Social Icons */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Connect With Us
              </h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com' },
                  { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com' },
                  { icon: TwitterIcon, label: 'Twitter', href: 'https://twitter.com' },
                  { icon: LinkedinIcon, label: 'LinkedIn', href: 'https://linkedin.com' },
                  { icon: YoutubeIcon, label: 'YouTube', href: 'https://youtube.com' }
                ].map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-400 hover:bg-amber-500 hover:text-black transition-all duration-300 hover:-translate-y-1 shadow-md shadow-black/35"
                      aria-label={social.label}
                    >
                      <IconComponent className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 relative pl-3">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3.5">
              {[
                { label: 'Explore Catalog', path: '/catalog' },
                { label: 'Featured Gallery', path: '/catalog?category=all' },
                { label: 'Current Cart', path: '/cart' },
                { label: 'My Bookings', path: '/bookings' },
                { label: 'Admin Terminal', path: '/admin' }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="group flex items-center text-sm text-slate-400 hover:text-amber-400 transition-all duration-200"
                  >
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 mr-1.5 transition-all duration-300 text-amber-400" />
                    <span className="transition-transform group-hover:translate-x-1 duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 relative pl-3">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-full"></span>
              Contact Info
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3.5 text-sm text-slate-400">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-amber-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-200 text-xs font-semibold">Our Showroom</strong>
                  <span className="mt-0.5 block">123 Event Street, New York, NY 10001</span>
                </div>
              </li>
              <li className="flex items-start gap-3.5 text-sm text-slate-400">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-amber-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-200 text-xs font-semibold">Call Support</strong>
                  <a href="tel:+12125550199" className="hover:text-amber-400 transition-colors mt-0.5 block">
                    +1 (212) 555-0199
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3.5 text-sm text-slate-400">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-amber-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-200 text-xs font-semibold">Email Us</strong>
                  <a href="mailto:support@eventdeco.com" className="hover:text-amber-400 transition-colors mt-0.5 block">
                    support@eventdeco.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3.5 text-sm text-slate-400">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-amber-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-200 text-xs font-semibold">Showroom Hours</strong>
                  <span className="mt-0.5 block">Mon-Sat: 9AM - 7PM | Sun: 10AM - 5PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 relative pl-3">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-full"></span>
              Join Newsletter
            </h3>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              Subscribe to stay updated with design trends, new collections, and catalog arrivals.
            </p>
            
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm animate-in zoom-in duration-300">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Awesome! Check your inbox for updates soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0d122b]/50 border border-white/10 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:scale-[1.02] cursor-pointer text-sm tracking-wide"
                >
                  Subscribe Now
                </button>
              </form>
            )}
            
            <div className="mt-5 text-slate-500 text-xs">
              🔒 We value your privacy. Unsubscribe at any time.
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <div className="text-sm text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} EventDeco Inc. All rights reserved. Made for unforgettable memories.
          </div>
          
          {/* Policy Links */}
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setShowTerms(true)}
              className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
          </div>

        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-amber-500 text-black rounded-full shadow-2xl transition-all duration-300 hover:bg-amber-400 hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-bottom-5 cursor-pointer border border-amber-600/30"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5 font-bold" />
        </button>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0d122b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#070914]/80">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                Privacy Policy
              </h2>
              <button 
                onClick={() => setShowPrivacy(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed scrollbar-hide">
              <p>Last updated: July 2026</p>
              <h3 className="text-white font-semibold mt-2">1. Information We Collect</h3>
              <p>We collect information you provide directly, such as when you create an account, make booking requests, contact customer service, or subscribe to our newsletter. This includes name, email address, phone number, and rental booking choices.</p>
              
              <h3 className="text-white font-semibold mt-2">2. How We Use Your Information</h3>
              <p>We use your details to process orders, verify checkout security, improve catalog recommendations, handle logistics for dropoff/pickup, and send promo offers (only if you subscribe). We do not sell your personal data to third parties.</p>
              
              <h3 className="text-white font-semibold mt-2">3. Payment Security</h3>
              <p>All online transaction payments are handled via secure, industry-leading processors (such as Stripe). We do not store credit or debit card data on our internal servers.</p>
              
              <h3 className="text-white font-semibold mt-2">4. Cookies</h3>
              <p>We utilize essential functional cookies to persist your active cart state and keep you securely logged in as you browse our rental catalog.</p>
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#070914]/50 flex justify-end">
              <button 
                onClick={() => setShowPrivacy(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all cursor-pointer text-sm"
              >
                Got It, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0d122b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#070914]/80">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                Terms &amp; Conditions
              </h2>
              <button 
                onClick={() => setShowTerms(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed scrollbar-hide">
              <p>Last updated: July 2026</p>
              <h3 className="text-white font-semibold mt-2">1. Booking and Reservations</h3>
              <p>By placing a rental order, you authorize EventDeco Inc. to block inventory items for the scheduled date. Booking requests are pending confirmation until payment terms are fully satisfied.</p>
              
              <h3 className="text-white font-semibold mt-2">2. Security Deposit &amp; Damage</h3>
              <p>Clients are fully liable for decorations, seating, or audio equipment while on rental. Damage, breakage, or loss of items will incur charges up to the full replacement cost of the items.</p>
              
              <h3 className="text-white font-semibold mt-2">3. Rental Duration &amp; Late Returns</h3>
              <p>Standard rentals are calculated on a daily rate. Late returns will be subject to automatic extensions and additional billing matching our standard rate structure.</p>
              
              <h3 className="text-white font-semibold mt-2">4. Cancellation &amp; Refund Policy</h3>
              <p>Cancellations made more than 7 days prior to the event are eligible for a full refund. Cancellations made within 7 days are subject to a 50% reservation hold fee.</p>
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#070914]/50 flex justify-end">
              <button 
                onClick={() => setShowTerms(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all cursor-pointer text-sm"
              >
                Accept &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};
