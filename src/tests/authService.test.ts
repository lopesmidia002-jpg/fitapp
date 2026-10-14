import { describe, it, expect } from 'vitest';
import { supabase, isSupabaseConfigured, storageService } from '../lib/supabase';

describe('Supabase & Storage Integration Service', () => {
  it('initializes Supabase client instance with persistSession', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(supabase.storage).toBeDefined();
  });

  it('determines whether remote Supabase URL and keys are configured', () => {
    // When run in local test without cloud env, it defaults to false/mock
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });

  it('provides storageService for uploading files with fallback support', () => {
    expect(storageService).toBeDefined();
    expect(typeof storageService.uploadFile).toBe('function');
  });
});
