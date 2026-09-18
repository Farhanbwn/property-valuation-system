import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { valuationService } from '../services/api';
import { Printer, ArrowLeft, Building2, Map as MapIcon, Calculator } from 'lucide-react';
import logoPrint from '../assets/logo_bg_b.png';

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none overflow-hidden">
        {/* Print Header */}
        <div className="hidden print:flex flex-col items-center justify-center text-center pb-4 mb-4 border-b-2 border-black">
          <img src={logoPrint} alt="Burdwan Property & Land Valuation" className="w-20 h-auto mb-2 object-contain" />
          <h1 className="text-xl font-bold uppercase tracking-tight text-black mb-1">
            BURDWAN PROPERTY & LAND VALUATION
          </h1>
          <p className="text-xs font-semibold text-slate-800">
            {record.valuationType === 'LAND' ? 'STANDALONE LAND VALUATION REPORT' : 'PROPERTY VALUATION REPORT'}
          </p>
        </div>

        <div className="p-8 print:p-0 print:border-none border-b border-slate-200">
          <div className="flex justify-between items-end mb-6 print:mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 print:hidden">
                {record.valuationType === 'LAND' ? 'STANDALONE LAND VALUATION REPORT' : 'PROPERTY VALUATION REPORT'}
              </h1>
              <p className="text-slate-500 mt-1 print:text-xs">ID: <span className="font-medium text-slate-900">{record._id.substring(0, 8).toUpperCase()}</span></p>
            </div>
            <div className="text-right text-sm print:text-xs text-slate-500 space-y-1">
              <p>Date: <span className="font-medium text-slate-900">{new Date(record.createdAt).toLocaleDateString('en-GB')}</span></p>
              <p>Rules Version: <span className="font-medium text-slate-900">{record.rulesVersion}</span></p>
              <p>Mode: <span className="font-medium text-slate-900">{record.calculationMode}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 print:gap-4 mt-8 print:mt-4 text-sm print:text-xs">
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 print:mb-2 flex items-center uppercase tracking-wider text-xs">
                <Building2 className="w-4 h-4 mr-2" /> Property Details
              </h3>
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                <div className="space-y-2 print:space-y-1">
                  <p><span className="text-slate-500 block text-xs">Holding No</span> <span className="font-medium text-slate-900">{record.property.holdingNumber || 'N/A'}</span></p>
                  <p><span className="text-slate-500 block text-xs">Owner Name</span> <span className="font-medium text-slate-900">{record.property.ownerName || 'N/A'}</span></p>
                  <p><span className="text-slate-500 block text-xs">Location</span> <span className="text-slate-900">{record.property.location || 'N/A'}</span></p>
                  <p><span className="text-slate-500 block text-xs">Assessment Date</span> <span className="text-slate-900">{new Date(record.createdAt).toLocaleDateString('en-GB')}</span></p>
                </div>
                <div className="space-y-2 print:space-y-1">
                  <p><span className="text-slate-500 block text-xs">District</span> <span className="text-slate-900">{record.property.district || 'N/A'}</span></p>
                  <p><span className="text-slate-500 block text-xs">ULB Name</span> <span className="text-slate-900">{record.property.ulbName || 'N/A'}</span></p>
                  <p><span className="text-slate-500 block text-xs">Ward No</span> <span className="text-slate-900">{record.property.ward || 'N/A'}</span></p>
                </div>
              </div>

              <h3 className="font-semibold text-slate-700 mb-3 print:mb-2 mt-6 flex items-center uppercase tracking-wider text-xs">
                <MapIcon className="w-4 h-4 mr-2" /> Application & Land Records
              </h3>
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                <div className="space-y-2 print:space-y-1">
                  <p><span className="text-slate-500 block text-xs">Application No</span> <span className="text-slate-900">{record.property.applicationNo || 'N/A'}</span></p>
                  <p><span className="text-slate-500 block text-xs">App Date</span> <span className="text-slate-900">{record.property.applicationDate ? new Date(record.property.applicationDate).toLocaleDateString('en-GB') : 'N/A'}</span></p>
                  <p><span className="text-slate-500 block text-xs">L.R. Plot</span> <span className="text-slate-900">{record.property.lrPlot || 'N/A'}</span></p>
                </div>
                <div className="space-y-2 print:space-y-1">
                  <p><span className="text-slate-500 block text-xs">J.L No</span> <span className="text-slate-900">{record.property.jlNo || 'N/A'}</span></p>
                  <p><span className="text-slate-500 block text-xs">Khatian No</span> <span className="text-slate-900">{record.property.khatianNo || 'N/A'}</span></p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 print:mb-2 flex items-center uppercase tracking-wider text-xs">
                <MapIcon className="w-4 h-4 mr-2" /> Assessment Inputs
              </h3>
              {record.valuationType === 'LAND' ? (
                <div className="grid grid-cols-2 gap-4 print:gap-2">
                  <div className="space-y-2 print:space-y-1">
                    <p><span className="text-slate-500 block text-xs">Total Land Area</span> <span className="font-medium text-slate-900">{record.calculationBreakdown.totalLandSqFt.toLocaleString()} sq ft</span></p>
                    <p><span className="text-slate-500 block text-xs">Zone</span> <span className="font-medium text-slate-900">{record.inputs.zone}</span></p>
                  </div>
                  <div className="space-y-2 print:space-y-1">
                    <p><span className="text-slate-500 block text-xs">Land Type</span> <span className="font-medium text-slate-900">{
                      record.inputs.landType === 'VACANT_LAND' || record.inputs.landType === 'NORMAL' ? 'Vacant Land'
                        : record.inputs.landType === 'POND' ? 'Pond'
                          : record.inputs.landType
                    }</span></p>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>

        <div className="p-8 print:p-2 bg-slate-50/50 print:bg-white">
          <h2 className="text-lg font-bold text-slate-800 mb-6 print:mb-2 flex items-center uppercase tracking-wider">
            <Calculator className="w-5 h-5 mr-2 text-primary" /> Calculation Summary
          </h2>

          <div className="space-y-6 print:space-y-2">
            {/* Score & Building */}
            {record.valuationType === 'LAND' ? (
              <div className="grid grid-cols-1 gap-8 print:gap-4">
                <div className="bg-white p-5 print:p-4 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 print:mb-2 border-b border-slate-100 pb-2">Land Value Breakdown</h4>
                  <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
                    <div className="flex justify-between"><span className="text-slate-600">Vacant Land Valuation</span><span className="font-medium">{formatCurrency(record.calculationBreakdown.normalLandValuation || 0)}</span></div>
                    {record.calculationBreakdown.pondAdjustment > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Pond Adjustment (50%)</span>
                        <span>- {formatCurrency(record.calculationBreakdown.pondAdjustment)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 print:gap-4">
                <div className="bg-white p-5 print:p-4 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 print:mb-2 border-b border-slate-100 pb-2">Score Breakdown</h4>
                  <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
                    <div className="flex justify-between"><span className="text-slate-600">Zone Score</span><span>{record.resolvedScores?.zone || 0}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Usage Score</span><span>{record.resolvedScores?.usage || 0}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Construction Score</span><span>{record.resolvedScores?.construction || 0}</span></div>
                    {record.resolvedScores?.additional > 0 && (
                      <div className="flex justify-between"><span className="text-slate-600">Additional Score</span><span>{record.resolvedScores.additional}</span></div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 mt-2">
                      <span>Total Score</span><span>{record.resolvedScores?.totalScore || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 print:p-4 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 print:mb-2 border-b border-slate-100 pb-2">Building & Land</h4>
                  <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
                    <div className="flex justify-between"><span className="text-slate-600">Assessed Building Value</span><span className="font-medium">{formatCurrency(record.calculationBreakdown.assessedBuildingValue || 0)}</span></div>
                    <div className="flex justify-between text-red-600">
                      <span>Depreciation ({record.calculationBreakdown.depreciationPercent || 0}%)</span>
                      <span>- {formatCurrency(record.calculationBreakdown.depreciationAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Land Addition</span>
                      <span>+ {formatCurrency(record.calculationBreakdown.landAddition || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Effective Period */}
            {record.property.effectFrom && (
              <div className="bg-emerald-50 text-emerald-900 p-4 print:p-2 rounded-xl border border-emerald-200 mt-8 print:mt-2 flex items-center justify-between">
                <div>
                  <h3 className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">Effective Period</h3>
                  <div className="text-lg font-bold">{record.property.effectFrom} <span className="text-emerald-700 font-medium">({record.property.effectYear || 'N/A'})</span></div>
                </div>
              </div>
            )}

            {/* Final Results */}
            <div className="bg-slate-900 text-white p-6 print:p-3 rounded-xl shadow-inner mt-4 print:mt-2 print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1 print:mb-0">Final Effective Valuation</h3>
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
                  {record.calculationBreakdown.commercialSurcharge != null && (
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
