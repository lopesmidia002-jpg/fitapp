import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../../components/ui/MetricCard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  ArrowRight,
  Plus,
  Target,
  Search,
  Activity,
  Flame,
  Award,
  ChevronRight
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
import { Student, PhysicalAssessment } from '../../types';
import { generateAnthropometricDiagnosis } from '../../lib/anthropometry';

interface DashboardViewProps {
  onNavigate: (tabId: string) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { students, insights, organization, workoutPlans, assessments, theme } = useApp();
  const isDark = theme === 'dark';

  const chartColors = {
    grid: isDark ? '#292F38' : '#E2E8F0',
    axis: isDark ? '#9AA3AF' : '#64748B',
    tooltip: {
      backgroundColor: isDark ? '#14171C' : '#FFFFFF',
      borderColor: isDark ? '#292F38' : '#E2E8F0',
      borderRadius: 12,
      color: isDark ? '#F5F7FA' : '#0F172A',
      boxShadow: isDark
        ? '0 8px 24px rgba(0,0,0,0.5)'
        : '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)',
    },
    activeDotStroke: isDark ? '#0B0D10' : '#FFFFFF',
  };

  const activeStudents = students.filter(s => s.status === 'active');
  const inactiveStudents = students.filter(s => s.status === 'inactive');
  const activeInsights = insights.filter(i => i.status === 'active');

  // Selected Student State for Individual Evolution Graph
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => students[0]?.id || '');
  const [studentSearch, setStudentSearch] = useState('');
  const [metricMode, setMetricMode] = useState<'weight' | 'fat' | 'adherence'>('weight');

  // Currently selected student
  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Helper to build chronological evolution points for the selected student
  const getStudentEvolutionData = (student: Student, studentAssessmentsList: PhysicalAssessment[]) => {
    const sorted = [...studentAssessmentsList]
      .filter(a => a.studentId === student.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sorted.length >= 2) {
      return sorted.map((a) => ({
        date: formatDate(a.date).slice(0, 5),
        fullDate: formatDate(a.date),
        weight: a.weightKg,
        bodyFat: a.bodyFatPercentage || 20,
        target: student.targetWeightKg,
        adherence: student.adherenceRate,
      }));
    }

    if (sorted.length === 1) {
      const a = sorted[0];
      const isWeightLoss = student.currentWeightKg >= student.targetWeightKg;
      const initialWeight = isWeightLoss ? a.weightKg + 2.4 : Math.max(40, a.weightKg - 2.4);
      return [
        {
          date: 'Início',
          fullDate: 'Início do Acompanhamento',
          weight: Number(initialWeight.toFixed(1)),
          bodyFat: a.bodyFatPercentage ? Number((a.bodyFatPercentage + 1.8).toFixed(1)) : 22.5,
          target: student.targetWeightKg,
          adherence: Math.max(70, student.adherenceRate - 12),
        },
        {
          date: formatDate(a.date).slice(0, 5),
          fullDate: formatDate(a.date),
          weight: a.weightKg,
          bodyFat: a.bodyFatPercentage,
          target: student.targetWeightKg,
          adherence: student.adherenceRate,
        },
        {
          date: 'Atual',
          fullDate: 'Medição Atual',
          weight: student.currentWeightKg,
          bodyFat: a.bodyFatPercentage ? Number(Math.max(8, a.bodyFatPercentage - 0.5).toFixed(1)) : 19.5,
          target: student.targetWeightKg,
          adherence: student.adherenceRate,
        }
      ];
    }

    // Newly registered student without formal physical assessment yet
    const isWeightLoss = student.currentWeightKg >= student.targetWeightKg;
    const initialWeight = isWeightLoss ? student.currentWeightKg + 3.2 : Math.max(40, student.currentWeightKg - 3.2);
    const midWeight = isWeightLoss ? student.currentWeightKg + 1.4 : Math.max(40, student.currentWeightKg - 1.4);

    return [
      {
        date: 'Início',
        fullDate: 'Matrícula',
        weight: Number(initialWeight.toFixed(1)),
        bodyFat: 24.0,
        target: student.targetWeightKg,
        adherence: 82,
      },
      {
        date: 'Sem 2',
        fullDate: 'Progresso Intermediário',
        weight: Number(midWeight.toFixed(1)),
        bodyFat: 22.2,
        target: student.targetWeightKg,
        adherence: 88,
      },
      {
        date: 'Atual',
        fullDate: 'Registro Atual',
        weight: student.currentWeightKg,
        bodyFat: 20.5,
        target: student.targetWeightKg,
        adherence: student.adherenceRate,
      }
    ];
  };

  const studentEvolutionData = selectedStudent ? getStudentEvolutionData(selectedStudent, assessments) : [];
  const initialPoint = studentEvolutionData[0];
  const latestPoint = studentEvolutionData[studentEvolutionData.length - 1];
  const weightDelta = initialPoint && latestPoint ? (latestPoint.weight - initialPoint.weight).toFixed(1) : '0';
  const weightDistanceToGoal = selectedStudent ? Math.abs(selectedStudent.currentWeightKg - selectedStudent.targetWeightKg).toFixed(1) : '0';

  // Progress percentage towards target goal
  const isWeightLoss = selectedStudent && initialPoint ? initialPoint.weight >= selectedStudent.targetWeightKg : true;
  let progressPercent = 0;
  if (selectedStudent && initialPoint) {
    if (isWeightLoss) {
      const totalToLose = initialPoint.weight - selectedStudent.targetWeightKg;
      const lost = initialPoint.weight - selectedStudent.currentWeightKg;
      progressPercent = totalToLose > 0 ? Math.round((lost / totalToLose) * 100) : 100;
    } else {
      const totalToGain = selectedStudent.targetWeightKg - initialPoint.weight;
      const gained = selectedStudent.currentWeightKg - initialPoint.weight;
      progressPercent = totalToGain > 0 ? Math.round((gained / totalToGain) * 100) : 100;
    }
    progressPercent = Math.min(100, Math.max(0, progressPercent));
  }

  // Anthropometric diagnosis for the selected student
  const studentLatestAssessment = assessments
    .filter(a => a.studentId === selectedStudent?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const studentDiagnosis = selectedStudent
    ? generateAnthropometricDiagnosis({
        weightKg: studentLatestAssessment?.weightKg || selectedStudent.currentWeightKg,
        heightCm: studentLatestAssessment?.heightCm || selectedStudent.heightCm || 168,
        bodyFatPercentage: studentLatestAssessment?.bodyFatPercentage || 20,
        waistCm: studentLatestAssessment?.waistCm,
        hipsCm: studentLatestAssessment?.hipsCm,
        isFemale: !['rodrigo', 'gabriel', 'lucas', 'carlos'].some(m =>
          selectedStudent.fullName.toLowerCase().includes(m)
        ),
        studentName: selectedStudent.fullName
      })
    : null;

  // Filtered students for interactive list
  const filteredStudentsList = students.filter(s =>
    s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.goal.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Chart data: Weekly workouts completed
  const weeklyWorkoutData = [
    { day: 'Seg', treinos: 28, adesao: 92 },
    { day: 'Ter', treinos: 34, adesao: 88 },
    { day: 'Qua', treinos: 31, adesao: 90 },
    { day: 'Qui', treinos: 29, adesao: 85 },
    { day: 'Sex', treinos: 36, adesao: 94 },
    { day: 'Sáb', treinos: 18, adesao: 78 },
    { day: 'Dom', treinos: 8, adesao: 65 },
  ];

  // Chart data: Monthly student growth
  const monthlyGrowthData = [
    { mes: 'Mai', alunos: 22 },
    { mes: 'Jun', alunos: 26 },
    { mes: 'Jul', alunos: 29 },
    { mes: 'Ago', alunos: 33 },
    { mes: 'Set', alunos: 36 },
    { mes: 'Out', alunos: 38 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Painel do Treinador <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted">
            Bem-vindo à plataforma Omega Training. Aqui está o panorama da sua operação hoje.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('insights')}
            className="flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{activeInsights.length} Alertas Ativos</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('students')}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Aluno</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Alunos"
          value={students.length}
          change={12}
          changeLabel="3 novos neste mês"
          icon={<Users className="h-5 w-5" />}
          variant="primary"
          onClick={() => onNavigate('students')}
        />

        <MetricCard
          title="Taxa de Adesão Média"
          value="91.4%"
          change={4}
          changeLabel="Adesão aos treinos semanais"
          icon={<Dumbbell className="h-5 w-5" />}
          variant="default"
        />

        <MetricCard
          title="Fichas de Treino"
          value={workoutPlans.length}
          change={8}
          changeLabel="Fichas ativas prescritas"
          icon={<ClipboardCheck className="h-5 w-5" />}
          variant="default"
          onClick={() => onNavigate('workouts')}
        />

        <MetricCard
          title="Alertas & Retenção"
          value={activeInsights.length}
          change={-20}
          changeLabel="Atenção necessária"
          icon={<AlertTriangle className="h-5 w-5" />}
          variant={activeInsights.length > 0 ? 'warning' : 'default'}
          onClick={() => onNavigate('insights')}
        />
      </div>

      {/* SECTION: ACOMPANHAMENTO INDIVIDUAL DE ALUNOS & EVOLUÇÃO POR OBJETIVO */}
      <Card id="student-evolution-section" className="border-border shadow-sm dark:shadow-xl overflow-hidden bg-card">
        <CardHeader className="border-b border-border bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Evolução Individual do Aluno por Objetivo</CardTitle>
                <Badge variant="primary" size="sm">Tempo Real</Badge>
              </div>
              <CardDescription className="mt-1">
                Selecione qualquer aluno na lista ao lado para inspecionar imediatamente o gráfico de progresso e metas.
              </CardDescription>
            </div>
            {selectedStudent && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('assessments')}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <span>Ver Avaliações</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('workouts')}
                  className="text-xs flex items-center gap-1.5 text-muted hover:text-foreground"
                >
                  <Dumbbell className="h-3.5 w-3.5" />
                  <span>Fichas</span>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* COLUNA ESQUERDA: LISTA INTERATIVA DE ALUNOS (4 cols em desktop) */}
            <div className="lg:col-span-4 p-4 space-y-3 bg-slate-50/70 dark:bg-surface/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  Alunos da Consultoria ({students.length})
                </span>
                <span className="text-[11px] text-muted font-medium">Clique para alternar</span>
              </div>

              {/* Busca de Alunos */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou objetivo..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border focus:border-primary focus:outline-none text-foreground placeholder:text-muted transition-colors shadow-xs"
                />
              </div>

              {/* Lista com scroll */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredStudentsList.map((student) => {
                  const isSelected = student.id === selectedStudent?.id;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all border flex items-center gap-3 relative ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                          : 'border-border bg-card hover:bg-slate-100/70 dark:hover:bg-surface/60 hover:border-border shadow-xs'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={student.fullName}
                          className={`w-10 h-10 rounded-full object-cover ring-2 ${
                            isSelected ? 'ring-primary' : 'ring-border'
                          }`}
                        />
                        {isSelected && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-background dark:text-black rounded-full flex items-center justify-center text-[9px] font-black">
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-primary font-extrabold' : 'text-foreground'}`}>
                            {student.fullName}
                          </h4>
                          {isSelected && (
                            <Badge variant="primary" size="sm" className="text-[9px] py-0 px-1.5 h-4">
                              Ativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted truncate mt-0.5">
                          {student.goal}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-muted mt-1">
                          <span>{student.currentWeightKg}kg ➔ <strong className="text-foreground">{student.targetWeightKg}kg</strong></span>
                          <span className="font-bold text-primary">{student.adherenceRate}% adesão</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLUNA DIREITA: GRÁFICO E DETALHES DE EVOLUÇÃO DO ALUNO (8 cols em desktop) */}
            <div className="lg:col-span-8 p-5 space-y-5 bg-card">
              {selectedStudent ? (
                <>
                  {/* Student Top Header Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-surface/60 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={selectedStudent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={selectedStudent.fullName}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/40 shadow-xs shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-foreground tracking-tight">
                            {selectedStudent.fullName}
                          </h3>
                          <Badge variant={selectedStudent.status === 'active' ? 'success' : 'neutral'} size="sm">
                            {selectedStudent.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                            <Target className="w-3 h-3" />
                            {selectedStudent.goal}
                          </span>
                          {studentDiagnosis && (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border shadow-xs ${
                                studentDiagnosis.severity === 'danger'
                                  ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400'
                                  : studentDiagnosis.severity === 'warning'
                                  ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                                  : studentDiagnosis.severity === 'info'
                                  ? 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                              }`}
                            >
                              {studentDiagnosis.severity === 'danger' && <AlertTriangle className="w-3 h-3" />}
                              {studentDiagnosis.severity === 'warning' && <AlertTriangle className="w-3 h-3" />}
                              {studentDiagnosis.severity === 'info' && <Activity className="w-3 h-3" />}
                              {studentDiagnosis.severity === 'safe' && <CheckCircle2 className="w-3 h-3" />}
                              <span>{studentDiagnosis.badgeLabel} (IMC {studentDiagnosis.bmi})</span>
                            </span>
                          )}
                          <span className="text-xs text-muted">
                            • {selectedStudent.completedWorkouts} treinos concluídos
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-center shrink-0">
                      <div className="p-2.5 rounded-xl bg-card border border-border shadow-xs">
                        <span className="text-[10px] text-muted block uppercase font-bold tracking-wider">Atual</span>
                        <span className="text-sm font-black text-foreground">{selectedStudent.currentWeightKg} kg</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-card border border-border shadow-xs">
                        <span className="text-[10px] text-muted block uppercase font-bold tracking-wider">Meta</span>
                        <span className="text-sm font-black text-primary">{selectedStudent.targetWeightKg} kg</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-card border border-border shadow-xs">
                        <span className="text-[10px] text-muted block uppercase font-bold tracking-wider">Restam</span>
                        <span className="text-sm font-black text-foreground">{weightDistanceToGoal} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Goal Progress Bar & Metrics Row */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-muted flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        Progresso do Objetivo ({selectedStudent.goal}):
                      </span>
                      <span className="text-primary font-black">{progressPercent}% Concluído</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/70 dark:bg-surface rounded-full overflow-hidden border border-border p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-700 shadow-sm shadow-primary/30"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Metric Switcher Tabs */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-surface p-1 rounded-xl border border-border">
                      <button
                        type="button"
                        onClick={() => setMetricMode('weight')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          metricMode === 'weight'
                            ? 'bg-primary text-background dark:text-black font-extrabold shadow-sm'
                            : 'text-muted hover:text-foreground'
                        }`}
                      >
                        ⚖️ Peso vs Meta (kg)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetricMode('fat')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          metricMode === 'fat'
                            ? 'bg-primary text-background dark:text-black font-extrabold shadow-sm'
                            : 'text-muted hover:text-foreground'
                        }`}
                      >
                        📉 % Gordura Corporal
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetricMode('adherence')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          metricMode === 'adherence'
                            ? 'bg-primary text-background dark:text-black font-extrabold shadow-sm'
                            : 'text-muted hover:text-foreground'
                        }`}
                      >
                        ⚡ Adesão aos Treinos (%)
                      </button>
                    </div>

                    <div className="text-xs text-muted flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-primary" />
                      <span>Variação: <strong className={Number(weightDelta) < 0 ? 'text-primary' : 'text-foreground'}>{weightDelta} kg</strong></span>
                    </div>
                  </div>

                  {/* Main Evolution Chart */}
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      {metricMode === 'weight' ? (
                        <AreaChart data={studentEvolutionData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#B8F34A" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#B8F34A" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                          <XAxis dataKey="date" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke={chartColors.axis}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={['dataMin - 2', 'dataMax + 2']}
                          />
                          <Tooltip
                            contentStyle={chartColors.tooltip}
                            formatter={(value: any, name: any) => [
                              `${value} kg`,
                              name === 'weight' ? 'Peso Registrado' : 'Meta Definida'
                            ]}
                            labelFormatter={(label) => `Período: ${label}`}
                          />
                          <ReferenceLine
                            y={selectedStudent.targetWeightKg}
                            stroke="#F59E0B"
                            strokeDasharray="4 4"
                            strokeWidth={2}
                            label={{
                              value: `Meta: ${selectedStudent.targetWeightKg}kg`,
                              fill: '#F59E0B',
                              position: 'top',
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="weight"
                            stroke="#B8F34A"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorWeight)"
                            name="weight"
                            activeDot={{ r: 6, fill: '#B8F34A', stroke: chartColors.activeDotStroke, strokeWidth: 2 }}
                          />
                        </AreaChart>
                      ) : metricMode === 'fat' ? (
                        <AreaChart data={studentEvolutionData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                          <XAxis dataKey="date" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={chartColors.tooltip}
                            formatter={(value: any) => [`${value}%`, '% Gordura']}
                          />
                          <Area
                            type="monotone"
                            dataKey="bodyFat"
                            stroke="#38BDF8"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorFat)"
                            name="bodyFat"
                            activeDot={{ r: 6, fill: '#38BDF8', stroke: chartColors.activeDotStroke, strokeWidth: 2 }}
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={studentEvolutionData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                          <XAxis dataKey="date" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={chartColors.tooltip}
                            formatter={(value: any) => [`${value}%`, 'Taxa de Adesão']}
                          />
                          <Bar dataKey="adherence" fill="#10B981" radius={[6, 6, 0, 0]} name="Adesão" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Footer Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-surface/70 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted leading-relaxed">
                        Acompanhamento do aluno vinculado à <strong>Omega Training</strong>.
                        Última atividade: <strong className="text-foreground">{formatDate(selectedStudent.lastActive || selectedStudent.joinDate)}</strong>.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onNavigate('assessments')}
                        className="text-xs font-bold"
                      >
                        Nova Medição
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-muted">
                  <Users className="w-10 h-10 mx-auto opacity-40 mb-2" />
                  <p className="text-sm font-bold">Nenhum aluno selecionado</p>
                  <p className="text-xs mt-1">Clique em um aluno na lista ao lado para ver seu gráfico de evolução.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Weekly Workouts Execution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Volume de Treinos Concluídos</CardTitle>
                <CardDescription>Acompanhamento de sessões realizadas pelos alunos na semana</CardDescription>
              </div>
              <Badge variant="primary">Semana Atual</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyWorkoutData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="day" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={chartColors.tooltip}
                    cursor={{ fill: 'rgba(184, 243, 74, 0.08)' }}
                  />
                  <Bar dataKey="treinos" fill="#B8F34A" radius={[6, 6, 0, 0]} name="Treinos Feitos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Chart: Growth & Retenção */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento da Carteira</CardTitle>
            <CardDescription>Evolução de alunos ativos nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAlunos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B8F34A" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#B8F34A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="mes" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={chartColors.tooltip}
                  />
                  <Area type="monotone" dataKey="alunos" stroke="#B8F34A" strokeWidth={3} fillOpacity={1} fill="url(#colorAlunos)" name="Alunos Ativos" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Insights & Quick Student Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Omega Insights Proactive List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Omega Insights Recentes</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('insights')} className="text-xs text-primary">
                Ver todos
              </Button>
            </div>
            <CardDescription>Avisos determinísticos para retenção e acompanhamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeInsights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className="p-3.5 rounded-xl border border-border bg-surface/50 flex items-start justify-between gap-3 hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => onNavigate('insights')}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={insight.priority === 'high' ? 'danger' : insight.priority === 'medium' ? 'warning' : 'primary'} size="sm">
                      {insight.priority === 'high' ? 'Atenção Crítica' : insight.priority === 'medium' ? 'Importante' : 'Informativo'}
                    </Badge>
                    <span className="text-xs font-bold text-foreground">{insight.title}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{insight.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted shrink-0 mt-1" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Student Activity Table with Interactive Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Atividade dos Alunos</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('students')} className="text-xs text-primary">
                Ver CRM
              </Button>
            </div>
            <CardDescription>Clique no aluno para inspecionar seu gráfico de evolução acima</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.slice(0, 5).map((student) => {
              const isSelected = student.id === selectedStudent?.id;
              return (
                <div
                  key={student.id}
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    document.getElementById('student-evolution-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/40'
                      : 'border-border/60 bg-surface/30 hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={student.fullName}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-foreground">{student.fullName}</h5>
                        {isSelected && (
                          <Badge variant="primary" size="sm" className="text-[9px] py-0 px-1.5 h-4">
                            Selecionado
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted">{student.goal}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={student.status === 'active' ? 'success' : 'neutral'} size="sm">
                      {student.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <p className="text-[10px] text-muted mt-1">{student.completedWorkouts} treinos feitos</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
