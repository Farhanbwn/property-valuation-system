import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calculator, Map, History, Settings, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Property Valuation', href: '/property-valuation', icon: Calculator },
    { name: 'Land Valuation', href: '/land-valuation', icon: Map },
    { name: 'History', href: '/valuation-history', icon: History },
    { name: 'Rules Config', href: '/settings/valuation-rules', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-secondary text-white p-4 flex items-center justify-between z-20">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Score & Valuation</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-secondary text-white no-print z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 hidden md:block">
          <h1 className="text-xl font-bold tracking-tight text-white">Burdwan Property & land valuation Calculator</h1>
          <p className="text-slate-400 text-sm mt-1">Property Calculator</p>
        </div>
        <nav className="mt-6">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
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

        {/* User & Logout section at the bottom */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
          {user && (
            <div className="mb-4 px-2">
              <p className="text-sm font-semibold truncate" title={user.name}>
                <span className="text-slate-400 font-normal">Account:</span> {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate mt-1" title={user.email}>{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 transition-colors rounded-md hover:bg-slate-800 hover:text-red-300"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto w-full max-w-full flex flex-col">
          <div className="p-4 md:p-10 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
