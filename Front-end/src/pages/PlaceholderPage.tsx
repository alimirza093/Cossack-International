import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components/src_components_index';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => (
  <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
    <Navbar logo="COSSACK" />
    <main className="px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="section-accent" />
          <h1 className="section-title">{title}</h1>
        </div>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">{description}</p>
        <Link to="/" className="btn-primary inline-block text-sm">
          Continue Shopping
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default PlaceholderPage;
