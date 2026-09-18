import { useEffect, useState } from 'react';
import { inspectionService } from '../services/api';
import { FileText, Calendar, MapPin, Search, CheckSquare, Send } from 'lucide-react';

const InspectionSubmission = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Date range filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const res = await inspectionService.getMyInspections();
      // Only keep 'draft' inspections for this portal
      const drafts = res.data.data.filter((i: any) => i.status === 'draft');
      setInspections(drafts);
    } catch (err) {
      console.error('Failed to fetch inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSubmitBatch = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to submit ${selectedIds.size} inspection(s)? You will not be able to edit them once submitted.`)) {
      return;
    }

    setSubmitting(true);
    try {
      await inspectionService.submitInspectionsBatch(Array.from(selectedIds));
      setSelectedIds(new Set());
      await fetchInspections(); // Refresh the list
    } catch (err) {
      console.error('Failed to submit inspections:', err);
      alert('Failed to submit inspections.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter inspections based on date range
  const filteredInspections = inspections.filter(inspection => {
    if (!startDate && !endDate) return true;
    
    // Using applicationDate or createdAt depending on business logic. Usually createdAt for drafts.
    const itemDate = new Date(inspection.createdAt);
    itemDate.setHours(0, 0, 0, 0);

    let pass = true;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (itemDate < start) pass = false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (itemDate > end) pass = false;
    }
    return pass;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredInspections.map(i => i._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const allFilteredSelected = filteredInspections.length > 0 && filteredInspections.every(i => selectedIds.has(i._id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Submission Portal</h1>
          <p className="text-slate-500 mt-1">Select and submit your draft inspections to the portal user.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border-slate-300 shadow-sm p-2 text-sm border focus:border-emerald-500 focus:ring-emerald-500 bg-white" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border-slate-300 shadow-sm p-2 text-sm border focus:border-emerald-500 focus:ring-emerald-500 bg-white" 
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">
              {selectedIds.size} selected
            </span>
            <button
              onClick={handleSubmitBatch}
              disabled={selectedIds.size === 0 || submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center"><CheckSquare className="w-4 h-4 mr-2 animate-pulse" /> Submitting...</span>
              ) : (
                <span className="flex items-center"><Send className="w-4 h-4 mr-2" /> Submit Selected</span>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading drafts...</div>
        ) : filteredInspections.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No draft inspections found</p>
            <p className="text-slate-500 mt-2 max-w-sm">
              {inspections.length > 0 
                ? "No drafts match your selected date range."
                : "You don't have any pending drafts to submit."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                    />
                  </th>
                  <th className="p-4 font-medium">Application</th>
                  <th className="p-4 font-medium">Owner</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInspections.map((inspection) => (
                  <tr 
                    key={inspection._id} 
                    className={`transition-colors cursor-pointer ${selectedIds.has(inspection._id) ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                    onClick={() => handleToggleSelect(inspection._id)}
                  >
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedIds.has(inspection._id)}
                        onChange={() => {}} // handled by row click
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                      />
                    </td>
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
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        Draft
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(inspection.createdAt).toLocaleDateString()}
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

export default InspectionSubmission;
