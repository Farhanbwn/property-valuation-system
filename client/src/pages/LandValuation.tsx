import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { valuationService } from '../services/api';
import { Map, Calculator } from 'lucide-react';

const formSchema = z.object({
  zone: z.string().min(1, 'Zone is required'),
  landType: z.enum(['NORMAL', 'POND']),
  landArea: z.object({
    bigha: z.coerce.number().min(0).default(0),
    khatha: z.coerce.number().min(0).default(0),
    chatak: z.coerce.number().min(0).default(0),
    sqFt: z.coerce.number().min(0).default(0)
  })
});

type FormData = z.infer<typeof formSchema>;

const LandValuation = () => {
  const [rules, setRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveResult, setLiveResult] = useState<any>(null);

  const { register, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      landType: 'NORMAL',
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
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (watchAllFields.zone) {
      handleCalculation(watchAllFields);
    }
  }, [JSON.stringify(watchAllFields)]);

  const handleCalculation = async (data: FormData) => {
    try {
      const res = await valuationService.calculateStandaloneLandValuation(data);
      setLiveResult(res.data.data);
    } catch (err) {
      // Ignore validation errors while typing
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  if (loading) return <div className="p-10 text-center">Loading rules...</div>;
  if (!rules) return <div className="p-10 text-center text-red-500">Failed to load rules.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* LEFT: FORM */}
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Standalone Land Valuation</h1>
        <p className="text-slate-500">Calculate valuation for empty land or ponds.</p>
        
        <form className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">1. Land Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zone *</label>
                <select {...register('zone')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-primary focus:ring-primary">
                  <option value="">Select Zone...</option>
                  {rules.landZoneRatesPerKhatha.map((z: any) => (
                    <option key={z.code} value={z.code}>{z.code} - {z.description || 'Zone'} - {formatCurrency(z.value)}/Khatha</option>
                  ))}
                </select>
                {errors.zone && <p className="text-red-500 text-xs mt-1">{errors.zone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Land Type *</label>
                <select {...register('landType')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-primary focus:ring-primary">
                  <option value="NORMAL">Normal</option>
                  <option value="POND">Pond (50% Valuation)</option>
                </select>
              </div>

            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">2. Land Area</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bigha</label>
                <input type="number" min="0" {...register('landArea.bigha')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khatha</label>
                <input type="number" min="0" {...register('landArea.khatha')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chatak</label>
                <input type="number" min="0" {...register('landArea.chatak')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sq Ft</label>
                <input type="number" min="0" {...register('landArea.sqFt')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-primary focus:ring-primary" />
              </div>
            </div>
            {liveResult && (
              <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Converted Area:</span>
                <span className="text-lg font-bold text-slate-800">{liveResult.totalLandSqFt.toLocaleString()} sq ft</span>
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
          </div>
          
          <div className="p-6">
            {!liveResult ? (
              <div className="text-center text-slate-500 py-8">
                <Map className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm">Select zone and enter land area to see calculation.</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Market Value / Sq Ft</span>
                  <span className="font-medium text-slate-900">{formatCurrency(liveResult.marketValuePerSqFt)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Actual Cost / Sq Ft</span>
                  <span className="font-medium text-slate-900">{formatCurrency(liveResult.actualCostPerSqFt)}</span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Normal Land Valuation</span>
                  <span className="font-medium text-slate-900">{formatCurrency(liveResult.normalLandValuation)}</span>
                </div>

                {liveResult.pondAdjustment > 0 && (
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 text-red-600">
                    <span>Pond Adjustment (50%)</span>
                    <span>- {formatCurrency(liveResult.pondAdjustment)}</span>
                  </div>
                )}
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-700">Effective Valuation</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(liveResult.effectiveLandValuation)}</span>
                  </div>
                  {liveResult.minimumApplied && (
                    <div className="text-xs text-accent bg-accent/10 p-1.5 rounded inline-block w-full text-center mb-2 mt-2">
                      Minimum valuation applied (₹1,150)
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Quarter Tax / Fee</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(liveResult.quarterTax)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandValuation;
