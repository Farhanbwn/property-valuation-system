import { useState, useEffect } from 'react';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { valuationService } from '../services/api';
import { Calculator, Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  propertyDetails: z.object({
    holdingNumber: z.string().optional(),
    ownerName: z.string().optional(),
    address: z.string().optional(),
    assessmentDate: z.string().optional(),
    notes: z.string().optional()
  }),
  coverAreaSqFt: z.coerce.number().min(0, 'Must be positive'),
  zoneScoreCode: z.string().min(1, 'Required'),
  useOrCommercialScoreCode: z.string().min(1, 'Required'),
  constructionScoreCode: z.string().min(1, 'Required'),
  optionalFourthScoreCode: z.string().optional(),
  buildingAgeYears: z.coerce.number().min(0, 'Must be positive'),
  landArea: z.object({
    bigha: z.coerce.number().min(0).default(0),
    khatha: z.coerce.number().min(0).default(0),
    chatak: z.coerce.number().min(0).default(0),
    sqFt: z.coerce.number().min(0).default(0)
  })
});

type FormData = z.infer<typeof formSchema>;

const PropertyValuation = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveResult, setLiveResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useRHForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      coverAreaSqFt: 0,
      buildingAgeYears: 0,
      landArea: { bigha: 0, khatha: 0, chatak: 0, sqFt: 0 }
    }
  });

  const watchAllFields = watch();

  useEffect(() => {
    valuationService.getRules()
      .then(res => {
        setRules(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load valuation rules. Ensure database is seeded and running.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (
      watchAllFields.coverAreaSqFt >= 0 && 
      watchAllFields.zoneScoreCode && 
      watchAllFields.useOrCommercialScoreCode && 
      watchAllFields.constructionScoreCode && 
      watchAllFields.buildingAgeYears >= 0
    ) {
      handleLiveCalculation(watchAllFields);
    }
  }, [JSON.stringify(watchAllFields)]);

  const handleLiveCalculation = async (data: FormData) => {
    try {
      setCalculating(true);
      const res = await valuationService.calculatePropertyValuation(data);
      setLiveResult(res.data.data);
    } catch (err) {
      // Ignore live calculation errors silently
    } finally {
      setCalculating(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      const res = await valuationService.savePropertyValuation(data);
      navigate(`/valuation/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save valuation');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  if (loading) return <div className="p-10 text-center">Loading rules...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* LEFT: FORM */}
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Property Valuation Calculator</h1>
        
        <form id="valuation-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">1. Property Details (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Holding Number</label>
                <input type="text" {...register('propertyDetails.holdingNumber')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                <input type="text" {...register('propertyDetails.ownerName')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">2. Building Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Covered Area (Sq Ft) *</label>
                <input type="number" min="0" {...register('coverAreaSqFt')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border" />
                {errors.coverAreaSqFt && <p className="text-red-500 text-xs mt-1">{errors.coverAreaSqFt.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Building Age (Years) *</label>
                <input type="number" min="0" {...register('buildingAgeYears')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border" />
                {errors.buildingAgeYears && <p className="text-red-500 text-xs mt-1">{errors.buildingAgeYears.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                  Zone *
                  {watchAllFields.zoneScoreCode && (
                    <span className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">
                      Waitage: Rs. {rules.scoreLookup.find((s:any) => s.code === watchAllFields.zoneScoreCode)?.value.toFixed(2)}
                    </span>
                  )}
                </label>
                <select {...register('zoneScoreCode')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border">
                  <option value="">Select Zone...</option>
                  {rules.scoreLookup.filter((s:any) => s.type === 'zone').map((s:any) => (
                    <option key={s.code} value={s.code}>{s.code} - {s.description || 'Zone'} (Rs. {s.value.toFixed(2)})</option>
                  ))}
                </select>
                {errors.zoneScoreCode && <p className="text-red-500 text-xs mt-1">{errors.zoneScoreCode.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                  Usage / Commercial Category *
                  {watchAllFields.useOrCommercialScoreCode && (
                    <span className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">
                      Waitage: Rs. {rules.scoreLookup.find((s:any) => s.code === watchAllFields.useOrCommercialScoreCode)?.value.toFixed(2)}
                    </span>
                  )}
                </label>
                <select {...register('useOrCommercialScoreCode')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border">
                  <option value="">Select Usage...</option>
                  {rules.scoreLookup.filter((s:any) => ['usage', 'commercial', 'combined'].includes(s.type)).map((s:any) => (
                    <option key={s.code} value={s.code}>{s.code} - {s.description || 'Usage'} (Rs. {s.value.toFixed(2)})</option>
                  ))}
                </select>
                {errors.useOrCommercialScoreCode && <p className="text-red-500 text-xs mt-1">{errors.useOrCommercialScoreCode.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                  Construction Type *
                  {watchAllFields.constructionScoreCode && (
                    <span className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">
                      Waitage: Rs. {rules.scoreLookup.find((s:any) => s.code === watchAllFields.constructionScoreCode)?.value.toFixed(2)}
                    </span>
                  )}
                </label>
                <select {...register('constructionScoreCode')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border">
                  <option value="">Select Construction...</option>
                  {rules.scoreLookup.filter((s:any) => s.type === 'construction').map((s:any) => (
                    <option key={s.code} value={s.code}>{s.code} - {s.description || 'Construction'} (Rs. {s.value.toFixed(2)})</option>
                  ))}
                </select>
                {errors.constructionScoreCode && <p className="text-red-500 text-xs mt-1">{errors.constructionScoreCode.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">3. Land Area</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bigha</label>
                <input type="number" min="0" {...register('landArea.bigha')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khatha</label>
                <input type="number" min="0" {...register('landArea.khatha')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chatak</label>
                <input type="number" min="0" {...register('landArea.chatak')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sq Ft</label>
                <input type="number" min="0" {...register('landArea.sqFt')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border" />
              </div>
            </div>
            {liveResult && (
              <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Converted Land Area:</span>
                <span className="text-lg font-bold text-slate-800">{liveResult.land.totalSqFt.toLocaleString()} sq ft</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* RIGHT: LIVE CALCULATION */}
      <div className="w-full lg:w-96 space-y-6 shrink-0">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden sticky top-6">
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            <h2 className="font-semibold flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Live Summary
            </h2>
            {calculating && <span className="text-xs text-slate-400 animate-pulse">Calculating...</span>}
          </div>
          
          <div className="p-6">
            {!liveResult ? (
              <div className="text-center text-slate-500 py-8">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm">Enter required building info and select codes to see live calculation.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Total Score</span>
                  <span className="font-bold text-slate-900">{liveResult.scores.total}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Building Valuation</span>
                  <span className="font-medium text-slate-900">{formatCurrency(liveResult.building.assessedValue)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 text-red-600">
                  <span>Depreciation ({liveResult.building.depreciationPercent}%)</span>
                  <span>- {formatCurrency(liveResult.building.depreciationAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 text-emerald-600">
                  <span>Land Addition</span>
                  <span>+ {formatCurrency(liveResult.land.landAddition)}</span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-700">Calculated Value</span>
                    <span className="font-bold">{formatCurrency(liveResult.valuation.calculated)}</span>
                  </div>
                  {liveResult.valuation.minimumApplied && (
                    <div className="text-xs text-accent bg-accent/10 p-1.5 rounded inline-block w-full text-center mb-2">
                      Minimum valuation applied (₹1,150)
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Quarter Tax</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(liveResult.charges.quarterTax)}</span>
                    </div>
                    {liveResult.charges.commercialSurcharge !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Commercial Surcharge</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(liveResult.charges.commercialSurcharge)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    form="valuation-form"
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-primary hover:bg-primary-light text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Valuation'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyValuation;
