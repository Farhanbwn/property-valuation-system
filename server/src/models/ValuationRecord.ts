import mongoose, { Schema, Document } from 'mongoose';

export interface IValuationRecord extends Document {
  userId: mongoose.Types.ObjectId;
  valuationType: 'PROPERTY' | 'LAND';
  property: {
    holdingNumber?: string;
    ownerName?: string;
    address?: string;
    district?: string;
    ulbName?: string;
    ward?: number;
    location?: string;
    assessmentDate?: Date;
    notes?: string;
    applicationNo?: string;
    applicationDate?: Date;
    jlNo?: string;
    khatianNo?: string;
    lrPlot?: string;
    effectFrom?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    effectYear?: string;
  };
  inputs: {
    coverAreaSqFt?: number;
    zoneScoreCode?: string;
    useOrCommercialScoreCode?: string;
    constructionScoreCode?: string;
    optionalFourthScoreCode?: string;
    buildingAgeYears?: number;
    zone?: string;
    landType?: 'VACANT_LAND' | 'POND';
    landArea: {
      bigha: number;
      khatha: number;
      chatak: number;
      sqFt: number;
    };
  };
  resolvedScores: {
    zone?: number;
    usage?: number;
    construction?: number;
    additional?: number;
    totalScore?: number;
  };
  calculationBreakdown: {
    assessedBuildingValue?: number;
    depreciationPercent?: number;
    depreciationAmount?: number;
    totalLandSqFt: number;
    landAddition?: number;
    normalLandValuation?: number;
    pondAdjustment?: number;
    calculatedValuation?: number;
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
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    valuationType: { type: String, enum: ['PROPERTY', 'LAND'], default: 'PROPERTY' },
    property: {
      holdingNumber: { type: String },
      ownerName: { type: String },
      address: { type: String },
      district: { type: String },
      ulbName: { type: String },
      ward: { type: Number },
      location: { type: String },
      assessmentDate: { type: Date },
      notes: { type: String },
      applicationNo: { type: String },
      applicationDate: { type: Date },
      jlNo: { type: String },
      khatianNo: { type: String },
      lrPlot: { type: String },
      effectFrom: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'] },
      effectYear: { type: String },
    },
    inputs: {
      coverAreaSqFt: { type: Number },
      zoneScoreCode: { type: String },
      useOrCommercialScoreCode: { type: String },
      constructionScoreCode: { type: String },
      optionalFourthScoreCode: { type: String },
      buildingAgeYears: { type: Number },
      zone: { type: String },
      landType: { type: String, enum: ['VACANT_LAND', 'POND'] },
      landArea: {
        bigha: { type: Number, required: true },
        khatha: { type: Number, required: true },
        chatak: { type: Number, required: true },
        sqFt: { type: Number, required: true },
      },
    },
    resolvedScores: {
      zone: { type: Number },
      usage: { type: Number },
      construction: { type: Number },
      additional: { type: Number, default: 0 },
      totalScore: { type: Number },
    },
    calculationBreakdown: {
      assessedBuildingValue: { type: Number },
      depreciationPercent: { type: Number },
      depreciationAmount: { type: Number },
      totalLandSqFt: { type: Number, required: true },
      landAddition: { type: Number },
      normalLandValuation: { type: Number },
      pondAdjustment: { type: Number },
      calculatedValuation: { type: Number },
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
