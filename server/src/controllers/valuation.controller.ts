import { Request, Response } from 'express';
import { ValuationRule } from '../models/ValuationRule';
import { ValuationRecord } from '../models/ValuationRecord';
import { ValuationService } from '../services/valuation.service';
import { propertyValuationInputSchema, standaloneLandValuationInputSchema } from '../validators/valuation.validator';
import { z } from 'zod';

export const getActiveRules = async (req: Request, res: Response) => {
  try {
    const rules = await ValuationRule.findOne({ active: true });
    if (!rules) {
      return res.status(404).json({ success: false, message: 'No active valuation rules found.' });
    }
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const calculatePropertyValuation = async (req: Request, res: Response) => {
  try {
    const validatedData = propertyValuationInputSchema.parse(req.body);
    const rules = await ValuationRule.findOne({ active: true });
    
    if (!rules) {
      return res.status(404).json({ success: false, message: 'No active valuation rules found.' });
    }

    const result = ValuationService.calculateFullPropertyValuation(validatedData, rules, 'excel-strict');
    
    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed for /calculate:', JSON.stringify(error.issues, null, 2));
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid valuation input.', 
        errors: error.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message })) 
      });
    }
    console.error("500 Error in calculatePropertyValuation:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const savePropertyValuation = async (req: Request, res: Response) => {
  try {
    const validatedData = propertyValuationInputSchema.parse(req.body);
    const rules = await ValuationRule.findOne({ active: true });
    
    if (!rules) {
      return res.status(404).json({ success: false, message: 'No active valuation rules found.' });
    }

    const result = ValuationService.calculateFullPropertyValuation(validatedData, rules, 'excel-strict');
    
    const record = new ValuationRecord({
      property: validatedData.propertyDetails,
      inputs: {
        coverAreaSqFt: validatedData.coverAreaSqFt,
        zoneScoreCode: validatedData.zoneScoreCode,
        useOrCommercialScoreCode: validatedData.useOrCommercialScoreCode,
        constructionScoreCode: validatedData.constructionScoreCode,
        optionalFourthScoreCode: validatedData.optionalFourthScoreCode,
        buildingAgeYears: validatedData.buildingAgeYears,
        landArea: validatedData.landArea
      },
      resolvedScores: {
        zone: result.scores.zone,
        usage: result.scores.usage,
        construction: result.scores.construction,
        additional: result.scores.additional,
        totalScore: result.scores.total
      },
      calculationBreakdown: {
        assessedBuildingValue: result.building.assessedValue,
        depreciationPercent: result.building.depreciationPercent,
        depreciationAmount: result.building.depreciationAmount,
        totalLandSqFt: result.land.totalSqFt,
        landAddition: result.land.landAddition,
        calculatedValuation: result.valuation.calculated,
        minimumApplied: result.valuation.minimumApplied,
        effectiveValuation: result.valuation.effective,
        quarterTax: result.charges.quarterTax,
        commercialSurcharge: result.charges.commercialSurcharge
      },
      rulesVersion: result.rulesVersion,
      calculationMode: 'excel-strict'
    });

    await record.save();

    res.status(201).json({ success: true, data: { id: record._id, ...result } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid valuation input.', 
        errors: error.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message })) 
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getValuationHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const records = await ValuationRecord.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await ValuationRecord.countDocuments();

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getValuationById = async (req: Request, res: Response) => {
  try {
    const record = await ValuationRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Valuation not found.' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteValuation = async (req: Request, res: Response) => {
  try {
    const record = await ValuationRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Valuation not found.' });
    }
    res.json({ success: true, message: 'Valuation deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const calculateStandaloneLandValuation = async (req: Request, res: Response) => {
  try {
    const validatedData = standaloneLandValuationInputSchema.parse(req.body);
    const rules = await ValuationRule.findOne({ active: true });
    
    if (!rules) {
      return res.status(404).json({ success: false, message: 'No active valuation rules found.' });
    }

    const result = ValuationService.calculateStandaloneLandValuation({
      zone: validatedData.zone,
      landArea: validatedData.landArea,
      landType: validatedData.landType
    }, rules);
    
    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid valuation input.', 
        errors: error.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message })) 
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
