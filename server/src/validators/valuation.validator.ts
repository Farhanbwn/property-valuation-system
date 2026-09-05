import { z } from 'zod';

export const landAreaSchema = z.object({
  bigha: z.coerce.number().min(0, "Bigha cannot be negative"),
  khatha: z.coerce.number().min(0, "Khatha cannot be negative"),
  chatak: z.coerce.number().min(0, "Chatak cannot be negative"),
  sqFt: z.coerce.number().min(0, "Square feet cannot be negative")
});

export const propertyValuationInputSchema = z.object({
  coverAreaSqFt: z.coerce.number().min(0, "Covered area cannot be negative"),
  zoneScoreCode: z.string().min(1, "Zone code is required"),
  useOrCommercialScoreCode: z.string().min(1, "Usage/Commercial code is required"),
  constructionScoreCode: z.string().min(1, "Construction code is required"),
  optionalFourthScoreCode: z.string().optional(),
  buildingAgeYears: z.coerce.number().min(0, "Building age cannot be negative"),
  landArea: landAreaSchema,
  propertyDetails: z.object({
    holdingNumber: z.string().optional(),
    ownerName: z.string().optional(),
    address: z.string().optional(),
    assessmentDate: z.string().optional(),
    notes: z.string().optional()
  }).optional()
});

export const standaloneLandValuationInputSchema = z.object({
  zone: z.string().min(1, "Zone code is required"),
  landArea: landAreaSchema,
  landType: z.enum(['NORMAL', 'POND']).default('NORMAL')
});
