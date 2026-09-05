import mongoose, { Schema, Document } from 'mongoose';

export interface IValuationRule extends Document {
  schemaVersion: string;
  name: string;
  active: boolean;
  constants: {
    buildingValuationFactor: number;
    bighaToSqFt: number;
    khathaToSqFt: number;
    chatakToSqFt: number;
    minimumValuation: number;
    commercialSurchargePercent: number;
  };
  scoreLookup: Array<{
    code: string;
    description: string;
    value: number;
    type: string;
  }>;
  landZoneRatesPerKhatha: Array<{
    code: string;
    description: string;
    value: number;
  }>;
  mainLandSlabs: Array<{
    minExclusive: number | null;
    maxInclusive: number | null;
    formula: string;
  }>;
  standaloneLandSlabs: Array<{
    condition: string;
    formula: string;
  }>;
}

const ValuationRuleSchema = new Schema(
  {
    schemaVersion: { type: String, required: true },
    name: { type: String, required: true },
    active: { type: Boolean, default: false },
    constants: {
      buildingValuationFactor: { type: Number, required: true },
      bighaToSqFt: { type: Number, required: true },
      khathaToSqFt: { type: Number, required: true },
      chatakToSqFt: { type: Number, required: true },
      minimumValuation: { type: Number, required: true },
      commercialSurchargePercent: { type: Number, required: true },
    },
    scoreLookup: [
      {
        code: { type: String, required: true },
        description: { type: String, required: true },
        value: { type: Number, required: true },
        type: { type: String, required: true },
      },
    ],
    landZoneRatesPerKhatha: [
      {
        code: { type: String, required: true },
        description: { type: String, required: true },
        value: { type: Number, required: true },
      },
    ],
    mainLandSlabs: [
      {
        minExclusive: { type: Number, default: null },
        maxInclusive: { type: Number, default: null },
        formula: { type: String, required: true },
      },
    ],
    standaloneLandSlabs: [
      {
        condition: { type: String, required: true },
        formula: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const ValuationRule = mongoose.model<IValuationRule>('ValuationRule', ValuationRuleSchema);
