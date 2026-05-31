import React from 'react';
import { WhyUsCard } from '../src_components_index';
import { whyUsItems } from '../../data/src_data_index';
import SectionHeader from './SectionHeader';

const WhyUsSection: React.FC = () => (
  <section className="bg-[#0B0B0B] py-16 md:py-24 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Why Cossack" light />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {whyUsItems.map((item, i) => (
          <WhyUsCard key={i} {...item} />
        ))}
      </div>
    </div>
  </section>
);

export default React.memo(WhyUsSection);
