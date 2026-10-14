import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../lib/utils';

describe('Formatters Utilities', () => {
  it('should format BRL currency properly', () => {
    const formatted = formatCurrency(179);
    // BRL format contains R$ and 179,00
    expect(formatted).toContain('179');
    expect(formatted).toContain('R$');
  });
});
