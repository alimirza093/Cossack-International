import React, { useState } from 'react';
import { Footer, Navbar } from '../components/src_components_index';
import Toast, { type ToastType } from '../components/ui/Toast';

type ToastState = { message: string; type: ToastType } | null;

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setToast({ message: 'Please fill in all fields.', type: 'error' });
      return;
    }
    setToast({ message: 'Message sent successfully.', type: 'success' });
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="section-accent" />
            <h1 className="section-title">Contact</h1>
          </div>
          <div className="bg-white border border-zinc-100 rounded-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                  Name
                </label>
                <input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm text-[#0B0B0B] focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm text-[#0B0B0B] focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm text-[#0B0B0B] focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors resize-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full text-sm">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Contact;

