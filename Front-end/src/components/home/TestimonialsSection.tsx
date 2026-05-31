import React from 'react';
import { testimonials } from '../../data/src_data_index';
import SectionHeader from './SectionHeader';

const TestimonialsSection: React.FC = () => (
  <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="What Clients Say" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {testimonials.map((item) => (
          <blockquote
            key={item.id}
            className="p-6 sm:p-8 bg-zinc-50 border border-zinc-100 rounded-sm hover:border-[#39FF14]/30 hover:shadow-[0_0_25px_rgba(57,255,20,0.08)] transition-all duration-300"
          >
            <span className="material-icons-round text-[#39FF14] text-2xl mb-4 block">format_quote</span>
            <p className="text-sm text-zinc-600 leading-relaxed mb-6">&ldquo;{item.quote}&rdquo;</p>
            <footer>
              <p className="text-[#0B0B0B] font-black text-xs uppercase italic tracking-wider">
                {item.name}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">{item.role}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  </section>
);

export default React.memo(TestimonialsSection);
