import React from 'react';
import { Link } from 'react-router-dom';

interface MobileAdminNavProps {
  activeKey: 'dashboard' | 'products' | 'categories' | 'orders';
  onLogout: () => void;
}

const ITEMS: Array<{
  key: MobileAdminNavProps['activeKey'];
  label: string;
  href: string;
  icon: string;
}> = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { key: 'products', label: 'Products', href: '/admin/products', icon: 'inventory_2' },
  { key: 'categories', label: 'Categories', href: '/admin/categories', icon: 'category' },
  { key: 'orders', label: 'Orders', href: '/admin/orders', icon: 'receipt_long' },
];

export const MobileAdminNav: React.FC<MobileAdminNavProps> = ({ activeKey, onLogout }) => (
  <nav className="lg:hidden mb-6 bg-[#0B0B0B] border border-zinc-800 rounded-sm p-2">
    <div className="grid grid-cols-2 gap-1">
      {ITEMS.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Link
            key={item.key}
            to={item.href}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-sm border transition-colors ${
              isActive
                ? 'bg-[#39FF14]/10 border-[#39FF14]/50 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <span className="material-icons-round text-sm text-[#39FF14]">{item.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onLogout}
        className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#39FF14]/50 transition-colors"
      >
        <span className="material-icons-round text-sm text-[#39FF14]">logout</span>
        <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
      </button>
    </div>
  </nav>
);
