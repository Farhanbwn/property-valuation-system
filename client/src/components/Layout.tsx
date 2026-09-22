import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calculator, Map, History, Settings, Menu, X, LogOut, Users, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import logo from '../assets/logo.png';

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
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Rules Config', href: '/settings/valuation-rules', icon: Settings },
    { name: 'Settings', href: '/settings', icon: Settings, exact: true },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'User Management', href: '/users', icon: Users });
  } else if (user?.role === 'user') {
    navigation.splice(1, 0, { name: 'Field Inspections', href: '/field-inspections', icon: Users });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Mobile Header */}
      <div className="md:hidden print:hidden bg-secondary text-white p-4 flex items-center justify-between z-20">
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
      <aside className={`fixed inset-y-0 left-0 w-64 bg-secondary text-white print:hidden z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-screen ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 hidden md:flex md:flex-col md:items-center md:justify-center flex-shrink-0">
          <img src={logo} alt="BWNPLVC Logo" className="w-24 h-auto mb-2 object-contain" />
          <h1 className="text-xl font-bold tracking-tight text-white">BWNPLVC</h1>
        </div>
        <nav className="mt-2 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.href 
              : location.pathname.startsWith(item.href);
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
        <div className="mt-auto w-full p-4 border-t border-slate-700 flex-shrink-0 bg-secondary">
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

      <div className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible relative">
        <Header />
        <main className="flex-1 overflow-y-auto print:overflow-visible w-full max-w-full flex flex-col">
          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
