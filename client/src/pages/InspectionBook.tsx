import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { inspectionService, valuationService } from '../services/api';
import { BURDWAN_MOUZA_LIST } from '../data/mouzaData';
import { Save, CheckCircle2, Printer, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { CustomSelect } from '../components/ui/CustomSelect';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV'];

const formSchema = z.object({
  applicationNo: z.string().optional(),
  applicationDate: z.string().min(1, 'Required'),
  ownerName: z.string().min(1, 'Required'),
  district: z.string().optional(),
  ulbName: z.string().optional(),
  ward: z.coerce.number().optional(),
  location: z.string().optional(),
  holdingNumber: z.string().optional(),
  jlNo: z.string().optional(),
  mouza: z.string().optional(),
  khatianNo: z.string().optional(),
  lrPlot: z.string().optional(),
  coverAreaSqFt: z.coerce.number().min(0, 'Must be positive'),
  buildingAgeYears: z.coerce.number().min(0, 'Must be positive'),
  natureOfUseCode: z.string().optional(),
  constructionScoreCode: z.string().optional(),
  landArea: z.object({
    bigha: z.coerce.number().min(0).optional(),
    khatha: z.coerce.number().min(0).optional(),
    chatak: z.coerce.number().min(0).optional(),
    sqFt: z.coerce.number().min(0).optional()
  }).optional(),
  noOfFloor: z.string().optional(),
  remark: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const InspectionBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rules, setRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, watch, setValue, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicationDate: today,
      district: 'Purba Bardhaman',
      ulbName: 'Burdwan Municipality',
      coverAreaSqFt: 0,
      buildingAgeYears: 0,
      landArea: { bigha: 0, khatha: 0, chatak: 0, sqFt: 0 }
    }
  });

  const selectedWard = watch('ward');
  const natureOfUseCode = watch('natureOfUseCode');
  const isVacantOrPond = ['VACANT_LAND', 'POND'].includes(natureOfUseCode || '');

  useEffect(() => {
    valuationService.getRules()
      .then(res => {
        setRules(res.data.data);
        if (id) {
          inspectionService.getInspectionById(id).then(recordRes => {
            const d = recordRes.data.data;
            if (d.applicationDate) {
              d.applicationDate = d.applicationDate.substring(0, 10);
            }
            if (d.status && d.status !== 'draft') {
              setIsReadOnly(true);
            }
            reset(d);
            setLoading(false);
          }).catch(() => {
            setError('Failed to load existing inspection.');
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Failed to load valuation rules for dropdowns.');
        setLoading(false);
      });
  }, [id, reset]);

  useEffect(() => {
    // Only clear location if we are not loading an existing record, or if we change ward manually
    // Since we don't have a reliable way to distinguish manual change from form reset here in a simple way,
    // we just skip this for now. `reset(d)` correctly sets both ward and location.
    // If user changes ward, they will have to select location again which is fine.
  }, [selectedWard, setValue]);

  useEffect(() => {
    if (isVacantOrPond) {
      setValue('coverAreaSqFt', 0);
      setValue('buildingAgeYears', 0);
      setValue('constructionScoreCode', '');
      setValue('noOfFloor', '');
    }
  }, [isVacantOrPond, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      setError(null);
      if (id) {
        await inspectionService.updateInspection(id, data);
      } else {
        await inspectionService.createInspection(data);
      }
      setSuccess(true);
      
      if (!id) {
        // Reset form but keep default values and today's date if creating new
        reset({
          applicationDate: today,
          district: 'Purba Bardhaman',
          ulbName: 'Burdwan Municipality',
          coverAreaSqFt: 0,
          buildingAgeYears: 0,
          landArea: { bigha: 0, khatha: 0, chatak: 0, sqFt: 0 }
        });
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save inspection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading form...</div>;
  if (error && !rules) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-slate-900">
          {isReadOnly ? 'Inspection Preview' : 'Inspection Book'}
        </h1>
        {isReadOnly && (
          <div className="flex space-x-3">
            <Link 
              to="/inspection/list"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <button 
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200 text-sm mb-6 print:hidden">
          This inspection has been submitted and is currently in <strong>read-only</strong> mode.
        </div>
      )}
      
      {/* Success Modal Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-sm w-full mx-4 transform transition-all flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Success!</h3>
            <p className="text-slate-500 mb-6">
              {id 
                ? 'Inspection updated successfully.' 
                : 'Inspection submitted successfully. A new blank form is ready.'}
            </p>
            <button 
              onClick={() => {
                setSuccess(false);
                if (id) {
                  navigate('/inspection/list');
                } else {
                  window.location.reload();
                }
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isReadOnly} className="space-y-6">
        
        {/* Section 1: Application Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">1. Application Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Application No</label>
              <input type="text" {...register('applicationNo')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Application Date</label>
              <input type="date" {...register('applicationDate')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
              {errors.applicationDate && <p className="text-red-500 text-xs mt-1">{errors.applicationDate.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Property & Location Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">2. Owner & Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name <span className="text-red-500">*</span></label>
              <input type="text" {...register('ownerName')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
              {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
              <input type="text" {...register('district')} disabled className="w-full rounded-md border-slate-300 shadow-sm bg-slate-100 text-slate-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ULB Name</label>
              <input type="text" {...register('ulbName')} disabled className="w-full rounded-md border-slate-300 shadow-sm bg-slate-100 text-slate-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
              <Controller
                name="ward"
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
                name="location"
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
              <input type="text" {...register('holdingNumber')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        {/* Section 3: Land Records */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">3. Land Records</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">J.L No</label>
              <Controller
                name="jlNo"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      const match = BURDWAN_MOUZA_LIST.find(m => m.jlNo === val);
                      if (match) setValue('mouza', match.mouza);
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
                name="mouza"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      const match = BURDWAN_MOUZA_LIST.find(m => m.mouza === val);
                      if (match) setValue('jlNo', match.jlNo);
                    }}
                    placeholder="Select Mouza..."
                    options={BURDWAN_MOUZA_LIST.map(item => ({ label: item.mouza, value: item.mouza }))}
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Khatian No</label>
              <input type="text" {...register('khatianNo')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">L.R. Plot</label>
              <input type="text" {...register('lrPlot')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        {/* Section 4: Property Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">4. Property Specifics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nature of Use (Usage / Commercial / Land Type)</label>
              <Controller
                name="natureOfUseCode"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Nature of Use..."
                    options={[
                      ...(rules?.scoreLookup.filter((s:any) => ['usage', 'commercial', 'combined'].includes(s.type)).map((s:any) => ({
                        label: `${s.code} - ${s.description}`,
                        value: s.code
                      })) || []),
                      { label: 'VACANT_LAND - Vacant Land', value: 'VACANT_LAND' },
                      { label: 'POND - Pond (50% Valuation)', value: 'POND' }
                    ]}
                  />
                )}
              />
            </div>

            {!isVacantOrPond && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Covered Area (Sq Ft) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" {...register('coverAreaSqFt')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
                  {errors.coverAreaSqFt && <p className="text-red-500 text-xs mt-1">{errors.coverAreaSqFt.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Building Age (Years) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" {...register('buildingAgeYears')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
                  {errors.buildingAgeYears && <p className="text-red-500 text-xs mt-1">{errors.buildingAgeYears.message}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Construction Type</label>
                  <Controller
                    name="constructionScoreCode"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Construction Type..."
                        options={rules?.scoreLookup.filter((s:any) => s.type === 'construction').map((s:any) => ({
                          label: `${s.code} - ${s.description}`,
                          value: s.code
                        })) || []}
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">No of Floors</label>
                  <Controller
                    name="noOfFloor"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Floors..."
                        options={ROMAN_NUMERALS.map(num => ({ label: num, value: num }))}
                      />
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 5: Land Area Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">5. Land Area Measurement</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bigha</label>
              <input type="number" min="0" {...register('landArea.bigha')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Khatha</label>
              <input type="number" min="0" {...register('landArea.khatha')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chatak</label>
              <input type="number" min="0" {...register('landArea.chatak')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sq Ft</label>
              <input type="number" min="0" {...register('landArea.sqFt')} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        {/* Section 6: Additional Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">6. Additional Remarks</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remark</label>
            <textarea {...register('remark')} rows={3} className="w-full rounded-md border-slate-300 shadow-sm p-2 border focus:border-emerald-500 focus:ring-emerald-500"></textarea>
          </div>
        </div>
        </fieldset>

        {!isReadOnly && (
          <div className="flex justify-end pt-4 pb-12 print:hidden">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-lg flex items-center transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Submitting...' : 'Submit Inspection'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default InspectionBook;
