import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Layers, Armchair, Sparkles, ArrowRight } from 'lucide-react';

export const CatalogSection = () => {
  const categories = [
    {
      id: 'lighting',
      name: 'Lighting & FX',
      description: 'Professional stage lights, glowing ambient uplighting, and string fairy lights.',
      icon: Lightbulb,
      colorClass: 'from-blue-500/10 to-amber-500/10 border-blue-500/20 hover:border-amber-400/50 text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'staging',
      name: 'Staging & Truss',
      description: 'Heavy-duty platforms, structural trusses, and secure rigging systems.',
      icon: Layers,
      colorClass: 'from-indigo-500/10 to-blue-500/10 border-indigo-500/20 hover:border-blue-400/50 text-blue-400',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 'seating',
      name: 'Seating & Tables',
      description: 'Elegant banquet seating, modern bar stools, and polished reception tables.',
      icon: Armchair,
      colorClass: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-pink-400/50 text-pink-400',
      iconBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    },
    {
      id: 'decor',
      name: 'Decor & Props',
      description: 'Themed backdrop frames, luxury floral arches, and stunning centerpieces.',
      icon: Sparkles,
      colorClass: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-teal-400/50 text-teal-400',
      iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
  ];

  return (
    <section className="w-full py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-gradient-to-b from-[#0a0c1f] via-[#151726] to-[#090b16]">
      <div className="max-w-[1600px] mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 text-sm font-bold uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">Our Catalog</span>
          <h2 className="text-4xl font-extrabold text-white mt-4 mb-4 tracking-tight">Browse by Category</h2>
          <p className="text-slate-400 text-lg">Select a category to view our premium inventory and book high-quality equipment for your next event.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                className={`group flex flex-col p-8 rounded-2xl bg-gradient-to-br ${cat.colorClass} border backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
              >
                <div className={`w-14 h-14 rounded-xl ${cat.iconBg} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  {cat.name}
                </h3>
                <p className="text-slate-400 text-base leading-relaxed mb-6 flex-grow">
                  {cat.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity duration-300 mt-auto">
                  <span>Explore Items</span>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
