import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  classifyBMI,
  classifyBodyFat,
  calculateWHR,
  generateAnthropometricDiagnosis
} from '../lib/anthropometry';

describe('Anthropometry & Clinical Diagnosis Suite', () => {
  it('calculates BMI correctly with standard formula (kg/m²)', () => {
    // Marina: 62.4 kg, 168 cm -> 62.4 / (1.68^2) = 22.11
    const bmi = calculateBMI(62.4, 168);
    expect(bmi).toBe(22.1);

    // Height or weight 0 should return 0 safely
    expect(calculateBMI(0, 170)).toBe(0);
    expect(calculateBMI(70, 0)).toBe(0);
  });

  it('classifies all BMI ranges according to WHO official standards', () => {
    expect(classifyBMI(15.5).category).toBe('underweight_severe');
    expect(classifyBMI(16.5).category).toBe('underweight_moderate');
    expect(classifyBMI(17.8).category).toBe('underweight_mild');
    expect(classifyBMI(22.0).category).toBe('normal');
    expect(classifyBMI(27.5).category).toBe('overweight');
    expect(classifyBMI(32.0).category).toBe('obesity_1');
    expect(classifyBMI(37.5).category).toBe('obesity_2');
    expect(classifyBMI(42.0).category).toBe('obesity_3');
  });

  it('classifies Body Fat % accurately for both males and females', () => {
    // Female
    expect(classifyBodyFat(12, true).category).toBe('very_low');
    expect(classifyBodyFat(18, true).category).toBe('athletic');
    expect(classifyBodyFat(22, true).category).toBe('fitness');
    expect(classifyBodyFat(28, true).category).toBe('acceptable');
    expect(classifyBodyFat(34, true).category).toBe('elevated');

    // Male
    expect(classifyBodyFat(5, false).category).toBe('very_low');
    expect(classifyBodyFat(10, false).category).toBe('athletic');
    expect(classifyBodyFat(15, false).category).toBe('fitness');
    expect(classifyBodyFat(20, false).category).toBe('acceptable');
    expect(classifyBodyFat(26, false).category).toBe('elevated');
  });

  it('calculates waist-to-hip ratio (RCQ) and detects cardiovascular risk', () => {
    // Female: waist 68, hips 98 -> 0.69 (low risk < 0.80)
    const femaleNormal = calculateWHR(68, 98, true);
    expect(femaleNormal.ratio).toBe(0.69);
    expect(femaleNormal.risk).toBe('low');

    // Female: waist 88, hips 95 -> 0.93 (high risk >= 0.85)
    const femaleHigh = calculateWHR(88, 95, true);
    expect(femaleHigh.ratio).toBe(0.93);
    expect(femaleHigh.risk).toBe('high');

    // Male: waist 80, hips 95 -> 0.84 (low risk < 0.90)
    const maleNormal = calculateWHR(80, 95, false);
    expect(maleNormal.ratio).toBe(0.84);
    expect(maleNormal.risk).toBe('low');

    // Male: waist 102, hips 100 -> 1.02 (high risk >= 1.00)
    const maleHigh = calculateWHR(102, 100, false);
    expect(maleHigh.ratio).toBe(1.02);
    expect(maleHigh.risk).toBe('high');
  });

  it('differentiates athletic muscle mass from metabolic obesity (false-positive BMI)', () => {
    // Bodybuilder with BMI 28.5 (overweight by BMI) but 11% body fat
    const athlete = generateAnthropometricDiagnosis({
      weightKg: 88,
      heightCm: 176,
      bodyFatPercentage: 11,
      isFemale: false
    });

    expect(athlete.isAthleticOverweight).toBe(true);
    expect(athlete.severity).toBe('info');
    expect(athlete.badgeLabel).toContain('Atlético');
  });

  it('generates clinical alerts and technical recommendations for obesity', () => {
    const obese = generateAnthropometricDiagnosis({
      weightKg: 105,
      heightCm: 170, // BMI = 36.3 (Obesity Grade II)
      bodyFatPercentage: 38,
      waistCm: 105,
      hipsCm: 110,
      isFemale: true
    });

    expect(obese.bmiCategory).toBe('obesity_2');
    expect(obese.severity).toBe('danger');
    expect(obese.trainingRecommendations.length).toBeGreaterThan(0);
    expect(obese.nutritionRecommendations.length).toBeGreaterThan(0);
    expect(obese.healthRecommendations.length).toBeGreaterThan(0);
    expect(obese.formattedReportText).toContain('DIAGNÓSTICO ANTROPOMÉTRICO');
    expect(obese.formattedReportText).toContain('Prescrição de Treino');
  });

  it('generates clinical alerts and technical recommendations for underweight', () => {
    const underweight = generateAnthropometricDiagnosis({
      weightKg: 42,
      heightCm: 168, // BMI = 14.9 (Severe Underweight)
      bodyFatPercentage: 13,
      isFemale: true
    });

    expect(underweight.bmiCategory).toBe('underweight_severe');
    expect(underweight.severity).toBe('danger');
    expect(underweight.trainingRecommendations.some(r => r.includes('força') || r.includes('hipertrofia'))).toBe(true);
    expect(underweight.nutritionRecommendations.some(r => r.includes('Superávit'))).toBe(true);
  });
});
