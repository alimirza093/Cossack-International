import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../src_components_index';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B] flex flex-col">
    <Navbar logo="COSSACK" />
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="section-accent" />
            <h1 className="section-title text-xl md:text-2xl">{title}</h1>
          </div>
          {subtitle && <p className="text-zinc-500 text-sm leading-relaxed">{subtitle}</p>}
        </div>
        <div className="bg-white border border-zinc-100 rounded-sm p-6 sm:p-8 shadow-sm">
          {children}
        </div>
        <p className="text-center mt-6 text-xs text-zinc-500">
          <Link to="/" className="hover:text-[#39FF14] transition-colors font-bold uppercase tracking-widest">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default AuthLayout;
