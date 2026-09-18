import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import InspectionLayout from './components/InspectionLayout';
import Dashboard from './pages/Dashboard';
import PropertyValuation from './pages/PropertyValuation';
import LandValuation from './pages/LandValuation';
import ValuationHistory from './pages/ValuationHistory';
import ValuationDetail from './pages/ValuationDetail';
import ValuationReport from './pages/ValuationReport';
import ValuationRules from './pages/ValuationRules';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Home from './pages/Home';
import InspectionLogin from './pages/InspectionLogin';
import InspectionDashboard from './pages/InspectionDashboard';
import InspectionBook from './pages/InspectionBook';
import InspectionList from './pages/InspectionList';
import InspectionSubmission from './pages/InspectionSubmission';
import FieldInspections from './pages/FieldInspections';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Determine the right login page to redirect to based on the attempted path
    const loginPath = location.pathname.startsWith('/inspection') ? '/inspection-login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'inspection') {
      return <Navigate to="/inspection/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    if (user.role === 'inspection') {
      return <Navigate to="/inspection/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/inspection-login" element={<PublicRoute><InspectionLogin /></PublicRoute>} />
        
        {/* BWNPLVC Portal - Admins and Users */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'user']}><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="property-valuation/:id?" element={<PropertyValuation />} />
          <Route path="land-valuation/:id?" element={<LandValuation />} />
          <Route path="valuation-history" element={<ValuationHistory />} />
          <Route path="reports" element={<ValuationReport />} />
          <Route path="valuation/:id" element={<ValuationDetail />} />
          <Route path="field-inspections" element={<FieldInspections />} />
          <Route path="settings/valuation-rules" element={<ValuationRules />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* Inspection Portal - Admins and Inspection Users */}
        <Route path="/inspection" element={<ProtectedRoute allowedRoles={['admin', 'inspection']}><InspectionLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<InspectionDashboard />} />
          <Route path="book/:id?" element={<InspectionBook />} />
          <Route path="list" element={<InspectionList />} />
          <Route path="submit" element={<InspectionSubmission />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
