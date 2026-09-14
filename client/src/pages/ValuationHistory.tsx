import { useEffect, useState } from 'react';
import { valuationService } from '../services/api';
import { Link } from 'react-router-dom';
import { Eye, Trash2, Edit2, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ValuationHistory = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROPERTY' | 'LAND'>('ALL');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [limit, setLimit] = useState(10);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const limitOptions = [10, 25, 50, 100];
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isLimitOpen && !(e.target as Element).closest('.limit-dropdown')) {
        setIsLimitOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isLimitOpen]);

  const fetchRecords = async (page: number, type: 'ALL' | 'PROPERTY' | 'LAND' = activeTab, currentLimit: number = limit, query: string = searchTerm) => {
    try {
      setLoading(true);
      const res = await valuationService.getHistory(page, currentLimit, type, undefined, undefined, query);
      setRecords(res.data.data);
      setPagination({ page: res.data.pagination.page, totalPages: res.data.pagination.totalPages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRecords(1, activeTab, limit, searchTerm);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, limit, searchTerm]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Valuation History</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search App No, Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-center mb-2">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex space-x-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-8 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'ALL' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All Valuations
          </button>
          <button
            onClick={() => setActiveTab('PROPERTY')}
            className={`px-8 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'PROPERTY' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Property Valuations
          </button>
          <button
            onClick={() => setActiveTab('LAND')}
            className={`px-8 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'LAND' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Land Valuations
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                {user?.role === 'admin' && <th className="px-6 py-4 font-semibold">Assessed By</th>}
                <th className="px-6 py-4 font-semibold">Holding No.</th>
                <th className="px-6 py-4 font-semibold">Owner</th>
                {user?.role !== 'admin' && activeTab !== 'ALL' && (
                  <>
                    <th className="px-6 py-4 font-semibold">Zone</th>
                    {activeTab === 'PROPERTY' ? (
                      <th className="px-6 py-4 font-semibold">Usage</th>
                    ) : (
                      <th className="px-6 py-4 font-semibold">Land Type</th>
                    )}
                  </>
                )}
                <th className="px-6 py-4 font-semibold text-right">Valuation</th>
                <th className="px-6 py-4 font-semibold text-right">Q. Tax</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 8 : (activeTab === 'ALL' ? 7 : 9)} className="px-6 py-10 text-center text-slate-500">Loading...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 8 : (activeTab === 'ALL' ? 7 : 9)} className="px-6 py-10 text-center text-slate-500">No valuations found.</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{new Date(record.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4">
                      {record.valuationType === 'LAND' ? (
                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Land</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Property</span>
                      )}
                    </td>
                    {user?.role === 'admin' && <td className="px-6 py-4 text-slate-600">{record.userId?.name || '-'}</td>}
                    <td className="px-6 py-4 font-medium text-slate-900">{record.property?.holdingNumber || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{record.property?.ownerName || '-'}</td>
                    
                    {user?.role !== 'admin' && activeTab !== 'ALL' && (
                      activeTab === 'PROPERTY' ? (
                        <>
                          <td className="px-6 py-4 text-slate-600">{record.inputs.zoneScoreCode || '-'}</td>
                          <td className="px-6 py-4 text-slate-600">{record.inputs.useOrCommercialScoreCode || '-'}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-slate-600">{record.inputs.zone || '-'}</td>
                          <td className="px-6 py-4 text-slate-600">{
                            record.inputs.landType === 'VACANT_LAND' || record.inputs.landType === 'NORMAL' ? 'Vacant Land' 
                            : record.inputs.landType === 'POND' ? 'Pond' 
                            : record.inputs.landType || '-'
                          }</td>
                        </>
                      )
                    )}

                    <td className="px-6 py-4 text-right font-medium text-slate-900">{formatCurrency(record.calculationBreakdown.effectiveValuation)}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(record.calculationBreakdown.quarterTax)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center space-x-3">
                        <Link to={`/valuation/${record._id}`} className="text-primary hover:text-primary-light" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {user?.role !== 'admin' && (
                          <Link 
                            to={record.valuationType === 'LAND' ? `/land-valuation/${record._id}` : `/property-valuation/${record._id}`} 
                            className="text-emerald-500 hover:text-emerald-600" 
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        )}
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
        
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-sm text-slate-500 limit-dropdown relative">
            <span className="mr-2">Show</span>
            <div className="relative">
              <button 
                onClick={() => setIsLimitOpen(!isLimitOpen)}
                className="flex items-center justify-between w-18 border border-slate-300 rounded-lg py-1.5 px-3 text-sm font-medium text-slate-700 bg-white shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              >
                {limit}
                <ChevronDown className={`w-4 h-4 text-slate-400 ml-1 transition-transform ${isLimitOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLimitOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-10 py-1">
                  {limitOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setLimit(opt);
                        setIsLimitOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                        limit === opt 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="ml-2">entries</span>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center space-x-4">
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
    </div>
  );
};

export default ValuationHistory;
