import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Footer, Navbar } from '../components/src_components_index';

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const orderId = (location.state as { orderId?: string } | null)?.orderId;

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto bg-white border border-zinc-100 rounded-sm py-16 px-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center mb-5">
            <span className="material-icons-round text-4xl text-[#0B0B0B]">check_circle</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-[#0B0B0B] mb-2">
            Order created successfully
          </h1>
          {orderId && (
            <p className="text-xs text-zinc-500 mb-2 break-all">
              Order ID: {orderId}
            </p>
          )}
          <p className="text-sm text-zinc-500 mb-7">Thank you for your purchase.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-primary inline-block text-sm">
              Continue Shopping
            </Link>
            <Link to="/orders" className="inline-block text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors">
              View Orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
