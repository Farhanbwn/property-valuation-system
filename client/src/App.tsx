import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import PropertyValuation from './pages/PropertyValuation.tsx';
import LandValuation from './pages/LandValuation.tsx';
import ValuationHistory from './pages/ValuationHistory.tsx';
import ValuationDetail from './pages/ValuationDetail.tsx';
import ValuationRules from './pages/ValuationRules.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
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
