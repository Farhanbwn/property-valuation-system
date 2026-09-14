import { Activity } from 'lucide-react';

const InspectionDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Inspection Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
          <Activity className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Pending Inspections</h2>
          <p className="text-3xl font-black text-slate-900 mt-2">0</p>
          <p className="text-sm text-slate-500 mt-1">Waiting for review</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
          <Activity className="w-12 h-12 text-emerald-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Completed Inspections</h2>
          <p className="text-3xl font-black text-slate-900 mt-2">0</p>
          <p className="text-sm text-slate-500 mt-1">This month</p>
        </div>
      </div>
    </div>
  );
};

export default InspectionDashboard;
