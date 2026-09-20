import { useEffect, useState } from 'react';
import { userService, inspectionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Users, FileText, Calendar, MapPin, ArrowRight } from 'lucide-react';

const FieldInspections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (user?.role !== 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inspectorsRes, inspectionsRes] = await Promise.all([
        userService.getMyInspectors(),
        inspectionService.getTeamInspections()
      ]);
      setInspectors(inspectorsRes.data.data);
      setInspections(inspectionsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyToValuation = (inspection: any) => {
    const isLand = ['VACANT_LAND', 'POND'].includes(inspection.natureOfUseCode);
    const route = isLand ? '/land-valuation' : '/property-valuation';
    navigate(route, { state: { importedInspection: inspection } });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Field Inspections Hub</h1>
          <p className="text-slate-500 mt-1">Manage your assigned field inspectors and review their submitted data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assigned Inspectors */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">My Field Team</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading team...</div>
            ) : inspectors.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <Users className="h-10 w-10 text-slate-300 mb-3" />
                <p>You have no inspectors assigned to you.</p>
                <p className="text-sm mt-1">Contact an administrator to get a team assigned.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {inspectors.map((inspector) => (
                  <li key={inspector._id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="font-medium text-slate-900">{inspector.name}</div>
                    <div className="text-sm text-slate-500">{inspector.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Submitted Inspections */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="text-emerald-600" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Recent Submissions</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
            {loading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                Loading submissions...
              </div>
            ) : inspections.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                 <FileText className="h-12 w-12 text-slate-300 mb-4" />
                 <p className="text-lg font-medium text-slate-700">No recent submissions</p>
                 <p className="max-w-sm mt-2">When your field team submits an Inspection Book form, it will appear here for your review.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {inspections.map((inspection) => (
                  <li key={inspection._id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-lg text-slate-900">{inspection.ownerName || 'Unknown Owner'}</span>
                          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium border border-slate-200">
                            App No: {inspection.applicationNo || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1.5 text-slate-400" />
                            Submitted by: {inspection.inspectorId?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                            {new Date(inspection.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                            Ward {inspection.ward || '-'}
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm text-slate-600 flex gap-4">
                           <span><strong>Area:</strong> {inspection.coverAreaSqFt} sq ft</span>
                           <span><strong>Age:</strong> {inspection.buildingAgeYears} years</span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex items-center">
                        <button 
                          onClick={() => handleCopyToValuation(inspection)}
                          className="bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
                        >
                          Copy to Valuation
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldInspections;
