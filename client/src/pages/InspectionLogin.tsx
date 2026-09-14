import { useState } from 'react';
import styled from 'styled-components';
import bgImage from '../assets/bg_image.png';
import logoBgB from '../assets/logo_bg_b.png';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const InspectionLogin = () => {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      if (response.data.user.role === 'user') {
        setError('Regular users cannot access the Inspection Portal.');
        return;
      }
      login(response.data.token, response.data.user);
      navigate('/inspection/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      <HeroSection>
        <div className="w-full z-20">
          <Header />
        </div>
        <div className="flex-1 flex items-center justify-center w-full z-10 p-4 min-h-[500px] py-8">
          <StyledWrapper>
          <div className="wrapper">
            <div className="static-card">
              <div className="title">INSPECTION BOOK LOGIN</div>
              <form className="static-card__form" onSubmit={handleSubmit}>
                <input className="static-card__input" name="email" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <div className="input-container">
                  <input className="static-card__input" name="password" placeholder="Password" type={showLoginPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="password-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && <ErrorText>{error}</ErrorText>}
                <button className="static-card__btn" disabled={loading}>{loading ? '...' : 'LOGIN'}</button>
              </form>
            </div>
          </div>
        </StyledWrapper>
      </div>
      </HeroSection>
      <div className="w-full z-20 bg-white">
        <Footer />
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-2xl border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] p-10 md:p-12 max-w-lg w-11/12 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-2xl border-2 border-slate-900 shadow-md mb-6 flex items-center justify-center">
              <img 
                src={logoBgB} 
                alt="Burdwan Property Logo" 
                className="h-24 md:h-28 w-auto object-contain animate-pulse" 
              />
            </div>
            <div className="flex items-center gap-3 text-slate-900 font-black text-2xl md:text-3xl mb-3">
              <Loader2 className="h-7 w-7 stroke-[2.5] animate-spin text-blue-600" />
              <span>Logging in...</span>
            </div>
            <p className="text-sm md:text-base text-slate-600 font-medium max-w-xs">
              Authenticating user credentials. Please wait...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 14px;
  margin: -10px 0 0 0;
  text-align: center;
  max-width: 250px;
`;

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
    filter: blur(2px);
    z-index: -1;
  }
`;

const StyledWrapper = styled.div`
  .wrapper {
    --input-focus: #2d8cf0;
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --bg-color-alt: #666;
    --main-color: #323232;
  }
  
  .static-card {
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: lightgrey;
    gap: 20px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    width: 300px;
  }

  .static-card__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .title {
    margin: 10px 0 20px 0;
    font-size: 25px;
    font-weight: 900;
    text-align: center;
    color: var(--main-color);
  }

  .static-card__input {
    width: 250px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 15px;
    font-weight: 600;
    color: var(--font-color);
    padding: 5px 40px 5px 10px;
    outline: none;
  }

  .input-container {
    position: relative;
    width: 250px;
  }

  .password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: var(--font-color-sub);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  .password-toggle:hover {
    color: var(--font-color);
  }

  .static-card__input::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
  }

  .static-card__input:focus {
    border: 2px solid var(--input-focus);
  }

  .static-card__btn:active, .button-confirm:active {
    box-shadow: 0px 0px var(--main-color);
    transform: translate(3px, 3px);
  }

  .static-card__btn {
    margin: 20px 0 10px 0;
    width: 120px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 17px;
    font-weight: 600;
    color: var(--font-color);
    cursor: pointer;
  }
`;

export default InspectionLogin;
