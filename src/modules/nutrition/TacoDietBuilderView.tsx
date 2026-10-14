import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  Trash2,
  BookOpen,
  Scale,
  Target,
  ArrowRight,
  ChevronRight,
  Filter,
  Calculator,
  Eye,
  EyeOff
} from 'lucide-react';
import { Meal, MealItem, NutritionPlan } from '../../types';
import { TACO_DATABASE, TACO_CATEGORIES, TacoFood, calculateTacoMacros } from '../../services/tacoData';

interface TacoDietBuilderViewProps {
  onNavigate?: (tabId: string) => void;
}

export function TacoDietBuilderView({ onNavigate }: TacoDietBuilderViewProps) {
  const { students, nutritionPlans, addNutritionPlan, currentUser, toggleDietVisibility } = useApp();

  const [activeMainTab, setActiveMainTab] = useState<'builder' | 'database'>('builder');

  // Selected student for individualized diet elaboration
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => students[0]?.id || 'stud-1');
  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Existing plan for this student (if any) to initialize or edit
  const existingPlan = nutritionPlans.find(p => p.studentId === selectedStudent?.id);

  // Targets and meta state
  const [planTitle, setPlanTitle] = useState(existingPlan?.title || `Plano Alimentar Individual — ${selectedStudent?.fullName || 'Personalizado'}`);
  const [targetCalories, setTargetCalories] = useState(existingPlan?.targetCalories || 2200);
  const [targetProteinG, setTargetProteinG] = useState(existingPlan?.targetProteinG || 140);
  const [targetCarbsG, setTargetCarbsG] = useState(existingPlan?.targetCarbsG || 220);
  const [targetFatsG, setTargetFatsG] = useState(existingPlan?.targetFatsG || 60);
  const [waterIntakeMl, setWaterIntakeMl] = useState(existingPlan?.waterIntakeMl || 3000);
  const [validUntil, setValidUntil] = useState(existingPlan?.validUntil || new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [isHiddenForStudent, setIsHiddenForStudent] = useState<boolean>(() => existingPlan?.isHiddenForStudent || false);

  // Meals currently being elaborated
  const [meals, setMeals] = useState<Meal[]>(() => {
    if (existingPlan && existingPlan.meals && existingPlan.meals.length > 0) {
      return existingPlan.meals;
    }
    return [
      {
        id: 'm-1',
        time: '07:30',
        title: 'Café da Manhã / Desjejum',
        items: [
          { id: 'item-1', name: 'Ovo de Galinha, inteiro, cozido', amount: '100g', calories: 146, proteinGrams: 13.3, carbsGrams: 0.6, fatsGrams: 9.5 },
          { id: 'item-2', name: 'Pão de Forma, 100% integral', amount: '50g', calories: 127, proteinGrams: 4.7, carbsGrams: 25.0, fatsGrams: 1.9 },
          { id: 'item-3', name: 'Banana Prata, crua', amount: '85g', calories: 83, proteinGrams: 1.1, carbsGrams: 22.1, fatsGrams: 0.1 },
        ]
      },
      {
        id: 'm-2',
        time: '12:30',
        title: 'Almoço Completo',
        items: [
          { id: 'item-4', name: 'Peito de Frango, filé sem pele, grelhado', amount: '150g', calories: 239, proteinGrams: 48.0, carbsGrams: 0.0, fatsGrams: 3.8 },
          { id: 'item-5', name: 'Arroz, tipo 1, cozido', amount: '150g', calories: 192, proteinGrams: 3.8, carbsGrams: 42.2, fatsGrams: 0.3 },
          { id: 'item-6', name: 'Feijão Carioca, cozido (50% caldo)', amount: '100g', calories: 76, proteinGrams: 4.8, carbsGrams: 13.6, fatsGrams: 0.5 },
          { id: 'item-7', name: 'Azeite de Oliva Extra Virgem', amount: '13g', calories: 115, proteinGrams: 0.0, carbsGrams: 0.0, fatsGrams: 13.0 },
        ]
      },
      {
        id: 'm-3',
        time: '16:30',
        title: 'Lanche da Tarde / Pré-Treino',
        items: [
          { id: 'item-8', name: 'Iogurte Natural Desnatado', amount: '170g', calories: 70, proteinGrams: 6.5, carbsGrams: 9.9, fatsGrams: 0.5 },
          { id: 'item-9', name: 'Aveia em flocos, crua', amount: '30g', calories: 118, proteinGrams: 4.2, carbsGrams: 20.0, fatsGrams: 2.6 },
          { id: 'item-10', name: 'Whey Protein Concentrado 80%', amount: '30g', calories: 120, proteinGrams: 24.0, carbsGrams: 2.1, fatsGrams: 1.8 },
        ]
      },
      {
        id: 'm-4',
        time: '20:00',
        title: 'Jantar',
        items: [
          { id: 'item-11', name: 'Carne Bovina, Patinho sem gordura, grelhado', amount: '150g', calories: 329, proteinGrams: 53.9, carbsGrams: 0.0, fatsGrams: 11.0 },
          { id: 'item-12', name: 'Batata Doce, cozida com casca', amount: '150g', calories: 116, proteinGrams: 0.9, carbsGrams: 27.6, fatsGrams: 0.2 },
          { id: 'item-13', name: 'Brócolis, cozido', amount: '100g', calories: 25, proteinGrams: 2.1, carbsGrams: 4.4, fatsGrams: 0.5 },
        ]
      }
    ];
  });

  // When changing student, update form with their existing plan or default
  const handleStudentChange = (studId: string) => {
    setSelectedStudentId(studId);
    const stud = students.find(s => s.id === studId);
    const plan = nutritionPlans.find(p => p.studentId === studId);
    if (plan) {
      setPlanTitle(plan.title);
      setTargetCalories(plan.targetCalories);
      setTargetProteinG(plan.targetProteinG);
      setTargetCarbsG(plan.targetCarbsG);
      setTargetFatsG(plan.targetFatsG);
      setWaterIntakeMl(plan.waterIntakeMl);
      setValidUntil(plan.validUntil);
      setMeals(plan.meals);
      setIsHiddenForStudent(plan.isHiddenForStudent || false);
    } else {
      setPlanTitle(`Plano Alimentar Individual — ${stud?.fullName || 'Personalizado'}`);
      setIsHiddenForStudent(false);
    }
  };

  // TACO Food Picker Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [targetMealIdForAdd, setTargetMealIdForAdd] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<string>('all');
  const [selectedTacoFood, setSelectedTacoFood] = useState<TacoFood | null>(null);
  const [quantityGrams, setQuantityGrams] = useState<number>(100);

  // Success Save Toast / Modal
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  // Real-time macro calculations from current meals
  const totalCalories = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + (i.calories || 0), 0), 0);
  const totalProtein = Number(meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + (i.proteinGrams || 0), 0), 0).toFixed(1));
  const totalCarbs = Number(meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + (i.carbsGrams || 0), 0), 0).toFixed(1));
  const totalFats = Number(meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + (i.fatsGrams || 0), 0), 0).toFixed(1));

  // Percentage of targets
  const calPercent = targetCalories > 0 ? Math.min(100, Math.round((totalCalories / targetCalories) * 100)) : 0;
  const protPercent = targetProteinG > 0 ? Math.min(100, Math.round((totalProtein / targetProteinG) * 100)) : 0;
  const carbsPercent = targetCarbsG > 0 ? Math.min(100, Math.round((totalCarbs / targetCarbsG) * 100)) : 0;
  const fatsPercent = targetFatsG > 0 ? Math.min(100, Math.round((totalFats / targetFatsG) * 100)) : 0;

  // Add Meal
  const handleAddNewMeal = () => {
    const newMeal: Meal = {
      id: `m-${Date.now()}`,
      time: '19:00',
      title: `Nova Refeição ${meals.length + 1}`,
      items: []
    };
    setMeals(prev => [...prev, newMeal]);
  };

  // Remove Meal
  const handleRemoveMeal = (mealId: string) => {
    setMeals(prev => prev.filter(m => m.id !== mealId));
  };

  // Update Meal Title / Time
  const handleUpdateMealHeader = (mealId: string, field: 'time' | 'title', val: string) => {
    setMeals(prev => prev.map(m => m.id === mealId ? { ...m, [field]: val } : m));
  };

  // Open TACO picker for a specific meal
  const handleOpenTacoPicker = (mealId: string) => {
    setTargetMealIdForAdd(mealId);
    setSelectedTacoFood(TACO_DATABASE[0]);
    setQuantityGrams(TACO_DATABASE[0].servingDefaultG || 100);
    setIsPickerOpen(true);
  };

  // Add selected TACO food to meal
  const handleAddTacoFoodToMeal = () => {
    if (!targetMealIdForAdd || !selectedTacoFood || quantityGrams <= 0) return;

    const macros = calculateTacoMacros(selectedTacoFood, quantityGrams);
    const newItem: MealItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: selectedTacoFood.name,
      amount: `${quantityGrams}g`,
      calories: macros.calories,
      proteinGrams: macros.proteinGrams,
      carbsGrams: macros.carbsGrams,
      fatsGrams: macros.fatsGrams,
    };

    setMeals(prev => prev.map(m => {
      if (m.id === targetMealIdForAdd) {
        return {
          ...m,
          items: [...m.items, newItem]
        };
      }
      return m;
    }));

    setIsPickerOpen(false);
  };

  // Remove food item from meal
  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        return {
          ...m,
          items: m.items.filter(i => i.id !== itemId)
        };
      }
      return m;
    }));
  };

  // Save the elaborated diet to AppContext & sync with NutritionView & Student App
  const handleSaveIndividualDiet = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedStudent) return;

    const planToSave: Omit<NutritionPlan, 'id'> = {
      organizationId: 'org-1',
      studentId: selectedStudent.id,
      proId: currentUser.id || 'user-pro-1',
      title: planTitle,
      targetCalories: Number(targetCalories),
      targetProteinG: Number(targetProteinG),
      targetCarbsG: Number(targetCarbsG),
      targetFatsG: Number(targetFatsG),
      waterIntakeMl: Number(waterIntakeMl),
      meals: meals,
      validUntil: validUntil,
      isHiddenForStudent: isHiddenForStudent,
    };

    addNutritionPlan(planToSave);
    const visNotice = isHiddenForStudent ? ' (Status: Oculta para o aluno)' : ' (Status: Visível no App)';
    setSaveSuccessToast(`Dieta individual de ${selectedStudent.fullName} salva e sincronizada com sucesso!${visNotice}`);
    setTimeout(() => setSaveSuccessToast(null), 4000);
  };

  // Quick preset macro goals
  const handleApplyPreset = (type: 'hypertrophy' | 'cutting' | 'balanced') => {
    const weight = selectedStudent?.currentWeightKg || 70;
    if (type === 'hypertrophy') {
      setTargetCalories(Math.round(weight * 35));
      setTargetProteinG(Math.round(weight * 2.2));
      setTargetCarbsG(Math.round(weight * 4.2));
      setTargetFatsG(Math.round(weight * 0.9));
    } else if (type === 'cutting') {
      setTargetCalories(Math.round(weight * 24));
      setTargetProteinG(Math.round(weight * 2.4));
      setTargetCarbsG(Math.round(weight * 2.0));
      setTargetFatsG(Math.round(weight * 0.7));
    } else {
      setTargetCalories(Math.round(weight * 30));
      setTargetProteinG(Math.round(weight * 2.0));
      setTargetCarbsG(Math.round(weight * 3.5));
      setTargetFatsG(Math.round(weight * 0.8));
    }
  };

  // Filter TACO items in picker
  const filteredTacoItems = TACO_DATABASE.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchesCat = pickerCategory === 'all' || f.category === pickerCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              Tabela TACO & Elaborador de Dietas <span className="text-primary">●</span>
            </h1>
            <Badge variant="primary" size="sm" className="font-mono font-bold">
              UNICAMP 4ª Edição
            </Badge>
          </div>
          <p className="text-sm text-muted">
            Base oficial de composição de alimentos brasileiros. Monte planos alimentares individuais calculados grama a grama.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Botão de Ocultar / Desocultar Dieta do Aluno */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !isHiddenForStudent;
              setIsHiddenForStudent(nextVal);
              if (existingPlan) {
                toggleDietVisibility(existingPlan.id);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isHiddenForStudent
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
            }`}
            title={
              isHiddenForStudent
                ? 'Dieta atualmente oculta para o aluno. Clique para desocultar.'
                : 'Dieta visível no app do aluno. Clique para ocultar.'
            }
          >
            {isHiddenForStudent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{isHiddenForStudent ? 'Dieta Oculta para Aluno' : 'Dieta Visível no App'}</span>
          </button>

          {onNavigate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('nutrition')}
              className="flex items-center gap-1.5"
            >
              <Utensils className="h-4 w-4 text-primary" />
              <span>Ver Nutrição & Dietas</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSaveIndividualDiet()}
            className="flex items-center gap-1.5 shadow-neon-sm"
          >
            <Check className="h-4 w-4" />
            <span>Salvar Dieta do Aluno</span>
          </Button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface border border-border w-fit text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveMainTab('builder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeMainTab === 'builder'
              ? 'bg-primary text-background shadow-sm font-black'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Elaborador de Dieta Individual</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('database')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeMainTab === 'database'
              ? 'bg-primary text-background shadow-sm font-black'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Explorar Tabela TACO Completa ({TACO_DATABASE.length} alimentos)</span>
        </button>
      </div>

      {/* ================= ABA 1: ELABORADOR DE DIETA INDIVIDUAL ================= */}
      {activeMainTab === 'builder' && (
        <div className="space-y-6">
          {/* Seletor do Aluno & Objetivos */}
          <Card className="border-primary/30 bg-surface/40">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Aluno Selecionado para a Dieta</CardTitle>
                    <CardDescription>Selecione para quem este plano alimentar individualizado será montado</CardDescription>
                  </div>
                </div>

                {/* Dropdown de Alunos */}
                <div className="w-full sm:w-72">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="w-full bg-surface border border-border text-foreground text-xs rounded-xl px-3 py-2.5 focus:border-primary focus:outline-none font-bold"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.goal})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Resumo do Aluno e Metas */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedStudent?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={selectedStudent?.fullName}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/40"
                  />
                  <div>
                    <h4 className="text-sm font-black text-foreground">{selectedStudent?.fullName}</h4>
                    <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                      <Target className="w-3.5 h-3.5" />
                      Objetivo: {selectedStudent?.goal}
                    </p>
                    <p className="text-[11px] text-muted">
                      Peso Atual: {selectedStudent?.currentWeightKg}kg • Meta: {selectedStudent?.targetWeightKg}kg
                    </p>
                  </div>
                </div>

                {/* Presets de Macros */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted font-bold mr-1">Calcular por Meta:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('cutting')}
                    className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface/80 border border-border text-[11px] font-bold text-foreground transition-colors"
                  >
                    🔥 Emagrecimento
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('hypertrophy')}
                    className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface/80 border border-border text-[11px] font-bold text-foreground transition-colors"
                  >
                    💪 Hipertrofia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('balanced')}
                    className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface/80 border border-border text-[11px] font-bold text-foreground transition-colors"
                  >
                    ⚖️ Manutenção
                  </button>
                </div>
              </div>

              {/* Configuração de Metas Diárias do Plano */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                    Calorias Alvo (kcal)
                  </label>
                  <Input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(Number(e.target.value))}
                    className="font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                    Proteínas (g)
                  </label>
                  <Input
                    type="number"
                    value={targetProteinG}
                    onChange={(e) => setTargetProteinG(Number(e.target.value))}
                    className="font-mono font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                    Carboidratos (g)
                  </label>
                  <Input
                    type="number"
                    value={targetCarbsG}
                    onChange={(e) => setTargetCarbsG(Number(e.target.value))}
                    className="font-mono font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                    Gorduras (g)
                  </label>
                  <Input
                    type="number"
                    value={targetFatsG}
                    onChange={(e) => setTargetFatsG(Number(e.target.value))}
                    className="font-mono font-bold text-sky-400"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                    Hidratação (ml)
                  </label>
                  <Input
                    type="number"
                    step="250"
                    value={waterIntakeMl}
                    onChange={(e) => setWaterIntakeMl(Number(e.target.value))}
                    className="font-mono font-bold text-blue-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Painel de Macros em Tempo Real (Calculado das Refeições vs Metas) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-primary/20 bg-surface/50">
              <CardContent className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-primary" />
                    Calorias
                  </span>
                  <span className="font-mono font-bold text-foreground">{totalCalories} / {targetCalories} kcal</span>
                </div>
                <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      calPercent > 105 ? 'bg-amber-400' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, calPercent)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted text-right">{calPercent}% da meta diária</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-surface/50">
              <CardContent className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted uppercase tracking-wider">Proteínas</span>
                  <span className="font-mono font-bold text-emerald-400">{totalProtein}g / {targetProteinG}g</span>
                </div>
                <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, protPercent)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted text-right">{protPercent}% da meta</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-surface/50">
              <CardContent className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted uppercase tracking-wider">Carboidratos</span>
                  <span className="font-mono font-bold text-amber-400">{totalCarbs}g / {targetCarbsG}g</span>
                </div>
                <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, carbsPercent)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted text-right">{carbsPercent}% da meta</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-surface/50">
              <CardContent className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted uppercase tracking-wider">Gorduras</span>
                  <span className="font-mono font-bold text-sky-400">{totalFats}g / {targetFatsG}g</span>
                </div>
                <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, fatsPercent)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted text-right">{fatsPercent}% da meta</p>
              </CardContent>
            </Card>
          </div>

          {/* Refeições Elaboradas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Refeições do Plano Alimentar ({meals.length})
                </h3>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddNewMeal}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Adicionar Refeição</span>
              </Button>
            </div>

            {meals.map((meal, mealIdx) => {
              const mealCalories = meal.items.reduce((s, i) => s + (i.calories || 0), 0);
              const mealProtein = Number(meal.items.reduce((s, i) => s + (i.proteinGrams || 0), 0).toFixed(1));
              const mealCarbs = Number(meal.items.reduce((s, i) => s + (i.carbsGrams || 0), 0).toFixed(1));
              const mealFats = Number(meal.items.reduce((s, i) => s + (i.fatsGrams || 0), 0).toFixed(1));

              return (
                <Card key={meal.id} className="border-border bg-surface/30 overflow-hidden">
                  <div className="p-4 border-b border-border/80 bg-surface/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        <input
                          type="time"
                          value={meal.time}
                          onChange={(e) => handleUpdateMealHeader(meal.id, 'time', e.target.value)}
                          className="bg-card border border-border text-foreground font-mono text-xs px-2 py-1 rounded-lg focus:outline-none focus:border-primary"
                        />
                      </div>

                      <input
                        type="text"
                        value={meal.title}
                        onChange={(e) => handleUpdateMealHeader(meal.id, 'title', e.target.value)}
                        placeholder="Nome da Refeição (Ex: Almoço)"
                        className="bg-transparent border-b border-transparent hover:border-border focus:border-primary font-bold text-sm text-foreground px-1 py-0.5 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="font-bold text-primary">{mealCalories} kcal</span>
                        <span className="text-muted">•</span>
                        <span className="text-emerald-400">P: {mealProtein}g</span>
                        <span className="text-muted">•</span>
                        <span className="text-amber-400">C: {mealCarbs}g</span>
                        <span className="text-muted">•</span>
                        <span className="text-sky-400">G: {mealFats}g</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMeal(meal.id)}
                        className="text-muted hover:text-red-400 p-1 rounded-lg transition-colors"
                        title="Remover refeição"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Alimentos inseridos */}
                    {meal.items.length > 0 ? (
                      <div className="space-y-2">
                        {meal.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-card border border-border/80 hover:border-border transition-colors gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold text-foreground block truncate">{item.name}</span>
                                <span className="text-[11px] text-primary font-semibold">{item.amount}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-[11px] shrink-0">
                              <span className="font-bold text-foreground">{item.calories} kcal</span>
                              <span className="text-emerald-400">P: {item.proteinGrams}g</span>
                              <span className="text-amber-400">C: {item.carbsGrams}g</span>
                              <span className="text-sky-400">G: {item.fatsGrams}g</span>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(meal.id, item.id)}
                                className="text-muted hover:text-red-400 p-1 transition-colors"
                                title="Remover alimento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted">
                        Nenhum alimento adicionado nesta refeição ainda.
                      </div>
                    )}

                    {/* Botão para Adicionar da Tabela TACO */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenTacoPicker(meal.id)}
                      className="w-full flex items-center justify-center gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Alimento da Tabela TACO</span>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Botão de Salvar e Sincronizar Dieta */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-primary/30">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-foreground">Finalizar Elaboração da Dieta</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isHiddenForStudent
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isHiddenForStudent ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {isHiddenForStudent ? 'Oculta para o Aluno' : 'Visível no App'}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Ao salvar, a dieta será atualizada no menu <strong>Nutrição & Dietas</strong> e refletirá no <strong>App do Aluno</strong> de acordo com a visibilidade definida.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  const nextVal = !isHiddenForStudent;
                  setIsHiddenForStudent(nextVal);
                  if (existingPlan) {
                    toggleDietVisibility(existingPlan.id);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                  isHiddenForStudent
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
                    : 'border-border bg-card text-muted hover:text-foreground hover:border-amber-500/40'
                }`}
                title={isHiddenForStudent ? 'Clique para desocultar a dieta' : 'Clique para ocultar a dieta do aluno'}
              >
                {isHiddenForStudent ? <Eye className="w-4 h-4 shrink-0" /> : <EyeOff className="w-4 h-4 shrink-0" />}
                <span className="whitespace-nowrap">{isHiddenForStudent ? 'Desocultar Dieta' : 'Ocultar do Aluno'}</span>
              </button>

              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => handleSaveIndividualDiet()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 shadow-neon font-bold h-auto min-h-[42px] sm:h-12 py-2 sm:py-0 px-3 sm:px-6 text-xs sm:text-base leading-tight text-center"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="whitespace-nowrap sm:whitespace-normal">
                  <span className="hidden sm:inline">Salvar e Atualizar Dieta</span>
                  <span className="sm:hidden">Salvar Dieta</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ABA 2: CONSULTA COMPLETA DA TABELA TACO ================= */}
      {activeMainTab === 'database' && (
        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>Base Oficial TACO — Tabela Brasileira de Composição de Alimentos</span>
                </CardTitle>
                <CardDescription>
                  Dados por 100g de parte comestível conforme a metodologia padrão UNICAMP
                </CardDescription>
              </div>

              {/* Busca de Alimentos */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar alimento (ex: frango, arroz, aveia)..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface border border-border focus:border-primary focus:outline-none text-foreground placeholder:text-muted"
                />
              </div>
            </div>

            {/* Categorias Filtro */}
            <div className="flex items-center gap-1.5 flex-wrap pt-3">
              {TACO_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPickerCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pickerCategory === cat.id
                      ? 'bg-primary text-background'
                      : 'bg-surface text-muted hover:text-foreground border border-border'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/80 border-b border-border text-[11px] uppercase tracking-wider text-muted font-bold">
                  <tr>
                    <th className="py-3 px-4">Alimento (TACO)</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3">Porção Comum</th>
                    <th className="py-3 px-3 text-right">Calorias (100g)</th>
                    <th className="py-3 px-3 text-right text-emerald-400">Proteína</th>
                    <th className="py-3 px-3 text-right text-amber-400">Carboidratos</th>
                    <th className="py-3 px-3 text-right text-sky-400">Lipídios/Gorduras</th>
                    <th className="py-3 px-3 text-right">Fibras</th>
                    <th className="py-3 px-4 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTacoItems.map((food) => (
                    <tr key={food.id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">
                        {food.name}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="neutral" size="sm" className="text-[10px]">
                          {food.categoryLabel}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {food.servingMeasure}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-primary">
                        {food.caloriesPer100g} kcal
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                        {food.proteinPer100g}g
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-amber-400 font-bold">
                        {food.carbsPer100g}g
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-sky-400 font-bold">
                        {food.fatsPer100g}g
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-muted">
                        {food.fiberPer100g ? `${food.fiberPer100g}g` : '0g'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveMainTab('builder');
                            if (meals[0]) {
                              handleOpenTacoPicker(meals[0].id);
                              setSelectedTacoFood(food);
                              setQuantityGrams(food.servingDefaultG);
                            }
                          }}
                          className="text-[11px] py-1 px-2.5 h-auto"
                        >
                          Adicionar à Dieta
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL: SELETOR DE ALIMENTOS DA TABELA TACO */}
      {isPickerOpen && (
        <Modal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          title="Tabela TACO — Selecionar Alimento"
          description="Pesquise o alimento na tabela brasileira e informe a quantidade em gramas."
        >
          <div className="space-y-4">
            {/* Campo de Busca no Modal */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome do alimento..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface border border-border focus:border-primary focus:outline-none text-foreground"
              />
            </div>

            {/* Categorias Filtro */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {TACO_CATEGORIES.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPickerCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                    pickerCategory === cat.id
                      ? 'bg-primary text-background'
                      : 'bg-surface text-muted hover:text-foreground border border-border'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista rolável de alimentos */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-border rounded-xl p-2 bg-surface/20">
              {filteredTacoItems.map((food) => {
                const isSelected = selectedTacoFood?.id === food.id;
                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => {
                      setSelectedTacoFood(food);
                      setQuantityGrams(food.servingDefaultG);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                        : 'border-border/60 hover:bg-surface'
                    }`}
                  >
                    <div>
                      <span className={`font-bold block ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {food.name}
                      </span>
                      <span className="text-[10px] text-muted">{food.servingMeasure}</span>
                    </div>

                    <div className="text-right font-mono text-[11px]">
                      <span className="font-bold text-foreground">{food.caloriesPer100g} kcal</span>
                      <span className="text-[10px] text-muted block">P:{food.proteinPer100g}g • C:{food.carbsPer100g}g</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Ajuste de Gramas e Cálculo Instantâneo */}
            {selectedTacoFood && (
              <div className="p-3.5 rounded-xl bg-card border border-primary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-muted uppercase">Alimento Selecionado:</span>
                    <h5 className="text-xs font-black text-foreground">{selectedTacoFood.name}</h5>
                  </div>
                  <Badge variant="primary" size="sm">
                    {selectedTacoFood.servingMeasure}
                  </Badge>
                </div>

                {/* Gramas input com botões rápidos */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Quantidade em Gramas (g):</span>
                    <span className="font-mono text-primary font-bold">{quantityGrams}g</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="5"
                      min="5"
                      value={quantityGrams}
                      onChange={(e) => setQuantityGrams(Number(e.target.value))}
                      className="flex-1 bg-surface border border-border text-foreground font-mono text-xs rounded-xl px-3 py-2 focus:border-primary focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setQuantityGrams(prev => Math.max(10, prev - 25))}
                      className="px-2 py-2 rounded-xl bg-surface border border-border text-xs font-bold hover:bg-surface/80"
                    >
                      -25g
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantityGrams(prev => prev + 25)}
                      className="px-2 py-2 rounded-xl bg-surface border border-border text-xs font-bold hover:bg-surface/80"
                    >
                      +25g
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantityGrams(prev => prev + 50)}
                      className="px-2 py-2 rounded-xl bg-surface border border-border text-xs font-bold hover:bg-surface/80"
                    >
                      +50g
                    </button>
                  </div>
                </div>

                {/* Valores calculados para a porção */}
                {(() => {
                  const calculated = calculateTacoMacros(selectedTacoFood, quantityGrams);
                  return (
                    <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-border/80 text-xs font-mono">
                      <div className="p-1.5 rounded-lg bg-surface">
                        <span className="text-[9px] text-muted uppercase block">Calorias</span>
                        <strong className="text-foreground font-bold">{calculated.calories} kcal</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-surface">
                        <span className="text-[9px] text-muted uppercase block">Proteína</span>
                        <strong className="text-emerald-400 font-bold">{calculated.proteinGrams}g</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-surface">
                        <span className="text-[9px] text-muted uppercase block">Carbos</span>
                        <strong className="text-amber-400 font-bold">{calculated.carbsGrams}g</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-surface">
                        <span className="text-[9px] text-muted uppercase block">Gorduras</span>
                        <strong className="text-sky-400 font-bold">{calculated.fatsGrams}g</strong>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setIsPickerOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAddTacoFoodToMeal}
                disabled={!selectedTacoFood || quantityGrams <= 0}
              >
                Inserir na Refeição
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {saveSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-primary/50 text-foreground px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          <span>{saveSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
