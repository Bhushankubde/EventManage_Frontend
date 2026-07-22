import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { CatalogSection } from '../components/CatalogSection';

const HomePage = () => {
  return (
    <div className="w-full flex flex-col min-h-screen pb-20 bg-gradient-to-b from-[#090b16] via-[#0d1430] to-[#05060b] text-white">
      {/* Hero Section */}
      <section className="relative w-full pt-36 pb-20 text-center overflow-hidden flex items-center justify-center min-h-[550px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: "url('/images/event-img.jpeg')",
          }}
        ></div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-[#090b16]"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 w-full">
          {/* Subtitle Badge */}
          <span className="text-amber-400 text-xs md:text-sm font-bold uppercase tracking-widest
                           bg-amber-500/10 px-5 py-1.5 rounded-full border border-amber-500/25
                           mb-6 backdrop-blur-md shadow-[0_0_18px_rgba(245,158,11,0.12)]">
            Wedding &middot; Birthday &middot; Corporate
          </span>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            Every event, beautifully arranged.
          </h1>

          {/* Subtext */}
          <p className="text-slate-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8 drop-shadow">
            Browse decor, DJ setups, chairs and event supplies &mdash; no login needed until you&apos;re ready to book.
          </p>

          {/* Browse Categories CTA */}
          <Link
            to="/catalog"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3.5 rounded-full text-lg shadow-lg hover:shadow-amber-500/25 transition-all hover:scale-105"
          >
            Browse Categories
          </Link>
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
