import React from 'react';
import { Footer, Navbar } from '../components/src_components_index';

const Collections: React.FC = () => (
  <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
    <Navbar logo="COSSACK" />
    <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="section-accent" />
          <h1 className="section-title">Collections</h1>
        </div>
        <div className="bg-white border border-zinc-100 rounded-sm p-6 sm:p-8">
          <p className="text-sm text-zinc-500">
            Collections are coming soon.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Collections;

