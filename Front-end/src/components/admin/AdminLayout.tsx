import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../src_components_index';
import { MobileAdminNav } from './MobileAdminNav';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

type AdminNavKey = 'dashboard' | 'products' | 'categories' | 'orders';

const NAV: Array<{ key: AdminNavKey; label: string; href: string; icon: string }> = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { key: 'products', label: 'Products', href: '/admin/products', icon: 'inventory_2' },
  { key: 'categories', label: 'Categories', href: '/admin/categories', icon: 'category' },
  { key: 'orders', label: 'Orders', href: '/admin/orders', icon: 'receipt_long' },
];

function getActiveKey(pathname: string): AdminNavKey {
  if (pathname.startsWith('/admin/products')) return 'products';
  if (pathname.startsWith('/admin/categories')) return 'categories';
  if (pathname.startsWith('/admin/orders')) return 'orders';
  return 'dashboard';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const activeKey = useMemo(() => getActiveKey(pathname), [pathname]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar logo="COSSACK" />
      <div className="flex">
        <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0B0B0B] border-r border-zinc-800 min-h-[calc(100vh-64px)] pt-4">
          <nav className="px-3 space-y-1 flex-1">
            {NAV.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-sm border transition-colors ${
                    isActive
                      ? 'bg-[#39FF14]/10 border-[#39FF14]/50 text-white'
                      : 'bg-transparent border-transparent text-zinc-400 hover:border-zinc-800 hover:text-white'
                  }`}
                >
                  <span className="material-icons-round text-base text-[#39FF14]">{item.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-3 pb-4">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-sm border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#39FF14]/50 transition-colors"
            >
              <span className="material-icons-round text-base text-[#39FF14]">logout</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </aside>
        <div className="w-full">
          <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <MobileAdminNav activeKey={activeKey} onLogout={handleLogout} />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

