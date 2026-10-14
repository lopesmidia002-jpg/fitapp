import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import {
  Plus,
  Scale,
  Calendar,
  Lock,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Search,
  Users,
  Check,
  Flame,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Dumbbell,
  Apple,
  HeartPulse,
  Camera,
  Image as ImageIcon,
  UploadCloud,
  Trash2
} from 'lucide-react';
import { storageService } from '../../lib/supabase';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { formatDate } from '../../lib/utils';
import { PhysicalAssessment } from '../../types';
import {
  generateAnthropometricDiagnosis,
  AnthropometricDiagnosis,
  calculateBMI
} from '../../lib/anthropometry';

export function AssessmentsView() {
  const { assessments, addAssessment, students, currentUser, theme } = useApp();
  const isDark = theme === 'dark';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => students[0]?.id || 'stud-1');
  const [searchStudent, setSearchStudent] = useState('');

  // Currently selected student object
  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Assessments filtered specifically for this selected student
  const studentAssessments = assessments.filter(a => a.studentId === selectedStudent?.id);

  // Chronological order for evolution chart (oldest to newest)
  const sortedChronological = [...studentAssessments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Newest to oldest for cards
  const sortedRecent = [...studentAssessments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Chart data formatted from the active student's assessments
  const evolutionData = sortedChronological.map(a => ({
    data: formatDate(a.date).slice(0, 5), // DD/MM
    peso: a.weightKg,
    gordura: a.bodyFatPercentage,
    cintura: a.waistCm || 0,
    quadril: a.hipsCm || 0,
    braco: a.armsCm || 0,
  }));

  // Evolution metrics deltas
  const firstAssessment = sortedChronological[0];
  const latestAssessment = sortedChronological[sortedChronological.length - 1];

  const weightDelta = firstAssessment && latestAssessment && sortedChronological.length > 1
    ? (latestAssessment.weightKg - firstAssessment.weightKg).toFixed(1)
    : null;

  const fatDelta = firstAssessment && latestAssessment && sortedChronological.length > 1
    ? (latestAssessment.bodyFatPercentage - firstAssessment.bodyFatPercentage).toFixed(1)
    : null;

  // Filter students for the selector list
  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.goal.toLowerCase().includes(searchStudent.toLowerCase())
  );

  // Form State for new assessment
  const [newAssessment, setNewAssessment] = useState<Omit<PhysicalAssessment, 'id'>>({
    studentId: selectedStudent?.id || 'stud-1',
    proId: currentUser.id,
    date: new Date().toISOString().split('T')[0],
    weightKg: selectedStudent?.currentWeightKg || 65,
    heightCm: selectedStudent?.heightCm || 168,
    bodyFatPercentage: 20,
    method: 'Pollock 7 Dobras',
    chestCm: 88,
    waistCm: 68,
    hipsCm: 98,
    armsCm: 30,
    thighsCm: 56,
    proObservations: 'Boa adesão aos treinos, evolução muscular evidente.',
    photosUrls: [],
  });

  // UI state for cards and feedback
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [appliedReportFeedback, setAppliedReportFeedback] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);

    try {
      const uploadPromises = Array.from(files).map(file => storageService.uploadFile('assessments', file));
      const urls = await Promise.all(uploadPromises);
      setNewAssessment(prev => ({
        ...prev,
        photosUrls: [...(prev.photosUrls || []), ...urls],
      }));
    } catch (err) {
      console.error('Error uploading assessment photos:', err);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setNewAssessment(prev => ({
      ...prev,
      photosUrls: (prev.photosUrls || []).filter((_, i) => i !== index),
    }));
  };


  // Student in the modal form
  const currentModalStudent = students.find(s => s.id === newAssessment.studentId) || selectedStudent;
  const isFemaleModal = currentModalStudent
    ? !['rodrigo', 'gabriel', 'lucas', 'carlos', 'felipe', 'marcos', 'joao', 'pedro'].some(m =>
        currentModalStudent.fullName.toLowerCase().includes(m)
      )
    : true;

  // Real-time Anthropometric Diagnosis & Recommendations
  const liveDiagnosis: AnthropometricDiagnosis = useMemo(() => {
    return generateAnthropometricDiagnosis({
      weightKg: Number(newAssessment.weightKg) || 60,
      heightCm: Number(newAssessment.heightCm) || currentModalStudent?.heightCm || 168,
      bodyFatPercentage: Number(newAssessment.bodyFatPercentage) || 20,
      waistCm: newAssessment.waistCm ? Number(newAssessment.waistCm) : undefined,
      hipsCm: newAssessment.hipsCm ? Number(newAssessment.hipsCm) : undefined,
      isFemale: isFemaleModal,
      studentName: currentModalStudent?.fullName,
    });
  }, [
    newAssessment.weightKg,
    newAssessment.heightCm,
    newAssessment.bodyFatPercentage,
    newAssessment.waistCm,
    newAssessment.hipsCm,
    isFemaleModal,
    currentModalStudent
  ]);

  // Diagnosis of latest assessment for the selected student banner
  const latestDiagnosis = useMemo(() => {
    if (!latestAssessment) return null;
    const isFemale = selectedStudent
      ? !['rodrigo', 'gabriel', 'lucas', 'carlos', 'felipe', 'marcos', 'joao', 'pedro'].some(m =>
          selectedStudent.fullName.toLowerCase().includes(m)
        )
      : true;

    return generateAnthropometricDiagnosis({
      weightKg: latestAssessment.weightKg,
      heightCm: latestAssessment.heightCm || selectedStudent?.heightCm || 168,
      bodyFatPercentage: latestAssessment.bodyFatPercentage,
      waistCm: latestAssessment.waistCm,
      hipsCm: latestAssessment.hipsCm,
      isFemale,
      studentName: selectedStudent?.fullName
    });
  }, [latestAssessment, selectedStudent]);

  const handleOpenModal = () => {
    const student = selectedStudent || students[0];
    setNewAssessment({
      studentId: student?.id || 'stud-1',
      proId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      weightKg: student?.currentWeightKg || 65,
      heightCm: student?.heightCm || 168,
      bodyFatPercentage: 20,
      method: 'Pollock 7 Dobras',
      chestCm: 88,
      waistCm: 68,
      hipsCm: 98,
      armsCm: 30,
      thighsCm: 56,
      proObservations: 'Boa adesão aos treinos, evolução muscular evidente.',
    });
    setAppliedReportFeedback(false);
    setIsModalOpen(true);
  };

  const handleApplyRecommendations = () => {
    setNewAssessment(prev => ({
      ...prev,
      proObservations: liveDiagnosis.formattedReportText
    }));
    setAppliedReportFeedback(true);
    setTimeout(() => setAppliedReportFeedback(false), 2500);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAssessment: Omit<PhysicalAssessment, 'id'> = {
      ...newAssessment,
      bmi: liveDiagnosis.bmi,
      bmiCategory: liveDiagnosis.bmiCategoryLabel,
      riskLevel: liveDiagnosis.severity,
      technicalRecommendations: [
        ...liveDiagnosis.trainingRecommendations,
        ...liveDiagnosis.nutritionRecommendations,
        ...liveDiagnosis.healthRecommendations
      ]
    };
    addAssessment(finalAssessment);
    setSelectedStudentId(newAssessment.studentId);
    setIsModalOpen(false);
    alert(`Avaliação física registrada com sucesso para ${students.find(s => s.id === newAssessment.studentId)?.fullName || 'o aluno'}!`);
  };

  const toggleExpandCard = (id: string) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Avaliações Físicas & Medidas <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted">
            Registro antropométrico, dobras cutâneas, percentual de gordura e evolução corporal por aluno.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenModal}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Avaliação</span>
          </Button>
        </div>
      </div>

      {/* 1. SELEÇÃO DE ALUNOS CADASTRADOS */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Alunos Cadastrados & Avaliações</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {students.length} alunos
                </span>
              </CardTitle>
              <CardDescription>
                Selecione o aluno abaixo para alternar e visualizar o gráfico e histórico de avaliações em tempo real
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
              const count = assessments.filter(a => a.studentId === student.id).length;

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
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        count > 0 ? 'bg-primary/20 text-primary' : 'bg-dark-700 text-muted'
                      }`}>
                        {count} {count === 1 ? 'avaliação' : 'avaliações'}
                      </span>
                      <span className="text-[10px] text-muted font-medium">{student.currentWeightKg} kg</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. BANNER DO ALUNO SELECIONADO */}
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
                  Evolução Antropométrica: <span className="text-primary">{selectedStudent?.fullName}</span>
                </h3>
                <Badge variant={selectedStudent?.status === 'active' ? 'success' : 'neutral'} size="sm">
                  {selectedStudent?.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {studentAssessments.length} {studentAssessments.length === 1 ? 'avaliação registrada' : 'avaliações registradas'} • Meta: {selectedStudent?.goal}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {latestDiagnosis && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs ${
                  latestDiagnosis.severity === 'danger'
                    ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400'
                    : latestDiagnosis.severity === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                    : latestDiagnosis.severity === 'info'
                    ? 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                }`}
              >
                {latestDiagnosis.severity === 'danger' && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                {latestDiagnosis.severity === 'warning' && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                {latestDiagnosis.severity === 'info' && <Info className="h-3.5 w-3.5 shrink-0" />}
                {latestDiagnosis.severity === 'safe' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                <span>{latestDiagnosis.badgeLabel} • IMC {latestDiagnosis.bmi}</span>
              </div>
            )}
            {fatDelta !== null && (
              <Badge variant={parseFloat(fatDelta) <= 0 ? 'success' : 'neutral'} size="md">
                <TrendingDown className="h-3.5 w-3.5 mr-1" />
                {parseFloat(fatDelta) > 0 ? `+${fatDelta}%` : `${fatDelta}%`} Gordura
              </Badge>
            )}
            {weightDelta !== null && (
              <Badge variant="primary" size="md">
                <Scale className="h-3.5 w-3.5 mr-1" />
                {parseFloat(weightDelta) > 0 ? `+${weightDelta} kg` : `${weightDelta} kg`} Peso
              </Badge>
            )}
            {studentAssessments.length === 0 && (
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                Sem histórico de medidas
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. GRÁFICO DINÂMICO DE EVOLUÇÃO */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle>Curva de Evolução Física ({selectedStudent?.fullName})</CardTitle>
              <CardDescription>Progresso comparativo de peso, gordura e medidas ao longo das avaliações</CardDescription>
            </div>
            <span className="text-xs text-muted font-semibold bg-surface px-2.5 py-1 rounded-lg border border-border">
              {latestAssessment ? `Última medição: ${formatDate(latestAssessment.date)}` : 'Sem avaliações'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            {evolutionData.length > 0 ? (
              <ResponsiveContainer key={`container-${selectedStudent?.id}`} width="100%" height="100%">
                <LineChart key={`chart-${selectedStudent?.id}`} data={evolutionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#292F38' : '#E2E8F0'} vertical={false} />
                  <XAxis dataKey="data" stroke={isDark ? '#9AA3AF' : '#64748B'} fontSize={12} tickLine={false} />
                  <YAxis stroke={isDark ? '#9AA3AF' : '#64748B'} fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#14171C' : '#FFFFFF',
                      borderColor: isDark ? '#292F38' : '#E2E8F0',
                      borderRadius: 12,
                      color: isDark ? '#F5F7FA' : '#0F172A',
                      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke={isDark ? '#F5F7FA' : '#0F172A'}
                    strokeWidth={2}
                    dot={{ r: 4, fill: isDark ? '#F5F7FA' : '#0F172A' }}
                    name="Peso (kg)"
                    isAnimationActive={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="gordura"
                    stroke="#B8F34A"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#B8F34A' }}
                    name="% Gordura"
                    isAnimationActive={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="cintura"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#38BDF8' }}
                    name="Cintura (cm)"
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-xl bg-surface/30">
                <Scale className="h-10 w-10 text-muted mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-foreground">Nenhuma avaliação encontrada</h4>
                <p className="text-xs text-muted max-w-sm mt-1 mb-4">
                  O aluno {selectedStudent?.fullName} ainda não possui histórico antropométrico registrado.
                </p>
                <Button size="sm" variant="primary" onClick={handleOpenModal}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Registrar 1ª Avaliação
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. CARDS DE HISTÓRICO DE AVALIAÇÕES DO ALUNO */}
      <div>
        <h3 className="text-base font-bold text-foreground mb-3 flex items-center justify-between">
          <span>Histórico Detalhado de Medidas ({sortedRecent.length})</span>
          <span className="text-xs text-muted font-normal">Aluno: <strong className="text-primary">{selectedStudent?.fullName}</strong></span>
        </h3>

        {sortedRecent.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <Scale className="h-8 w-8 text-muted mx-auto opacity-40" />
              <p className="text-sm text-muted">Nenhum registro de avaliação física para este aluno.</p>
              <Button size="sm" variant="outline" onClick={handleOpenModal}>
                <Plus className="h-4 w-4 mr-1.5" />
                Adicionar Avaliação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedRecent.map((item, index) => {
              const itemStudent = students.find(s => s.id === item.studentId) || selectedStudent;
              const isFemaleItem = itemStudent
                ? !['rodrigo', 'gabriel', 'lucas', 'carlos', 'felipe', 'marcos', 'joao', 'pedro'].some(m =>
                    itemStudent.fullName.toLowerCase().includes(m)
                  )
                : true;
              const itemDiag = generateAnthropometricDiagnosis({
                weightKg: item.weightKg,
                heightCm: item.heightCm || itemStudent?.heightCm || 168,
                bodyFatPercentage: item.bodyFatPercentage,
                waistCm: item.waistCm,
                hipsCm: item.hipsCm,
                isFemale: isFemaleItem,
                studentName: itemStudent?.fullName
              });
              const isExpanded = expandedCardId === item.id;

              return (
                <Card key={item.id} className="hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {sortedRecent.length - index}
                        </span>
                        <CardTitle className="text-sm">Avaliação de {formatDate(item.date)}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            itemDiag.severity === 'danger'
                              ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400'
                              : itemDiag.severity === 'warning'
                              ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                              : itemDiag.severity === 'info'
                              ? 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                          }`}
                        >
                          {itemDiag.severity === 'danger' && <AlertTriangle className="h-3 w-3" />}
                          {itemDiag.severity === 'warning' && <AlertTriangle className="h-3 w-3" />}
                          {itemDiag.severity === 'info' && <Info className="h-3 w-3" />}
                          {itemDiag.severity === 'safe' && <CheckCircle2 className="h-3 w-3" />}
                          <span>{itemDiag.badgeLabel}</span>
                        </span>
                        <Badge variant="neutral" size="sm">{item.method}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Key anthropometrics pills (4-col) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-surface border border-border">
                        <span className="block text-[10px] uppercase text-muted font-bold">Peso</span>
                        <span className="text-sm font-black text-foreground">{item.weightKg} kg</span>
                      </div>
                      <div className="p-2 rounded-xl bg-surface border border-border">
                        <span className="block text-[10px] uppercase text-muted font-bold">% Gordura</span>
                        <span className="text-sm font-black text-primary">{item.bodyFatPercentage}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-surface border border-border">
                        <span className="block text-[10px] uppercase text-muted font-bold">IMC OMS</span>
                        <span className="text-sm font-black text-foreground">{itemDiag.bmi}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-surface border border-border">
                        <span className="block text-[10px] uppercase text-muted font-bold">Cintura</span>
                        <span className="text-sm font-black text-foreground">{item.waistCm || '-'} cm</span>
                      </div>
                    </div>

                    {/* Circumferences list */}
                    <div className="p-2.5 rounded-xl bg-surface/40 border border-border/60 text-xs grid grid-cols-3 gap-2 text-muted">
                      <div>Tórax: <strong className="text-foreground">{item.chestCm || '-'} cm</strong></div>
                      <div>Quadril: <strong className="text-foreground">{item.hipsCm || '-'} cm</strong></div>
                      <div>Braço: <strong className="text-foreground">{item.armsCm || '-'} cm</strong></div>
                    </div>

                    {/* Photos Preview if available */}
                    {item.photosUrls && item.photosUrls.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-muted flex items-center gap-1">
                          <Camera className="h-3 w-3 text-primary" /> Fotos de Evolução ({item.photosUrls.length})
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {item.photosUrls.map((photo, pIdx) => (
                            <a
                              key={pIdx}
                              href={photo}
                              target="_blank"
                              rel="noreferrer"
                              className="relative rounded-lg overflow-hidden border border-border aspect-[3/4] group bg-card"
                            >
                              <img src={photo} alt={`Evolução ${pIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-dark-900/80 px-1 rounded text-white">
                                #{pIdx + 1}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pro observations */}
                    <div className="text-xs text-muted leading-relaxed p-2.5 rounded-xl bg-surface/30 border border-border whitespace-pre-line">
                      <strong className="text-foreground">Parecer:</strong> {item.proObservations}
                    </div>


                    {/* Expandable Technical Recommendations */}
                    <button
                      type="button"
                      onClick={() => toggleExpandCard(item.id)}
                      className="w-full text-left flex items-center justify-between p-2 rounded-xl bg-slate-100/70 dark:bg-surface/60 hover:bg-slate-200/60 dark:hover:bg-surface border border-border text-xs font-semibold text-primary transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>Ver Análise Técnica e Recomendações Completas</span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-surface/50 border border-border space-y-2.5 text-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <Activity className="h-4 w-4 text-primary" />
                          <span>{itemDiag.headline}</span>
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed">
                          {itemDiag.clinicalExplanation}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          <div className="p-2 rounded-lg bg-card border border-border">
                            <span className="font-bold text-[11px] text-foreground flex items-center gap-1 mb-1">
                              <Dumbbell className="h-3.5 w-3.5 text-primary" /> Treino:
                            </span>
                            <ul className="list-disc list-inside text-[10px] text-muted space-y-0.5">
                              {itemDiag.trainingRecommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-2 rounded-lg bg-card border border-border">
                            <span className="font-bold text-[11px] text-foreground flex items-center gap-1 mb-1">
                              <Apple className="h-3.5 w-3.5 text-emerald-500" /> Nutrição:
                            </span>
                            <ul className="list-disc list-inside text-[10px] text-muted space-y-0.5">
                              {itemDiag.nutritionRecommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-2 rounded-lg bg-card border border-border">
                            <span className="font-bold text-[11px] text-foreground flex items-center gap-1 mb-1">
                              <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Saúde / Cuidados:
                            </span>
                            <ul className="list-disc list-inside text-[10px] text-muted space-y-0.5">
                              {itemDiag.healthRecommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Photos indicator with privacy notice */}
                    <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <Lock className="h-3 w-3" />
                        <span>Fotos protegidas por criptografia e RLS</span>
                      </div>
                      <span className="text-primary font-bold cursor-pointer hover:underline">
                        Ver fotos
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. MODAL DE NOVA AVALIAÇÃO FÍSICA COM ALERTA E RECOMENDAÇÕES */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nova Avaliação Física"
        description="Preencha as medições antropométricas do aluno selecionado com cálculo de IMC, gordura corporal e risco em tempo real."
        className="max-w-2xl"
      >
        <form onSubmit={handleSaveAssessment} className="space-y-4 max-h-[82vh] overflow-y-auto pr-1">
          <Select
            label="Aluno Avaliado *"
            options={students.map(s => ({ value: s.id, label: s.fullName }))}
            value={newAssessment.studentId}
            onChange={(e) => {
              const sId = e.target.value;
              const std = students.find(s => s.id === sId);
              setNewAssessment({
                ...newAssessment,
                studentId: sId,
                weightKg: std?.currentWeightKg || newAssessment.weightKg,
                heightCm: std?.heightCm || newAssessment.heightCm || 168,
              });
            }}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Data da Avaliação *"
              type="date"
              value={newAssessment.date}
              onChange={(e) => setNewAssessment({ ...newAssessment, date: e.target.value })}
            />
            <Select
              label="Método *"
              options={[
                { value: 'Pollock 7 Dobras', label: 'Pollock 7 Dobras' },
                { value: 'Pollock 3 Dobras', label: 'Pollock 3 Dobras' },
                { value: 'Bioimpedância', label: 'Bioimpedância' },
              ]}
              value={newAssessment.method}
              onChange={(e) => setNewAssessment({ ...newAssessment, method: e.target.value as any })}
            />
          </div>

          {/* Medidas Principais: Peso, Altura e Gordura */}
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Peso Atual (kg) *"
              type="number"
              step="0.1"
              value={newAssessment.weightKg}
              onChange={(e) => setNewAssessment({ ...newAssessment, weightKg: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Altura (cm) *"
              type="number"
              step="1"
              value={newAssessment.heightCm || 168}
              onChange={(e) => setNewAssessment({ ...newAssessment, heightCm: parseFloat(e.target.value) || 168 })}
            />
            <Input
              label="% de Gordura Estimado *"
              type="number"
              step="0.1"
              value={newAssessment.bodyFatPercentage}
              onChange={(e) => setNewAssessment({ ...newAssessment, bodyFatPercentage: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Circunferências Corporais */}
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Cintura (cm)"
              type="number"
              step="0.5"
              value={newAssessment.waistCm}
              onChange={(e) => setNewAssessment({ ...newAssessment, waistCm: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Quadril (cm)"
              type="number"
              step="0.5"
              value={newAssessment.hipsCm}
              onChange={(e) => setNewAssessment({ ...newAssessment, hipsCm: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Braço (cm)"
              type="number"
              step="0.5"
              value={newAssessment.armsCm}
              onChange={(e) => setNewAssessment({ ...newAssessment, armsCm: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* BOX DE DIAGNÓSTICO EM TEMPO REAL & ALERTAS TÉCNICOS */}
          <div
            className={`p-4 rounded-2xl border transition-all space-y-3.5 ${
              liveDiagnosis.severity === 'danger'
                ? 'bg-rose-50/80 border-rose-300 dark:bg-rose-950/20 dark:border-rose-900/60'
                : liveDiagnosis.severity === 'warning'
                ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900/60'
                : liveDiagnosis.severity === 'info'
                ? 'bg-sky-50/80 border-sky-300 dark:bg-sky-950/20 dark:border-sky-900/60'
                : 'bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-900/60'
            }`}
          >
            {/* Header com Status e Grau */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {liveDiagnosis.severity === 'danger' && <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />}
                {liveDiagnosis.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />}
                {liveDiagnosis.severity === 'info' && <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />}
                {liveDiagnosis.severity === 'safe' && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Diagnóstico Antropométrico & Alertas Clínicos
                  </h4>
                  <p className="text-sm font-bold text-foreground">
                    {liveDiagnosis.headline}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-xs ${
                  liveDiagnosis.severity === 'danger'
                    ? 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/50 dark:border-rose-700 dark:text-rose-300'
                    : liveDiagnosis.severity === 'warning'
                    ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/50 dark:border-amber-700 dark:text-amber-300'
                    : liveDiagnosis.severity === 'info'
                    ? 'bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-900/50 dark:border-sky-700 dark:text-sky-300'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/50 dark:border-emerald-700 dark:text-emerald-300'
                }`}
              >
                {liveDiagnosis.badgeLabel}
              </span>
            </div>

            {/* Régua Espectro do IMC */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span className="font-semibold">Escala Oficial OMS de IMC:</span>
                <span className="font-bold text-foreground">
                  IMC: <strong className="text-primary text-xs">{liveDiagnosis.bmi} kg/m²</strong> ({liveDiagnosis.bmiCategoryLabel})
                </span>
              </div>
              <div className="relative w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-dark-700 border border-border">
                <div className="h-full w-[18.5%] bg-sky-400" title="Baixo Peso (< 18.5)" />
                <div className="h-full w-[20%] bg-emerald-400" title="Eutrofia / Normal (18.5 - 24.9)" />
                <div className="h-full w-[16%] bg-amber-400" title="Sobrepeso (25.0 - 29.9)" />
                <div className="h-full w-[16%] bg-orange-400" title="Obesidade Grau I (30.0 - 34.9)" />
                <div className="h-full w-[29.5%] bg-rose-500" title="Obesidade Grau II / III (≥ 35.0)" />
              </div>
              <div className="flex justify-between text-[10px] text-muted font-medium px-0.5">
                <span>&lt; 18.5 Baixo</span>
                <span>18.5-24.9 Normal</span>
                <span>25-29.9 Sobrepeso</span>
                <span>30-34.9 Obes. I</span>
                <span>≥ 35 Obes. II/III</span>
              </div>
            </div>

            {/* Grid de 4 Métricas Calculadas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-card border border-border shadow-xs">
                <span className="block text-[10px] uppercase text-muted font-bold">IMC Oficial</span>
                <span className="text-sm font-black text-foreground">{liveDiagnosis.bmi}</span>
                <span className="block text-[9px] text-muted truncate">{liveDiagnosis.bmiCategoryLabel}</span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border shadow-xs">
                <span className="block text-[10px] uppercase text-muted font-bold">% Gordura</span>
                <span className="text-sm font-black text-primary">{liveDiagnosis.bodyFatPercentage}%</span>
                <span className="block text-[9px] text-muted truncate">{liveDiagnosis.bodyFatLabel}</span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border shadow-xs">
                <span className="block text-[10px] uppercase text-muted font-bold">RCQ (Cintura/Quad.)</span>
                <span className="text-sm font-black text-foreground">{liveDiagnosis.waistToHipRatio || '-'}</span>
                <span className="block text-[9px] text-muted truncate">
                  {liveDiagnosis.cardioRiskLabel || 'Informe cintura/quadril'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border shadow-xs">
                <span className="block text-[10px] uppercase text-muted font-bold">RCE (Cintura/Alt.)</span>
                <span className="text-sm font-black text-foreground">{liveDiagnosis.waistToHeightRatio || '-'}</span>
                <span className="block text-[9px] text-muted truncate">
                  {liveDiagnosis.waistToHeightRatio && liveDiagnosis.waistToHeightRatio < 0.5 ? 'Normal (< 0.50)' : 'Risco Aumentado'}
                </span>
              </div>
            </div>

            {/* Explicação Clínica */}
            <p className="text-xs text-muted leading-relaxed bg-card/60 p-2.5 rounded-xl border border-border/80">
              <strong className="text-foreground">Parecer Fisiológico:</strong> {liveDiagnosis.clinicalExplanation}
            </p>

            {/* Recomendações Estruturadas em 3 Blocos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
                <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <Dumbbell className="h-3.5 w-3.5 text-primary" /> Prescrição de Treino:
                </span>
                <ul className="list-disc list-inside text-[11px] text-muted space-y-1">
                  {liveDiagnosis.trainingRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
                <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <Apple className="h-3.5 w-3.5 text-emerald-500" /> Diretrizes Nutricionais:
                </span>
                <ul className="list-disc list-inside text-[11px] text-muted space-y-1">
                  {liveDiagnosis.nutritionRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border shadow-xs space-y-1">
                <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Monitoramento & Saúde:
                </span>
                <ul className="list-disc list-inside text-[11px] text-muted space-y-1">
                  {liveDiagnosis.healthRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ação Rápida para Inserir no Parecer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-border/60">
              <span className="text-[11px] text-muted">
                Deseja incluir esta análise técnica automaticamente no laudo do aluno?
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyRecommendations}
                className={`text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                  appliedReportFeedback
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'border-primary/50 text-primary hover:bg-primary/10'
                }`}
              >
                {appliedReportFeedback ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                    <span>✓ Recomendações Inseridas no Parecer!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Inserir Diagnóstico no Parecer</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Registro Fotográfico da Avaliação Física */}
          <div className="space-y-2 p-3.5 rounded-xl bg-surface border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-primary" />
                  <span>Fotos de Evolução (Frente, Costas e Perfil)</span>
                </label>
                <p className="text-[11px] text-muted">
                  Anexe fotos para comparativo de antes/depois e acompanhamento postural
                </p>
              </div>

              <label className="cursor-pointer shrink-0">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-background hover:bg-primary-hover shadow-sm transition-all cursor-pointer">
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>{isUploadingPhoto ? 'Enviando...' : 'Anexar Fotos'}</span>
                </span>
              </label>
            </div>

            {/* Preview of Uploaded Photos */}
            {newAssessment.photosUrls && newAssessment.photosUrls.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {newAssessment.photosUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-border bg-card aspect-[3/4]">
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-rose-600/90 text-white hover:bg-rose-600 transition-colors shadow-sm"
                      title="Remover foto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-dark-900/80 px-1.5 py-0.5 rounded text-white">
                      Foto {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-3 text-center text-xs text-muted">
                Nenhuma foto anexada nesta avaliação. Clique em "Anexar Fotos" acima para adicionar.
              </div>
            )}
          </div>

          {/* Campo de Parecer Técnico e Recomendações (Multilinha) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">

              Parecer Técnico e Recomendações *
            </label>
            <textarea
              rows={4}
              value={newAssessment.proObservations}
              onChange={(e) => setNewAssessment({ ...newAssessment, proObservations: e.target.value })}
              className="w-full p-3 text-xs rounded-xl bg-card border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors shadow-xs"
              placeholder="Digite o parecer técnico e recomendações ou clique em 'Inserir Diagnóstico no Parecer' acima..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Avaliação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
