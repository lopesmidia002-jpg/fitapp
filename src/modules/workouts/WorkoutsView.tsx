import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Exercise, WorkoutPlan, WorkoutExercise } from '../../types';
import { cn } from '../../lib/utils';
import { ExerciseVideoPlayerModal, ExerciseVideoModalData } from '../../components/workouts/ExerciseVideoPlayerModal';
import { ExerciseVideoUploaderModal } from '../../components/workouts/ExerciseVideoUploaderModal';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Play,
  Clock,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Trash2,
  ListPlus,
  X,
  Menu,
  ChevronDown,
  Check,
  Film,
  UploadCloud,
  Video,
  Activity,
  ShieldAlert,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';

export const CARDIO_PRESETS = [
  {
    name: 'Corrida / Caminhada Inclinada na Esteira',
    equipment: 'Esteira Ergométrica',
    instructions: 'Manter cadência constante de passadas, olhar para frente na linha do horizonte, tronco levemente inclinado a favor do movimento, aterrissagem suave com o mediopé e braços flexionados a 90° sincronizados com as pernas.',
    precautions: 'Não segurar nas barras de apoio (reduz em até 30% o gasto calórico e altera a marcha natural). Evitar passadas excessivamente longas (overstriding) para proteger meniscos e lombar. Manter ombros relaxados para não tensionar o trapézio.',
    targetSetsDefault: 1,
    targetRepsDefault: '20 a 30 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:25',
  },
  {
    name: 'Bicicleta Ergométrica Vertical (Spinning)',
    equipment: 'Bicicleta Ergométrica',
    instructions: 'Ajustar a altura do selim na altura da crista ilíaca (osso do quadril). Pedalada fluida em 360°, mantendo joelhos paralelos (sem abrir para fora). Manter cadência controlada entre 75 a 90 RPM com carga progressiva.',
    precautions: 'O joelho deve manter leve flexão de 25° a 30° no ponto mais baixo do pedal (evitar hiperextensão articular). Não curvar excessivamente a coluna lombar nem descarregar peso excessivo nos punhos sobre o guidão.',
    targetSetsDefault: 1,
    targetRepsDefault: '25 a 35 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Stationary_bicycle_exercise.webm',
    videoDuration: '0:20',
  },
  {
    name: 'Bicicleta Ergométrica Horizontal (Recumbent)',
    equipment: 'Bicicleta Ergométrica Horizontal',
    instructions: 'Acomodar as costas totalmente apoiadas no encosto ergonômico. Ajustar a distância do assento para que a perna não trave esticada no fim do curso. Segurar suavemente nas manoplas laterais com respiração contínua.',
    precautions: 'Ideal para alunos com dor lombar, gestantes ou sobrepeso severo. Manter o quadril colado no encosto sem deslizar para frente. Manter os pés seguros nas presilhas dos pedais para poupar os tornozelos.',
    targetSetsDefault: 1,
    targetRepsDefault: '20 a 30 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Stationary_bicycle_exercise.webm',
    videoDuration: '0:20',
  },
  {
    name: 'Simulador de Escada (StairMaster)',
    equipment: 'Simulador de Escada',
    instructions: 'Subir degrau por degrau apoiando a planta inteira do pé no centro do degrau. Empurrar com calcanhares e glúteos para máxima ativação da cadeia posterior. Manter ritmo constante e respiração diafragmática.',
    precautions: 'Não apoiar o peso do corpo sobre o corrimão (as mãos servem apenas para equilíbrio sutil). Não inclinar o tronco excessivamente à frente ("corcunda"). Manter joelhos sem valgo dinâmico.',
    targetSetsDefault: 1,
    targetRepsDefault: '15 a 20 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:25',
  },
  {
    name: 'Elíptico / Transport',
    equipment: 'Elíptico',
    instructions: 'Movimento contínuo sincronizado empurrando e puxando as hastes com os membros superiores e pedalando com os inferiores em movimento elíptico suave sem impacto articular.',
    precautions: 'Manter calcanhares em contato com a plataforma durante o ciclo (não pedalar nas pontas dos pés para evitar fascite plantar). Manter coluna ereta e abdômen ativado.',
    targetSetsDefault: 1,
    targetRepsDefault: '20 a 30 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Stationary_bicycle_exercise.webm',
    videoDuration: '0:20',
  },
  {
    name: 'Remo Seco Indoor (Air Rower)',
    equipment: 'Remo Seco (Air Rower)',
    instructions: 'Ciclo biomecânico: Ataque (Catch) -> Propulsão (Drive: estender pernas 60%, inclinar tronco 20%, puxar braços 20%) -> Finalização (Finish) -> Retorno suave (Recovery inverso).',
    precautions: 'Não iniciar a puxada flexionando as costas. A força inicial nasce 100% da extensão dos membros inferiores. Na propulsão, estenda os joelhos antes de puxar a manopla ao esterno.',
    targetSetsDefault: 1,
    targetRepsDefault: '15 a 20 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:22',
  },
  {
    name: 'Air Bike (Assault Bike)',
    equipment: 'Air Bike',
    instructions: 'Pedalada de alta intensidade combinando empurrar e puxar vigoroso das manoplas, aproveitando a resistência do ar proporcional à potência gerada em tiros ou cadência contínua.',
    precautions: 'Evitar oscilação lateral excessiva do tronco. Manter o core ativado e ombros afastados das orelhas. Atenção ao alinhamento dos joelhos na fase de fadiga aguda.',
    targetSetsDefault: 4,
    targetRepsDefault: '30s tiro / 30s leve',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Stationary_bicycle_exercise.webm',
    videoDuration: '0:20',
  },
  {
    name: 'Corda Naval (Battle Rope)',
    equipment: 'Corda Naval',
    instructions: 'Base semiagachada com joelhos flexionados, core firme e peito aberto. Produzir ondas alternadas ou simultâneas movimentando os braços com potência a partir dos ombros.',
    precautions: 'Não arquear ou arredondar a coluna lombar durante os impulsos. Manter joelhos alinhados sem colapso medial e peso distribuído nos calcanhares.',
    targetSetsDefault: 4,
    targetRepsDefault: '30 a 45 seg',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:25',
  },
  {
    name: 'Corda de Pular (Jump Rope)',
    equipment: 'Corda de Pular',
    instructions: 'Giro da corda pelos punhos com cotovelos próximos às costelas. Saltos baixos (1 a 2 cm do solo) aterrissando suavemente na ponta dos pés com joelhos destravados.',
    precautions: 'Não saltar flexionando os joelhos para trás. Aterrissagem suave e elástica para proteger o tendão de Aquiles e a coluna vertebral.',
    targetSetsDefault: 4,
    targetRepsDefault: '60 a 90 seg',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:25',
  }
];

export const CARDIO_EQUIPMENTS = [
  { value: 'Esteira Ergométrica', label: 'Esteira Ergométrica' },
  { value: 'Bicicleta Ergométrica', label: 'Bicicleta Ergométrica (Spinning / Vertical)' },
  { value: 'Bicicleta Ergométrica Horizontal', label: 'Bicicleta Ergométrica Horizontal' },
  { value: 'Simulador de Escada', label: 'Simulador de Escada (StairMaster)' },
  { value: 'Elíptico', label: 'Elíptico (Transport)' },
  { value: 'Remo Seco (Air Rower)', label: 'Remo Seco (Air Rower)' },
  { value: 'Air Bike', label: 'Air Bike (Assault Bike)' },
  { value: 'Corda Naval', label: 'Corda Naval (Battle Rope)' },
  { value: 'Corda de Pular', label: 'Corda de Pular (Speed Rope)' },
  { value: 'Peso Corporal', label: 'Peso Corporal / Pliometria' },
  { value: 'Máquina', label: 'Máquina Cardiovascular' },
  { value: 'Outro', label: 'Outro Equipamento de Cardio' },
];

export const STANDARD_EQUIPMENTS = [
  { value: 'Halteres', label: 'Halteres' },
  { value: 'Barra', label: 'Barra' },
  { value: 'Máquina', label: 'Máquina' },
  { value: 'Cabo', label: 'Cabo' },
  { value: 'Peso Corporal', label: 'Peso Corporal' },
  { value: 'Kettlebell', label: 'Kettlebell' },
  { value: 'Outro', label: 'Outro' },
];

export function WorkoutsView() {
  const { exercises, addExercise, workoutPlans, addWorkoutPlan, students, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'programs' | 'exercises'>('programs');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Todos');
  const [searchExercise, setSearchExercise] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Video Player Modal State
  const [activeVideoExercise, setActiveVideoExercise] = useState<ExerciseVideoModalData | null>(null);

  // Video Uploader Modal State
  const [uploaderState, setUploaderState] = useState<{
    isOpen: boolean;
    targetType: 'plan_exercise' | 'new_custom_exercise';
    exerciseIndex?: number;
    exerciseName: string;
    initialUrl: string;
  } | null>(null);

  // New Exercise Modal
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'id'>>({
    name: '',
    muscleGroup: 'Peitoral',
    equipment: 'Halteres',
    instructions: '',
    precautions: '',
    targetSetsDefault: 3,
    targetRepsDefault: '10 a 12',
    videoUrl: '',
    videoDuration: '',
  });

  // New Workout Plan Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPlanSaved, setIsPlanSaved] = useState(false);
  const [isExerciseSaved, setIsExerciseSaved] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [planTitle, setPlanTitle] = useState('Treino Personalizado de Hipertrofia');
  const [planSplit, setPlanSplit] = useState<'A' | 'B' | 'C' | 'D' | 'Fullbody'>('A');
  const [planNotes, setPlanNotes] = useState('Manter cadência de 3 segundos na fase excêntrica.');
  const [chosenExercises, setChosenExercises] = useState<WorkoutExercise[]>([
    {
      exerciseId: exercises[0]?.id || 'ex-1',
      name: exercises[0]?.name || 'Supino Reto com Barra',
      sets: 4,
      reps: '8-10',
      restSeconds: 90,
      weightKg: 40,
      videoUrl: exercises[0]?.videoUrl || 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      videoDuration: exercises[0]?.videoDuration || '0:35',
    }
  ]);

  const muscleGroups = ['Todos', 'Peitoral', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Abdômen', 'Cardio'];

  const filteredExercises = exercises.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'Todos' || ex.muscleGroup === selectedMuscle;
    const matchesSearch = ex.name.toLowerCase().includes(searchExercise.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const handleAddExerciseToPlan = (ex: Exercise) => {
    setChosenExercises([
      ...chosenExercises,
      {
        exerciseId: ex.id,
        name: ex.name,
        sets: ex.targetSetsDefault || 3,
        reps: ex.targetRepsDefault || '10-12',
        restSeconds: 60,
        weightKg: 20,
        videoUrl: ex.videoUrl,
        videoDuration: ex.videoDuration,
      }
    ]);
  };

  const handleRemoveExerciseFromPlan = (index: number) => {
    setChosenExercises(chosenExercises.filter((_, i) => i !== index));
  };

  const handleSaveUploaderVideo = (videoUrl: string, duration?: string) => {
    if (!uploaderState) return;
    if (uploaderState.targetType === 'plan_exercise' && uploaderState.exerciseIndex !== undefined) {
      const updated = [...chosenExercises];
      updated[uploaderState.exerciseIndex].videoUrl = videoUrl;
      if (duration) updated[uploaderState.exerciseIndex].videoDuration = duration;
      setChosenExercises(updated);
    } else if (uploaderState.targetType === 'new_custom_exercise') {
      setNewExercise(prev => ({
        ...prev,
        videoUrl,
        videoDuration: duration || prev.videoDuration || '0:30'
      }));
    }
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || chosenExercises.length === 0) return;

    addWorkoutPlan({
      organizationId: 'org-alpha-1',
      studentId: selectedStudentId,
      proId: currentUser.id,
      title: planTitle,
      split: planSplit,
      description: planNotes,
      exercises: chosenExercises,
      validUntil: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
    });

    setIsPlanSaved(true);
    setTimeout(() => {
      setIsPlanSaved(false);
      setIsPlanModalOpen(false);
    }, 1100);
  };

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExercise.name) return;
    addExercise(newExercise);
    setIsExerciseSaved(true);
    setTimeout(() => {
      setIsExerciseSaved(false);
      setIsExerciseModalOpen(false);
      setNewExercise({
        name: '',
        muscleGroup: 'Peitoral',
        equipment: 'Halteres',
        instructions: '',
        precautions: '',
        targetSetsDefault: 3,
        targetRepsDefault: '10 a 12',
        videoUrl: '',
        videoDuration: '',
      });
    }, 1000);
  };

  const handleOpenExerciseModal = () => {
    const isCardio = selectedMuscle === 'Cardio';
    setNewExercise({
      name: isCardio ? 'Corrida / Caminhada Inclinada na Esteira' : '',
      muscleGroup: isCardio ? 'Cardio' : 'Peitoral',
      equipment: isCardio ? 'Esteira Ergométrica' : 'Halteres',
      instructions: isCardio ? CARDIO_PRESETS[0].instructions : '',
      precautions: isCardio ? CARDIO_PRESETS[0].precautions : '',
      targetSetsDefault: isCardio ? 1 : 3,
      targetRepsDefault: isCardio ? '20 a 30 min' : '10 a 12',
      videoUrl: isCardio ? 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm' : '',
      videoDuration: isCardio ? '0:25' : '',
    });
    setIsExerciseModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Treinos & Biblioteca de Exercícios <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted">
            Prescreva rotinas estruturadas com descansos, cargas e orientações posturais.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenExerciseModal}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Exercício</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <ListPlus className="h-4 w-4" />
            <span>Montar Nova Ficha</span>
          </Button>
        </div>
      </div>

      {/* Tabs Switcher: Fichas Ativas vs Catálogo */}
      <div className="flex space-x-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'programs'
              ? 'bg-primary text-background font-black shadow-neon-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Fichas e Programas Ativos ({workoutPlans.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'exercises'
              ? 'bg-primary text-background font-black shadow-neon-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Biblioteca de Exercícios ({exercises.length})
        </button>
      </div>

      {/* TAB 1: FICHAS E PROGRAMAS */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutPlans.map((plan) => {
              const student = students.find(s => s.id === plan.studentId);
              return (
                <Card key={plan.id} className="hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-black uppercase">
                            Divisão {plan.split}
                          </span>
                          <span className="text-xs text-muted">Válido até {plan.validUntil}</span>
                        </div>
                        <CardTitle>{plan.title}</CardTitle>
                        <CardDescription>
                          Aluno: <strong className="text-foreground">{student?.fullName || 'Marina Silva Rocha'}</strong>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted bg-surface/50 p-2.5 rounded-lg border border-border">
                      {plan.description}
                    </p>

                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Exercícios Prescritos ({plan.exercises.length}):
                      </p>
                      {plan.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2.5 rounded-lg bg-surface border border-border/70 gap-2"
                        >
                          <div className="flex items-center gap-2 font-semibold min-w-0">
                            <span className="h-5 w-5 rounded-full bg-dark-700 text-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{ex.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const match = exercises.find(e => e.id === ex.exerciseId || e.name === ex.name);
                                setActiveVideoExercise({
                                  name: ex.name,
                                  muscleGroup: match?.muscleGroup,
                                  equipment: match?.equipment,
                                  instructions: match?.instructions,
                                  precautions: match?.precautions,
                                  videoUrl: ex.videoUrl || match?.videoUrl,
                                  videoDuration: ex.videoDuration || match?.videoDuration,
                                  sets: ex.sets,
                                  reps: ex.reps,
                                  restSeconds: ex.restSeconds,
                                  weightKg: ex.weightKg,
                                });
                              }}
                              className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary hover:text-background transition-all px-2 py-0.5 rounded-md border border-primary/20 shrink-0"
                              title="Assistir vídeo de execução deste exercício"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              <span>Vídeo</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-3 text-muted shrink-0 text-[11px] sm:text-xs">
                            <span>{ex.sets} séries × {ex.reps}</span>
                            <span className="text-primary font-bold">{ex.restSeconds}s descanso</span>
                            {ex.weightKg && <span className="text-foreground">{ex.weightKg} kg</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BIBLIOTECA DE EXERCÍCIOS */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="Buscar exercício..."
                  value={searchExercise}
                  onChange={(e) => setSearchExercise(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  rightIcon={
                    searchExercise ? (
                      <button
                        type="button"
                        onClick={() => setSearchExercise('')}
                        className="text-muted hover:text-foreground p-1 transition-colors"
                        aria-label="Limpar busca"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : undefined
                  }
                />
              </div>

              {/* Mobile Filter: Menu Sanduíche para Tipos/Grupos de Treino */}
              <div className="relative sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground hover:border-primary/50 transition-colors shadow-sm"
                  aria-expanded={isMobileFilterOpen}
                  aria-label="Abrir menu de grupos de treino"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Menu className="h-4 w-4" />
                    </span>
                    <span className="text-muted">Grupo:</span>
                    <span className="font-bold text-foreground">{selectedMuscle}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted transition-transform duration-200 ${
                      isMobileFilterOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {isMobileFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                      onClick={() => setIsMobileFilterOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted border-b border-border/50 flex items-center justify-between">
                        <span>Filtrar por Grupo</span>
                        <span className="text-primary font-mono">{filteredExercises.length} exercícios</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1 max-h-60 overflow-y-auto">
                        {muscleGroups.map((group) => {
                          const isSelected = selectedMuscle === group;
                          return (
                            <button
                              key={group}
                              type="button"
                              onClick={() => {
                                setSelectedMuscle(group);
                                setIsMobileFilterOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-primary text-background font-bold shadow-neon-sm'
                                  : 'text-muted hover:text-foreground hover:bg-surface'
                              }`}
                            >
                              <span className="truncate">{group}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 shrink-0 stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop Filter Chips */}
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1.5 pt-0.5 sm:py-0 scrollbar-none">
                {muscleGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedMuscle(group)}
                    className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      selectedMuscle === group
                        ? 'bg-primary text-background font-bold shadow-neon-sm'
                        : 'bg-surface text-muted hover:text-foreground'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Banner Informativo de Cardio e Ergômetros */}
          {selectedMuscle === 'Cardio' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-transparent border border-emerald-500/30 dark:border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span>Módulo de Cardio, Ergômetros & Cuidados Posturais</span>
                    <Badge variant="primary" size="sm">Diretrizes ACSM / Biomecânica</Badge>
                  </h4>
                  <p className="text-muted mt-0.5 text-xs">
                    Ergômetros aeróbicos (Esteira, Bike Spinning, Horizontal, Escada, Remo, Elíptico) com instruções técnicas completas e cuidados posturais para proteção da lombar, meniscos e joelhos.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenExerciseModal}
                className="shrink-0 text-xs flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Exercício de Cardio</span>
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((ex) => (
              <Card key={ex.id} className="hover:border-primary/40 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-foreground break-words">{ex.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="primary" size="sm">{ex.muscleGroup}</Badge>
                        {ex.muscleGroup === 'Cardio' ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            <span>{ex.equipment}</span>
                          </span>
                        ) : (
                          <Badge variant="neutral" size="sm">{ex.equipment}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Botão de Demonstração em Vídeo */}
                    <button
                      type="button"
                      onClick={() => setActiveVideoExercise(ex)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-background transition-all font-bold text-xs shrink-0 shadow-sm group"
                      title="Assistir vídeo de execução biomecânica"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{ex.videoDuration || 'Vídeo HD'}</span>
                    </button>
                  </div>

                  {/* Instruções de Execução Biomecânica */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      <span>Instruções de Execução:</span>
                    </span>
                    <p className="text-xs text-foreground/90 leading-relaxed bg-surface/50 p-2.5 rounded-xl border border-border/70">
                      {ex.instructions}
                    </p>
                  </div>

                  {/* Cuidados Posturais / Contraindicações */}
                  {ex.precautions && (
                    <div className="text-xs p-2.5 rounded-xl border flex items-start gap-2 bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold block text-[11px] text-amber-900 dark:text-amber-400">
                          Cuidados Posturais & Prevenção:
                        </span>
                        <p className="text-[11px] leading-relaxed mt-0.5 text-muted dark:text-amber-200/90">
                          {ex.precautions}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveVideoExercise(ex)}
                      className="text-xs text-primary font-bold hover:underline flex items-center gap-1 transition-colors"
                      title="Assistir execução passo a passo em câmera lenta"
                    >
                      <Film className="h-3.5 w-3.5" />
                      <span>Ver Execução</span>
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddExerciseToPlan(ex)}
                      className="text-xs text-primary hover:bg-primary/10 shrink-0"
                    >
                      + Adicionar à ficha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Montar Ficha Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Montar Novo Programa de Treino"
        description="Configure exercícios, séries, repetições e pausas para o aluno selecionado."
        className="max-w-2xl"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Aluno Destinatário *"
              options={students.map(s => ({ value: s.id, label: `${s.fullName} (${s.status})` }))}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            />
            <Select
              label="Divisão *"
              options={[
                { value: 'A', label: 'Treino A' },
                { value: 'B', label: 'Treino B' },
                { value: 'C', label: 'Treino C' },
                { value: 'D', label: 'Treino D' },
                { value: 'Fullbody', label: 'Fullbody' },
              ]}
              value={planSplit}
              onChange={(e) => setPlanSplit(e.target.value as any)}
            />
          </div>

          <Input
            label="Título da Ficha *"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            placeholder="Ex: Treino A — Foco Peito e Tríceps"
          />

          <Input
            label="Orientações Gerais"
            value={planNotes}
            onChange={(e) => setPlanNotes(e.target.value)}
            placeholder="Ex: Cadência de 3 seg na descida, aquecer manguito antes."
          />

          {/* Exercises in Plan Builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted uppercase">Exercícios Selecionados ({chosenExercises.length})</label>
              <span className="text-xs text-primary font-medium">Configure séries e descanso</span>
            </div>

            {chosenExercises.map((ex, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                  <span className="font-bold text-foreground truncate max-w-[160px] sm:max-w-xs">{ex.name}</span>

                  {/* Botão de Carregar/Visualizar Vídeo da Execução */}
                  {ex.videoUrl ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setUploaderState({
                          isOpen: true,
                          targetType: 'plan_exercise',
                          exerciseIndex: idx,
                          exerciseName: ex.name,
                          initialUrl: ex.videoUrl || ''
                        })}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 transition-colors"
                        title="Vídeo de execução vinculado. Clique para alterar ou carregar outro vídeo."
                      >
                        <Film className="h-3 w-3 text-emerald-400" />
                        <span>Vídeo Anexado</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const match = exercises.find(e => e.id === ex.exerciseId || e.name === ex.name);
                          setActiveVideoExercise({
                            name: ex.name,
                            muscleGroup: match?.muscleGroup,
                            equipment: match?.equipment,
                            instructions: match?.instructions,
                            precautions: match?.precautions,
                            videoUrl: ex.videoUrl,
                            videoDuration: ex.videoDuration,
                            sets: ex.sets,
                            reps: ex.reps,
                            restSeconds: ex.restSeconds,
                          });
                        }}
                        className="p-1 rounded bg-surface hover:bg-card text-muted hover:text-primary transition-colors"
                        title="Assistir prévia do vídeo"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUploaderState({
                        isOpen: true,
                        targetType: 'plan_exercise',
                        exerciseIndex: idx,
                        exerciseName: ex.name,
                        initialUrl: ''
                      })}
                      className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md border border-primary/30 transition-colors shrink-0"
                      title="Carregar arquivo de vídeo ou link de execução para o aluno"
                    >
                      <UploadCloud className="h-3 w-3" />
                      <span>Carregar Vídeo</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-muted">Séries:</span>
                    <input
                      type="number"
                      value={ex.sets}
                      onChange={(e) => {
                        const updated = [...chosenExercises];
                        updated[idx].sets = parseInt(e.target.value) || 1;
                        setChosenExercises(updated);
                      }}
                      className="w-12 bg-card border border-border rounded px-1.5 py-1 text-center text-foreground font-bold"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-muted">Reps:</span>
                    <input
                      type="text"
                      value={ex.reps}
                      onChange={(e) => {
                        const updated = [...chosenExercises];
                        updated[idx].reps = e.target.value;
                        setChosenExercises(updated);
                      }}
                      className="w-16 bg-card border border-border rounded px-1.5 py-1 text-center text-foreground font-bold"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-muted">Pausa (s):</span>
                    <input
                      type="number"
                      value={ex.restSeconds}
                      onChange={(e) => {
                        const updated = [...chosenExercises];
                        updated[idx].restSeconds = parseInt(e.target.value) || 30;
                        setChosenExercises(updated);
                      }}
                      className="w-14 bg-card border border-border rounded px-1.5 py-1 text-center text-primary font-bold"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveExerciseFromPlan(idx)}
                    className="text-red-400 hover:text-red-300 h-7 w-7 shrink-0"
                    title="Remover exercício da ficha"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Quick add more exercises to the plan */}
            <div className="pt-2 flex items-center gap-2">
              <select
                className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground flex-1 focus:outline-none focus:border-primary"
                onChange={(e) => {
                  const ex = exercises.find(item => item.id === e.target.value);
                  if (ex) {
                    handleAddExerciseToPlan(ex);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>+ Adicionar mais um exercício do catálogo à ficha...</option>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.muscleGroup} • {ex.equipment}) {ex.videoUrl ? '🎥 com vídeo' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsPlanModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={`flex items-center gap-1.5 font-bold transition-all duration-200 ${
                isPlanSaved
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/30'
                  : 'shadow-neon-sm'
              }`}
            >
              {isPlanSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>✓ Ficha Salva com Sucesso!</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Salvar e Publicar Ficha</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cadastrar Exercício Modal */}
      <Modal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        title="Cadastrar Novo Exercício na Biblioteca"
        description="Adicione exercícios personalizados com vídeo de execução, orientações e cuidados."
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleCreateCustomExercise} className="space-y-4">
          <Input
            label="Nome do Exercício *"
            required
            value={newExercise.name}
            onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
            placeholder={
              newExercise.muscleGroup === 'Cardio'
                ? "Ex: Corrida / Caminhada Inclinada na Esteira"
                : "Ex: Puxada Articulada Unilateral"
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Grupo Muscular *"
              options={[
                { value: 'Peitoral', label: 'Peitoral' },
                { value: 'Costas', label: 'Costas' },
                { value: 'Pernas', label: 'Pernas' },
                { value: 'Ombros', label: 'Ombros' },
                { value: 'Braços', label: 'Braços' },
                { value: 'Abdômen', label: 'Abdômen' },
                { value: 'Cardio', label: 'Cardio' },
              ]}
              value={newExercise.muscleGroup}
              onChange={(e) => {
                const mg = e.target.value as any;
                if (mg === 'Cardio') {
                  const isCardioCurrent = CARDIO_EQUIPMENTS.some(eq => eq.value === newExercise.equipment);
                  const firstPreset = CARDIO_PRESETS[0];
                  setNewExercise({
                    ...newExercise,
                    muscleGroup: 'Cardio',
                    name: newExercise.name || firstPreset.name,
                    equipment: isCardioCurrent ? newExercise.equipment : 'Esteira Ergométrica',
                    instructions: newExercise.instructions || firstPreset.instructions,
                    precautions: newExercise.precautions || firstPreset.precautions,
                    targetSetsDefault: 1,
                    targetRepsDefault: '20 a 30 min',
                    videoUrl: newExercise.videoUrl || firstPreset.videoUrl || '',
                    videoDuration: newExercise.videoDuration || firstPreset.videoDuration || '0:25',
                  });
                } else {
                  const isStd = STANDARD_EQUIPMENTS.some(eq => eq.value === newExercise.equipment);
                  setNewExercise({
                    ...newExercise,
                    muscleGroup: mg,
                    equipment: isStd ? newExercise.equipment : 'Halteres',
                    targetSetsDefault: 3,
                    targetRepsDefault: '10 a 12',
                  });
                }
              }}
            />

            <Select
              label="Equipamento *"
              options={newExercise.muscleGroup === 'Cardio' ? CARDIO_EQUIPMENTS : STANDARD_EQUIPMENTS}
              value={newExercise.equipment}
              onChange={(e) => {
                const selectedEq = e.target.value as any;
                const matchedPreset = CARDIO_PRESETS.find(p => p.equipment === selectedEq);
                if (matchedPreset && (
                  !newExercise.instructions ||
                  CARDIO_PRESETS.some(p => p.instructions === newExercise.instructions)
                )) {
                  setNewExercise({
                    ...newExercise,
                    equipment: selectedEq,
                    name: (!newExercise.name || CARDIO_PRESETS.some(p => p.name === newExercise.name)) ? matchedPreset.name : newExercise.name,
                    instructions: matchedPreset.instructions,
                    precautions: matchedPreset.precautions,
                    targetSetsDefault: matchedPreset.targetSetsDefault,
                    targetRepsDefault: matchedPreset.targetRepsDefault,
                    videoUrl: matchedPreset.videoUrl || newExercise.videoUrl,
                    videoDuration: matchedPreset.videoDuration || newExercise.videoDuration,
                  });
                } else {
                  setNewExercise({ ...newExercise, equipment: selectedEq });
                }
              }}
            />
          </div>

          {/* Quick Ergometer Presets for Cardio */}
          {newExercise.muscleGroup === 'Cardio' && (
            <div className="p-3 rounded-xl bg-surface/80 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Equipamentos Cardiovasculares & Ergômetros Rápidos:</span>
                </span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Auto-preencher</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CARDIO_PRESETS.map((preset) => {
                  const isSelected = newExercise.equipment === preset.equipment;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setNewExercise({
                          ...newExercise,
                          name: preset.name,
                          equipment: preset.equipment as any,
                          instructions: preset.instructions,
                          precautions: preset.precautions,
                          targetSetsDefault: preset.targetSetsDefault,
                          targetRepsDefault: preset.targetRepsDefault,
                          videoUrl: preset.videoUrl || newExercise.videoUrl,
                          videoDuration: preset.videoDuration || newExercise.videoDuration,
                        });
                      }}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg border font-medium transition-all text-left",
                        isSelected
                          ? "bg-primary text-background border-primary shadow-xs font-bold"
                          : "bg-card text-muted hover:text-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {preset.equipment}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cardio Postural Safety Callout Box */}
          {newExercise.muscleGroup === 'Cardio' && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
              <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Diretrizes e Cuidados Posturais em Ergômetros Cardiovasculares</span>
              </div>
              <ul className="text-xs text-amber-900 dark:text-amber-200/90 space-y-1.5 list-disc list-inside leading-relaxed pl-1">
                <li><strong className="text-foreground">Não debruçar nos corrimãos/apoios:</strong> Mãos servem unicamente para equilíbrio sutil. Apoiar o peso do corpo sobrecarrega ombros e coluna cervical, além de superestimar as calorias gastas.</li>
                <li><strong className="text-foreground">Ajuste anatômico de selim:</strong> Na bicicleta ergométrica, posicionar a altura do selim na crista ilíaca para garantir 25° a 30° de flexão no ponto mais baixo (evitar hiperextensão patelar).</li>
                <li><strong className="text-foreground">Alinhamento dinâmico articular:</strong> Manter joelhos alinhados no mesmo plano do pé (prevenindo valgo dinâmico) e coluna ereta com ativação contínua do core.</li>
                <li><strong className="text-foreground">Respiração Diafragmática Rítmica:</strong> Manter respiração ritmada contínua sem apnéia ou manobra de Valsalva durante tiros aeróbios ou esforço prolongado.</li>
              </ul>
            </div>
          )}

          {/* Target Sets & Reps / Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Séries Padrão *"
              type="number"
              min={1}
              max={10}
              value={newExercise.targetSetsDefault || 1}
              onChange={(e) => setNewExercise({ ...newExercise, targetSetsDefault: parseInt(e.target.value) || 1 })}
            />
            <Input
              label={newExercise.muscleGroup === 'Cardio' ? "Duração / Tempo Estimado *" : "Repetições Sugeridas *"}
              value={newExercise.targetRepsDefault || (newExercise.muscleGroup === 'Cardio' ? '20 a 30 min' : '10 a 12')}
              onChange={(e) => setNewExercise({ ...newExercise, targetRepsDefault: e.target.value })}
              placeholder={newExercise.muscleGroup === 'Cardio' ? "Ex: 20 a 30 min ou 4x 30s tiro" : "Ex: 8 a 10 reps"}
            />
          </div>

          <Textarea
            label="Instruções de Execução *"
            required
            rows={3}
            value={newExercise.instructions}
            onChange={(e) => setNewExercise({ ...newExercise, instructions: e.target.value })}
            placeholder={
              newExercise.muscleGroup === 'Cardio'
                ? "Ex: Manter cadência constante de passadas, olhar para frente na linha do horizonte, tronco levemente inclinado a favor do movimento, aterrissagem suave com o mediopé e braços flexionados a 90° sincronizados."
                : "Ex: Escápulas estabilizadas, puxar até o peito, cotovelos alinhados."
            }
          />

          <Textarea
            label="Cuidados Posturais / Contraindicações *"
            rows={3}
            value={newExercise.precautions}
            onChange={(e) => setNewExercise({ ...newExercise, precautions: e.target.value })}
            placeholder={
              newExercise.muscleGroup === 'Cardio'
                ? "Ex: Não segurar nas barras de apoio, manter leve flexão no joelho sem hiperextensão, evitar sobrecarga na coluna lombar e fascite plantar."
                : "Ex: Evitar flexão lombar excessiva se houver hérnia discal."
            }
          />

          {/* Campo de Vídeo do Exercício */}
          <div className="p-3 rounded-xl bg-surface/60 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Film className="h-4 w-4 text-primary" />
                <span>Vídeo de Demonstração (Opcional)</span>
              </label>
              {newExercise.videoUrl && (
                <Badge variant="success" size="sm">Vídeo Vinculado</Badge>
              )}
            </div>

            {newExercise.videoUrl ? (
              <div className="flex items-center justify-between text-xs bg-card p-2 rounded-lg border border-border">
                <span className="font-mono text-primary truncate max-w-xs">{newExercise.videoUrl}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveVideoExercise({
                      name: newExercise.name || 'Prévia do Exercício',
                      muscleGroup: newExercise.muscleGroup,
                      equipment: newExercise.equipment,
                      instructions: newExercise.instructions,
                      precautions: newExercise.precautions,
                      videoUrl: newExercise.videoUrl,
                      videoDuration: newExercise.videoDuration,
                    })}
                    className="p-1 text-muted hover:text-primary"
                    title="Assistir prévia"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploaderState({
                      isOpen: true,
                      targetType: 'new_custom_exercise',
                      exerciseName: newExercise.name || 'Novo Exercício',
                      initialUrl: newExercise.videoUrl || ''
                    })}
                    className="text-xs text-primary hover:underline font-bold"
                  >
                    Alterar
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewExercise(prev => ({ ...prev, videoUrl: '', videoDuration: '' }))}
                    className="text-xs text-rose-400 hover:text-rose-300 ml-1"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUploaderState({
                  isOpen: true,
                  targetType: 'new_custom_exercise',
                  exerciseName: newExercise.name || 'Novo Exercício',
                  initialUrl: ''
                })}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-primary border-dashed border-primary/40 hover:bg-primary/5"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Carregar Vídeo (Upload de Arquivo, Link do YouTube ou Presets)</span>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsExerciseModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={`flex items-center gap-1.5 font-bold transition-all duration-200 ${
                isExerciseSaved
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/30'
                  : 'shadow-neon-sm'
              }`}
            >
              {isExerciseSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>✓ Exercício Cadastrado!</span>
                </>
              ) : (
                'Cadastrar Exercício'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Reprodução de Vídeo da Execução */}
      <ExerciseVideoPlayerModal
        isOpen={!!activeVideoExercise}
        onClose={() => setActiveVideoExercise(null)}
        exercise={activeVideoExercise}
      />

      {/* Modal de Carregamento de Vídeo pelo Treinador */}
      {uploaderState && (
        <ExerciseVideoUploaderModal
          isOpen={uploaderState.isOpen}
          onClose={() => setUploaderState(null)}
          exerciseName={uploaderState.exerciseName}
          initialVideoUrl={uploaderState.initialUrl}
          onSaveVideo={handleSaveUploaderVideo}
        />
      )}
    </div>
  );
}
