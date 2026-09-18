import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { valuationService } from '../services/api';
import { Map, Calculator, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const formSchema = z.object({
  propertyDetails: z.object({
    ownerName: z.string().optional(),
    district: z.string().optional(),
    ulbName: z.string().optional(),
    ward: z.coerce.number().optional(),
    location: z.string().optional(),
    holdingNumber: z.string().optional(),
    assessmentDate: z.string().optional(),
    notes: z.string().optional(),
    applicationNo: z.string().optional(),
    applicationDate: z.string().optional(),
    jlNo: z.string().optional(),
    khatianNo: z.string().optional(),
    lrPlot: z.string().optional(),
    effectFrom: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], { required_error: 'Required', invalid_type_error: 'Required' }),
    effectYear: z.string().min(1, 'Required')
  }),
  zone: z.string().min(1, 'Zone is required'),
  landType: z.enum(['VACANT_LAND', 'POND']),
  landArea: z.object({
    bigha: z.coerce.number().min(0).default(0),
    khatha: z.coerce.number().min(0).default(0),
    chatak: z.coerce.number().min(0).default(0),
    sqFt: z.coerce.number().min(0).default(0)
  })
});

type FormData = z.infer<typeof formSchema>;

const LandValuation = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [rules, setRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveResult, setLiveResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      propertyDetails: {
        district: 'Purba Bardhaman',
        ulbName: 'Burdwan Municipality'
      },
      landType: 'VACANT_LAND',
      landArea: { bigha: 0, khatha: 0, chatak: 0, sqFt: 0 }
    }
  });

  const watchAllFields = watch();
  const selectedWard = watch('propertyDetails.ward');

  useEffect(() => {
    setValue('propertyDetails.location', '');
  }, [selectedWard, setValue]);

  useEffect(() => {
    valuationService.getRules()
      .then(res => {
        setRules(res.data.data);
        if (id) {
          valuationService.getValuationById(id).then(recordRes => {
            const d = recordRes.data.data;
            const propertyDetails = { ...(d.property || {}) };
            if (propertyDetails.applicationDate) {
              propertyDetails.applicationDate = propertyDetails.applicationDate.substring(0, 10);
            }
            if (propertyDetails.assessmentDate) {
              propertyDetails.assessmentDate = propertyDetails.assessmentDate.substring(0, 10);
            }
            
            reset({
              propertyDetails: {
                ...propertyDetails,
                effectFrom: propertyDetails.effectFrom || '',
                effectYear: propertyDetails.effectYear || ''
              },
              zone: d.inputs.zone,
              landType: d.inputs.landType,
              landArea: d.inputs.landArea || { bigha: 0, khatha: 0, chatak: 0, sqFt: 0 }
            });
            setLoading(false);
          }).catch(() => {
            setError('Failed to load existing valuation.');
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id, reset]);

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

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      let res;
      if (id) {
        res = await valuationService.updateStandaloneLandValuation(id, data);
      } else {
        res = await valuationService.saveStandaloneLandValuation(data);
      }
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
  if (!rules) return <div className="p-10 text-center text-red-500">Failed to load rules.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* LEFT: FORM */}
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit Land Valuation' : 'Land Valuation Calculator'}</h1>
        <p className="text-slate-500">Calculate valuation for empty land or ponds.</p>
        
        {error && <div className="p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

        <form id="land-valuation-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">1. Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                <input type="text" {...register('propertyDetails.ownerName')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                <input type="text" {...register('propertyDetails.district')} disabled className="w-full rounded-md border-slate-300 shadow-sm bg-slate-100 text-slate-500 p-2 border" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ULB Name</label>
                <input type="text" {...register('propertyDetails.ulbName')} disabled className="w-full rounded-md border-slate-300 shadow-sm bg-slate-100 text-slate-500 p-2 border" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
                <select {...register('propertyDetails.ward')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500 bg-white">
                  <option value="">Select Ward...</option>
                  {rules?.locationData?.wards.map((w: any) => (
                    <option key={w.ward} value={w.ward}>Ward {w.ward}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <select {...register('propertyDetails.location')} disabled={!selectedWard} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500 bg-white disabled:bg-slate-100">
                  <option value="">Select Location...</option>
                  {selectedWard && rules?.locationData?.wards.find((w: any) => w.ward === Number(selectedWard))?.locations.map((loc: string) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>


              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Holding Number</label>
                <input type="text" {...register('propertyDetails.holdingNumber')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>

            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">2. Application & Land Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Application No</label>
                <input type="text" {...register('propertyDetails.applicationNo')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Application Date</label>
                <input type="date" max={watchAllFields.propertyDetails?.assessmentDate || today} {...register('propertyDetails.applicationDate')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">J.L No</label>
                <input type="text" {...register('propertyDetails.jlNo')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khatian No</label>
                <input type="text" {...register('propertyDetails.khatianNo')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">L.R. Plot</label>
                <input type="text" {...register('propertyDetails.lrPlot')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>

            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">3. Land Details</h2>
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
                  <option value="VACANT_LAND">Vacant Land</option>
                  <option value="POND">Pond (50% Valuation)</option>
                </select>
              </div>

            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">4. Land Area</h2>
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">5. Effective Period</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">With Effect from <span className="text-red-500">*</span></label>
                <select {...register('propertyDetails.effectFrom')} className={`w-full rounded-md shadow-sm p-2 border ${errors.propertyDetails?.effectFrom ? 'border-red-300' : 'border-slate-300'} focus:border-blue-500 focus:ring-blue-500 bg-white`}>
                  <option value="">Select Quarter...</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
                {errors.propertyDetails?.effectFrom && <p className="mt-1 text-xs text-red-500">{errors.propertyDetails.effectFrom.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year <span className="text-red-500">*</span></label>
                <input type="text" {...register('propertyDetails.effectYear')} placeholder="e.g. 2025-26" className={`w-full rounded-md shadow-sm p-2 border ${errors.propertyDetails?.effectYear ? 'border-red-300' : 'border-slate-300'} focus:border-blue-500 focus:ring-blue-500`} />
                {errors.propertyDetails?.effectYear && <p className="mt-1 text-xs text-red-500">{errors.propertyDetails.effectYear.message}</p>}
              </div>
            </div>
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
                  <span className="text-slate-600">Vacant Land Valuation</span>
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

                <div className="pt-6">
                  {Object.keys(errors).length > 0 && (
                    <p className="text-red-500 text-xs text-center mb-3 font-medium bg-red-50 py-2 rounded border border-red-100">
                      Please fill in all mandatory fields before saving.
                    </p>
                  )}
                  <button 
                    form="land-valuation-form"
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-primary hover:bg-primary-light text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : id ? 'Update Valuation' : 'Save Valuation'}
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

export default LandValuation;
