import { useState, useEffect } from 'react';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { valuationService } from '../services/api';
import { BURDWAN_MOUZA_LIST } from '../data/mouzaData';
import { Controller } from 'react-hook-form';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Calculator, Save, AlertCircle } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const formSchema = z.object({
  propertyDetails: z.object({
    ownerName: z.string().min(1, 'Required'),
    district: z.string().optional(),
    ulbName: z.string().optional(),
    ward: z.coerce.number().optional(),
    location: z.string().optional(),
    holdingNumber: z.string().optional(),
    address: z.string().optional(),
    assessmentDate: z.string().optional(),
    notes: z.string().optional(),
    applicationNo: z.string().optional(),
    applicationDate: z.string().optional(),
    jlNo: z.string().optional(),
    mouza: z.string().optional(),
    khatianNo: z.string().optional(),
    lrPlot: z.string().optional(),
    effectFrom: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], { required_error: 'Required', invalid_type_error: 'Required' }),
    effectYear: z.string().min(1, 'Required')
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
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [rules, setRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveResult, setLiveResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, watch, setValue, reset, control, formState: { errors } } = useRHForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      propertyDetails: {
        district: 'Purba Bardhaman',
        ulbName: 'Burdwan Municipality'
      },
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
              propertyDetails: propertyDetails,
              coverAreaSqFt: d.inputs.coverAreaSqFt,
              zoneScoreCode: d.inputs.zoneScoreCode,
              useOrCommercialScoreCode: d.inputs.useOrCommercialScoreCode,
              constructionScoreCode: d.inputs.constructionScoreCode,
              optionalFourthScoreCode: d.inputs.optionalFourthScoreCode || '',
              buildingAgeYears: d.inputs.buildingAgeYears,
              landArea: d.inputs.landArea || { bigha: 0, khatha: 0, chatak: 0, sqFt: 0 }
            });
            setLoading(false);
          }).catch(() => {
            setError('Failed to load existing valuation.');
            setLoading(false);
          });
        } else if (location.state?.importedInspection) {
          const d = location.state.importedInspection;
          reset({
            propertyDetails: {
              applicationNo: d.applicationNo || '',
              applicationDate: d.applicationDate ? d.applicationDate.substring(0, 10) : today,
              ownerName: d.ownerName || '',
              district: d.district || 'Purba Bardhaman',
              ulbName: d.ulbName || 'Burdwan Municipality',
              ward: d.ward || '',
              location: d.location || '',
              holdingNumber: d.holdingNumber || '',
              jlNo: d.jlNo || '',
              mouza: d.mouza || '',
              khatianNo: d.khatianNo || '',
              lrPlot: d.lrPlot || '',
              effectFrom: d.effectFrom || '',
              effectYear: d.effectYear || '',
              notes: d.remark ? `Imported from Inspection Book. Remark: ${d.remark}` : 'Imported from Inspection Book.'
            },
            coverAreaSqFt: d.coverAreaSqFt || 0,
            zoneScoreCode: '',
            useOrCommercialScoreCode: d.natureOfUseCode || '',
            constructionScoreCode: d.constructionScoreCode || '',
            optionalFourthScoreCode: '',
            buildingAgeYears: d.buildingAgeYears || 0,
            landArea: d.landArea || { bigha: 0, khatha: 0, chatak: 0, sqFt: 0 }
          });
          
          // Clear state so refresh doesn't overwrite
          window.history.replaceState({}, '');
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Failed to load valuation rules. Ensure database is seeded and running.');
        setLoading(false);
      });
  }, [id, reset, location.state]);

  const selectedWard = watch('propertyDetails.ward');
  useEffect(() => {
    setValue('propertyDetails.location', '');
  }, [selectedWard, setValue]);

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
      let res;
      if (id) {
        res = await valuationService.updatePropertyValuation(id, data);
      } else {
        res = await valuationService.savePropertyValuation(data);
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
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* LEFT: FORM */}
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit Property Valuation' : 'Property Valuation Calculator'}</h1>
        
        <form id="valuation-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">1. Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name <span className="text-red-500">*</span></label>
                <input type="text" {...register('propertyDetails.ownerName')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
                {errors.propertyDetails?.ownerName && <p className="text-red-500 text-xs mt-1">{errors.propertyDetails.ownerName.message}</p>}
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
                <Controller
                  name="propertyDetails.ward"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Ward..."
                      options={rules?.locationData?.wards.map((w: any) => ({
                        label: `Ward ${w.ward}`,
                        value: String(w.ward)
                      })) || []}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <Controller
                  name="propertyDetails.location"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!selectedWard}
                      placeholder="Select Location..."
                      options={(selectedWard && rules?.locationData?.wards.find((w: any) => w.ward === Number(selectedWard))?.locations.map((loc: string) => ({
                        label: loc,
                        value: loc
                      }))) || []}
                    />
                  )}
                />
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
                <Controller
                  name="propertyDetails.jlNo"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        const match = BURDWAN_MOUZA_LIST.find(m => m.jlNo === val);
                        if (match) setValue('propertyDetails.mouza', match.mouza);
                      }}
                      placeholder="Select J.L No..."
                      options={BURDWAN_MOUZA_LIST.map(item => ({ label: item.jlNo, value: item.jlNo }))}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mouza</label>
                <Controller
                  name="propertyDetails.mouza"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        const match = BURDWAN_MOUZA_LIST.find(m => m.mouza === val);
                        if (match) setValue('propertyDetails.jlNo', match.jlNo);
                      }}
                      placeholder="Select Mouza..."
                      options={BURDWAN_MOUZA_LIST.map(item => ({ label: item.mouza, value: item.mouza }))}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khatian No</label>
                <input type="text" {...register('propertyDetails.khatianNo')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">L.R. Plot</label>
                <input type="text" {...register('propertyDetails.lrPlot')} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" />
              </div>

            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">3. Building Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Covered Area (Sq Ft) <span className="text-red-500">*</span></label>
                <input type="number" min="0" {...register('coverAreaSqFt')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border" />
                {errors.coverAreaSqFt && <p className="text-red-500 text-xs mt-1">{errors.coverAreaSqFt.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Building Age (Years) <span className="text-red-500">*</span></label>
                <input type="number" min="0" {...register('buildingAgeYears')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border" />
                {errors.buildingAgeYears && <p className="text-red-500 text-xs mt-1">{errors.buildingAgeYears.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between items-center">
                  <span>Zone <span className="text-red-500">*</span></span>
                  {watchAllFields.zoneScoreCode && (
                    <span className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">
                      Waitage: Rs. {rules.scoreLookup.find((s:any) => s.code === watchAllFields.zoneScoreCode)?.value.toFixed(2)}
                    </span>
                  )}
                </label>
                <Controller
                  name="zoneScoreCode"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Zone..."
                      options={rules.scoreLookup.filter((s:any) => s.type === 'zone').map((s:any) => ({
                        label: `${s.code} - ${s.description || 'Zone'} (Rs. ${s.value.toFixed(2)})`,
                        value: s.code
                      }))}
                    />
                  )}
                />
                {errors.zoneScoreCode && <p className="text-red-500 text-xs mt-1">{errors.zoneScoreCode.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between items-center">
                  <span>Usage / Commercial Category <span className="text-red-500">*</span></span>
                  {watchAllFields.useOrCommercialScoreCode && (
                    <span className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">
                      Waitage: Rs. {rules.scoreLookup.find((s:any) => s.code === watchAllFields.useOrCommercialScoreCode)?.value.toFixed(2)}
                    </span>
                  )}
                </label>
                <Controller
                  name="useOrCommercialScoreCode"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Usage..."
                      options={rules.scoreLookup.filter((s:any) => ['usage', 'commercial', 'combined'].includes(s.type)).map((s:any) => ({
                        label: `${s.code} - ${s.description || 'Usage'} (Rs. ${s.value.toFixed(2)})`,
                        value: s.code
                      }))}
                    />
                  )}
                />
                {errors.useOrCommercialScoreCode && <p className="text-red-500 text-xs mt-1">{errors.useOrCommercialScoreCode.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between items-center">
                  <span>Construction Type <span className="text-red-500">*</span></span>
                  {watchAllFields.constructionScoreCode && (
                    <span className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">
                      Waitage: Rs. {rules.scoreLookup.find((s:any) => s.code === watchAllFields.constructionScoreCode)?.value.toFixed(2)}
                    </span>
                  )}
                </label>
                <Controller
                  name="constructionScoreCode"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Construction..."
                      options={rules.scoreLookup.filter((s:any) => s.type === 'construction').map((s:any) => ({
                        label: `${s.code} - ${s.description || 'Construction'} (Rs. ${s.value.toFixed(2)})`,
                        value: s.code
                      }))}
                    />
                  )}
                />
                {errors.constructionScoreCode && <p className="text-red-500 text-xs mt-1">{errors.constructionScoreCode.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">4. Land Area</h2>
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">5. Effective Period</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">With Effect from <span className="text-red-500">*</span></label>
                <Controller
                  name="propertyDetails.effectFrom"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Quarter..."
                      options={[
                        { label: 'Q1', value: 'Q1' },
                        { label: 'Q2', value: 'Q2' },
                        { label: 'Q3', value: 'Q3' },
                        { label: 'Q4', value: 'Q4' }
                      ]}
                    />
                  )}
                />
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
      <div className="w-full lg:w-80 xl:w-96 space-y-6 shrink-0">
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
                  {Object.keys(errors).length > 0 && (
                    <p className="text-red-500 text-xs text-center mb-3 font-medium bg-red-50 py-2 rounded border border-red-100">
                      Please fill in all mandatory fields before saving.
                    </p>
                  )}
                  <button 
                    form="valuation-form"
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

export default PropertyValuation;
