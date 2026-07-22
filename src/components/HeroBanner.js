import React from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';

export const HeroBanner = () => {
  return (
    <div className="w-full bg-[#fbf2ee] pt-32 pb-10 px-6 sm:px-12 lg:px-20 border-b-8 border-dotted border-[#e7d4b5] transition-all">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Column: Text & CTA */}
        <div className="flex-1 max-w-2xl text-left">
          <p className="text-[#c87a68] text-sm sm:text-base font-normal tracking-wide mb-3">
            Wedding &middot; Birthday &middot; Corporate
          </p>
          
          <h1 className="text-[#3d1429] text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold tracking-tight leading-tight mb-4">
            Every event, beautifully arranged.
          </h1>
          
          <p className="text-[#6e6360] text-base sm:text-lg leading-relaxed mb-8">
            Browse decor, DJ setups, chairs and event supplies &mdash; no login needed until you&apos;re ready to book.
          </p>
          
          <Link
            to="/catalog"
            className="inline-block bg-[#4a1525] hover:bg-[#360d19] text-white text-sm sm:text-base font-semibold px-7 py-3 rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
          >
            Browse Categories
          </Link>
        </div>

        {/* Right Column: Decorative Gold Card with Party Popper */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="w-56 h-48 sm:w-64 sm:h-52 bg-[#f6dfab] rounded-t-3xl rounded-b-[4rem] flex items-center justify-center shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-center p-4">
              <PartyPopper className="w-16 h-16 text-[#3d1429] stroke-[1.8]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroBanner;
