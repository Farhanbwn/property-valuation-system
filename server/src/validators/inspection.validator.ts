import { z } from 'zod';
import mongoose from 'mongoose';

export const inspectionLandAreaSchema = z.object({
  bigha: z.coerce.number().min(0).default(0),
  khatha: z.coerce.number().min(0).default(0),
  chatak: z.coerce.number().min(0).default(0),
  sqFt: z.coerce.number().min(0).default(0),
}).default({ bigha: 0, khatha: 0, chatak: 0, sqFt: 0 });

export const createInspectionSchema = z.object({
  applicationNo: z.string().trim().max(100).optional().default(''),
  applicationDate: z.coerce.date().optional().default(() => new Date()),
  ownerName: z.string().trim().min(1, 'Owner name is required').max(200),
  district: z.string().trim().max(100).optional().default('Purba Bardhaman'),
  ulbName: z.string().trim().max(100).optional().default('Burdwan Municipality'),
  ward: z.coerce.number().optional(),
  location: z.string().trim().max(200).optional().default(''),
  holdingNumber: z.string().trim().max(100).optional().default(''),
  jlNo: z.string().trim().max(100).optional().default(''),
  mouza: z.string().trim().max(100).optional().default(''),
  khatianNo: z.string().trim().max(100).optional().default(''),
  lrPlot: z.string().trim().max(100).optional().default(''),
  coverAreaSqFt: z.coerce.number().min(0, 'Covered area cannot be negative'),
  buildingAgeYears: z.coerce.number().min(0, 'Building age cannot be negative'),
  natureOfUseCode: z.string().trim().max(50).optional().default(''),
  constructionScoreCode: z.string().trim().max(50).optional().default(''),
  landArea: inspectionLandAreaSchema,
  noOfFloor: z.string().trim().max(50).optional().default('I'),
  remark: z.string().trim().max(2000).optional().default(''),
});

// Update schema strictly whitelists editable fields and blocks modification of status, inspectorId, parentUserId
export const updateInspectionSchema = createInspectionSchema.partial();

export const batchSubmitSchema = z.object({
  inspectionIds: z.array(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid inspection ID format',
    })
  ).min(1, 'At least one inspection ID is required'),
});
