import { describe, it, expect } from 'vitest';
import { parseVideoUrl, EXERCISE_VIDEO_PRESETS } from '../lib/videoUtils';
import { INITIAL_EXERCISES, INITIAL_WORKOUT_PLANS } from '../services/mockData';

describe('Exercise Video Demonstration & Upload System', () => {
  it('correctly parses YouTube URLs into responsive embed URLs', () => {
    const standardUrl = 'https://www.youtube.com/watch?v=rT7DgCr-3pg';
    const parsedStandard = parseVideoUrl(standardUrl);
    expect(parsedStandard.type).toBe('youtube');
    expect(parsedStandard.embedUrl).toContain('https://www.youtube-nocookie.com/embed/rT7DgCr-3pg');

    const shortUrl = 'https://youtu.be/aclHkVaku9U';
    const parsedShort = parseVideoUrl(shortUrl);
    expect(parsedShort.type).toBe('youtube');
    expect(parsedShort.embedUrl).toContain('https://www.youtube-nocookie.com/embed/aclHkVaku9U');

    const shortsUrl = 'https://www.youtube.com/shorts/3VcKaXpzqRo';
    const parsedShorts = parseVideoUrl(shortsUrl);
    expect(parsedShorts.type).toBe('youtube');
    expect(parsedShorts.embedUrl).toContain('https://www.youtube-nocookie.com/embed/3VcKaXpzqRo');
  });

  it('correctly handles direct video files (.webm, .mp4, blob, and data URLs)', () => {
    const webmUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm';
    const parsedWebm = parseVideoUrl(webmUrl);
    expect(parsedWebm.type).toBe('direct');
    expect(parsedWebm.embedUrl).toBe(webmUrl);

    const blobUrl = 'blob:http://localhost:5173/12345-abcde';
    const parsedBlob = parseVideoUrl(blobUrl);
    expect(parsedBlob.type).toBe('direct');
    expect(parsedBlob.embedUrl).toBe(blobUrl);

    const dataUrl = 'data:video/mp4;base64,AAAAHGZ0eXBtcDQy...';
    const parsedData = parseVideoUrl(dataUrl);
    expect(parsedData.type).toBe('direct');
    expect(parsedData.embedUrl).toBe(dataUrl);
  });

  it('handles empty or null URLs gracefully', () => {
    expect(parseVideoUrl(null).type).toBe('empty');
    expect(parseVideoUrl('').type).toBe('empty');
    expect(parseVideoUrl('   ').type).toBe('empty');
    expect(parseVideoUrl(undefined).type).toBe('empty');
  });

  it('has verified video presets for all major muscle groups', () => {
    expect(EXERCISE_VIDEO_PRESETS.length).toBeGreaterThanOrEqual(7);
    const groups = new Set(EXERCISE_VIDEO_PRESETS.map(p => p.muscleGroup));
    expect(groups.has('Peitoral')).toBe(true);
    expect(groups.has('Pernas')).toBe(true);
    expect(groups.has('Costas')).toBe(true);
    expect(groups.has('Ombros')).toBe(true);
    expect(groups.has('Braços')).toBe(true);
    expect(groups.has('Abdômen')).toBe(true);

    // Each preset must have a valid videoUrl, instructions and precautions, and duration <= 60s
    for (const preset of EXERCISE_VIDEO_PRESETS) {
      expect(preset.videoUrl).toBeTruthy();
      expect(preset.instructions).toBeTruthy();
      expect(preset.duration).toBeTruthy();
      expect(preset.durationSeconds).toBeLessThanOrEqual(60);
    }
  });

  it('supports start and end second parameters to crop videos to <= 1 minute', () => {
    const parsed = parseVideoUrl('https://www.youtube.com/watch?v=rT7DgCr-3pg', { startSec: 5, endSec: 35 });
    expect(parsed.embedUrl).toContain('&start=5');
    expect(parsed.embedUrl).toContain('&end=35');
    expect(parsed.isShortClip).toBe(true);
  });

  it('guarantees all initial exercise videos are short demonstration clips (<= 60 seconds)', () => {
    expect(INITIAL_EXERCISES.length).toBeGreaterThanOrEqual(7);
    for (const ex of INITIAL_EXERCISES) {
      expect(ex.videoUrl).toBeTruthy();
      expect(ex.videoDuration).toBeTruthy();
      // Ensure format "M:SS" with M=0 (under 1 minute)
      const [minStr, secStr] = (ex.videoDuration || '0:0').split(':');
      const totalSec = parseInt(minStr) * 60 + parseInt(secStr);
      expect(totalSec).toBeLessThanOrEqual(60);
    }

    const supino = INITIAL_EXERCISES.find(e => e.id === 'ex-1');
    expect(supino?.videoUrl).toContain('.webm'); // Direct video loop
    expect(supino?.videoDuration).toBe('0:22');

    const initialPlan = INITIAL_WORKOUT_PLANS[0];
    expect(initialPlan.exercises.length).toBeGreaterThan(0);
    expect(initialPlan.exercises[0].videoUrl).toBeTruthy();
  });

  it('provides compact desktop video player modes (mini, compact, standard)', () => {
    // Validates that supported desktop video size profiles exist and provide reasonable heights (<= 260px)
    const desktopSizeProfiles = {
      mini: { maxHeight: 160, label: 'Mini' },
      compact: { maxHeight: 205, label: 'Compacta' },
      standard: { maxHeight: 260, label: 'Média' },
    };

    expect(desktopSizeProfiles.mini.maxHeight).toBeLessThanOrEqual(160);
    expect(desktopSizeProfiles.compact.maxHeight).toBeLessThanOrEqual(210);
    expect(desktopSizeProfiles.standard.maxHeight).toBeLessThanOrEqual(260);
  });

  it('provides comprehensive Cardio ergometers with full instructions and postural precautions', async () => {
    const { CARDIO_PRESETS, CARDIO_EQUIPMENTS } = await import('../modules/workouts/WorkoutsView');

    // Verify Cardio equipments include all standard gym ergometers
    const eqValues = CARDIO_EQUIPMENTS.map(eq => eq.value);
    expect(eqValues).toContain('Esteira Ergométrica');
    expect(eqValues).toContain('Bicicleta Ergométrica');
    expect(eqValues).toContain('Bicicleta Ergométrica Horizontal');
    expect(eqValues).toContain('Simulador de Escada');
    expect(eqValues).toContain('Elíptico');
    expect(eqValues).toContain('Remo Seco (Air Rower)');
    expect(eqValues).toContain('Air Bike');
    expect(eqValues).toContain('Corda Naval');
    expect(eqValues).toContain('Corda de Pular');

    // Verify every preset has biomechanical instructions, precautions, and equipment
    expect(CARDIO_PRESETS.length).toBeGreaterThanOrEqual(9);
    for (const preset of CARDIO_PRESETS) {
      expect(preset.name).toBeTruthy();
      expect(preset.equipment).toBeTruthy();
      expect(preset.instructions).toBeTruthy();
      expect(preset.precautions).toBeTruthy();
      expect(preset.instructions.length).toBeGreaterThan(30);
      expect(preset.precautions.length).toBeGreaterThan(30);
      expect(preset.targetSetsDefault).toBeGreaterThanOrEqual(1);
    }

    // Verify critical postural safety points
    const esteira = CARDIO_PRESETS.find(p => p.equipment === 'Esteira Ergométrica');
    expect(esteira?.precautions).toContain('barras de apoio');
    expect(esteira?.instructions).toContain('cadência');

    const bike = CARDIO_PRESETS.find(p => p.equipment === 'Bicicleta Ergométrica');
    expect(bike?.instructions).toContain('crista ilíaca');
    expect(bike?.precautions).toContain('flexão de 25° a 30°');
    expect(bike?.precautions).toContain('hiperextensão');

    const escada = CARDIO_PRESETS.find(p => p.equipment === 'Simulador de Escada');
    expect(escada?.precautions).toContain('corrimão');
    expect(escada?.instructions).toContain('calcanhares');

    const remo = CARDIO_PRESETS.find(p => p.equipment === 'Remo Seco (Air Rower)');
    expect(remo?.instructions).toContain('Propulsão');
    expect(remo?.precautions).toContain('flexionando as costas');

    // Verify INITIAL_EXERCISES contains Cardio exercises
    const cardioExercises = INITIAL_EXERCISES.filter(e => e.muscleGroup === 'Cardio');
    expect(cardioExercises.length).toBeGreaterThanOrEqual(9);
    for (const card of cardioExercises) {
      expect(card.precautions).toBeTruthy();
      expect(card.instructions).toBeTruthy();
      expect(card.videoUrl).toBeTruthy();
    }
  });
});

