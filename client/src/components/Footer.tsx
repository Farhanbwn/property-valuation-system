
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";
import { CgMail } from "react-icons/cg";

const Footer = () => {
  return (
    <footer className="w-full bg-white/80 backdrop-blur-md border-t border-slate-200/50 py-12 px-6 md:px-12 text-sm text-slate-500 flex flex-col z-10 mt-auto transition-all font-sans">
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-12">
        {/* Left Section */}
        <div className="flex flex-col space-y-4 lg:space-y-6 lg:w-1/3 text-center lg:text-left items-center lg:items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2 uppercase">Burdwan Property & Land Valuation Calculator</h2>
            <p className="text-slate-500 font-medium">Property assessment and land valuation based on standardized Burdwan regional valuation rules.</p>
          </div>
        </div>

        {/* Right Section - Contact */}
        <div className="flex flex-col space-y-4 lg:w-1/3 items-center lg:items-end mt-4 lg:mt-0">
          <h4 className="font-bold text-slate-800">Connect with us</h4>
          <div className="flex gap-4">
            <a href="https://github.com/Farhanbwn" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 transition-colors p-2 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50">
              <FaGithub className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/farhan-chowdhury-101b25258/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0a66c2] transition-colors p-2 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50">
              <FaLinkedinIn className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/nishan.bwn/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#E1306C] transition-colors p-2 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50">
              <IoLogoInstagram className="w-4 h-4" />
            </a>
            <a href="mailto:farhanbwn2003@gmail.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#EA4335] transition-colors p-2 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50">
              <CgMail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200">
        <span className="font-medium text-slate-400 text-center md:text-left flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <span>&copy; {new Date().getFullYear()} BWNPLVC. All rights reserved.</span>
          <span className="hidden sm:inline">|</span>
          <span className="font-medium text-slate-400 text-center md:text-left flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
            <span>
              Developed By <a href="https://www.farhanchowdhury.me/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors font-bold">Farhan</a>
            </span>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="font-medium text-slate-400 text-center md:text-left flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">Love from Bardhaman</span>
          <span className="hidden sm:inline">|</span>
        </span>
        <div className="flex gap-4 sm:gap-6 font-medium text-slate-400 mt-6 md:mt-0 justify-center">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Refund Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
