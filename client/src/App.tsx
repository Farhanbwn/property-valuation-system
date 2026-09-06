import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PropertyValuation from './pages/PropertyValuation';
import LandValuation from './pages/LandValuation';
import ValuationHistory from './pages/ValuationHistory';
import ValuationDetail from './pages/ValuationDetail';
import ValuationRules from './pages/ValuationRules';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="property-valuation" element={<PropertyValuation />} />
          <Route path="land-valuation" element={<LandValuation />} />
          <Route path="valuation-history" element={<ValuationHistory />} />
          <Route path="valuation/:id" element={<ValuationDetail />} />
          <Route path="settings/valuation-rules" element={<ValuationRules />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
