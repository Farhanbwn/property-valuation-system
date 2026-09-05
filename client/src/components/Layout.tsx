import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Calculator, Map, History, Settings } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Property Valuation', href: '/property-valuation', icon: Calculator },
    { name: 'Land Valuation', href: '/land-valuation', icon: Map },
    { name: 'History', href: '/valuation-history', icon: History },
    { name: 'Rules Config', href: '/settings/valuation-rules', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-64 bg-secondary text-white no-print">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-white">Score & Valuation</h1>
          <p className="text-slate-400 text-sm mt-1">Property Calculator</p>
        </div>
        <nav className="mt-6">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary border-l-4 border-accent text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
