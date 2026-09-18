import { Clock, CheckCircle2, FileEdit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { inspectionService } from '../services/api';

const InspectionDashboard = () => {
  const [stats, setStats] = useState({ drafts: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await inspectionService.getDashboardStats();
        if (res.data && res.data.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Inspection Dashboard</h1>
      
      {loading ? (
        <div className="p-10 text-center text-slate-500">Loading dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <FileEdit className="w-12 h-12 text-slate-400 mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Drafts</h2>
            <p className="text-3xl font-black text-slate-900 mt-2">{stats.drafts}</p>
            <p className="text-sm text-slate-500 mt-1">Unsent inspections</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <Clock className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Pending Inspections</h2>
            <p className="text-3xl font-black text-slate-900 mt-2">{stats.pending}</p>
            <p className="text-sm text-slate-500 mt-1">Waiting for review</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Completed Inspections</h2>
            <p className="text-3xl font-black text-slate-900 mt-2">{stats.completed}</p>
            <p className="text-sm text-slate-500 mt-1">This month</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionDashboard;
