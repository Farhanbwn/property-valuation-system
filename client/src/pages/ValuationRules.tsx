import { useState, useEffect } from 'react';
import { valuationService } from '../services/api';
import { Settings, Lock } from 'lucide-react';

const ValuationRules = () => {
  const [rules, setRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    valuationService.getRules()
      .then(res => {
        setRules(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!rules) return <div className="p-10 text-center text-red-500">Failed to load rules.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Valuation Rules Configuration</h1>
          <p className="text-slate-500 mt-1">Read-only view of active calculation constants and scores.</p>
        </div>
        <div className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          <Lock className="w-4 h-4 mr-1.5" /> Read Only Mode
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Constants */}
        {/* Constants */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex items-center">
            <Settings className="w-4 h-4 mr-2 text-slate-500" /> Global Constants
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-700">Building Valuation Factor</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 text-right">{rules.constants.buildingValuationFactor}</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-700">Bigha to Sq Ft</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 text-right">{rules.constants.bighaToSqFt}</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-700">Khatha to Sq Ft</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 text-right">{rules.constants.khathaToSqFt}</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-700">Minimum Valuation</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 text-right">₹{rules.constants.minimumValuation}</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-700">Commercial Surcharge %</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 text-right">{rules.constants.commercialSurchargePercent}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Scores */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex items-center justify-between">
            <span>Score Values</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
              {rules.scoreLookup.length} scores
            </span>
          </div>
          <div className="overflow-y-auto max-h-[320px]">
            <table className="w-full text-sm text-left text-slate-600 border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-xs">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50">Code</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50">Type</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 text-right bg-slate-50">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.scoreLookup.map((s: any) => (
                  <tr key={s.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-900">{s.code}</td>
                    <td className="py-2.5 px-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded uppercase tracking-wider">
                        {s.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 text-right">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ValuationRules;
