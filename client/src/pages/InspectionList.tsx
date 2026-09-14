import { useEffect, useState } from 'react';
import { inspectionService } from '../services/api';
import { FileText, Calendar, MapPin, Search, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InspectionList = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInspections = async () => {
    try {
      const res = await inspectionService.getMyInspections();
      setInspections(res.data.data);
    } catch (err) {
      console.error('Failed to fetch inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inspection data?')) {
      try {
        await inspectionService.deleteInspection(id);
        setInspections(inspections.filter(i => i._id !== id));
      } catch (err) {
        console.error('Failed to delete inspection:', err);
        alert('Failed to delete inspection.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Inspections</h1>
          <p className="text-slate-500 mt-1">View the field data you have submitted.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading your submissions...</div>
        ) : inspections.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No inspections found</p>
            <p className="text-slate-500 mt-2 max-w-sm">You haven't submitted any inspection data yet. Go to the Inspection Book to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4 font-medium">Application</th>
                  <th className="p-4 font-medium">Owner</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date Submitted</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((inspection) => (
                  <tr key={inspection._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-slate-400" />
                        <span className="font-medium text-slate-900">{inspection.applicationNo || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">{inspection.ownerName || '-'}</td>
                    <td className="p-4 text-slate-700">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                        {inspection.ward ? `Ward ${inspection.ward}` : '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        inspection.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inspection.status === 'reviewed' ? 'Reviewed' : 'Submitted'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(inspection.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => navigate(`/inspection/book/${inspection._id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View / Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(inspection._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionList;
