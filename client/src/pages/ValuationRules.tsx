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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex items-center">
            <Settings className="w-4 h-4 mr-2" /> Global Constants
          </div>
          <div className="p-4">
            <table className="w-full text-sm text-left text-slate-600">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2">Building Valuation Factor</td>
                  <td className="py-2 font-medium text-slate-900 text-right">{rules.constants.buildingValuationFactor}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2">Bigha to Sq Ft</td>
                  <td className="py-2 font-medium text-slate-900 text-right">{rules.constants.bighaToSqFt}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2">Khatha to Sq Ft</td>
                  <td className="py-2 font-medium text-slate-900 text-right">{rules.constants.khathaToSqFt}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2">Minimum Valuation</td>
                  <td className="py-2 font-medium text-slate-900 text-right">₹{rules.constants.minimumValuation}</td>
                </tr>
                <tr>
                  <td className="py-2">Commercial Surcharge %</td>
                  <td className="py-2 font-medium text-slate-900 text-right">{rules.constants.commercialSurchargePercent}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Scores */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
            Score Values
          </div>
          <div className="p-4 h-64 overflow-y-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className="py-2 font-semibold text-slate-900">Code</th>
                  <th className="py-2 font-semibold text-slate-900">Type</th>
                  <th className="py-2 font-semibold text-slate-900 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.scoreLookup.map((s: any) => (
                  <tr key={s.code}>
                    <td className="py-2 font-medium">{s.code}</td>
                    <td className="py-2 text-xs uppercase tracking-wider text-slate-500">{s.type}</td>
                    <td className="py-2 font-medium text-slate-900 text-right">{s.value}</td>
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
