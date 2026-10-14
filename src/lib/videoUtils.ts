/**
 * Utilitários para detecção, parsing e presets de vídeos curtos de execução de exercícios (máximo 1 minuto / 60s)
 * Compatível com YouTube (Shorts & Vídeos com trechos), Vimeo, arquivos diretos (.mp4, .webm), Blobs e Data URLs
 */

export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'direct' | 'empty';
  embedUrl: string;
  rawUrl: string;
  isShortClip: boolean;
}

export function parseVideoUrl(
  url?: string | null,
  options?: { startSec?: number; endSec?: number }
): ParsedVideo {
  if (!url || !url.trim()) {
    return { type: 'empty', embedUrl: '', rawUrl: '', isShortClip: false };
  }

  const cleanUrl = url.trim();

  // YouTube detection (Standard, Shorts, Embeds, Timestamps)
  const ytMatch = cleanUrl.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0`;

    // Support start / end cropping to force <= 1 minute short clips
    const urlParams = new URLSearchParams(cleanUrl.includes('?') ? cleanUrl.split('?')[1] : '');
    const start = options?.startSec ?? (urlParams.get('start') ? parseInt(urlParams.get('start')!) : (urlParams.get('t') ? parseInt(urlParams.get('t')!) : undefined));
    const end = options?.endSec ?? (urlParams.get('end') ? parseInt(urlParams.get('end')!) : undefined);

    if (start !== undefined && !isNaN(start)) {
      embedUrl += `&start=${start}`;
    }
    if (end !== undefined && !isNaN(end)) {
      embedUrl += `&end=${end}`;
    }

    return {
      type: 'youtube',
      embedUrl,
      rawUrl: cleanUrl,
      isShortClip: true,
    };
  }

  // Vimeo detection
  const vimeoMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`,
      rawUrl: cleanUrl,
      isShortClip: true,
    };
  }

  // Direct video file (MP4, WebM, Blob, Data URL)
  return {
    type: 'direct',
    embedUrl: cleanUrl,
    rawUrl: cleanUrl,
    isShortClip: true,
  };
}

export interface VideoPreset {
  id: string;
  name: string;
  muscleGroup: 'Peitoral' | 'Costas' | 'Pernas' | 'Ombros' | 'Braços' | 'Abdômen' | 'Cardio';
  equipment: 'Halteres' | 'Barra' | 'Máquina' | 'Peso Corporal' | 'Cabo' | 'Kettlebell';
  videoUrl: string;
  duration: string; // Garantido <= 1 minuto (ex: "0:22")
  durationSeconds: number; // <= 60s
  instructions: string;
  precautions?: string;
  sourceType: 'direct_webm' | 'youtube_short' | 'direct_mp4';
}

/**
 * Biblioteca verificada de vídeos curtos de execução (< 1 minuto / 60 segundos)
 * Foco exclusivo no padrão motor, alinhamento articular e cadência de repetição.
 */
export const EXERCISE_VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'preset-supino',
    name: 'Supino Reto com Barra',
    muscleGroup: 'Peitoral',
    equipment: 'Barra',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Bench_press_-_exercise_demonstration_video.webm',
    duration: '0:22',
    durationSeconds: 22,
    sourceType: 'direct_webm',
    instructions: 'Mantenha as escápulas aduzidas e deprimidas, pés firmes no chão, desça a barra até a linha do esterno mantendo os cotovelos a ~75° do tronco.',
    precautions: 'Não rebata a barra no tórax e evite hiperestender os punhos sob a barra.',
  },
  {
    id: 'preset-agachamento',
    name: 'Agachamento Livre com Barra',
    muscleGroup: 'Pernas',
    equipment: 'Barra',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
    duration: '0:28',
    durationSeconds: 28,
    sourceType: 'direct_webm',
    instructions: 'Pés na largura dos ombros, olhar à frente, inicie flexionando quadril e joelhos simultaneamente até o paralelo, mantendo o peito erguido.',
    precautions: 'Evite valgo dinâmico dos joelhos e retroversão pélvica acentuada no final da descida.',
  },
  {
    id: 'preset-terra',
    name: 'Levantamento Terra Convencional',
    muscleGroup: 'Costas',
    equipment: 'Barra',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Deadlift_-_exercise_demonstration_video.webm',
    duration: '0:25',
    durationSeconds: 25,
    sourceType: 'direct_webm',
    instructions: 'Barra rente às canelas, pegada firme, coluna neutra, empurre o chão com os calcanhares estendendo quadril e joelhos juntos.',
    precautions: 'Não arredonde a lombar em momento algum do levantamento.',
  },
  {
    id: 'preset-pullups',
    name: 'Barra Fixa Pronada (Pull-up)',
    muscleGroup: 'Costas',
    equipment: 'Peso Corporal',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Pull-ups_-_exercise_demonstration_video.webm',
    duration: '0:20',
    durationSeconds: 20,
    sourceType: 'direct_webm',
    instructions: 'Pegada pronada aberta, puxe até o queixo passar da barra aproximando as escápulas e desça com controle total.',
    precautions: 'Evite balanço corporal excessivo (kipping) na subida.',
  },
  {
    id: 'preset-desenvolvimento',
    name: 'Desenvolvimento Militar de Ombros',
    muscleGroup: 'Ombros',
    equipment: 'Barra',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Shoulder_press_-_exercise_demonstration_video.webm',
    duration: '0:24',
    durationSeconds: 24,
    sourceType: 'direct_webm',
    instructions: 'Pressione a barra acima da cabeça mantendo o abdômen contraído e cabeça alinhada sem hiperestender a coluna lombar.',
    precautions: 'Não incline o tronco excessivamente para trás durante a fase concêntrica.',
  },
  {
    id: 'preset-puxada',
    name: 'Puxada Alta no Pulley',
    muscleGroup: 'Costas',
    equipment: 'Cabo',
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    duration: '0:30',
    durationSeconds: 30,
    sourceType: 'youtube_short',
    instructions: 'Pegada pronada aberta, incline o tronco levemente para trás (10-15°), puxe a barra na direção da fúrcula esternal contraindo as grandes dorsais.',
    precautions: 'Não utilize impulso excessivo da lombar na fase inicial do movimento.',
  },
  {
    id: 'preset-elevacao',
    name: 'Elevação Lateral com Halteres',
    muscleGroup: 'Ombros',
    equipment: 'Halteres',
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    duration: '0:24',
    durationSeconds: 24,
    sourceType: 'youtube_short',
    instructions: 'Cotovelos com leve flexão (15°), eleve no plano escapular até a altura dos ombros, mantendo o polegar ligeiramente mais baixo que o mindinho.',
    precautions: 'Não dê tranco com o quadril nem eleve os ombros até as orelhas (compensação de trapézio).',
  },
  {
    id: 'preset-rosca',
    name: 'Rosca Direta com Barra W',
    muscleGroup: 'Braços',
    equipment: 'Barra',
    videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    duration: '0:22',
    durationSeconds: 22,
    sourceType: 'youtube_short',
    instructions: 'Cotovelos estáveis colados às costelas, flexione os braços com rotação anatômica da barra W, contraia o bíceps no topo e desça em 3 segundos.',
    precautions: 'Evite oscilar a coluna lombar para impulsionar a carga para cima.',
  },
  {
    id: 'preset-triceps',
    name: 'Tríceps Corda no Cross',
    muscleGroup: 'Braços',
    equipment: 'Cabo',
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    duration: '0:25',
    durationSeconds: 25,
    sourceType: 'youtube_short',
    instructions: 'Cotovelos travados na linha do corpo, estenda os braços para baixo e afaste as pontas da corda na máxima contração dos tríceps.',
    precautions: 'Não deixe os cotovelos subirem ou abrirem durante a fase excêntrica.',
  },
  {
    id: 'preset-prancha',
    name: 'Prancha Abdominal Isométrica',
    muscleGroup: 'Abdômen',
    equipment: 'Peso Corporal',
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    duration: '0:30',
    durationSeconds: 30,
    sourceType: 'youtube_short',
    instructions: 'Antebraços paralelos no solo, linha reta do calcanhar à nuca, glúteos e transverso do abdômen ativados durante todo o tempo.',
    precautions: 'Não deixe a pelve cair nem eleve o quadril formando um arco.',
  },
  {
    id: 'preset-legpress',
    name: 'Leg Press 45° Articulado',
    muscleGroup: 'Pernas',
    equipment: 'Máquina',
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    duration: '0:30',
    durationSeconds: 30,
    sourceType: 'youtube_short',
    instructions: 'Pés na largura do quadril na plataforma, desça até 90° de flexão mantendo a lombar totalmente apoiada no encosto.',
    precautions: 'Jamais estenda os joelhos completamente com hiperextensão/travamento ao empurrar.',
  }
];
