import { describe, it, expect } from 'vitest';
import { calculateBookingSplit } from '../src/services/ledger.service';

describe('Tripartite Zero-Leakage Ledger Suite', () => {
  const delhiCoop = {
    commissionPlatformRate: 0.04, // 4%
    welfareFundRate: 0.08,        // 8%
  };

  const puneCoop = {
    commissionPlatformRate: 0.035, // 3.5%
    welfareFundRate: 0.07,         // 7%
  };

  it('standard split on ₹1,000 with 8% welfare and 4% platform yields exactly ₹880 worker, ₹80 welfare, ₹40 platform', () => {
    const result = calculateBookingSplit(1000, delhiCoop);

    expect(result.grossAmount).toBe(1000.00);
    expect(result.workerPayout).toBe(880.00);
    expect(result.welfareFundShare).toBe(80.00);
    expect(result.platformShare).toBe(40.00);

    // Sum invariant check: W + F + P === Gross
    const totalSum = result.workerPayout + result.welfareFundShare + result.platformShare;
    expect(totalSum).toBe(1000.00);
  });

  it('standard split on ₹1,000 with Pune rates (7% welfare, 3.5% platform) yields exact allocation', () => {
    const result = calculateBookingSplit(1000, puneCoop);

    expect(result.grossAmount).toBe(1000.00);
    expect(result.welfareFundShare).toBe(70.00);
    expect(result.platformShare).toBe(35.00);
    expect(result.workerPayout).toBe(895.00);

    const totalSum = result.workerPayout + result.welfareFundShare + result.platformShare;
    expect(totalSum).toBe(1000.00);
  });

  it('guarantees zero rounding leakage across 1,000 simulated fractional transactions', () => {
    // Generate 1,000 random or sequential fractional rupee amounts between ₹50.00 and ₹50,000.99
    let totalGrossVolume = 0;
    let totalAllocatedVolume = 0;

    for (let i = 1; i <= 1000; i++) {
      // Create awkward fractional amounts with irregular decimals (e.g. 123.47, 999.99, etc.)
      const randomAmount = Number((50 + (i * 49.37) % 5000 + Math.random()).toFixed(2));
      const activeCoop = i % 2 === 0 ? delhiCoop : puneCoop;

      const split = calculateBookingSplit(randomAmount, activeCoop);

      const computedSum = Number(
        (split.workerPayout + split.welfareFundShare + split.platformShare).toFixed(2)
      );

      // Verify strict deterministic equality: W + F + P === Gross
      expect(computedSum).toBe(split.grossAmount);

      totalGrossVolume += split.grossAmount;
      totalAllocatedVolume += computedSum;
    }

    expect(Number(totalAllocatedVolume.toFixed(2))).toBe(Number(totalGrossVolume.toFixed(2)));
  });

  it('rejects negative booking amounts', () => {
    expect(() => calculateBookingSplit(-100, delhiCoop)).toThrowError(
      'Gross booking amount cannot be negative'
    );
  });

  it('rejects invalid cooperative rate configurations exceeding 100%', () => {
    const invalidCoop = {
      commissionPlatformRate: 0.60,
      welfareFundRate: 0.50,
    };
    expect(() => calculateBookingSplit(500, invalidCoop)).toThrowError(
      'Invalid rate configuration for cooperative'
    );
  });
});
