import { IValuationRule } from '../models/ValuationRule';

export class ValuationService {
  
  static normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  static roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  static mround(value: number, multiple: number): number {
    return Math.round(value / multiple) * multiple;
  }

  static calculateDepreciationPercent(age: number): number {
    if (age <= 10) return 0;
    if (age <= 120) return Math.round(age * 0.5);
    return 60;
  }

  static calculateMainLandAddition(totalLandSqFt: number): number {
    if (totalLandSqFt <= 7200) {
      return 0;
    }
    if (totalLandSqFt <= 14400) {
      return (totalLandSqFt - 7200) * 0.24;
    }
    if (totalLandSqFt <= 28800) {
      return ((totalLandSqFt - 14400) * 0.24 * 0.75) + 1728;
    }
    if (totalLandSqFt <= 43200) {
      return ((totalLandSqFt - 28800) * 0.24 * 0.50) + 4320;
    }
    return ((totalLandSqFt - 43200) * 0.24 * 0.25) + 6048;
  }

  static calculateQuarterTax(valuation: number): number {
    if (valuation <= 999) {
      const percentage = Math.round(valuation / 100 + 10);
      return (valuation * percentage / 100) / 4;
    }
    if (valuation <= 9999) {
      const percentage = Math.round(valuation / 1000 + 20);
      return (valuation * percentage / 100) / 4;
    }
    return (valuation * 0.30) / 4;
  }

  static isCommercialSurchargeEligible(
    usageCode: string, 
    calculationMode: 'excel-strict' | 'normalized'
  ): boolean {
    const strictCodes = ['M', 'I', 'C1', 'C2', 'C3', 'H1', 'H2', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9'];
    const normalizedCodes = [...strictCodes, 'H3'];
    
    const codes = calculationMode === 'excel-strict' ? strictCodes : normalizedCodes;
    return codes.includes(this.normalizeCode(usageCode));
  }

  static calculateFullPropertyValuation(
    inputs: {
      coverAreaSqFt: number;
      zoneScoreCode: string;
      useOrCommercialScoreCode: string;
      constructionScoreCode: string;
      optionalFourthScoreCode?: string;
      buildingAgeYears: number;
      landArea: { bigha: number; khatha: number; chatak: number; sqFt: number; };
    },
    rules: IValuationRule,
    calculationMode: 'excel-strict' | 'normalized' = 'excel-strict'
  ) {
    const steps: Array<{ name: string, expression: string, result: any }> = [];

    // 1. Lookup scores
    const zoneCode = this.normalizeCode(inputs.zoneScoreCode);
    const usageCode = this.normalizeCode(inputs.useOrCommercialScoreCode);
    const constructionCode = this.normalizeCode(inputs.constructionScoreCode);
    const optionalCode = inputs.optionalFourthScoreCode ? this.normalizeCode(inputs.optionalFourthScoreCode) : '';

    const zoneScore = rules.scoreLookup.find(s => s.code === zoneCode)?.value ?? 0;
    const usageScore = rules.scoreLookup.find(s => s.code === usageCode)?.value ?? 0;
    const constructionScore = rules.scoreLookup.find(s => s.code === constructionCode)?.value ?? 0;
    const additionalScore = rules.scoreLookup.find(s => s.code === optionalCode)?.value ?? 0;

    const totalScore = zoneScore + usageScore + constructionScore + additionalScore;
    steps.push({
      name: "Total Score",
      expression: `${zoneScore} + ${usageScore} + ${constructionScore} + ${additionalScore}`,
      result: totalScore
    });

    // 2. Building Valuation
    const assessedBuildingValue = Math.round(inputs.coverAreaSqFt * totalScore * rules.constants.buildingValuationFactor);
    steps.push({
      name: "Assessed Building Value",
      expression: `ROUND(${inputs.coverAreaSqFt} × ${totalScore} × ${rules.constants.buildingValuationFactor})`,
      result: assessedBuildingValue
    });

    // 3. Depreciation
    const depreciationPercent = this.calculateDepreciationPercent(inputs.buildingAgeYears);
    const depreciationAmount = Math.round((assessedBuildingValue * depreciationPercent) / 100);
    steps.push({
      name: "Depreciation Amount",
      expression: `ROUND(${assessedBuildingValue} × ${depreciationPercent}%)`,
      result: depreciationAmount
    });

    // 4. Land Calculation
    const totalLandSqFt = 
      inputs.landArea.bigha * rules.constants.bighaToSqFt +
      inputs.landArea.khatha * rules.constants.khathaToSqFt +
      inputs.landArea.chatak * rules.constants.chatakToSqFt +
      inputs.landArea.sqFt;
    
    const landAdditionRaw = this.calculateMainLandAddition(totalLandSqFt);
    const landAddition = Math.round(landAdditionRaw);
    steps.push({
      name: "Total Land Sq Ft",
      expression: `(${inputs.landArea.bigha} × 14400) + (${inputs.landArea.khatha} × 720) + (${inputs.landArea.chatak} × 45) + ${inputs.landArea.sqFt}`,
      result: totalLandSqFt
    });
    steps.push({
      name: "Land Addition",
      expression: `Calculated from slabs, rounded`,
      result: landAddition
    });

    // 5. Final Valuation
    const calculatedValuation = this.mround(assessedBuildingValue - depreciationAmount + landAddition, 10);
    let minimumApplied = false;
    let effectiveValuation = calculatedValuation;
    if (calculatedValuation <= rules.constants.minimumValuation) {
      effectiveValuation = rules.constants.minimumValuation;
      minimumApplied = true;
    }

    steps.push({
      name: "Calculated Valuation",
      expression: `MROUND(${assessedBuildingValue} - ${depreciationAmount} + ${landAddition}, 10)`,
      result: calculatedValuation
    });

    // 6. Quarter Tax
    let quarterTax = this.calculateQuarterTax(effectiveValuation);
    // Apply 1150 exception rule
    if (effectiveValuation === 1150) {
      // Hardcoded exception from Excel rules
      quarterTax = 60.38;
    }
    quarterTax = this.roundToTwoDecimals(quarterTax);

    // 7. Commercial Surcharge
    let commercialSurcharge: number | null = null;
    if (this.isCommercialSurchargeEligible(usageCode, calculationMode)) {
      commercialSurcharge = this.roundToTwoDecimals(quarterTax * (rules.constants.commercialSurchargePercent / 100));
    }

    return {
      scores: { zone: zoneScore, usage: usageScore, construction: constructionScore, additional: additionalScore, total: totalScore },
      building: {
        coverAreaSqFt: inputs.coverAreaSqFt,
        assessedValue: assessedBuildingValue,
        ageYears: inputs.buildingAgeYears,
        depreciationPercent,
        depreciationAmount
      },
      land: {
        totalSqFt: totalLandSqFt,
        landAddition
      },
      valuation: {
        calculated: calculatedValuation,
        minimumApplied,
        effective: effectiveValuation
      },
      charges: {
        quarterTax,
        commercialSurcharge
      },
      rulesVersion: rules.schemaVersion,
      steps
    };
  }

  static calculateStandaloneLandValuation(
    inputs: { zone: string; landArea: { bigha: number; khatha: number; chatak: number; sqFt: number; }; landType: 'NORMAL' | 'POND' },
    rules: IValuationRule
  ) {
    const zoneCode = this.normalizeCode(inputs.zone);
    const ratePerKhatha = rules.landZoneRatesPerKhatha.find(z => z.code === zoneCode)?.value ?? 0;
    
    const marketValuePerSqFt = ratePerKhatha / rules.constants.khathaToSqFt;
    // 0.1% = 0.001
    const actualCostPerSqFt = marketValuePerSqFt * 0.001;
    
    const totalLandSqFt = 
      inputs.landArea.bigha * rules.constants.bighaToSqFt +
      inputs.landArea.khatha * rules.constants.khathaToSqFt +
      inputs.landArea.chatak * rules.constants.chatakToSqFt +
      inputs.landArea.sqFt;

    let normalLandValuation = 0;
    if (totalLandSqFt <= 7200) {
      normalLandValuation = this.mround(actualCostPerSqFt * totalLandSqFt, 10);
    } else if (totalLandSqFt <= 14400) {
      normalLandValuation = this.mround(10000 + (totalLandSqFt - 7200) * actualCostPerSqFt * 0.75, 10);
    } else if (totalLandSqFt <= 43200) {
      normalLandValuation = this.mround(17500 + (totalLandSqFt - 14400) * actualCostPerSqFt * 0.50, 10);
    } else {
      normalLandValuation = this.mround(37500 + (totalLandSqFt - 43200) * actualCostPerSqFt * 0.25, 10);
    }

    let calculatedLandValuation = normalLandValuation;
    if (inputs.landType === 'POND') {
      calculatedLandValuation = normalLandValuation / 2;
    }

    let minimumApplied = false;
    let effectiveLandValuation = calculatedLandValuation;
    if (calculatedLandValuation < rules.constants.minimumValuation) {
      effectiveLandValuation = rules.constants.minimumValuation;
      minimumApplied = true;
    }

    let quarterTax = this.calculateQuarterTax(effectiveLandValuation);
    if (effectiveLandValuation === 1150) {
      quarterTax = 60.38;
    }

    return {
      zone: inputs.zone,
      valuationPerKhatha: ratePerKhatha,
      marketValuePerSqFt,
      actualCostPerSqFt,
      totalLandSqFt,
      normalLandValuation,
      pondAdjustment: inputs.landType === 'POND' ? (normalLandValuation / 2) : 0,
      minimumApplied,
      effectiveLandValuation,
      quarterTax: this.roundToTwoDecimals(quarterTax)
    };
  }
}
