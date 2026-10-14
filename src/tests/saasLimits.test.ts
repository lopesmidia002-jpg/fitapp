import { describe, it, expect } from 'vitest';
import { SAAS_PLANS } from '../services/mockData';

describe('SaaS Plan Limits & Quota Enforcement', () => {
  it('should have 3 distinct configured plans with strict student limits', () => {
    expect(SAAS_PLANS).toHaveLength(3);

    const starter = SAAS_PLANS.find(p => p.id === 'starter');
    const pro = SAAS_PLANS.find(p => p.id === 'pro');
    const business = SAAS_PLANS.find(p => p.id === 'business');

    expect(starter?.maxStudents).toBe(15);
    expect(pro?.maxStudents).toBe(50);
    expect(business?.maxStudents).toBe(200);

    expect(starter?.priceMonthly).toBe(89);
    expect(pro?.priceMonthly).toBe(179);
    expect(business?.priceMonthly).toBe(349);
  });

  it('should detect when student quota is reached or exceeded', () => {
    const proPlan = SAAS_PLANS.find(p => p.id === 'pro')!;

    const canAddStudent = (currentCount: number, planMax: number) => {
      return currentCount < planMax;
    };

    expect(canAddStudent(38, proPlan.maxStudents)).toBe(true);
    expect(canAddStudent(50, proPlan.maxStudents)).toBe(false);
    expect(canAddStudent(51, proPlan.maxStudents)).toBe(false);
  });
});
