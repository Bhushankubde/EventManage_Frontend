import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Lightbulb, Layers, Armchair, Sparkles, ArrowRight, ShoppingCart, User, Phone, Mail } from 'lucide-react';
import { CatalogSection } from '../components/CatalogSection';


const HomePage = () => {
  return (
    <div className="w-full flex flex-col min-h-screen pb-20 bg-gradient-to-b from-[#090b16] via-[#0d1430] to-[#05060b] text-white">
      {/* Hero Section */}
      <section className="relative w-full py-40 text-center overflow-hidden flex items-center justify-center min-h-[550px]">
        {/* Background Image: Original, no blur color overlay, fully vibrant */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: "url('/images/event-img.jpeg')",
          }}
        ></div>

        {/* Subtle, premium gradient overlay to blend into the dark page background and ensure white text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#090b16]"></div>
        <div className="relative z-10 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 w-full">


          {/* Tagline badge */}
          <span className="text-amber-400 text-xs md:text-sm font-bold uppercase tracking-widest
                           bg-amber-500/10 px-5 py-1.5 rounded-full border border-amber-500/25
                           mb-10 backdrop-blur-md shadow-[0_0_18px_rgba(245,158,11,0.12)]">
            Events, Rentals &amp; Local Shopping Hub
          </span>

          {/* Contact pills */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 mb-10 text-base font-medium text-slate-300">
            <div className="flex items-center gap-2.5 bg-black/25 px-5 py-2 rounded-full border border-white/8 backdrop-blur-sm">
              <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>+1 (234) 567-8900</span>
            </div>
            <div className="flex items-center gap-2.5 bg-black/25 px-5 py-2 rounded-full border border-white/8 backdrop-blur-sm">
              <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>info@eventdeco.com</span>
            </div>
          </div>

        </div>
      </section>

      {/* Info Bar */}
      <section className="w-full border-y border-white/5 bg-[#0d122b]/50 backdrop-blur-md relative z-10">
        <div className="max-w-5xl mx-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x divide-white/10">
          <div className="flex items-center justify-center md:justify-start gap-5 px-4 md:px-12">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white text-lg">Our Location</h3>
              <p className="text-slate-300 text-sm mt-1">123 Event Street, New York, NY 10001</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-5 px-4 md:px-12">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white text-lg">Store Hours</h3>
              <p className="text-slate-300 text-sm mt-1">Mon-Sat: 9AM - 7PM | Sun: 10AM - 5PM</p>
            </div>
          </div>
        </div>
      </section>

      <CatalogSection />
    </div>
  );
};

export default HomePage;
