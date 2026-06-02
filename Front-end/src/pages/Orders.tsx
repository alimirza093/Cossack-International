import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer, Navbar } from '../components/src_components_index';
import Toast from '../components/ui/Toast';
import { getMyOrders, getOrderErrorMessage } from '../api/orderService';
import type { Order, OrderStatus } from '../types/api';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

const OrdersSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white border border-zinc-100 rounded-sm p-5 animate-pulse">
        <div className="h-4 bg-zinc-100 rounded w-1/3 mb-3" />
        <div className="h-3 bg-zinc-100 rounded w-1/2 mb-2" />
        <div className="h-3 bg-zinc-100 rounded w-1/4" />
      </div>
    ))}
  </div>
);

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(getOrderErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar logo="COSSACK" />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter mb-8">
            My Orders
          </h1>

          {loading ? (
            <OrdersSkeleton />
          ) : orders.length === 0 ? (
            <div className="bg-white border border-zinc-100 rounded-sm py-16 px-6 text-center max-w-3xl mx-auto">
              <div className="w-20 h-20 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-5">
                <span className="material-icons-round text-4xl text-zinc-400">inventory_2</span>
              </div>
              <h2 className="text-xl font-black uppercase italic tracking-tight text-[#0B0B0B] mb-2">
                No orders yet
              </h2>
              <p className="text-sm text-zinc-500 mb-7">Start shopping to place your first order.</p>
              <Link to="/" className="btn-primary inline-block text-sm">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="bg-white border border-zinc-100 rounded-sm p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Order ID
                      </p>
                      <p className="text-sm font-bold text-[#0B0B0B] break-all">{order.id}</p>
                    </div>
                    <span
                      className={`inline-flex w-fit px-2.5 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Date</p>
                      <p className="text-sm font-medium text-[#0B0B0B]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Total Items</p>
                      <p className="text-sm font-medium text-[#0B0B0B]">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Total Price</p>
                      <p className="text-sm font-black text-[#0B0B0B]">${toNumber(order.total_price).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Link to={`/orders/${order.id}`} className="btn-primary inline-block text-sm">
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </div>
  );
};

export default Orders;
