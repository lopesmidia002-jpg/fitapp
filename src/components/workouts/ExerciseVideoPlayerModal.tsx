import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { parseVideoUrl } from '../../lib/videoUtils';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  AlertTriangle,
  Dumbbell,
  CheckCircle2,
  ExternalLink,
  Film,
  X,
  Monitor
} from 'lucide-react';

export interface ExerciseVideoModalData {
  name: string;
  muscleGroup?: string;
  equipment?: string;
  instructions?: string;
  precautions?: string;
  videoUrl?: string;
  videoDuration?: string;
  sets?: number;
  reps?: string;
  restSeconds?: number;
  weightKg?: number;
}

interface ExerciseVideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: ExerciseVideoModalData | null;
}

export function ExerciseVideoPlayerModal({
  isOpen,
  onClose,
  exercise,
}: ExerciseVideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(true);
  // Tamanho da tela do vídeo no modo desktop: 'mini' (160px), 'compact' (205px - padrão), 'standard' (260px)
  const [videoScreenSize, setVideoScreenSize] = useState<'mini' | 'compact' | 'standard'>('compact');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setPlaybackRate(1);
    }
  }, [isOpen, exercise?.videoUrl]);

  if (!exercise) return null;

  const parsedVideo = parseVideoUrl(exercise.videoUrl);

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      description=""
      className="max-w-xl md:max-w-4xl p-0 overflow-hidden bg-card border-border/80 shadow-2xl"
    >
      <div className="flex flex-col">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-border bg-surface/50 flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="p-1 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Film className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                Vídeo de Demonstração & Postura
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <span>⚡ Vídeo Curto (≤ 1 min)</span>
              </span>
              <span className="text-[10px] font-mono text-foreground font-bold bg-background px-2 py-0.5 rounded-md border border-border">
                ⏱ {exercise.videoDuration || '0:25s'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-primary/90 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 font-semibold">
                <Monitor className="h-3 w-3" />
                <span>Desktop Compacto</span>
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-foreground break-words">
                {exercise.name}
              </h3>
              {exercise.muscleGroup && (
                <Badge variant="primary" size="sm">
                  {exercise.muscleGroup}
                </Badge>
              )}
              {exercise.equipment && (
                <Badge variant="neutral" size="sm">
                  {exercise.equipment}
                </Badge>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface border border-border/60 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body: 2 Columns on Desktop (md:), Stacked on Mobile */}
        <div className="p-4 sm:p-5 flex flex-col md:grid md:grid-cols-12 md:gap-5">
          {/* LEFT COLUMN: Compact Video Player + Controls + Specs */}
          <div className="md:col-span-6 flex flex-col">
            {/* Video Container - Compact Height on Desktop */}
            <div
              className={cn(
                "relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden rounded-xl border border-border/60 shadow-md transition-all duration-200 mx-auto",
                videoScreenSize === 'mini' && 'max-h-[160px] md:max-h-[160px]',
                videoScreenSize === 'compact' && 'max-h-[210px] md:max-h-[205px]',
                videoScreenSize === 'standard' && 'max-h-[260px] md:max-h-[260px]'
              )}
            >
              {parsedVideo.type === 'youtube' && (
                <iframe
                  src={parsedVideo.embedUrl}
                  title={`Execução de ${exercise.name}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}

              {parsedVideo.type === 'vimeo' && (
                <iframe
                  src={parsedVideo.embedUrl}
                  title={`Execução de ${exercise.name}`}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}

              {parsedVideo.type === 'direct' && (
                <div className="relative w-full h-full group">
                  <video
                    ref={videoRef}
                    src={parsedVideo.embedUrl}
                    autoPlay
                    loop={isLooping}
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Direct Video Overlay Bar */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-2 text-white text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleTogglePlay}
                        className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title={isPlaying ? 'Pausar' : 'Reproduzir'}
                      >
                        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={handleRestart}
                        className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Reiniciar vídeo do início"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title={isMuted ? 'Ativar Som' : 'Silenciar'}
                      >
                        {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    </div>

                    {/* Speed Controls: Slow-Motion (0.5x) for Postural Form Analysis */}
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/10 text-[10px]">
                      <Gauge className="h-3 w-3 text-primary" />
                      {[0.5, 1].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleChangePlaybackRate(rate)}
                          className={cn(
                            "px-1 py-0.2 rounded transition-colors",
                            playbackRate === rate
                              ? 'bg-primary text-background font-black'
                              : 'text-zinc-300 hover:text-white'
                          )}
                          title={rate === 0.5 ? 'Câmera lenta para analisar a postura' : 'Velocidade normal'}
                        >
                          {rate === 0.5 ? '0.5x' : '1x'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {parsedVideo.type === 'empty' && (
                <div className="p-6 text-center flex flex-col items-center justify-center max-w-xs">
                  <div className="w-12 h-12 rounded-xl bg-surface/80 border border-border flex items-center justify-center text-primary mb-2">
                    <Dumbbell className="h-6 w-6 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Vídeo Demonstrativo em Processamento</h4>
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    Nenhum vídeo anexado ainda a este exercício.
                  </p>
                </div>
              )}
            </div>

            {/* Video Sub-bar: Controls & Desktop Screen Size Selector */}
            <div className="mt-2.5 flex items-center justify-between gap-2 bg-surface/60 p-2 rounded-xl border border-border text-xs">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Play className="h-3 w-3" /> {parsedVideo.type === 'direct' ? 'Loop Contínuo' : 'Player Incorporado'}
                </span>
                <span>•</span>
                <span>⏱ {exercise.videoDuration || '≤ 1 min'}</span>
              </div>

              {/* Desktop Screen Size Switcher */}
              <div className="hidden md:flex items-center gap-1 text-[10px]">
                <span className="text-muted mr-0.5">Tela:</span>
                <button
                  type="button"
                  onClick={() => setVideoScreenSize('mini')}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-bold transition-all",
                    videoScreenSize === 'mini'
                      ? "bg-primary text-background shadow-xs"
                      : "text-muted hover:text-foreground bg-background border border-border/50"
                  )}
                  title="Tela de vídeo ultra compacta (160px)"
                >
                  Mini
                </button>
                <button
                  type="button"
                  onClick={() => setVideoScreenSize('compact')}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-bold transition-all",
                    videoScreenSize === 'compact'
                      ? "bg-primary text-background shadow-xs"
                      : "text-muted hover:text-foreground bg-background border border-border/50"
                  )}
                  title="Tela compacta reduzida para desktop (205px - padrão)"
                >
                  Compacta
                </button>
                <button
                  type="button"
                  onClick={() => setVideoScreenSize('standard')}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-bold transition-all",
                    videoScreenSize === 'standard'
                      ? "bg-primary text-background shadow-xs"
                      : "text-muted hover:text-foreground bg-background border border-border/50"
                  )}
                  title="Tela de vídeo média (260px)"
                >
                  Média
                </button>
              </div>
            </div>

            {/* Workout Parameters Badges */}
            {(exercise.sets || exercise.reps || exercise.restSeconds || exercise.weightKg) && (
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-xs">
                {exercise.sets && (
                  <div className="p-1.5 rounded-lg bg-surface/50 border border-border">
                    <span className="text-[10px] text-muted block">Séries</span>
                    <span className="font-bold text-foreground">{exercise.sets}</span>
                  </div>
                )}
                {exercise.reps && (
                  <div className="p-1.5 rounded-lg bg-surface/50 border border-border">
                    <span className="text-[10px] text-muted block">Reps</span>
                    <span className="font-bold text-foreground">{exercise.reps}</span>
                  </div>
                )}
                {exercise.restSeconds && (
                  <div className="p-1.5 rounded-lg bg-surface/50 border border-border">
                    <span className="text-[10px] text-muted block">Pausa</span>
                    <span className="font-bold text-foreground">{exercise.restSeconds}s</span>
                  </div>
                )}
                {exercise.weightKg && (
                  <div className="p-1.5 rounded-lg bg-surface/50 border border-border">
                    <span className="text-[10px] text-muted block">Carga</span>
                    <span className="font-bold text-foreground">{exercise.weightKg}kg</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Biomechanical Cues & Postural Instructions */}
          <div className="md:col-span-6 mt-4 md:mt-0 space-y-3 flex flex-col justify-start max-h-[380px] overflow-y-auto pr-1">
            {/* Instructions */}
            {exercise.instructions && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Instruções Biomecânicas</span>
                </div>
                <p className="text-xs text-muted leading-relaxed bg-surface/60 p-2.5 rounded-xl border border-border">
                  {exercise.instructions}
                </p>
              </div>
            )}

            {/* Precautions / Safety Notes */}
            {exercise.precautions && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Cuidados Posturais & Contraindicações</span>
                </div>
                <div className="text-xs text-amber-300/90 leading-relaxed bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  {exercise.precautions}
                </div>
              </div>
            )}

            {/* Key Checkpoints */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Pontos de Atenção</span>
              {exercise.muscleGroup === 'Cardio' ? (
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-surface/50 border border-border flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-foreground text-[11px] block">Ajuste & Ergonomia:</span>
                      <span className="text-[11px] text-muted">Ajuste de selim/altura na crista ilíaca, pés seguros nas presilhas/plataforma sem hiperextender os joelhos.</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface/50 border border-border flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-foreground text-[11px] block">Pegada & Postura do Tronco:</span>
                      <span className="text-[11px] text-muted">Mãos suaves nos apoios sem descarregar o peso corporal; coluna neutra e core estabilizado.</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface/50 border border-border flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-foreground text-[11px] block">Cadência & Respiração:</span>
                      <span className="text-[11px] text-muted">Respiração diafragmática contínua (sem apneia) mantendo a cadência e a zona alvo prescrita.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-surface/50 border border-border flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-foreground text-[11px] block">Posição Inicial:</span>
                      <span className="text-[11px] text-muted">Estabilizar core, pés firmes e coluna neutra alinhada.</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface/50 border border-border flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-foreground text-[11px] block">Fase Excêntrica (Descida):</span>
                      <span className="text-[11px] text-muted">Cadência controlada de 2 a 3 segundos sem relaxar a musculatura.</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface/50 border border-border flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-foreground text-[11px] block">Contração Pico:</span>
                      <span className="text-[11px] text-muted">Aperto máximo de 1s sem perder o padrão motor nem hiperextender.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-border bg-surface/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {parsedVideo.rawUrl && (
              <a
                href={parsedVideo.rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-primary flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Abrir Vídeo Original</span>
              </a>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={onClose} className="px-5">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
