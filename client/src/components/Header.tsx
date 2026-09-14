import logoBgB from '../assets/logo_bg_b.png';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="w-full flex bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 py-4 md:px-8 md:py-5 items-center justify-between z-10 shadow-sm transition-all print:hidden">
      <Link to="/" className="flex items-center gap-3 w-full justify-center md:justify-start hover:opacity-80 transition-opacity">
        {!isAuthenticated && (
          <img 
            src={logoBgB} 
            alt="Burdwan Property Logo" 
            className="h-8 md:h-10 w-auto object-contain" 
          />
        )}
        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight text-slate-800 drop-shadow-sm uppercase text-center md:text-left">
          Burdwan Property & Land Valuation Calculator
        </h1>
      </Link>
    </header>
  );
};

export default Header;
