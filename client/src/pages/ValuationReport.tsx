import { useState } from 'react';
import { valuationService } from '../services/api';
import { Printer, Search } from 'lucide-react';

const ValuationReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showProperty, setShowProperty] = useState(true);
  const [showLand, setShowLand] = useState(true);

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedMonth(val);

    if (val) {
      const [year, month] = val.split('-');
      const firstDay = new Date(Number(year), Number(month) - 1, 1);
      const lastDay = new Date(Number(year), Number(month), 0);

      const formatStr = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      setStartDate(formatStr(firstDay));
      setEndDate(formatStr(lastDay));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    let type: 'ALL' | 'PROPERTY' | 'LAND' = 'ALL';
    if (showProperty && !showLand) type = 'PROPERTY';
    if (!showProperty && showLand) type = 'LAND';
    if (!showProperty && !showLand) {
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch up to 1000 records for the report
      const res = await valuationService.getHistory(1, 1000, type, startDate, endDate);
      setRecords(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch report data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="space-y-6">
      <style>
        {`
          @media print {
            @page { size: landscape; margin: 10mm; }
            body { background: white; }
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-2 print:hidden">
        <h1 className="text-2xl font-bold text-slate-900">Valuation Reports</h1>
      </div>

      {/* Filter Section - Hidden when printing */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 items-end">

          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 h-[42px]"
            />
          </div>

          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setSelectedMonth(''); }}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 h-[42px]"
            />
          </div>

          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setSelectedMonth(''); }}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 h-[42px]"
            />
          </div>

          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Valuation Type</label>
            <div className="flex space-x-6 h-[42px] items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProperty}
                  onChange={(e) => setShowProperty(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700">Property</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLand}
                  onChange={(e) => setShowLand(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700">Land</span>
              </label>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end gap-3 h-[42px]">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={records.length === 0}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </form>
      </div>

      {/* Report View - Shown on screen and in print */}
      {(hasSearched || records.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">

          {/* Print Header - Only visible when printing or as part of the report */}
          <div className="hidden print:block p-4 text-center mb-4">
            <h2 className="text-xl font-bold uppercase">Valuation Report</h2>
            <p className="text-sm text-slate-600">
              {startDate && endDate ? `From: ${formatDate(startDate)} To: ${formatDate(endDate)}` :
                startDate ? `From: ${formatDate(startDate)}` :
                  endDate ? `To: ${formatDate(endDate)}` : 'All Dates'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm print:text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 print:bg-white print:border-black print:border-b-2">
                <tr>
                  <th className="px-4 py-3 font-semibold print:px-2 print:py-2">Sl No</th>
                  <th className="px-4 py-3 font-semibold print:px-2 print:py-2">App No</th>
                  <th className="px-4 py-3 font-semibold print:px-2 print:py-2">App Date</th>
                  <th className="px-4 py-3 font-semibold print:px-2 print:py-2">Date</th>
                  <th className="px-4 py-3 font-semibold print:px-2 print:py-2">Name</th>
                  <th className="px-4 py-3 font-semibold print:px-2 print:py-2">Ward</th>
                  <th className="px-4 py-3 font-semibold print:px-2 print:py-2">Location</th>
                  <th className="px-4 py-3 font-semibold print:px-2 print:py-2">Holding No</th>
                  <th className="px-4 py-3 font-semibold print:px-2 print:py-2">Type</th>
                  <th className="px-4 py-3 font-semibold text-right print:px-2 print:py-2">AV</th>
                  <th className="px-4 py-3 font-semibold text-right print:px-2 print:py-2">QT</th>
                  <th className="px-4 py-3 font-semibold text-right print:px-2 print:py-2">SC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-10 text-center text-slate-500">
                      No records found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  records.map((r, index) => {
                    const isLand = r.valuationType === 'LAND';
                    const av = r.calculationBreakdown.effectiveValuation;
                    const qt = r.calculationBreakdown.quarterTax;
                    const sc = r.calculationBreakdown.commercialSurcharge || 0;

                    return (
                      <tr key={r._id} className="hover:bg-slate-50 transition-colors print:hover:bg-white">
                        <td className="px-4 py-3 print:px-2 print:py-1.5">{index + 1}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5">{r.property?.applicationNo || '-'}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5">{formatDate(r.property?.applicationDate)}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5">{formatDate(r.createdAt)}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5 font-medium">{r.property?.ownerName || '-'}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5">{r.property?.ward || '-'}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5">{r.property?.location || '-'}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5">{r.property?.holdingNumber || '-'}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5 font-semibold text-slate-600">
                          {isLand ? 'Land' : 'Property'}
                        </td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5 text-right font-medium">{formatCurrency(av)}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5 text-right">{formatCurrency(qt)}</td>
                        <td className="px-4 py-3 print:px-2 print:py-1.5 text-right">{formatCurrency(sc)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValuationReport;
