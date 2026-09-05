import mongoose, { Schema, Document } from 'mongoose';

export interface IValuationRecord extends Document {
  property: {
    holdingNumber?: string;
    ownerName?: string;
    address?: string;
    assessmentDate?: Date;
    notes?: string;
  };
  inputs: {
    coverAreaSqFt: number;
    zoneScoreCode: string;
    useOrCommercialScoreCode: string;
    constructionScoreCode: string;
    optionalFourthScoreCode?: string;
    buildingAgeYears: number;
    landArea: {
      bigha: number;
      khatha: number;
      chatak: number;
      sqFt: number;
    };
  };
  resolvedScores: {
    zone: number;
    usage: number;
    construction: number;
    additional: number;
    totalScore: number;
  };
  calculationBreakdown: {
    assessedBuildingValue: number;
    depreciationPercent: number;
    depreciationAmount: number;
    totalLandSqFt: number;
    landAddition: number;
    calculatedValuation: number;
    minimumApplied: boolean;
    effectiveValuation: number;
    quarterTax: number;
    commercialSurcharge: number | null;
  };
  rulesVersion: string;
  calculationMode: 'excel-strict' | 'normalized';
}

const ValuationRecordSchema = new Schema(
  {
    property: {
      holdingNumber: { type: String },
      ownerName: { type: String },
      address: { type: String },
      assessmentDate: { type: Date },
      notes: { type: String },
    },
    inputs: {
      coverAreaSqFt: { type: Number, required: true },
      zoneScoreCode: { type: String, required: true },
      useOrCommercialScoreCode: { type: String, required: true },
      constructionScoreCode: { type: String, required: true },
      optionalFourthScoreCode: { type: String },
      buildingAgeYears: { type: Number, required: true },
      landArea: {
        bigha: { type: Number, required: true },
        khatha: { type: Number, required: true },
        chatak: { type: Number, required: true },
        sqFt: { type: Number, required: true },
      },
    },
    resolvedScores: {
      zone: { type: Number, required: true },
      usage: { type: Number, required: true },
      construction: { type: Number, required: true },
      additional: { type: Number, default: 0 },
      totalScore: { type: Number, required: true },
    },
    calculationBreakdown: {
      assessedBuildingValue: { type: Number, required: true },
      depreciationPercent: { type: Number, required: true },
      depreciationAmount: { type: Number, required: true },
      totalLandSqFt: { type: Number, required: true },
      landAddition: { type: Number, required: true },
      calculatedValuation: { type: Number, required: true },
      minimumApplied: { type: Boolean, required: true },
      effectiveValuation: { type: Number, required: true },
      quarterTax: { type: Number, required: true },
      commercialSurcharge: { type: Number, default: null },
    },
    rulesVersion: { type: String, required: true },
    calculationMode: { type: String, enum: ['excel-strict', 'normalized'], default: 'excel-strict' },
  },
  { timestamps: true }
);

export const ValuationRecord = mongoose.model<IValuationRecord>('ValuationRecord', ValuationRecordSchema);
