

const Header = () => {
  return (
    <header className="w-full flex bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 py-4 md:px-8 md:py-5 items-center justify-between z-10 shadow-sm transition-all ">
      <div className="flex items-center w-full justify-center md:justify-start">
        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight text-slate-800 drop-shadow-sm uppercase text-center md:text-left">
          Burdwan Property & Land Valuation Calculator
        </h1>
      </div>
    </header>
  );
};

export default Header;
