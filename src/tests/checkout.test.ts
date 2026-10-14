import { describe, it, expect } from 'vitest';
import { paymentService } from '../lib/supabase';

describe('Payment & Checkout Gateway Service', () => {
  it('generates a valid PIX payload and copy-paste key with required parameters', () => {
    const amount = 197.00;
    const pix = paymentService.generatePixCode(amount, 'Assinatura Plano Pro');

    expect(pix).toBeDefined();
    expect(pix.qrCodeText).toContain('BR.GOV.BCB.PIX');
    expect(pix.copyPasteKey).toContain('197.00');
    expect(pix.copyPasteKey).toContain('Omega Training');
  });

  it('processes and confirms PIX payment instantaneously', async () => {
    const amount = 97.00;
    const result = await paymentService.confirmPixPayment(amount);

    expect(result.success).toBe(true);
    expect(result.method).toBe('pix');
    expect(result.amount).toBe(97.00);
    expect(result.transactionId).toMatch(/^tx_pix_/);
  });

  it('validates and successfully approves credit card payment with valid credentials', async () => {
    const result = await paymentService.processCreditCard({
      cardNumber: '4111 2222 3333 4444',
      cardHolder: 'NILTON LOPES',
      expiryDate: '12/28',
      cvv: '123',
      installments: 1,
      amount: 347.00,
    });

    expect(result.success).toBe(true);
    expect(result.method).toBe('credit_card');
    expect(result.amount).toBe(347.00);
    expect(result.transactionId).toMatch(/^tx_card_/);
  });

  it('throws an error when credit card number or CVV are invalid', async () => {
    await expect(
      paymentService.processCreditCard({
        cardNumber: '123',
        cardHolder: 'TEST',
        expiryDate: '12/28',
        cvv: '1',
        installments: 1,
        amount: 97.00,
      })
    ).rejects.toThrow('Dados do cartão de crédito inválidos');
  });
});
