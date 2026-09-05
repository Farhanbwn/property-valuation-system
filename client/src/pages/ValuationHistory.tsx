import { useEffect, useState } from 'react';
import { valuationService } from '../services/api';
import { Link } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';

const ValuationHistory = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchRecords = async (page: number) => {
    try {
      setLoading(true);
      const res = await valuationService.getHistory(page, 10);
      setRecords(res.data.data);
      setPagination({ page: res.data.pagination.page, totalPages: res.data.pagination.totalPages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this valuation?')) {
      try {
        await valuationService.deleteValuation(id);
        fetchRecords(pagination.page);
      } catch (err) {
        alert('Failed to delete valuation');
      }
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Valuation History</h1>
        <Link to="/property-valuation" className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
          New Valuation
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Holding No.</th>
                <th className="px-6 py-4 font-semibold">Owner</th>
                <th className="px-6 py-4 font-semibold">Zone</th>
                <th className="px-6 py-4 font-semibold text-right">Valuation</th>
                <th className="px-6 py-4 font-semibold text-right">Q. Tax</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">Loading...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">No valuations found.</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{new Date(record.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{record.property.holdingNumber || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{record.property.ownerName || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{record.inputs.zoneScoreCode}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{formatCurrency(record.calculationBreakdown.effectiveValuation)}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(record.calculationBreakdown.quarterTax)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center space-x-3">
                        <Link to={`/valuation/${record._id}`} className="text-primary hover:text-primary-light" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(record._id)} className="text-red-500 hover:text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <button 
              disabled={pagination.page === 1} 
              onClick={() => fetchRecords(pagination.page - 1)}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
            <button 
              disabled={pagination.page === pagination.totalPages} 
              onClick={() => fetchRecords(pagination.page + 1)}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationHistory;
