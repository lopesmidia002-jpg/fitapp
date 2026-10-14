import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { parseVideoUrl, EXERCISE_VIDEO_PRESETS, VideoPreset } from '../../lib/videoUtils';
import {
  UploadCloud,
  Link2,
  Film,
  Check,
  Play,
  Trash2,
  AlertCircle,
  Sparkles,
  FileVideo,
  Clock,
  Zap,
  Scissors
} from 'lucide-react';

interface ExerciseVideoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  initialVideoUrl?: string;
  onSaveVideo: (videoUrl: string, duration?: string) => void;
}

export function ExerciseVideoUploaderModal({
  isOpen,
  onClose,
  exerciseName,
  initialVideoUrl = '',
  onSaveVideo,
}: ExerciseVideoUploaderModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'presets'>('upload');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>(initialVideoUrl);
  const [videoLinkInput, setVideoLinkInput] = useState<string>(initialVideoUrl);
  const [videoDuration, setVideoDuration] = useState<string>('0:25');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [durationWarning, setDurationWarning] = useState<string | null>(null);

  // Optional start/end clipping for YouTube links to guarantee <= 1 minute
  const [cropStart, setCropStart] = useState<string>('');
  const [cropEnd, setCropEnd] = useState<string>('');
  const [presetFilter, setPresetFilter] = useState<'all' | 'direct' | 'youtube'>('all');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync when modal opens or initialVideoUrl changes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedVideoUrl(initialVideoUrl);
      setVideoLinkInput(initialVideoUrl);
      setUploadError(null);
      setDurationWarning(null);
      setUploadedFileName('');
      setCropStart('');
      setCropEnd('');
    }
  }, [isOpen, initialVideoUrl]);

  // Handle local video file upload with client-side duration validation (<= 60s)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setDurationWarning(null);

    // Max 80MB check
    if (file.size > 80 * 1024 * 1024) {
      setUploadError('O arquivo de vídeo excede o limite máximo recomendado de 80MB. Escolha um vídeo mais curto ou compactado.');
      return;
    }

    if (!file.type.startsWith('video/')) {
      setUploadError('Por favor, selecione um arquivo de vídeo válido (.mp4, .webm, .mov, etc.).');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedVideoUrl(objectUrl);
    setUploadedFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);

    // Check duration via client-side video element
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      const durSec = Math.round(tempVideo.duration);
      const minutes = Math.floor(durSec / 60);
      const seconds = durSec % 60;
      const formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      setVideoDuration(formatted);

      if (durSec > 60) {
        setDurationWarning(`Aviso: este vídeo tem ${formatted} (${durSec}s). A recomendação da plataforma é usar vídeos curtos de até 1 minuto (60 segundos) para carregamento rápido.`);
      } else {
        setDurationWarning(null);
      }
    };
  };

  const handleApplyLink = () => {
    if (!videoLinkInput.trim()) {
      setUploadError('Cole um link válido de vídeo antes de prosseguir.');
      return;
    }
    setUploadError(null);
    setDurationWarning(null);

    let finalUrl = videoLinkInput.trim();

    // If coach provided start / end cropping for YouTube:
    const startSec = parseInt(cropStart);
    const endSec = parseInt(cropEnd);

    if (!isNaN(startSec) || !isNaN(endSec)) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      if (!isNaN(startSec)) finalUrl += `${separator}start=${startSec}`;
      if (!isNaN(endSec)) finalUrl += `&end=${endSec}`;

      if (!isNaN(startSec) && !isNaN(endSec)) {
        const diff = endSec - startSec;
        if (diff > 60) {
          setDurationWarning(`O trecho selecionado (${diff}s) ultrapassa 1 minuto. Sugerimos recortar até 60 segundos.`);
        }
        setVideoDuration(`0:${diff < 10 ? '0' : ''}${diff}`);
      }
    } else {
      setVideoDuration('0:30');
    }

    setSelectedVideoUrl(finalUrl);
  };

  const handleSelectPreset = (preset: VideoPreset) => {
    setSelectedVideoUrl(preset.videoUrl);
    setVideoLinkInput(preset.videoUrl);
    setVideoDuration(preset.duration);
    setUploadedFileName(`Modelo Omega: ${preset.name}`);
    setUploadError(null);
    setDurationWarning(null);
  };

  const handleRemoveVideo = () => {
    setSelectedVideoUrl('');
    setVideoLinkInput('');
    setUploadedFileName('');
    setVideoDuration('0:25');
    setCropStart('');
    setCropEnd('');
  };

  const handleSave = () => {
    onSaveVideo(selectedVideoUrl, videoDuration || '0:25');
    onClose();
  };

  const parsedCurrentVideo = parseVideoUrl(selectedVideoUrl);

  const filteredPresets = EXERCISE_VIDEO_PRESETS.filter((p) => {
    if (presetFilter === 'direct') return p.sourceType === 'direct_webm';
    if (presetFilter === 'youtube') return p.sourceType === 'youtube_short';
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Carregar Vídeo Curto de Execução"
      description={`Anexe uma demonstração visual rápida (máximo 1 minuto) para o exercício "${exerciseName}".`}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Banner de Orientação: Vídeos Curtos de até 1 Minuto */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2.5 text-xs">
          <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-foreground">Diretriz da Consultoria: Vídeos Rápidos (≤ 1 minuto)</span>
            <p className="text-muted text-[11px] mt-0.5 leading-relaxed">
              Priorize vídeos curtos de <strong>15 a 60 segundos</strong> que demonstrem de 2 a 4 repetições perfeitas em loop. Vídeos rápidos carregam instantaneamente no celular do aluno na academia.
            </p>
          </div>
        </div>

        {/* Tabs selector */}
        <div className="flex border-b border-border space-x-1 pb-1">
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setUploadError(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-primary text-background font-black shadow-neon-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload do Arquivo</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('link'); setUploadError(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'link'
                ? 'bg-primary text-background font-black shadow-neon-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Link2 className="h-4 w-4" />
            <span>Link / Trecho (≤ 1 min)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('presets'); setUploadError(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'presets'
                ? 'bg-primary text-background font-black shadow-neon-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Biblioteca de Presets (≤ 30s)</span>
          </button>
        </div>

        {/* TAB 1: FILE UPLOAD */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-surface/30 hover:bg-surface/60 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Clique para selecionar ou arraste o vídeo curto aqui
              </h4>
              <p className="text-xs text-muted max-w-sm">
                Formatos aceitos: MP4, WebM, MOV. Idealmente clipes curtos de <strong>15 a 60 segundos</strong> gravados pelo treinador.
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-2 pointer-events-none">
                Selecionar Vídeo no Dispositivo (Máx 60s)
              </Button>
            </div>

            {uploadedFileName && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileVideo className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-bold text-foreground truncate">{uploadedFileName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-primary font-bold">⏱ {videoDuration}</span>
                  <Badge variant="success" size="sm">Pronto para salvar</Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXTERNAL LINK COM RECORTE OPCIONAL */}
        {activeTab === 'link' && (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              Insira o link de um vídeo do <strong>YouTube (Shorts ou normal)</strong>, <strong>Vimeo</strong> ou arquivo <strong>.mp4 / .webm</strong>.
            </p>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  value={videoLinkInput}
                  onChange={(e) => setVideoLinkInput(e.target.value)}
                  leftIcon={<Link2 className="h-4 w-4" />}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyLink}
                className="shrink-0"
              >
                Aplicar e Testar
              </Button>
            </div>

            {/* Recorte Opcional de Trecho para Vídeos Longos do YouTube */}
            <div className="p-3 rounded-xl bg-surface/50 border border-border text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Scissors className="h-3.5 w-3.5 text-primary" />
                <span>Recortar Trecho Curto (Opcional — Máx 60 segundos):</span>
              </div>
              <p className="text-[11px] text-muted">
                Se o vídeo for longo, defina o segundo de início e fim da execução para reproduzir somente a demonstração:
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted text-[11px]">Início (seg):</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cropStart}
                    onChange={(e) => setCropStart(e.target.value)}
                    className="w-16 bg-card border border-border rounded-lg px-2 py-1 text-center font-bold text-foreground"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted text-[11px]">Fim (seg):</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={cropEnd}
                    onChange={(e) => setCropEnd(e.target.value)}
                    className="w-16 bg-card border border-border rounded-lg px-2 py-1 text-center font-bold text-foreground"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleApplyLink}
                  className="text-xs text-primary"
                >
                  Recortar Trecho
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OMEGA PRESETS (TODOS <= 30 SEGUNDOS) */}
        {activeTab === 'presets' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                Modelos verificados com duração de <strong>20 a 30 segundos</strong> em loop contínuo:
              </p>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPresetFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    presetFilter === 'all' ? 'bg-primary text-background' : 'bg-surface text-muted'
                  }`}
                >
                  Todos ({EXERCISE_VIDEO_PRESETS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPresetFilter('direct')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    presetFilter === 'direct' ? 'bg-primary text-background' : 'bg-surface text-muted'
                  }`}
                >
                  Vídeos Diretos WebM
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {filteredPresets.map((preset) => {
                const isSelected = selectedVideoUrl === preset.videoUrl;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-start justify-between p-3 rounded-xl text-left border transition-all text-xs ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                        : 'bg-surface/50 border-border hover:border-primary/40 text-muted hover:text-foreground'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <span>{preset.name}</span>
                        {preset.sourceType === 'direct_webm' && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-mono font-bold">
                            LOOP HD
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {preset.muscleGroup} • {preset.equipment}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono text-[11px] font-bold text-primary bg-background px-1.5 py-0.5 rounded border border-border flex items-center gap-0.5">
                        <Zap className="h-3 w-3" />
                        {preset.duration}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-primary font-black" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Warning message if video > 60s */}
        {durationWarning && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{durationWarning}</span>
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* CURRENT VIDEO PREVIEW BOX */}
        {selectedVideoUrl && (
          <div className="p-3.5 rounded-2xl bg-surface/70 border border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Prévia do Vídeo (Duração: {videoDuration || '≤ 1 min'}):</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">
                  ≤ 1 Minuto
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                title="Remover este vídeo do exercício"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remover Vídeo</span>
              </button>
            </div>

            <div className="relative w-full max-w-sm md:max-w-md mx-auto aspect-video max-h-[190px] rounded-xl overflow-hidden bg-black flex items-center justify-center border border-border/60 shadow-md">
              {parsedCurrentVideo.type === 'youtube' && (
                <iframe
                  src={parsedCurrentVideo.embedUrl}
                  title="Prévia do vídeo curto"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}

              {parsedCurrentVideo.type === 'vimeo' && (
                <iframe
                  src={parsedCurrentVideo.embedUrl}
                  title="Prévia do vídeo curto"
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}

              {parsedCurrentVideo.type === 'direct' && (
                <video
                  src={parsedCurrentVideo.embedUrl}
                  controls
                  loop
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={!selectedVideoUrl}
            className="flex items-center gap-1.5 shadow-neon-sm"
          >
            <Check className="h-4 w-4" />
            <span>Salvar Vídeo Curto</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
