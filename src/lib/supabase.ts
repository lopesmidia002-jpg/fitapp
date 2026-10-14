import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key-omega-training';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('localhost')
);

// Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Storage Service - handles uploading physical assessment photos and exercise media
 */
export const storageService = {
  /**
   * Upload an image/file to Supabase Storage or convert to Base64 data URL as offline fallback
   */
  async uploadFile(bucket: 'assessments' | 'exercises' | 'avatars', file: File): Promise<string> {
    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
      } catch (err) {
        console.warn('Supabase storage upload failed, falling back to local data URL:', err);
      }
    }

    // Local fallback: convert file to Base64 data URL for instant offline preview & persistence
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },
};

/**
 * Payment Service - handles simulated PIX and Credit Card gateway checkouts
 */
export interface PaymentResult {
  success: boolean;
  transactionId: string;
  method: 'pix' | 'credit_card';
  amount: number;
  paidAt: string;
  receiptUrl?: string;
  message: string;
}

export const paymentService = {
  generatePixCode(amount: number, description: string): { qrCodeText: string; copyPasteKey: string } {
    const timestamp = Date.now();
    const cleanAmount = amount.toFixed(2);
    const pixPayload = `00020126580014BR.GOV.BCB.PIX0136omegatraining-pix-pay@omegatraining.pro5204000053039865405${cleanAmount}5802BR5914Omega Training6009Sao Paulo62240520OMEGA${timestamp}6304`;
    return {
      qrCodeText: pixPayload,
      copyPasteKey: pixPayload,
    };
  },

  async processCreditCard(cardData: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    installments: number;
    amount: number;
  }): Promise<PaymentResult> {
    // Simulate processing latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const cleanCard = cardData.cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 13 || cardData.cvv.length < 3) {
      throw new Error('Dados do cartão de crédito inválidos. Verifique número e CVV.');
    }

    return {
      success: true,
      transactionId: `tx_card_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      method: 'credit_card',
      amount: cardData.amount,
      paidAt: new Date().toISOString(),
      message: 'Pagamento aprovado com sucesso via operadora!',
    };
  },

  async confirmPixPayment(amount: number): Promise<PaymentResult> {
    // Simulate instantaneous PIX clearing
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      success: true,
      transactionId: `tx_pix_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      method: 'pix',
      amount,
      paidAt: new Date().toISOString(),
      message: 'PIX identificado e compensado instantaneamente pelo Banco Central!',
    };
  },
};
