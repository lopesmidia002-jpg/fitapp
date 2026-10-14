import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Utensils,
  Plus,
  Flame,
  Droplets,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Check,
  Search,
  Users,
  Apple,
  Sparkles,
  Send,
  MessageSquare,
  Copy,
  ExternalLink,
  Share2,
  Mail,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { NutritionPlan, Meal } from '../../types';

interface NutritionViewProps {
  onNavigate?: (tabId: string) => void;
}

export function NutritionView({ onNavigate }: NutritionViewProps = {}) {
  const { students, nutritionPlans, addNutritionPlan, currentUser, toggleDietVisibility } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => students[0]?.id || 'stud-1');
  const [searchStudent, setSearchStudent] = useState('');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPlanSaved, setIsPlanSaved] = useState(false);

  // Share Menu Modal & States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [copiedMenu, setCopiedMenu] = useState(false);

  // Active student and active individualized nutrition plan
  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const activePlan = nutritionPlans.find(p => p.studentId === selectedStudent?.id);

  const getFormattedMenuText = (plan: NutritionPlan, student: typeof selectedStudent) => {
    if (!plan || !student) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const studentAppUrl = `${origin}${pathname}?role=student&studentId=${student.id}`;

    const mealsText = plan.meals.map(m => {
      const mealCalories = m.items.reduce((sum, item) => sum + item.calories, 0);
      const itemsText = m.items.map(i => `  • ${i.name} (${i.amount}) — ${i.calories} kcal [P:${i.proteinGrams}g C:${i.carbsGrams}g G:${i.fatsGrams}g]`).join('\n');
      return `⏰ *${m.time} — ${m.title}* (${mealCalories} kcal)\n${itemsText}`;
    }).join('\n\n');

    return `🥗 *FitApp — Plano Alimentar & Cardápio*
*Omega Training*

Olá, *${student.fullName}*!
Aqui está o seu cardápio alimentar montado individualmente para o seu objetivo:

📋 *${plan.title}*
🎯 *Suas Metas Diárias:*
• 🔥 Calorias: *${plan.targetCalories} kcal*
• 🍗 Proteínas: *${plan.targetProteinG}g*
• 🍚 Carboidratos: *${plan.targetCarbsG}g*
• 🥑 Gorduras Boas: *${plan.targetFatsG}g*
• 💧 Hidratação: *${plan.waterIntakeMl / 1000}L de água por dia*

🍽️ *SEU CARDÁPIO REFEIÇÃO POR REFEIÇÃO:*

${mealsText}

📱 *Acesse e acompanhe seu cardápio no app pelo link:*
${studentAppUrl}

Foco total na disciplina e ótimos treinos! 🔥
— Omega Training`;
  };

  const handleSendWhatsApp = () => {
    if (!activePlan || !selectedStudent) return;
    const msg = getFormattedMenuText(activePlan, selectedStudent);
    let phoneDigits = (selectedStudent.phone || '').replace(/\D/g, '');
    if (phoneDigits.length === 10 || phoneDigits.length === 11) {
      phoneDigits = '55' + phoneDigits;
    }
    const waUrl = phoneDigits
      ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    setShareToast('Cardápio aberto no WhatsApp!');
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleCopyMenu = () => {
    if (!activePlan || !selectedStudent) return;
    const msg = getFormattedMenuText(activePlan, selectedStudent);
    navigator.clipboard.writeText(msg);
    setCopiedMenu(true);
    setShareToast('Cardápio copiado para a área de transferência!');
    setTimeout(() => {
      setCopiedMenu(false);
      setShareToast(null);
    }, 3000);
  };

  const handleSendEmail = () => {
    if (!activePlan || !selectedStudent) return;
    const msg = getFormattedMenuText(activePlan, selectedStudent);
    const subject = encodeURIComponent(`Seu Cardápio & Plano Alimentar — Omega Training`);
    const body = encodeURIComponent(msg);
    window.open(`mailto:${selectedStudent.email}?subject=${subject}&body=${body}`, '_blank');
  };

  // Filter students in the selector list
  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.goal.toLowerCase().includes(searchStudent.toLowerCase())
  );

  // Totals calculations if activePlan exists
  const totalCalories = activePlan
    ? activePlan.meals.reduce((sum, meal) => sum + meal.items.reduce((s, item) => s + item.calories, 0), 0)
    : 0;
  const totalProtein = activePlan
    ? activePlan.meals.reduce((sum, meal) => sum + meal.items.reduce((s, item) => s + item.proteinGrams, 0), 0)
    : 0;
  const totalCarbs = activePlan
    ? activePlan.meals.reduce((sum, meal) => sum + meal.items.reduce((s, item) => s + item.carbsGrams, 0), 0)
    : 0;
  const totalFats = activePlan
    ? activePlan.meals.reduce((sum, meal) => sum + meal.items.reduce((s, item) => s + item.fatsGrams, 0), 0)
    : 0;

  // New Plan Form State
  const [newPlanForm, setNewPlanForm] = useState({
    studentId: selectedStudent?.id || 'stud-1',
    title: 'Plano Alimentar Individualizado',
    targetCalories: 2200,
    targetProteinG: 140,
    targetCarbsG: 220,
    targetFatsG: 60,
    waterIntakeMl: 3000,
    validUntil: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
    isHiddenForStudent: false,
  });

  const handleOpenModal = () => {
    setNewPlanForm({
      studentId: selectedStudent?.id || students[0]?.id || 'stud-1',
      title: `Plano Alimentar — ${selectedStudent?.fullName || 'Personalizado'}`,
      targetCalories: activePlan?.targetCalories || 2200,
      targetProteinG: activePlan?.targetProteinG || 140,
      targetCarbsG: activePlan?.targetCarbsG || 220,
      targetFatsG: activePlan?.targetFatsG || 60,
      waterIntakeMl: activePlan?.waterIntakeMl || 3000,
      validUntil: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
      isHiddenForStudent: activePlan?.isHiddenForStudent || false,
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();

    const targetStudent = students.find(s => s.id === newPlanForm.studentId);

    // Default template meals if newly creating
    const baseMeals: Meal[] = activePlan?.meals || [
      {
        id: `m-${Date.now()}-1`,
        time: '07:30',
        title: 'Café da Manhã / Desjejum',
        items: [
          { id: `i-${Date.now()}-1`, name: 'Ovos mexidos com azeite', amount: '3 unidades', calories: 215, proteinGrams: 18, carbsGrams: 1, fatsGrams: 15 },
          { id: `i-${Date.now()}-2`, name: 'Pão 100% integral', amount: '2 fatias (50g)', calories: 120, proteinGrams: 5, carbsGrams: 22, fatsGrams: 2 },
          { id: `i-${Date.now()}-3`, name: 'Fruta com aveia', amount: '1 porção + 20g aveia', calories: 130, proteinGrams: 3, carbsGrams: 26, fatsGrams: 2 },
        ]
      },
      {
        id: `m-${Date.now()}-2`,
        time: '12:30',
        title: 'Almoço Completo',
        items: [
          { id: `i-${Date.now()}-4`, name: 'Proteína magra (frango ou peixe)', amount: '160g', calories: 250, proteinGrams: 48, carbsGrams: 0, fatsGrams: 5 },
          { id: `i-${Date.now()}-5`, name: 'Arroz ou batata cozida', amount: '150g', calories: 195, proteinGrams: 4, carbsGrams: 42, fatsGrams: 0.5 },
          { id: `i-${Date.now()}-6`, name: 'Feijão carioca ou lentilha', amount: '1 concha (100g)', calories: 76, proteinGrams: 5, carbsGrams: 13, fatsGrams: 0.5 },
          { id: `i-${Date.now()}-7`, name: 'Salada crua à vontade', amount: 'À vontade', calories: 25, proteinGrams: 1, carbsGrams: 4, fatsGrams: 0 },
        ]
      },
      {
        id: `m-${Date.now()}-3`,
        time: '16:30',
        title: 'Lanche Pré-Treino',
        items: [
          { id: `i-${Date.now()}-8`, name: 'Iogurte natural desnatado', amount: '170g', calories: 85, proteinGrams: 9, carbsGrams: 12, fatsGrams: 0 },
          { id: `i-${Date.now()}-9`, name: 'Fruta com canela', amount: '1 unidade', calories: 120, proteinGrams: 1, carbsGrams: 28, fatsGrams: 0 },
          { id: `i-${Date.now()}-10`, name: 'Whey Protein', amount: '30g', calories: 120, proteinGrams: 24, carbsGrams: 3, fatsGrams: 1.5 },
        ]
      },
      {
        id: `m-${Date.now()}-4`,
        time: '20:00',
        title: 'Jantar Pós-Treino',
        items: [
          { id: `i-${Date.now()}-11`, name: 'Proteína magra grelhada', amount: '160g', calories: 230, proteinGrams: 42, carbsGrams: 0, fatsGrams: 6 },
          { id: `i-${Date.now()}-12`, name: 'Carboidrato complexo cozido', amount: '150g', calories: 140, proteinGrams: 2, carbsGrams: 32, fatsGrams: 0 },
          { id: `i-${Date.now()}-13`, name: 'Legumes no vapor com azeite', amount: '100g', calories: 50, proteinGrams: 2, carbsGrams: 6, fatsGrams: 2 },
        ]
      }
    ];

    addNutritionPlan({
      organizationId: 'org-alpha-1',
      studentId: newPlanForm.studentId,
      proId: currentUser.id,
      title: newPlanForm.title,
      targetCalories: Number(newPlanForm.targetCalories),
      targetProteinG: Number(newPlanForm.targetProteinG),
      targetCarbsG: Number(newPlanForm.targetCarbsG),
      targetFatsG: Number(newPlanForm.targetFatsG),
      waterIntakeMl: Number(newPlanForm.waterIntakeMl),
      validUntil: newPlanForm.validUntil,
      meals: baseMeals,
      isHiddenForStudent: newPlanForm.isHiddenForStudent,
    });

    setSelectedStudentId(newPlanForm.studentId);
    setIsPlanSaved(true);
    setTimeout(() => {
      setIsPlanSaved(false);
      setIsPlanModalOpen(false);
    }, 1100);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Nutrição & Dietas Individualizadas <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted">
            Prescrição nutricional estruturada por refeição com metas de calorias, macronutrientes e hidratação por aluno.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('taco')}
              className="flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-bold"
            >
              <BookOpen className="h-4 w-4" />
              <span>Elaborar com Tabela TACO</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenModal}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Plano Nutricional</span>
          </Button>
        </div>
      </div>

      {/* Compliance / Professional Notice */}
      <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3 text-xs text-muted">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-foreground">Diretriz Ética & Prescrição Nutricional</p>
          <p className="mt-0.5 leading-relaxed">
            Os planos alimentares individuais devem ser elaborados ou supervisionados por profissionais habilitados. As tabelas nutricionais utilizam como referência a Tabela TACO / IBGE com rastreabilidade de macronutrientes.
          </p>
        </div>
      </div>

      {/* 1. SELEÇÃO DE ALUNOS CADASTRADOS */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Alunos Cadastrados & Dietas</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {students.length} alunos
                </span>
              </CardTitle>
              <CardDescription>
                Selecione o aluno abaixo para carregar seu plano nutricional individualizado e suas respectivas refeições
              </CardDescription>
            </div>

            <div className="w-full sm:w-64">
              <Input
                placeholder="Buscar aluno..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudentId === student.id;
              const plan = nutritionPlans.find(p => p.studentId === student.id);

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 relative group ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-neon-sm ring-1 ring-primary'
                      : 'bg-surface/50 border-border hover:border-primary/40 hover:bg-surface'
                  }`}
                >
                  <img
                    src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={student.fullName}
                    className={`h-11 w-11 rounded-xl object-cover ring-2 transition-transform ${
                      isSelected ? 'ring-primary scale-105' : 'ring-border'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {student.fullName}
                      </h4>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0 stroke-[3]" />}
                    </div>
                    <p className="text-[11px] text-muted truncate mt-0.5">{student.goal}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        plan ? 'bg-primary/20 text-primary' : 'bg-dark-700 text-muted'
                      }`}>
                        {plan ? `${plan.targetCalories} kcal` : 'Sem dieta'}
                      </span>
                      {plan && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                          plan.isHiddenForStudent
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`} title={plan.isHiddenForStudent ? 'Dieta oculta para o aluno' : 'Dieta visível no app do aluno'}>
                          {plan.isHiddenForStudent ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                          <span>{plan.isHiddenForStudent ? 'Oculta' : 'Visível'}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-muted font-medium">{student.currentWeightKg} kg</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. BANNER DO ALUNO E METAS DE MACROS INDIVIDUALIZADAS */}
      {activePlan ? (
        <>
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={selectedStudent?.fullName}
                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-base">
                      Plano Nutricional: <span className="text-primary">{selectedStudent?.fullName}</span>
                    </h3>
                    <Badge variant={selectedStudent?.status === 'active' ? 'success' : 'neutral'} size="sm">
                      {selectedStudent?.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    <strong>{activePlan.title}</strong> • Vigência até {activePlan.validUntil}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary" size="md">
                  <Flame className="h-3.5 w-3.5 mr-1" />
                  Meta: {activePlan.targetCalories} kcal
                </Badge>
                <Badge variant="neutral" size="md">
                  <Droplets className="h-3.5 w-3.5 mr-1 text-blue-400" />
                  {activePlan.waterIntakeMl / 1000}L de Água
                </Badge>

                {/* Status de Visibilidade no App do Aluno */}
                <Badge
                  variant={activePlan.isHiddenForStudent ? 'warning' : 'success'}
                  size="md"
                  className="flex items-center gap-1 font-bold"
                >
                  {activePlan.isHiddenForStudent ? (
                    <EyeOff className="h-3.5 w-3.5 mr-1 text-amber-400" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  )}
                  <span>{activePlan.isHiddenForStudent ? 'Oculta para o Aluno' : 'Visível no App'}</span>
                </Badge>

                {/* Botão de Ocultar / Desocultar Dieta */}
                <Button
                  variant={activePlan.isHiddenForStudent ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleDietVisibility(activePlan.id)}
                  className={`flex items-center gap-1.5 font-bold transition-all shadow-sm ${
                    activePlan.isHiddenForStudent
                      ? 'bg-amber-500 hover:bg-amber-600 text-dark-900 border-amber-500'
                      : 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                  }`}
                  title={
                    activePlan.isHiddenForStudent
                      ? 'Clique para desocultar e permitir que o aluno veja a dieta no app'
                      : 'Clique para ocultar temporariamente a dieta no app do aluno'
                  }
                >
                  {activePlan.isHiddenForStudent ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Desocultar Dieta</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Ocultar Dieta</span>
                    </>
                  )}
                </Button>

                {/* Ajustar com TACO */}
                {onNavigate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('taco')}
                    className="flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-bold"
                    title="Editar ou adicionar alimentos da Tabela TACO nesta dieta"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Ajustar com TACO</span>
                  </Button>
                )}

                {/* Enviar Cardápio ao Aluno */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-1.5 shadow-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Enviar cardápio montado diretamente ao aluno"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Enviar Cardápio</span>
                </Button>

                {/* WhatsApp rápido */}
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  title="Enviar direto no WhatsApp"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>

                {/* Copiar cardápio rápido */}
                <button
                  type="button"
                  onClick={handleCopyMenu}
                  className="p-1.5 rounded-lg border border-border text-muted hover:text-primary hover:border-primary/40 transition-colors"
                  title="Copiar texto do cardápio"
                >
                  {copiedMenu ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Banner de Aviso quando Dieta está Oculta */}
          {activePlan.isHiddenForStudent && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <EyeOff className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    Dieta Oculta para o Aluno ({selectedStudent?.fullName})
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Este plano alimentar está no modo privado/ajuste e <strong>não é exibido</strong> no aplicativo do aluno. O aluno verá um aviso informando que você está reformulando o cardápio.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => toggleDietVisibility(activePlan.id)}
                className="bg-amber-500 hover:bg-amber-600 text-dark-900 font-black shrink-0 text-xs flex items-center gap-1.5 shadow-md"
              >
                <Eye className="h-4 w-4" />
                <span>Desocultar Dieta (Liberar Acesso)</span>
              </Button>
            </div>
          )}

          {/* Macro Targets Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-[10px] uppercase font-bold text-muted">Meta Calórica</p>
              <p className="text-2xl font-black text-primary mt-1">
                {totalCalories} <span className="text-xs text-muted font-normal">/ {activePlan.targetCalories} kcal</span>
              </p>
              <div className="w-full bg-dark-700 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((totalCalories / activePlan.targetCalories) * 100))}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-[10px] uppercase font-bold text-muted">Proteínas</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {totalProtein}g <span className="text-xs text-muted font-normal">/ {activePlan.targetProteinG}g</span>
              </p>
              <div className="w-full bg-dark-700 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((totalProtein / activePlan.targetProteinG) * 100))}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-[10px] uppercase font-bold text-muted">Carboidratos</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {totalCarbs}g <span className="text-xs text-muted font-normal">/ {activePlan.targetCarbsG}g</span>
              </p>
              <div className="w-full bg-dark-700 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((totalCarbs / activePlan.targetCarbsG) * 100))}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-[10px] uppercase font-bold text-muted">Gorduras Boas</p>
              <p className="text-2xl font-black text-sky-400 mt-1">
                {totalFats}g <span className="text-xs text-muted font-normal">/ {activePlan.targetFatsG}g</span>
              </p>
              <div className="w-full bg-dark-700 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-sky-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((totalFats / activePlan.targetFatsG) * 100))}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-muted">Meta Água</p>
              <p className="text-2xl font-black text-blue-400 mt-1">
                {activePlan.waterIntakeMl / 1000}L <span className="text-xs text-muted font-normal">/ dia</span>
              </p>
              <div className="w-full bg-dark-700 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* 3. REFEIÇÕES DO PLANO DO ALUNO */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                <span>Cardápio & Refeições de {selectedStudent?.fullName}</span>
                <span className="text-xs font-normal text-muted font-mono">({activePlan.meals.length} refeições)</span>
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsShareModalOpen(true)}
                  className="text-xs text-primary border-primary/40 hover:bg-primary/10 flex items-center gap-1 font-semibold"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Compartilhar com o Aluno</span>
                </Button>
                <Badge variant="primary">Plano Ativo</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePlan.meals.map((meal) => (
                <Card key={meal.id} className="hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-surface border border-border text-primary font-bold text-xs flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{meal.time}</span>
                        </div>
                        <CardTitle className="text-sm font-bold">{meal.title}</CardTitle>
                      </div>
                      <span className="text-xs font-bold text-primary font-mono">
                        {meal.items.reduce((s, i) => s + i.calories, 0)} kcal
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {meal.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-surface/40 border border-border/60 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-[11px] text-muted">{item.amount}</p>
                        </div>
                        <div className="text-right text-[11px] text-muted font-medium">
                          <span className="text-foreground font-bold">{item.calories} kcal</span>
                          <span className="block text-[10px] font-mono">P: {item.proteinGrams}g | C: {item.carbsGrams}g | G: {item.fatsGrams}g</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Empty State if student has no plan */
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Apple className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Nenhum plano alimentar cadastrado para {selectedStudent?.fullName}
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto mt-1">
                Configure metas calóricas, distribuição de macronutrientes e as refeições diárias individualizadas para este aluno.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onNavigate && (
                <Button
                  variant="outline"
                  onClick={() => onNavigate('taco')}
                  className="border-primary/40 text-primary hover:bg-primary/10"
                >
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  <span>Elaborar com Tabela TACO</span>
                </Button>
              )}
              <Button variant="primary" onClick={handleOpenModal}>
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Prescrever 1º Plano Alimentar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. MODAL: CRIAR / ATRIBUIR PLANO NUTRICIONAL */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Criar Plano Nutricional Individualizado"
        description="Configure as metas e estrutura de refeições para o aluno selecionado."
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <Select
            label="Aluno Destinatário *"
            options={students.map(s => ({ value: s.id, label: s.fullName }))}
            value={newPlanForm.studentId}
            onChange={(e) => {
              const sId = e.target.value;
              const s = students.find(std => std.id === sId);
              setNewPlanForm({
                ...newPlanForm,
                studentId: sId,
                title: `Plano Alimentar — ${s?.fullName || 'Personalizado'}`
              });
            }}
          />

          <Input
            label="Título do Plano *"
            value={newPlanForm.title}
            onChange={(e) => setNewPlanForm({ ...newPlanForm, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Meta Calórica (kcal) *"
              type="number"
              value={newPlanForm.targetCalories}
              onChange={(e) => setNewPlanForm({ ...newPlanForm, targetCalories: Number(e.target.value) })}
            />
            <Input
              label="Meta de Hidratação (ml) *"
              type="number"
              step="250"
              value={newPlanForm.waterIntakeMl}
              onChange={(e) => setNewPlanForm({ ...newPlanForm, waterIntakeMl: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Proteínas (g) *"
              type="number"
              value={newPlanForm.targetProteinG}
              onChange={(e) => setNewPlanForm({ ...newPlanForm, targetProteinG: Number(e.target.value) })}
            />
            <Input
              label="Carboidratos (g) *"
              type="number"
              value={newPlanForm.targetCarbsG}
              onChange={(e) => setNewPlanForm({ ...newPlanForm, targetCarbsG: Number(e.target.value) })}
            />
            <Input
              label="Gorduras (g) *"
              type="number"
              value={newPlanForm.targetFatsG}
              onChange={(e) => setNewPlanForm({ ...newPlanForm, targetFatsG: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Data de Vigência *"
            type="date"
            value={newPlanForm.validUntil}
            onChange={(e) => setNewPlanForm({ ...newPlanForm, validUntil: e.target.value })}
          />

          {/* Opção de Ocultar ou Liberar Imediatamente no App do Aluno */}
          <div className="p-3 rounded-xl bg-surface/60 border border-border flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                {newPlanForm.isHiddenForStudent ? <EyeOff className="h-3.5 w-3.5 text-amber-400" /> : <Eye className="h-3.5 w-3.5 text-emerald-400" />}
                <span>Visibilidade no App do Aluno</span>
              </label>
              <p className="text-[11px] text-muted">
                {newPlanForm.isHiddenForStudent
                  ? 'A dieta ficará oculta para o aluno até que você decida desocultar.'
                  : 'A dieta ficará visível imediatamente para o aluno no aplicativo.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewPlanForm(prev => ({ ...prev, isHiddenForStudent: !prev.isHiddenForStudent }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                newPlanForm.isHiddenForStudent
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {newPlanForm.isHiddenForStudent ? 'Oculta para o Aluno' : 'Liberada (Visível)'}
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsPlanModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={isPlanSaved ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 flex items-center gap-1.5" : ""}
            >
              {isPlanSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>✓ Plano Salvo com Sucesso!</span>
                </>
              ) : (
                'Salvar e Atribuir Plano'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ENVIAR CARDÁPIO MONTADO AO ALUNO */}
      {activePlan && selectedStudent && (
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={`Enviar Cardápio — ${selectedStudent.fullName}`}
          description={`Envie o plano alimentar montado diretamente para o aluno via WhatsApp, e-mail ou link de acesso.`}
        >
          <div className="space-y-4">
            {/* Student mini header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedStudent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={selectedStudent.fullName}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/40 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">{selectedStudent.fullName}</h4>
                  <p className="text-xs text-muted truncate">
                    {activePlan.title} • {activePlan.targetCalories} kcal
                  </p>
                </div>
              </div>
              <Badge variant="primary" size="sm" className="shrink-0">
                {activePlan.meals.length} Refeições
              </Badge>
            </div>

            {/* Macros summary pill bar */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-[10px] text-muted block">Calorias</span>
                <strong className="text-primary font-mono">{activePlan.targetCalories} kcal</strong>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-muted block">Proteínas</span>
                <strong className="text-emerald-400 font-mono">{activePlan.targetProteinG}g</strong>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] text-muted block">Carboidratos</span>
                <strong className="text-amber-400 font-mono">{activePlan.targetCarbsG}g</strong>
              </div>
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <span className="text-[10px] text-muted block">Gorduras</span>
                <strong className="text-sky-400 font-mono">{activePlan.targetFatsG}g</strong>
              </div>
            </div>

            {/* Direct Link to Student App Nutrition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Link Direto do Aluno ao Cardápio</span>
                <span className="text-[11px] text-muted font-normal">Abre no app do aluno</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?role=student&studentId=${selectedStudent.id}` : ''}
                  className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono text-primary truncate focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = `${window.location.origin}${window.location.pathname}?role=student&studentId=${selectedStudent.id}`;
                    navigator.clipboard.writeText(link);
                    setShareToast('Link copiado!');
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  className="shrink-0 text-xs flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar Link</span>
                </Button>
                <button
                  type="button"
                  onClick={() => window.open(`${window.location.origin}${window.location.pathname}?role=student&studentId=${selectedStudent.id}`, '_blank')}
                  className="p-2 rounded-xl border border-border text-muted hover:text-foreground hover:border-primary/40 transition-colors"
                  title="Testar em nova aba"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Formatted Text Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Cardápio Formatado para Envio (WhatsApp / E-mail)
                </label>
                <button
                  type="button"
                  onClick={handleCopyMenu}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedMenu ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar Cardápio</span>
                    </>
                  )}
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto p-3.5 rounded-xl bg-card border border-border/80 font-mono text-xs text-muted leading-relaxed whitespace-pre-wrap select-all">
                {getFormattedMenuText(activePlan, selectedStudent)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Enviar pelo WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-surface border border-border hover:border-primary/40 text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Enviar por E-mail</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                {shareToast && (
                  <p className="text-xs text-primary font-semibold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{shareToast}</span>
                  </p>
                )}
                <div className="ml-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsShareModalOpen(false)}
                    className="text-xs text-muted"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Floating notification toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-primary/50 text-foreground px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{shareToast}</span>
        </div>
      )}
    </div>
  );
}
