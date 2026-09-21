import mongoose, { Schema, Document } from 'mongoose';

export interface IInspectionBook extends Document {
  inspectorId: mongoose.Types.ObjectId;
  parentUserId: mongoose.Types.ObjectId;
  applicationNo: string;
  applicationDate: Date;
  ownerName: string;
  district: string;
  ulbName: string;
  ward: number;
  location: string;
  holdingNumber: string;
  jlNo: string;
  mouza: string;
  khatianNo: string;
  lrPlot: string;
  coverAreaSqFt: number;
  buildingAgeYears: number;
  natureOfUseCode: string;
  constructionScoreCode: string;
  landArea: {
    bigha: number;
    khatha: number;
    chatak: number;
    sqFt: number;
  };
  noOfFloor: string; // roman numerals I to XXV
  remark: string;
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: Date;
  updatedAt: Date;
}

const InspectionBookSchema: Schema = new Schema(
  {
    inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicationNo: { type: String },
    applicationDate: { type: Date, required: true, default: Date.now },
    ownerName: { type: String, required: true },
    district: { type: String, default: 'Purba Bardhaman' },
    ulbName: { type: String, default: 'Burdwan Municipality' },
    ward: { type: Number },
    location: { type: String },
    holdingNumber: { type: String },
    jlNo: { type: String },
    mouza: { type: String },
    khatianNo: { type: String },
    lrPlot: { type: String },
    coverAreaSqFt: { type: Number, required: true },
    buildingAgeYears: { type: Number, required: true },
    natureOfUseCode: { type: String },
    constructionScoreCode: { type: String },
    landArea: {
      bigha: { type: Number, default: 0 },
      khatha: { type: Number, default: 0 },
      chatak: { type: Number, default: 0 },
      sqFt: { type: Number, default: 0 },
    },
    noOfFloor: { type: String },
    remark: { type: String },
    status: { type: String, enum: ['draft', 'submitted', 'reviewed'], default: 'draft' }
  },
  { timestamps: true }
);

export default mongoose.model<IInspectionBook>('InspectionBook', InspectionBookSchema);
