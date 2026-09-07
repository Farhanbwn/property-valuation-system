import { useEffect, useState } from 'react';
import { valuationService } from '../services/api';
import { Calculator, Map, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProperty: 0,
    totalLand: 0,
    totalUsers: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await valuationService.getDashboardStats();
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        const res = await valuationService.getHistory(1, 5);
        if (res.data.success) {
          const records = res.data.data;
          setRecent(records);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'admin' ? 'lg:grid-cols-3' : ''} gap-6`}>
        {user?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center text-slate-500 mb-4">
              <Users className="w-5 h-5 mr-2 text-primary-light" />
              <h3 className="text-sm font-medium">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center text-slate-500 mb-4">
            <Calculator className="w-5 h-5 mr-2 text-accent" />
            <h3 className="text-sm font-medium">Total Property Valuation</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalProperty}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center text-slate-500 mb-4">
            <Map className="w-5 h-5 mr-2 text-emerald-500" />
            <h3 className="text-sm font-medium">Total Land Valuation</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalLand}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2 text-slate-400" />
            Recent Calculations
          </h2>
          <Link to="/valuation-history" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Holding / Owner</th>
                <th className="px-6 py-3 font-medium">Area</th>
                <th className="px-6 py-3 font-medium">Valuation</th>
                <th className="px-6 py-3 font-medium text-right">Quarter Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recent.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{new Date(record.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{record.property.holdingNumber || '-'}</div>
                    <div className="text-xs text-slate-500">{record.property.ownerName || '-'}</div>
                  </td>
                  <td className="px-6 py-4">{record.inputs.coverAreaSqFt} sq ft</td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(record.calculationBreakdown.effectiveValuation)}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(record.calculationBreakdown.quarterTax)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No valuations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
