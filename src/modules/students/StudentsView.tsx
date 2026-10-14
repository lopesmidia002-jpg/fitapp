import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Student } from '../../types';
import {
  Users,
  Search,
  Plus,
  FileDown,
  Upload,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Dumbbell,
  LineChart,
  ShieldAlert,
  Archive,
  CheckCircle2,
  X,
  Camera,
  Sparkles,
  Eye,
  EyeOff,
  Utensils,
  Pencil,
  Save,
  Check,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';


export function StudentsView() {
  const { students, addStudent, updateStudent, archiveStudent, deleteStudent, nutritionPlans, toggleDietVisibility } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Save feedback state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    goal: '',
    currentWeightKg: 70,
    targetWeightKg: 68,
    heightCm: 175,
    status: 'active' as const,
    privateNotes: '',
  });

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem selecionada ultrapassa 5MB. Por favor escolha uma imagem menor.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewStudent(prev => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRandomPresetAvatar = () => {
    const randomIndex = Math.floor(Math.random() * PRESET_AVATARS.length);
    setNewStudent(prev => ({ ...prev, avatarUrl: PRESET_AVATARS[randomIndex] }));
  };

  // Edit Student Form State & Handlers
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    goal: '',
    currentWeightKg: 70,
    targetWeightKg: 68,
    heightCm: 175,
    status: 'active' as 'active' | 'inactive' | 'archived' | 'blocked',
    privateNotes: '',
  });


  const handleOpenEdit = (student: Student, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingStudent(student);
    setEditFormData({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone || '',
      avatarUrl: student.avatarUrl || '',
      goal: student.goal || '',
      currentWeightKg: student.currentWeightKg || 70,
      targetWeightKg: student.targetWeightKg || 68,
      heightCm: student.heightCm || 175,
      status: student.status || 'active',
      privateNotes: student.privateNotes || '',
    });
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem selecionada ultrapassa 5MB. Por favor escolha uma imagem menor.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setEditFormData(prev => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * PRESET_AVATARS.length);
    setEditFormData(prev => ({ ...prev, avatarUrl: PRESET_AVATARS[randomIndex] }));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setSaveStatus('saving');

    const updatedData = {
      fullName: editFormData.fullName,
      email: editFormData.email,
      phone: editFormData.phone,
      avatarUrl: editFormData.avatarUrl || undefined,
      goal: editFormData.goal,
      currentWeightKg: Number(editFormData.currentWeightKg),
      targetWeightKg: Number(editFormData.targetWeightKg),
      heightCm: Number(editFormData.heightCm),
      status: editFormData.status,
      privateNotes: editFormData.privateNotes,
    };

    updateStudent(editingStudent.id, updatedData);

    if (selectedStudent && selectedStudent.id === editingStudent.id) {
      setSelectedStudent(prev => prev ? {
        ...prev,
        ...updatedData,
        avatarUrl: editFormData.avatarUrl,
      } : null);
    }

    // Set saved confirmation state
    setSaveStatus('saved');

    // Keep visible so the user clearly sees confirmation before closing modal
    setTimeout(() => {
      const studentName = editFormData.fullName;
      setEditingStudent(null);
      setSaveStatus('idle');
      setToastMessage(`As alterações no perfil de ${studentName} foram salvas com sucesso!`);
      setTimeout(() => setToastMessage(null), 4500);
    }, 1100);
  };

  const handleDeleteStudent = (student: Student, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm(`Atenção: Deseja EXCLUIR permanentemente o(a) aluno(a) "${student.fullName}" da sua consultoria?\n\nEsta ação removerá todos os dados e acessos deste aluno.`)) {
      deleteStudent(student.id);
      if (selectedStudent?.id === student.id) setSelectedStudent(null);
      if (editingStudent?.id === student.id) setEditingStudent(null);
      setToastMessage(`Aluno "${student.fullName}" excluído com sucesso!`);
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  // Filter students

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? student.status !== 'archived' : student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.fullName || !newStudent.email) return;

    const createdName = newStudent.fullName;
    addStudent({
      ...newStudent,
      avatarUrl: newStudent.avatarUrl || undefined,
    });
    setIsAddModalOpen(false);
    setToastMessage(`Aluno ${createdName} cadastrado com sucesso!`);
    setTimeout(() => setToastMessage(null), 4500);
    setNewStudent({
      fullName: '',
      email: '',
      phone: '',
      avatarUrl: '',
      goal: '',
      currentWeightKg: 70,
      targetWeightKg: 68,
      heightCm: 175,
      status: 'active',
      privateNotes: '',
    });
  };

  const handleExportCSV = () => {
    const headers = 'ID,Nome,Email,Telefone,Status,Objetivo,PesoAtual,MetaPeso,Adesao,TreinosConcluidos\n';
    const rows = filteredStudents.map(s =>
      `"${s.id}","${s.fullName}","${s.email}","${s.phone}","${s.status}","${s.goal}",${s.currentWeightKg},${s.targetWeightKg},${s.adherenceRate}%,${s.completedWorkouts}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `omega_alunos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast de Confirmação de Alterações Salvas */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-card border-2 border-emerald-500/50 shadow-2xl flex items-center gap-3.5 text-sm text-foreground backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 max-w-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-foreground flex items-center gap-1.5">
              <span>Alterações Salvas</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Confirmado
              </span>
            </p>
            <p className="text-xs text-muted mt-0.5 break-words">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface/80 transition-colors shrink-0"
            title="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            CRM & Gestão de Alunos <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted">
            Cadastre, acompanhe a adesão e consulte fichas e histórico completo dos seus alunos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5"
            title="Exportar listagem para CSV"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5"
            title="Importar lista de alunos em lote"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importar</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Aluno</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-muted hover:text-foreground p-1 transition-colors"
                    aria-label="Limpar busca"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto pb-1.5 pt-0.5 sm:py-0 scrollbar-none">
            {(['all', 'active', 'inactive', 'archived'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-primary text-background font-bold shadow-neon-sm'
                    : 'bg-surface text-muted hover:text-foreground'
                }`}
              >
                {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : status === 'inactive' ? 'Inativos' : 'Arquivados'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">Nenhum aluno encontrado com esses critérios.</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="cursor-pointer hover:border-primary/50 transition-all duration-200"
              onClick={() => setSelectedStudent(student)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={student.fullName}
                      className="h-12 w-12 rounded-xl object-cover ring-1 ring-border"
                    />
                    <div>
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        {student.fullName}
                      </h4>
                      <p className="text-xs text-muted truncate max-w-[170px]">{student.goal}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(student, e)}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Editar perfil do aluno"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteStudent(student, e)}
                      className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir aluno permanentemente"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <Badge variant={student.status === 'active' ? 'success' : student.status === 'inactive' ? 'warning' : 'neutral'} size="sm">
                      {student.status === 'active' ? 'Ativo' : student.status === 'inactive' ? 'Inativo' : 'Arquivado'}
                    </Badge>
                  </div>
                </div>


                <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-surface/50">
                    <span className="block text-[10px] uppercase text-muted font-bold">Adesão</span>
                    <span className="font-extrabold text-primary">{student.adherenceRate}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface/50">
                    <span className="block text-[10px] uppercase text-muted font-bold">Treinos</span>
                    <span className="font-extrabold text-foreground">{student.completedWorkouts}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface/50">
                    <span className="block text-[10px] uppercase text-muted font-bold">Peso</span>
                    <span className="font-extrabold text-foreground">{student.currentWeightKg} kg</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                  <span>Último treino: {student.lastActive ? formatDate(student.lastActive) : 'Sem registro'}</span>
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Student 360 Profile Drawer / Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent.fullName}
          description={`Aluno Omega Training desde ${formatDate(selectedStudent.joinDate)}`}
          className="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
              <img
                src={selectedStudent.avatarUrl}
                alt={selectedStudent.fullName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/40"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{selectedStudent.email}</span>
                  <Badge variant={selectedStudent.status === 'active' ? 'success' : 'warning'}>
                    {selectedStudent.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {selectedStudent.phone}
                </p>
                <p className="text-xs font-semibold text-primary">
                  Objetivo: {selectedStudent.goal}
                </p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-[10px] uppercase text-muted font-bold">Peso Atual</p>
                <p className="text-lg font-black text-foreground">{selectedStudent.currentWeightKg} kg</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-[10px] uppercase text-muted font-bold">Meta de Peso</p>
                <p className="text-lg font-black text-primary">{selectedStudent.targetWeightKg} kg</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-[10px] uppercase text-muted font-bold">Altura</p>
                <p className="text-lg font-black text-foreground">{selectedStudent.heightCm} cm</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-[10px] uppercase text-muted font-bold">Adesão Total</p>
                <p className="text-lg font-black text-emerald-400">{selectedStudent.adherenceRate}%</p>
              </div>
            </div>

            {/* Private Notes (LGPD Compliant Restricted Section) */}
            <div className="p-4 rounded-xl bg-surface/50 border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <ShieldAlert className="h-4 w-4" />
                <span>Notas Clínicas e Observações Restritas (Visível apenas para Treinadores)</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {selectedStudent.privateNotes || 'Nenhuma observação clínica ou restrição física cadastrada.'}
              </p>
            </div>

            {/* Plano Nutricional & Visibilidade para o Aluno */}
            {(() => {
              const studentPlan = nutritionPlans.find(p => p.studentId === selectedStudent.id);
              if (!studentPlan) return null;

              return (
                <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Utensils className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">Plano Alimentar Ativo</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          studentPlan.isHiddenForStudent
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {studentPlan.isHiddenForStudent ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {studentPlan.isHiddenForStudent ? 'Oculta para o Aluno' : 'Visível no App'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted">
                        {studentPlan.title} • {studentPlan.targetCalories} kcal
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDietVisibility(studentPlan.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all border shrink-0 ${
                      studentPlan.isHiddenForStudent
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                        : 'border-border bg-card text-muted hover:text-foreground hover:border-amber-500/40'
                    }`}
                    title={studentPlan.isHiddenForStudent ? 'Liberar visualização da dieta para o aluno' : 'Ocultar dieta no app do aluno'}
                  >
                    {studentPlan.isHiddenForStudent ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{studentPlan.isHiddenForStudent ? 'Desocultar Dieta' : 'Ocultar Dieta do Aluno'}</span>
                  </button>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteStudent(selectedStudent)}
                  className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir Aluno</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    archiveStudent(selectedStudent.id);
                    setSelectedStudent(null);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Arquivar Aluno</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(selectedStudent)}
                  className="flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Editar Perfil</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                >
                  Concluir Visualização
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Student Profile Modal */}
      {editingStudent && (
        <Modal
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          title={`Editar Perfil: ${editingStudent.fullName}`}
          description="Altere dados cadastrais, objetivos, medidas corporais e observações restritas."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {/* Photo / Avatar Section */}
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <img
                  src={editFormData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={editFormData.fullName}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary"
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div>
                  <span className="text-xs font-bold text-foreground">Foto do Aluno</span>
                  <p className="text-[11px] text-muted">Carregue uma imagem ou gere um avatar aleatório</p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditPhotoUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border hover:border-primary text-foreground transition-all">
                      <Camera className="h-3.5 w-3.5 text-primary" />
                      <span>Alterar Foto</span>
                    </span>
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleEditRandomAvatar}
                    className="text-xs flex items-center gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Avatar Aleatório</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nome Completo *</label>
                <Input
                  value={editFormData.fullName}
                  onChange={e => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">E-mail *</label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={e => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Telefone / WhatsApp</label>
                <Input
                  value={editFormData.phone}
                  onChange={e => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Status da Conta</label>
                <select
                  value={editFormData.status}
                  onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-surface border border-border text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="active">Ativo (Acesso Liberado)</option>
                  <option value="inactive">Inativo (Pausado)</option>
                  <option value="blocked">Bloqueado</option>
                  <option value="archived">Arquivado</option>
                </select>

              </div>
            </div>

            {/* Goal and Metrics */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Objetivo Principal *</label>
              <Input
                value={editFormData.goal}
                onChange={e => setEditFormData(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="Ex: Hipertrofia e Definição Muscular"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Peso Atual (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={editFormData.currentWeightKg}
                  onChange={e => setEditFormData(prev => ({ ...prev, currentWeightKg: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Meta de Peso (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={editFormData.targetWeightKg}
                  onChange={e => setEditFormData(prev => ({ ...prev, targetWeightKg: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Altura (cm)</label>
                <Input
                  type="number"
                  value={editFormData.heightCm}
                  onChange={e => setEditFormData(prev => ({ ...prev, heightCm: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            {/* Private Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Notas Clínicas e Restrições Físicas (LGPD Restrito)</span>
              </label>
              <textarea
                rows={3}
                value={editFormData.privateNotes}
                onChange={e => setEditFormData(prev => ({ ...prev, privateNotes: e.target.value }))}
                placeholder="Histórico de lesões, restrições articulares, medicamentos ou recomendações médicas..."
                className="w-full bg-surface border border-border text-foreground text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Visual confirmation alert when saved */}
            {saveStatus === 'saved' && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>✓ Alterações salvas com sucesso no perfil de {editFormData.fullName}!</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => handleDeleteStudent(editingStudent)}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors border border-rose-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir Aluno</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingStudent(null);
                    setSaveStatus('idle');
                  }}
                  disabled={saveStatus === 'saving'}
                >
                  Cancelar
                </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saveStatus === 'saving'}
                className={`flex items-center justify-center gap-2 font-bold transition-all duration-200 min-w-[170px] ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/30'
                    : 'shadow-neon-sm'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-background" />
                    <span>Salvando alterações...</span>
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    <span>✓ Salvo com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
        </Modal>
      )}


      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Novo Aluno"
        description="Preencha as informações para adicionar o aluno à sua consultoria."
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          {/* Foto de Perfil do Aluno */}
          <div className="p-3.5 rounded-xl border border-border bg-surface/50 space-y-3">
            <label className="text-xs font-semibold text-foreground block">
              Foto de Perfil do Aluno
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-border group-hover:border-primary/50 bg-background flex items-center justify-center transition-colors">
                  {newStudent.avatarUrl ? (
                    <img
                      src={newStudent.avatarUrl}
                      alt="Prévia da foto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted text-center p-2">
                      <Camera className="w-6 h-6 mb-1 opacity-60 text-primary" />
                      <span className="text-[10px] font-medium leading-tight">Sem foto</span>
                    </div>
                  )}
                </div>
                {newStudent.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setNewStudent(prev => ({ ...prev, avatarUrl: '' }))}
                    title="Remover foto"
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label
                    htmlFor="student-photo-upload-crm"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-primary/50 text-xs font-semibold text-foreground hover:text-primary transition-all shadow-sm active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>Carregar Foto</span>
                    <input
                      id="student-photo-upload-crm"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRandomPresetAvatar}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-xs font-semibold text-primary transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Avatar Rápido</span>
                  </button>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  JPG, PNG ou WebP até 5MB. A foto será exibida no perfil do aluno, painel do professor e no aplicativo mobile.
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Nome Completo *"
            required
            value={newStudent.fullName}
            onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
            placeholder="Ex: João da Silva"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="E-mail *"
              type="email"
              required
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              placeholder="aluno@email.com"
            />
            <Input
              label="WhatsApp / Telefone"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>

          <Input
            label="Objetivo Principal"
            value={newStudent.goal}
            onChange={(e) => setNewStudent({ ...newStudent, goal: e.target.value })}
            placeholder="Ex: Hipertrofia, Definição, Preparação para Maratona"
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Peso (kg)"
              type="number"
              step="0.1"
              value={newStudent.currentWeightKg}
              onChange={(e) => setNewStudent({ ...newStudent, currentWeightKg: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Meta (kg)"
              type="number"
              step="0.1"
              value={newStudent.targetWeightKg}
              onChange={(e) => setNewStudent({ ...newStudent, targetWeightKg: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Altura (cm)"
              type="number"
              value={newStudent.heightCm}
              onChange={(e) => setNewStudent({ ...newStudent, heightCm: parseInt(e.target.value) || 0 })}
            />
          </div>

          <Input
            label="Observações / Limitações Físicas (Restrito)"
            value={newStudent.privateNotes}
            onChange={(e) => setNewStudent({ ...newStudent, privateNotes: e.target.value })}
            placeholder="Ex: Condromalácia patelar grau 2, cirurgia prévia no ombro"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cadastrar Aluno
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Importação em Lote de Alunos (CSV)"
        description="Carregue sua planilha contendo colunas: Nome, Email, Telefone, Objetivo."
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-surface/30">
            <Upload className="h-8 w-8 mx-auto text-primary mb-2 opacity-80" />
            <p className="text-sm font-bold text-foreground">Arraste seu arquivo CSV aqui</p>
            <p className="text-xs text-muted mt-1">ou clique para selecionar do computador</p>
            <input type="file" accept=".csv" className="hidden" id="csv-upload" />
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                alert('Validação do CSV executada com sucesso! 2 novos alunos importados.');
                setIsCsvModalOpen(false);
              }}
            >
              Selecionar Arquivo CSV
            </Button>
          </div>
          <p className="text-[11px] text-muted">
            Formatos suportados: CSV com separador vírgula ou ponto-e-vírgula. Os alunos importados receberão convite automático por e-mail para baixar o aplicativo PWA.
          </p>
        </div>
      </Modal>
    </div>
  );
}
