import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { BookOpenCheck } from 'lucide-react';
import bgImage from '../assets/bg_image.png';
import logoBgB from '../assets/logo_bg_b.png';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      <HeroSection>
        <div className="w-full z-20">
          <Header />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center w-full z-10 p-4 min-h-[500px] py-12">
          


          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center w-full max-w-5xl px-4">
            
            {/* BWNPLVC Portal Card */}
            <Link to="/login" className="group relative outline-none">
              <div className="absolute inset-0 bg-slate-900 rounded-2xl transform translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
              <div className="relative bg-white border-4 border-slate-900 rounded-2xl p-6 md:p-8 w-full sm:w-[280px] md:w-[320px] flex flex-col items-center text-center transition-transform transform group-hover:-translate-y-1 group-active:translate-y-1 group-active:translate-x-1">
                <div className="bg-blue-100 p-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-5 group-hover:bg-blue-200 transition-colors">
                  <img src={logoBgB} alt="BWNPLVC Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase tracking-wide">
                  BWNPLVC
                </h2>
                <p className="text-sm text-slate-600 font-semibold mb-6">
                  Property & Land Valuation Calculator Login
                </p>
                <div className="mt-auto w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg border-2 border-transparent group-hover:bg-blue-600 transition-colors text-sm md:text-base">
                  Enter Portal &rarr;
                </div>
              </div>
            </Link>

            {/* Inspection Book Portal Card */}
            <Link to="/inspection-login" className="group relative outline-none">
              <div className="absolute inset-0 bg-slate-900 rounded-2xl transform translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
              <div className="relative bg-white border-4 border-slate-900 rounded-2xl p-6 md:p-8 w-full sm:w-[280px] md:w-[320px] flex flex-col items-center text-center transition-transform transform group-hover:-translate-y-1 group-active:translate-y-1 group-active:translate-x-1">
                <div className="bg-emerald-100 p-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-5 group-hover:bg-emerald-200 transition-colors">
                  <BookOpenCheck className="w-12 h-12 md:w-16 md:h-16 text-emerald-700 stroke-[2]" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase tracking-wide">
                  Inspection Book
                </h2>
                <p className="text-sm text-slate-600 font-semibold mb-6">
                  Field Inspection & Documentation Login
                </p>
                <div className="mt-auto w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg border-2 border-transparent group-hover:bg-emerald-600 transition-colors text-sm md:text-base">
                  Enter Portal &rarr;
                </div>
              </div>
            </Link>

          </div>
        </div>
      </HeroSection>
      
      <div className="w-full z-20 bg-white">
        <Footer />
      </div>
    </div>
  );
};

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  isolation: isolate;

  &::before {
    content: "";
    position: absolute;
    top: -5%;
    left: -5%;
    width: 110%;
    height: 110%;
    background-image: url(${bgImage});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(4px);
    z-index: -1;
  }
`;

export default Home;
