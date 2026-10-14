import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Clock,
  Droplets,
  Flame,
  Award,
  Calendar,
  Utensils,
  ChevronRight,
  TrendingUp,
  Sparkles,
  StopCircle,
  RotateCcw,
  Star,
  Lock,
  Check,
  Share2,
  Copy,
  MessageCircle,
  Apple,
  Target,
  Activity,
  Scale,
  EyeOff,
  MessageSquare,
  Film
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { formatDate } from '../../lib/utils';
import { ExerciseVideoPlayerModal, ExerciseVideoModalData } from '../../components/workouts/ExerciseVideoPlayerModal';
import { generateAnthropometricDiagnosis } from '../../lib/anthropometry';

interface StudentAppViewProps {
  currentTab: string;
  onSelectTab?: (tabId: string) => void;
}

export function StudentAppView({ currentTab, onSelectTab }: StudentAppViewProps) {
  const {
    currentUser,
    students,
    workoutPlans,
    exercises,
    activeSession,
    startSession,
    toggleSetCompleted,
    startRestTimer,
    finishSession,
    cancelSession,
    goals,
    toggleGoal,
    nutritionPlans,
    assessments,
    theme
  } = useApp();

  const isDark = theme === 'dark';
  const currentStudent = students.find(s => s.id === currentUser.id || s.email === currentUser.email) || students.find(s => s.id === 'stud-1') || students[0];

  // Active tab state synchronized with prop
  const [activeTab, setActiveTab] = useState<string>(currentTab || 'student-home');
  const [activeVideoExercise, setActiveVideoExercise] = useState<ExerciseVideoModalData | null>(null);

  useEffect(() => {
    if (currentTab) setActiveTab(currentTab);
  }, [currentTab]);

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    onSelectTab?.(tabId);
  };

  // Student nutrition plan
  const studentNutritionPlan = nutritionPlans.find(p => p.studentId === currentStudent?.id) || nutritionPlans.find(p => p.studentId === 'stud-1') || nutritionPlans[0];

  // Track consumed meals for today
  const [consumedMeals, setConsumedMeals] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState(false);

  const toggleMealConsumed = (mealId: string) => {
    setConsumedMeals(prev => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  const handleCopyStudentMenu = () => {
    if (!studentNutritionPlan) return;
    const mealsText = studentNutritionPlan.meals.map(m => {
      const items = m.items.map(i => `  • ${i.name} (${i.amount}) - ${i.calories} kcal`).join('\n');
      return `⏰ ${m.time} - ${m.title}\n${items}`;
    }).join('\n\n');

    const fullText = `🥗 Meu Cardápio — ${studentNutritionPlan.title}\nOmega Training\n\n🎯 Metas:\n• Calorias: ${studentNutritionPlan.targetCalories} kcal\n• Proteína: ${studentNutritionPlan.targetProteinG}g\n• Carboidrato: ${studentNutritionPlan.targetCarbsG}g\n• Gordura: ${studentNutritionPlan.targetFatsG}g\n• Água: ${studentNutritionPlan.waterIntakeMl / 1000}L/dia\n\n🍽️ Refeições:\n${mealsText}`;
    navigator.clipboard.writeText(fullText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Evolution & Goals Tab State
  const [evolutionMetric, setEvolutionMetric] = useState<'weight' | 'fat' | 'adherence'>('weight');

  // Filter assessments for this student
  const studentAssessments = assessments
    .filter(a => a.studentId === currentStudent?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Generate continuous evolution trajectory
  const getStudentEvolutionPoints = () => {
    if (studentAssessments.length >= 2) {
      return studentAssessments.map(a => ({
        date: formatDate(a.date).slice(0, 5),
        fullDate: formatDate(a.date),
        weight: a.weightKg,
        bodyFat: a.bodyFatPercentage || 20,
        target: currentStudent?.targetWeightKg || 68,
        adherence: currentStudent?.adherenceRate || 90,
      }));
    }

    if (studentAssessments.length === 1) {
      const a = studentAssessments[0];
      const targetKg = currentStudent?.targetWeightKg || 68;
      const currentKg = currentStudent?.currentWeightKg || a.weightKg;
      const isWeightLoss = currentKg >= targetKg;
      const initialWeight = isWeightLoss ? a.weightKg + 2.4 : Math.max(40, a.weightKg - 2.4);
      return [
        {
          date: 'Início',
          fullDate: 'Início do Acompanhamento',
          weight: Number(initialWeight.toFixed(1)),
          bodyFat: a.bodyFatPercentage ? Number((a.bodyFatPercentage + 1.8).toFixed(1)) : 22.5,
          target: targetKg,
          adherence: Math.max(70, (currentStudent?.adherenceRate || 90) - 12),
        },
        {
          date: formatDate(a.date).slice(0, 5),
          fullDate: formatDate(a.date),
          weight: a.weightKg,
          bodyFat: a.bodyFatPercentage,
          target: targetKg,
          adherence: currentStudent?.adherenceRate || 90,
        },
        {
          date: 'Hoje',
          fullDate: 'Medição Atual',
          weight: currentKg,
          bodyFat: a.bodyFatPercentage ? Number(Math.max(8, a.bodyFatPercentage - 0.5).toFixed(1)) : 19.5,
          target: targetKg,
          adherence: currentStudent?.adherenceRate || 90,
        }
      ];
    }

    const currentKg = currentStudent?.currentWeightKg || 70;
    const targetKg = currentStudent?.targetWeightKg || 68;
    const isWeightLoss = currentKg >= targetKg;
    const initialWeight = isWeightLoss ? currentKg + 3.0 : Math.max(40, currentKg - 3.0);
    const midWeight = isWeightLoss ? currentKg + 1.2 : Math.max(40, currentKg - 1.2);

    return [
      {
        date: 'Início',
        fullDate: 'Início da Consultoria',
        weight: Number(initialWeight.toFixed(1)),
        bodyFat: 24.0,
        target: targetKg,
        adherence: 82,
      },
      {
        date: 'Sem 2',
        fullDate: 'Progresso Intermediário',
        weight: Number(midWeight.toFixed(1)),
        bodyFat: 22.0,
        target: targetKg,
        adherence: 88,
      },
      {
        date: 'Hoje',
        fullDate: 'Registro Atual',
        weight: currentKg,
        bodyFat: 20.0,
        target: targetKg,
        adherence: currentStudent?.adherenceRate || 92,
      }
    ];
  };

  const evolutionPoints = getStudentEvolutionPoints();
  const firstPoint = evolutionPoints[0];
  const lastPoint = evolutionPoints[evolutionPoints.length - 1];
  const weightChange = (lastPoint.weight - firstPoint.weight).toFixed(1);
  const remainingWeight = currentStudent
    ? Math.abs(currentStudent.currentWeightKg - currentStudent.targetWeightKg).toFixed(1)
    : '0';

  const isWeightLoss = currentStudent && firstPoint ? firstPoint.weight >= currentStudent.targetWeightKg : true;
  let progressPercent = 0;
  if (currentStudent && firstPoint) {
    if (isWeightLoss) {
      const totalToLose = firstPoint.weight - currentStudent.targetWeightKg;
      const lost = firstPoint.weight - currentStudent.currentWeightKg;
      progressPercent = totalToLose > 0 ? Math.round((lost / totalToLose) * 100) : 100;
    } else {
      const totalToGain = currentStudent.targetWeightKg - firstPoint.weight;
      const gained = currentStudent.currentWeightKg - firstPoint.weight;
      progressPercent = totalToGain > 0 ? Math.round((gained / totalToGain) * 100) : 100;
    }
    progressPercent = Math.min(100, Math.max(0, progressPercent));
  }

  const [waterDrunkMl, setWaterDrunkMl] = useState(1750);
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [sessionNotes, setSessionNotes] = useState('');

  const todaysWorkout = workoutPlans[0];

  // Rest Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (restRemaining && restRemaining > 0) {
      interval = setInterval(() => {
        setRestRemaining(prev => (prev && prev > 1 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restRemaining]);

  const handleStartRest = (seconds: number) => {
    setRestRemaining(seconds);
  };

  const handleAddWater = (amount: number) => {
    setWaterDrunkMl(prev => Math.min(4000, prev + amount));
  };

  if (currentStudent?.accessBlocked || currentStudent?.status === 'blocked') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-5 animate-in fade-in duration-300">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-foreground">Acesso Suspenso</h2>
          <p className="text-sm text-muted leading-relaxed">
            O seu login e o acesso aos treinos desta consultoria foram suspensos ou desativados.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border text-xs text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted">Aluno(a):</span>
            <span className="font-semibold text-foreground">{currentStudent.fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted">Login:</span>
            <span className="font-mono text-foreground">{currentStudent.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted">Situação:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Bloqueado / Excluído
            </span>
          </div>
          {currentStudent.blockedReason && (
            <div className="pt-2 border-t border-border/60">
              <span className="text-muted block text-[11px] mb-0.5">Motivo do Bloqueio:</span>
              <span className="text-rose-300 font-medium">{currentStudent.blockedReason}</span>
            </div>
          )}
          {currentStudent.blockedAt && (
            <div className="flex justify-between items-center text-[11px] text-muted pt-1">
              <span>Registrado em:</span>
              <span>{new Date(currentStudent.blockedAt).toLocaleDateString('pt-BR')} às {new Date(currentStudent.blockedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-surface/50 border border-border/60 text-xs text-muted">
          Entre em contato diretamente com o suporte <strong>Omega Training</strong> para solicitar a liberação ou atualização de suas credenciais.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5 pb-20 md:pb-6">
      {/* Personalized Greeting Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={currentStudent?.avatarUrl || currentUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'}
            alt={currentStudent?.fullName || currentUser.fullName}
            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-primary/40"
          />
          <div>
            <p className="text-xs text-muted font-medium">Bora treinar hoje?</p>
            <h2 className="text-lg font-black text-foreground">{currentStudent?.fullName || currentUser.fullName}</h2>
          </div>
        </div>

        <Badge variant="primary" size="sm" className="flex items-center gap-1.5 font-bold">
          <Flame className="h-3.5 w-3.5 text-primary" />
          <span>4 dias seguidos</span>
        </Badge>
      </div>

      {/* Student App Navigation Tabs (Pill Bar) */}
      <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-2xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleTabSelect('student-home')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'student-home' || activeTab === 'student-workouts'
              ? 'bg-primary text-background font-black shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Treinos</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('student-nutrition')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'student-nutrition'
              ? 'bg-primary text-background font-black shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Utensils className="h-4 w-4" />
          <span>Meu Cardápio</span>
          {studentNutritionPlan && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                studentNutritionPlan.isHiddenForStudent
                  ? activeTab === 'student-nutrition'
                    ? 'bg-amber-400 text-dark-900'
                    : 'bg-amber-500/20 text-amber-400'
                  : activeTab === 'student-nutrition'
                  ? 'bg-background/20 text-background'
                  : 'bg-primary/20 text-primary'
              }`}
            >
              {studentNutritionPlan.isHiddenForStudent ? 'Em Ajuste' : studentNutritionPlan.meals.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('student-evolution')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'student-evolution'
              ? 'bg-primary text-background font-black shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Metas</span>
        </button>
      </div>

      {/* ================= ABA: MEU CARDÁPIO & ALIMENTAÇÃO ================= */}
      {activeTab === 'student-nutrition' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {studentNutritionPlan ? (
            studentNutritionPlan.isHiddenForStudent ? (
              <Card className="border-amber-500/40 bg-surface/80 shadow-lg">
                <CardContent className="p-8 text-center space-y-5">
                  <div className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-neon-sm">
                    <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <Badge variant="warning" size="md" className="font-bold uppercase tracking-wider">
                      Cardápio em Ajuste
                    </Badge>
                    <h3 className="text-xl font-black text-foreground">
                      Dieta em Atualização pelo Treinador
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      A equipe <strong>Omega Training</strong> está reestruturando e ajustando suas metas e refeições individualizadas para o seu objetivo atual.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border text-xs text-left max-w-sm mx-auto space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Aluno:</span>
                      <span className="font-bold text-foreground">{currentStudent?.fullName || currentUser.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Objetivo:</span>
                      <span className="font-bold text-primary">{currentStudent?.goal || 'Personalizado'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Status do Cardápio:</span>
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        Em revisão pelo treinador
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted max-w-xs mx-auto">
                    Assim que o treinador liberar a visualização no sistema, suas refeições, horários e quantidades completas aparecerão aqui automaticamente.
                  </p>

                  <div className="pt-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        'Olá equipe Omega Training! Vi no FitApp que meu cardápio está em atualização. Gostaria de saber como andam meus novos ajustes nutricionais!'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Falar com o Professor no WhatsApp</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Header do Cardápio */}
                <Card className="border-primary/40 bg-surface/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" size="sm" className="font-bold">
                          Prescrito por Omega Training
                        </Badge>
                        <span className="text-[11px] text-muted font-medium">
                          Vigente até {studentNutritionPlan.validUntil}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-foreground">
                        {studentNutritionPlan.title}
                      </h3>
                      <p className="text-xs text-muted">
                        Cardápio individualizado para {currentStudent?.fullName || currentUser.fullName}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyStudentMenu}
                      className="p-2 rounded-xl border border-border bg-card hover:border-primary/50 text-muted hover:text-primary transition-colors shrink-0"
                      title="Copiar texto do cardápio completo"
                    >
                      {copiedToast ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Metas de Macronutrientes em Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/60 text-center">
                    <div className="p-2 rounded-xl bg-card border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted block">Calorias</span>
                      <strong className="text-sm font-black text-primary font-mono block mt-0.5">
                        {studentNutritionPlan.targetCalories}
                      </strong>
                      <span className="text-[9px] text-muted">kcal / dia</span>
                    </div>

                    <div className="p-2 rounded-xl bg-card border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted block">Proteína</span>
                      <strong className="text-sm font-black text-emerald-400 font-mono block mt-0.5">
                        {studentNutritionPlan.targetProteinG}g
                      </strong>
                      <span className="text-[9px] text-muted">alvo diário</span>
                    </div>

                    <div className="p-2 rounded-xl bg-card border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted block">Carboidrato</span>
                      <strong className="text-sm font-black text-amber-400 font-mono block mt-0.5">
                        {studentNutritionPlan.targetCarbsG}g
                      </strong>
                      <span className="text-[9px] text-muted">energia</span>
                    </div>

                    <div className="p-2 rounded-xl bg-card border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted block">Gorduras</span>
                      <strong className="text-sm font-black text-sky-400 font-mono block mt-0.5">
                        {studentNutritionPlan.targetFatsG}g
                      </strong>
                      <span className="text-[9px] text-muted">boas</span>
                    </div>
                  </div>

                  {/* Hidratação Alvo */}
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span className="font-semibold text-foreground">Meta de Água Recomendada:</span>
                    </div>
                    <span className="font-mono font-black text-blue-400">
                      {studentNutritionPlan.waterIntakeMl / 1000} Litros / dia
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Refeições do Cardápio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-primary" />
                    <span>Suas Refeições Planejadas</span>
                  </h4>
                  <span className="text-[11px] text-muted">
                    {Object.values(consumedMeals).filter(Boolean).length} de {studentNutritionPlan.meals.length} consumidas
                  </span>
                </div>

                {studentNutritionPlan.meals.map((meal) => {
                  const isConsumed = !!consumedMeals[meal.id];
                  const mealCals = meal.items.reduce((s, i) => s + i.calories, 0);

                  return (
                    <Card
                      key={meal.id}
                      className={`transition-all duration-200 ${
                        isConsumed
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-border bg-surface/40 hover:border-primary/40'
                      }`}
                    >
                      <CardHeader className="p-3.5 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-surface border border-border text-primary font-mono font-bold text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {meal.time}
                            </span>
                            <CardTitle className="text-sm font-bold text-foreground">
                              {meal.title}
                            </CardTitle>
                          </div>
                          <span className="text-xs font-mono font-bold text-primary">
                            {mealCals} kcal
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-3.5 pt-0 space-y-2">
                        <div className="space-y-1.5">
                          {meal.items.map((item) => (
                            <div
                              key={item.id}
                              className="p-2 rounded-lg bg-surface/70 border border-border/60 flex items-center justify-between text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-semibold text-foreground truncate">{item.name}</p>
                                <p className="text-[10px] text-muted">{item.amount}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono font-bold text-foreground">{item.calories} kcal</span>
                                <span className="block text-[9px] text-muted font-mono">
                                  P:{item.proteinGrams}g C:{item.carbsGrams}g G:{item.fatsGrams}g
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Interactive toggle for student */}
                        <button
                          type="button"
                          onClick={() => toggleMealConsumed(meal.id)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isConsumed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-surface hover:bg-surface/80 text-muted hover:text-foreground border border-border'
                          }`}
                        >
                          <CheckCircle2 className={`h-3.5 w-3.5 ${isConsumed ? 'text-emerald-400' : 'text-muted'}`} />
                          <span>{isConsumed ? 'Refeição Consumida ✓' : 'Marcar como Consumida'}</span>
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Dica do Professor Nilson */}
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-muted flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">Orientações Omega Training</p>
                  <p className="text-[11px] leading-relaxed">
                    Mantenha a regularidade nos horários e priorize água mineral entre as refeições. Caso precise substituir algum alimento, me mande uma mensagem no WhatsApp para ajustarmos a equivalência calórica.
                  </p>
                </div>
              </div>
            </>
            )
          ) : (
            <Card className="p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-foreground">Nenhum cardápio cadastrado ainda</h3>
              <p className="text-xs text-muted max-w-xs mx-auto">
                A equipe Omega Training está estruturando o seu plano alimentar personalizado com base na sua avaliação física e metas.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ================= TREINOS / HOME ================= */}
      {activeTab !== 'student-nutrition' && activeTab !== 'student-evolution' && (
        <>
          {/* Rest Countdown Timer Active Float Banner */}
      {restRemaining !== null && (
        <div className="p-4 rounded-2xl bg-primary text-background flex items-center justify-between shadow-neon animate-pulse">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 font-bold" />
            <span className="font-black text-sm">Descanso Ativo:</span>
          </div>
          <span className="text-2xl font-black font-mono">{restRemaining}s</span>
          <button
            type="button"
            onClick={() => setRestRemaining(null)}
            className="text-xs font-bold underline"
          >
            Pular
          </button>
        </div>
      )}

      {/* Workout of the Day / Player Banner */}
      {todaysWorkout && (
        <Card className="border-primary/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Dumbbell className="h-28 w-28 text-primary" />
          </div>

          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="sm">Treino do Dia</Badge>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="h-3 w-3" /> 45 - 55 min
              </span>
            </div>
            <CardTitle className="text-base mt-2">{todaysWorkout.title}</CardTitle>
            <p className="text-xs text-muted leading-relaxed">{todaysWorkout.description}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {!activeSession ? (
              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => startSession(todaysWorkout.id)}
                  className="w-full flex items-center justify-center gap-2 shadow-neon"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>Iniciar Treino Agora</span>
                </Button>

                {/* Prévia dos Exercícios do Treino com Vídeos de Execução */}
                <div className="space-y-2 pt-1 border-t border-border">
                  <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider">
                    <span>Exercícios Prescritos ({todaysWorkout.exercises.length})</span>
                    <span className="text-primary font-normal lowercase">toque em vídeo para ver a execução</span>
                  </div>
                  <div className="space-y-1.5">
                    {todaysWorkout.exercises.map((ex, exIdx) => {
                      const match = exercises.find(e => e.id === ex.exerciseId || e.name === ex.name);
                      const videoUrl = ex.videoUrl || match?.videoUrl;

                      return (
                        <div
                          key={exIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-surface/40 border border-border text-xs gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                              {exIdx + 1}
                            </span>
                            <span className="font-semibold text-foreground truncate">{ex.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-muted text-[11px]">{ex.sets} × {ex.reps}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveVideoExercise({
                                  name: ex.name,
                                  muscleGroup: match?.muscleGroup,
                                  equipment: match?.equipment,
                                  instructions: match?.instructions,
                                  precautions: match?.precautions,
                                  videoUrl: videoUrl,
                                  videoDuration: ex.videoDuration || match?.videoDuration,
                                  sets: ex.sets,
                                  reps: ex.reps,
                                  restSeconds: ex.restSeconds,
                                  weightKg: ex.weightKg,
                                });
                              }}
                              className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary hover:text-background transition-all px-2 py-1 rounded-md border border-primary/20"
                              title="Ver vídeo demonstrativo e postura"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              <span>Vídeo</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs bg-surface p-2.5 rounded-xl border border-border">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Sessão em Andamento
                  </span>
                  <button
                    onClick={cancelSession}
                    className="text-muted hover:text-red-400 text-[11px]"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Exercises list with interactive sets checklist */}
                <div className="space-y-3">
                  {todaysWorkout.exercises.map((ex, exIdx) => {
                    const match = exercises.find(e => e.id === ex.exerciseId || e.name === ex.name);
                    const videoUrl = ex.videoUrl || match?.videoUrl;

                    return (
                      <div key={exIdx} className="p-3 rounded-xl bg-surface/60 border border-border space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-bold text-xs text-foreground truncate">{ex.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveVideoExercise({
                                  name: ex.name,
                                  muscleGroup: match?.muscleGroup,
                                  equipment: match?.equipment,
                                  instructions: match?.instructions,
                                  precautions: match?.precautions,
                                  videoUrl: videoUrl,
                                  videoDuration: ex.videoDuration || match?.videoDuration,
                                  sets: ex.sets,
                                  reps: ex.reps,
                                  restSeconds: ex.restSeconds,
                                  weightKg: ex.weightKg,
                                });
                              }}
                              className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary hover:text-background transition-all px-2 py-0.5 rounded-md border border-primary/20 shrink-0"
                              title="Assistir vídeo de execução e instruções posturais"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              <span>Vídeo</span>
                            </button>
                          </div>
                          <span className="text-[11px] text-muted shrink-0">{ex.weightKg ? `${ex.weightKg} kg` : ''}</span>
                        </div>

                        {/* Sets checklist bubbles */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {Array.from({ length: ex.sets }).map((_, setIdx) => {
                            const key = `${ex.name}-${setIdx}`;
                            const isDone = !!activeSession.completedSets[key];

                            return (
                              <button
                                key={setIdx}
                                type="button"
                                onClick={() => {
                                  toggleSetCompleted(ex.name, setIdx);
                                  if (!isDone) handleStartRest(ex.restSeconds || 60);
                                }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isDone
                                    ? 'bg-primary text-background font-black shadow-neon-sm'
                                    : 'bg-card text-muted border border-border hover:border-primary/50'
                                }`}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Série {setIdx + 1}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted pt-1">
                          <span>Alvo: {ex.reps} reps</span>
                          <button
                            type="button"
                            onClick={() => handleStartRest(ex.restSeconds || 60)}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <Clock className="h-3 w-3" /> Descanso {ex.restSeconds}s
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsFinishModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>Concluir Sessão de Treino</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumo do Cardápio com Botão para Ver Completo */}
      {studentNutritionPlan && activeTab !== 'student-nutrition' && (
        <Card className={`transition-colors ${
          studentNutritionPlan.isHiddenForStudent
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'hover:border-primary/40'
        }`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  studentNutritionPlan.isHiddenForStudent
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {studentNutritionPlan.isHiddenForStudent ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Utensils className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-foreground">Meu Cardápio Nutricional</h4>
                    {studentNutritionPlan.isHiddenForStudent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Em Ajuste
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted">
                    {studentNutritionPlan.isHiddenForStudent
                      ? 'Omega Training está atualizando suas refeições'
                      : `${studentNutritionPlan.meals.length} refeições planejadas • ${studentNutritionPlan.targetCalories} kcal`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTabSelect('student-nutrition')}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{studentNutritionPlan.isHiddenForStudent ? 'Ver Status' : 'Ver Cardápio'}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {!studentNutritionPlan.isHiddenForStudent && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-border/60">
                <div className="p-1.5 rounded-lg bg-surface/50">
                  <span className="text-[9px] text-muted block">Proteínas</span>
                  <span className="font-mono font-bold text-emerald-400">{studentNutritionPlan.targetProteinG}g</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface/50">
                  <span className="text-[9px] text-muted block">Carboidratos</span>
                  <span className="font-mono font-bold text-amber-400">{studentNutritionPlan.targetCarbsG}g</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface/50">
                  <span className="text-[9px] text-muted block">Gorduras</span>
                  <span className="font-mono font-bold text-sky-400">{studentNutritionPlan.targetFatsG}g</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Daily Habits & Water Tracker */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Hidratação do Dia</h4>
                <p className="text-[11px] text-muted">Meta: 3.000 ml ({Math.round((waterDrunkMl / 3000) * 100)}%)</p>
              </div>
            </div>
            <span className="text-sm font-black text-blue-400">{waterDrunkMl} ml</span>
          </div>

          <div className="w-full bg-dark-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (waterDrunkMl / 3000) * 100)}%` }}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddWater(250)}
              className="flex-1 text-xs text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
            >
              + 250 ml
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddWater(500)}
              className="flex-1 text-xs text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
            >
              + 500 ml
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress na Home */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">
                Minhas Metas & Evolução
              </CardTitle>
            </div>
            <button
              type="button"
              onClick={() => handleTabSelect('student-evolution')}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Gráfico</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Objetivo em Destaque com Barra de Progresso */}
          <div className="p-3 rounded-xl bg-surface/70 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-primary" />
                {currentStudent?.goal || 'Objetivo de Treino'}
              </span>
              <span className="text-primary font-black font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-dark-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 shadow-neon-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted pt-0.5">
              <span>Atual: <strong className="text-foreground">{currentStudent?.currentWeightKg} kg</strong></span>
              <span>Meta: <strong className="text-primary">{currentStudent?.targetWeightKg} kg</strong></span>
              <span>Faltam: <strong className="text-foreground">{remainingWeight} kg</strong></span>
            </div>
          </div>

          {/* Lista de Metas Ativas com checkbox */}
          <div className="space-y-2">
            {goals.map((g) => (
              <div
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className="p-2.5 rounded-xl bg-surface/50 border border-border flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">{g.title}</span>
                  <p className="text-[10px] text-muted">
                    Progresso: {g.currentValue} / {g.targetValue} {g.unit}
                  </p>
                </div>
                <CheckCircle2 className={`h-4 w-4 ${g.isCompleted ? 'text-primary' : 'text-border'}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </>
    )}

      {/* ================= ABA: METAS & EVOLUÇÃO CONFORME O OBJETIVO ================= */}
      {activeTab === 'student-evolution' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Banner do Objetivo Principal */}
          <Card className="border-primary/40 bg-gradient-to-br from-surface to-surface/40 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Target className="h-32 w-32 text-primary" />
            </div>

            <CardContent className="p-4 sm:p-5 space-y-4 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="primary" size="sm" className="font-bold flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>Objetivo do Aluno</span>
                    </Badge>
                    <span className="text-[11px] text-muted font-medium">
                      Prescrito pelo Prof. Nilson
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                    {currentStudent?.goal || 'Condicionamento Físico e Saúde'}
                  </h3>
                  <p className="text-xs text-muted">
                    Plano de metas individualizado com foco em resultados mensuráveis.
                  </p>
                </div>
              </div>

              {/* Grid com Métricas Principais da Meta */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border/60">
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted block">Peso Atual</span>
                  <strong className="text-sm sm:text-base font-black text-foreground font-mono block mt-0.5">
                    {currentStudent?.currentWeightKg || 70} kg
                  </strong>
                  <span className="text-[9px] text-muted">última medição</span>
                </div>

                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted block">Meta Alvo</span>
                  <strong className="text-sm sm:text-base font-black text-primary font-mono block mt-0.5">
                    {currentStudent?.targetWeightKg || 68} kg
                  </strong>
                  <span className="text-[9px] text-muted">objetivo final</span>
                </div>

                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted block">Distância</span>
                  <strong className="text-sm sm:text-base font-black text-foreground font-mono block mt-0.5">
                    {remainingWeight} kg
                  </strong>
                  <span className="text-[9px] text-muted">faltam</span>
                </div>
              </div>

              {/* Barra de Progresso da Meta */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    Progresso da Meta
                  </span>
                  <span className="text-primary font-black">{progressPercent}% Concluído</span>
                </div>
                <div className="w-full h-2.5 bg-dark-700 rounded-full overflow-hidden border border-border/80">
                  <div
                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-700 shadow-neon-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico Dinâmico de Evolução */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Curva de Evolução Rumo ao Objetivo</span>
                  </CardTitle>
                  <p className="text-[11px] text-muted mt-0.5">
                    Acompanhamento histórico das medições e avaliações físicas
                  </p>
                </div>

                <span className="text-xs text-muted">
                  Variação: <strong className={Number(weightChange) < 0 ? 'text-primary' : 'text-foreground'}>{weightChange} kg</strong>
                </span>
              </div>

              {/* Botões seletores de métricas do gráfico */}
              <div className="flex items-center gap-1 pt-2">
                <button
                  type="button"
                  onClick={() => setEvolutionMetric('weight')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    evolutionMetric === 'weight'
                      ? 'bg-primary text-background shadow-sm'
                      : 'bg-surface text-muted hover:text-foreground border border-border'
                  }`}
                >
                  ⚖️ Peso (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setEvolutionMetric('fat')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    evolutionMetric === 'fat'
                      ? 'bg-primary text-background shadow-sm'
                      : 'bg-surface text-muted hover:text-foreground border border-border'
                  }`}
                >
                  📉 % Gordura
                </button>
                <button
                  type="button"
                  onClick={() => setEvolutionMetric('adherence')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    evolutionMetric === 'adherence'
                      ? 'bg-primary text-background shadow-sm'
                      : 'bg-surface text-muted hover:text-foreground border border-border'
                  }`}
                >
                  ⚡ Adesão (%)
                </button>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {evolutionMetric === 'weight' ? (
                    <AreaChart data={evolutionPoints} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="studentWeightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#B8F34A" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#B8F34A" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#292F38' : '#E2E8F0'} vertical={false} />
                      <XAxis dataKey="date" stroke={isDark ? '#9AA3AF' : '#64748B'} fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke={isDark ? '#9AA3AF' : '#64748B'}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#14171C' : '#FFFFFF',
                          borderColor: isDark ? '#292F38' : '#E2E8F0',
                          borderRadius: 12,
                          color: isDark ? '#F5F7FA' : '#0F172A',
                          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.08)',
                          fontSize: 12
                        }}
                        formatter={(val: any) => [`${val} kg`, 'Peso']}
                        labelFormatter={(l) => `Período: ${l}`}
                      />
                      <ReferenceLine
                        y={currentStudent?.targetWeightKg || 68}
                        stroke="#F59E0B"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        label={{
                          value: `Meta: ${currentStudent?.targetWeightKg || 68}kg`,
                          fill: '#F59E0B',
                          position: 'top',
                          fontSize: 10,
                          fontWeight: 700
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#B8F34A"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#studentWeightGrad)"
                        name="weight"
                        activeDot={{ r: 6, fill: '#B8F34A', stroke: isDark ? '#0B0D10' : '#FFFFFF', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  ) : evolutionMetric === 'fat' ? (
                    <AreaChart data={evolutionPoints} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="studentFatGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#292F38' : '#E2E8F0'} vertical={false} />
                      <XAxis dataKey="date" stroke={isDark ? '#9AA3AF' : '#64748B'} fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke={isDark ? '#9AA3AF' : '#64748B'} fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#14171C' : '#FFFFFF',
                          borderColor: isDark ? '#292F38' : '#E2E8F0',
                          borderRadius: 12,
                          color: isDark ? '#F5F7FA' : '#0F172A',
                          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.08)',
                          fontSize: 12
                        }}
                        formatter={(val: any) => [`${val}%`, '% Gordura']}
                      />
                      <Area
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="#38BDF8"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#studentFatGrad)"
                        name="bodyFat"
                        activeDot={{ r: 6, fill: '#38BDF8', stroke: isDark ? '#0B0D10' : '#FFFFFF', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={evolutionPoints} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#292F38' : '#E2E8F0'} vertical={false} />
                      <XAxis dataKey="date" stroke={isDark ? '#9AA3AF' : '#64748B'} fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke={isDark ? '#9AA3AF' : '#64748B'} fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#14171C' : '#FFFFFF',
                          borderColor: isDark ? '#292F38' : '#E2E8F0',
                          borderRadius: 12,
                          color: isDark ? '#F5F7FA' : '#0F172A',
                          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.08)',
                          fontSize: 12
                        }}
                        formatter={(val: any) => [`${val}%`, 'Adesão aos Treinos']}
                      />
                      <Bar dataKey="adherence" fill="#10B981" radius={[6, 6, 0, 0]} name="adherence" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Histórico das Avaliações Físicas Registradas */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <span>Histórico de Avaliações ({studentAssessments.length})</span>
                </CardTitle>
                <span className="text-[11px] text-muted">Realizadas na Consultoria</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {studentAssessments.length > 0 ? (
                studentAssessments.map((ass) => {
                  const diag = generateAnthropometricDiagnosis({
                    weightKg: ass.weightKg,
                    heightCm: ass.heightCm || currentStudent?.heightCm || 168,
                    bodyFatPercentage: ass.bodyFatPercentage,
                    waistCm: ass.waistCm,
                    hipsCm: ass.hipsCm,
                    isFemale: true,
                    studentName: currentStudent?.fullName
                  });

                  return (
                    <div
                      key={ass.id}
                      className="p-3.5 rounded-xl bg-surface/50 border border-border/80 space-y-2 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="primary" size="sm">
                            {formatDate(ass.date)}
                          </Badge>
                          <span className="text-xs font-bold text-foreground">
                            {ass.weightKg} kg
                          </span>
                          <span className="text-[11px] text-muted">
                            • {ass.bodyFatPercentage}% gordura
                          </span>
                          <span className="text-[11px] text-muted font-medium">
                            • IMC {diag.bmi}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                            diag.severity === 'danger'
                              ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400'
                              : diag.severity === 'warning'
                              ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                              : diag.severity === 'info'
                              ? 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                          }`}
                        >
                          {diag.badgeLabel}
                        </span>
                      </div>
                      {ass.proObservations && (
                        <div className="text-[11px] text-muted bg-card/70 p-2.5 rounded-lg border border-border/50 leading-relaxed whitespace-pre-line">
                          <strong className="text-foreground">💬 Parecer do Treinador:</strong>
                          <p className="mt-1">{ass.proObservations}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-surface/30 border border-border text-center text-xs text-muted">
                  Nenhuma avaliação física detalhada registrada ainda. As avaliações registradas pela Omega Training aparecerão aqui automaticamente.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Metas e Hábitos Ativos */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span>Metas & Hábitos Ativos</span>
                </CardTitle>
                <span className="text-xs text-primary font-bold">{goals.length} metas</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {goals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className="p-3 rounded-xl bg-surface/50 border border-border flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground block">{g.title}</span>
                    <p className="text-[10px] text-muted">
                      Progresso: {g.currentValue} / {g.targetValue} {g.unit}
                    </p>
                  </div>
                  <CheckCircle2 className={`h-5 w-5 ${g.isCompleted ? 'text-primary' : 'text-border'}`} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mensagem do Treinador */}
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-primary block">Mensagem da Equipe Omega Training:</span>
              <p className="text-muted leading-relaxed">
                Mantenha a consistência nos treinos e siga o cardápio nutricional prescrito. Cada semana com boa adesão nos aproxima do objetivo traçado para você!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Finish Workout Feedback Modal */}
      {isFinishModalOpen && (
        <Modal
          isOpen={isFinishModalOpen}
          onClose={() => setIsFinishModalOpen(false)}
          title="Sessão de Treino Concluída"
          description="Como você avalia a intensidade e o esforço da sessão?"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 py-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Nota ${star} estrelas`}
                  className="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= rating ? 'fill-primary text-primary' : 'text-dark-500'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Alguma dor ou comentário para o treinador? (Ex: carga do supino foi leve)"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full bg-surface text-foreground text-base sm:text-xs rounded-xl border border-border p-3 focus:outline-none focus:border-primary"
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setIsFinishModalOpen(false)}>Cancelar</Button>
              <Button
                variant="primary"
                onClick={() => {
                  finishSession(rating, sessionNotes);
                  setIsFinishModalOpen(false);
                  alert('Sessão registrada com sucesso e enviada ao seu treinador!');
                }}
              >
                Concluir e Salvar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast notification */}
      {copiedToast && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 bg-surface border border-primary/50 text-foreground px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="h-4 w-4 text-primary" />
          <span>Cardápio copiado para a área de transferência!</span>
        </div>
      )}
      {/* Modal de Vídeo de Demonstração e Postura para o Aluno */}
      <ExerciseVideoPlayerModal
        isOpen={!!activeVideoExercise}
        onClose={() => setActiveVideoExercise(null)}
        exercise={activeVideoExercise}
      />
    </div>
  );
}
