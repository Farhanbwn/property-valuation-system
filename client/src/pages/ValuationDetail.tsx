import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { valuationService } from '../services/api';
import { Printer, ArrowLeft, Building2, Map as MapIcon, Calculator } from 'lucide-react';

const ValuationDetail = () => {
  const { id } = useParams();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (id) {
      valuationService.getValuationById(id)
        .then(res => {
          setRecord(res.data.data);
          setLoading(false);
        })
        .catch(() => {
          setError('Valuation not found');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error || !record) return <div className="p-10 text-center text-red-500">{error}</div>;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="max-w-4xl mx-auto space-y-6 print-container">
      <div className="flex justify-between items-center no-print">
        <Link to="/valuation-history" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4 mr-2" /> Print Valuation
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 print-border overflow-hidden">
        <div className="p-8 print:p-4 border-b border-slate-200">
          <div className="flex justify-between items-start mb-6 print:mb-4">
            <div>
              <h1 className="text-3xl print:text-2xl font-bold text-slate-900">PROPERTY VALUATION REPORT</h1>
              <p className="text-slate-500 mt-1">ID: {record._id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right text-sm print:text-xs text-slate-500 space-y-1">
              <p>Date: {new Date(record.createdAt).toLocaleDateString()}</p>
              <p>Rules Version: {record.rulesVersion}</p>
              <p>Mode: {record.calculationMode}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 print:gap-4 mt-8 print:mt-4 text-sm print:text-xs">
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 print:mb-2 flex items-center uppercase tracking-wider text-xs">
                <Building2 className="w-4 h-4 mr-2" /> Property Details
              </h3>
              <div className="space-y-2 print:space-y-1">
                <p><span className="text-slate-500 inline-block w-24">Holding No:</span> <span className="font-medium text-slate-900">{record.property.holdingNumber || 'N/A'}</span></p>
                <p><span className="text-slate-500 inline-block w-24">Owner:</span> <span className="font-medium text-slate-900">{record.property.ownerName || 'N/A'}</span></p>
                <p><span className="text-slate-500 inline-block w-24">Address:</span> <span className="text-slate-900">{record.property.address || 'N/A'}</span></p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 print:mb-2 flex items-center uppercase tracking-wider text-xs">
                <MapIcon className="w-4 h-4 mr-2" /> Assessment Inputs
              </h3>
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                <div className="space-y-2 print:space-y-1">
                  <p><span className="text-slate-500 block text-xs">Covered Area</span> <span className="font-medium text-slate-900">{record.inputs.coverAreaSqFt} sq ft</span></p>
                  <p><span className="text-slate-500 block text-xs">Building Age</span> <span className="font-medium text-slate-900">{record.inputs.buildingAgeYears} yrs</span></p>
                  <p><span className="text-slate-500 block text-xs">Zone</span> <span className="font-medium text-slate-900">{record.inputs.zoneScoreCode}</span></p>
                </div>
                <div className="space-y-2 print:space-y-1">
                  <p><span className="text-slate-500 block text-xs">Usage</span> <span className="font-medium text-slate-900">{record.inputs.useOrCommercialScoreCode}</span></p>
                  <p><span className="text-slate-500 block text-xs">Construction</span> <span className="font-medium text-slate-900">{record.inputs.constructionScoreCode}</span></p>
                  <p><span className="text-slate-500 block text-xs">Total Land</span> <span className="font-medium text-slate-900">{record.calculationBreakdown.totalLandSqFt.toLocaleString()} sq ft</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 print:p-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 mb-6 print:mb-4 flex items-center uppercase tracking-wider">
            <Calculator className="w-5 h-5 mr-2 text-primary" /> Calculation Summary
          </h2>

          <div className="space-y-6 print:space-y-4">
            {/* Score & Building */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
              <div className="bg-white p-5 print:p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 print:mb-2 border-b border-slate-100 pb-2">Score Breakdown</h4>
                <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
                  <div className="flex justify-between"><span className="text-slate-600">Zone Score</span><span>{record.resolvedScores.zone}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Usage Score</span><span>{record.resolvedScores.usage}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Construction Score</span><span>{record.resolvedScores.construction}</span></div>
                  {record.resolvedScores.additional > 0 && (
                    <div className="flex justify-between"><span className="text-slate-600">Additional Score</span><span>{record.resolvedScores.additional}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 mt-2">
                    <span>Total Score</span><span>{record.resolvedScores.totalScore}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 print:p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 print:mb-2 border-b border-slate-100 pb-2">Building & Land</h4>
                <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
                  <div className="flex justify-between"><span className="text-slate-600">Assessed Building Value</span><span className="font-medium">{formatCurrency(record.calculationBreakdown.assessedBuildingValue)}</span></div>
                  <div className="flex justify-between text-red-600">
                    <span>Depreciation ({record.calculationBreakdown.depreciationPercent}%)</span>
                    <span>- {formatCurrency(record.calculationBreakdown.depreciationAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Land Addition</span>
                    <span>+ {formatCurrency(record.calculationBreakdown.landAddition)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Results */}
            <div className="bg-slate-900 text-white p-6 print:p-4 rounded-xl shadow-inner mt-8 print:mt-4 print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Final Effective Valuation</h3>
                  <div className="text-4xl font-bold">{formatCurrency(record.calculationBreakdown.effectiveValuation)}</div>
                  {record.calculationBreakdown.minimumApplied && (
                    <span className="inline-block mt-2 text-xs bg-accent text-slate-900 px-2 py-1 rounded font-medium">
                      Minimum Valuation Rule Applied
                    </span>
                  )}
                </div>
                
                <div className="mt-6 md:mt-0 space-y-3 md:text-right">
                  <div>
                    <span className="text-slate-400 text-sm mr-4">Quarter Tax / Fee:</span>
                    <span className="text-2xl font-bold text-emerald-400">{formatCurrency(record.calculationBreakdown.quarterTax)}</span>
                  </div>
                  {record.calculationBreakdown.commercialSurcharge !== null && (
                    <div>
                      <span className="text-slate-400 text-sm mr-4">Commercial Surcharge (20%):</span>
                      <span className="text-xl font-bold text-amber-400">{formatCurrency(record.calculationBreakdown.commercialSurcharge)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Print-only footer */}
        <div className="hidden print-only p-8 print:p-4 text-center text-xs text-slate-400 border-t border-slate-200">
          Generated by Property Score & Valuation System • {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ValuationDetail;
