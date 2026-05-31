import React, { useState } from 'react';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-zinc-100">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="section-accent" />
          <h2 className="section-title">Stay in the Loop</h2>
          <div className="section-accent" />
        </div>
        <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
          Get drops, manufacturing insights, and exclusive offers — no spam, just precision.
        </p>
        {submitted ? (
          <p className="text-sm font-bold text-[#0B0B0B] flex items-center justify-center gap-2">
            <span className="material-icons-round text-[#39FF14]">check_circle</span>
            Thanks — you&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
            />
            <button type="submit" className="btn-primary shrink-0 text-xs sm:text-sm px-8">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
