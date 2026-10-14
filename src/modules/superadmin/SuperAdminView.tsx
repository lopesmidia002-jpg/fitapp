import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MetricCard } from '../../components/ui/MetricCard';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  ShieldCheck,
  Building,
  Users,
  Server,
  Lock,
  Plus,
  Search,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  Key,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Phone,
  Mail,
  ShieldAlert,
  Send,
  Share2,
  ExternalLink,
  MessageSquare,
  Smartphone,
  Camera,
  Upload,
  X,
  Sparkles,
  Award,
  Dumbbell,
  GraduationCap,
  Settings,
  Menu,
  LogOut
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Student, Trainer } from '../../types';

interface AuditLog {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
  ip: string;
}

export function SuperAdminView() {
  const {
    students,
    addStudent,
    blockStudent,
    unblockStudent,
    deleteStudent,
    resetStudentPassword,
    trainers,
    addTrainer,
    updateTrainer,
    blockTrainer,
    unblockTrainer,
    deleteTrainer,
    resetTrainerPassword,
    organization,
    updateOrganization,
    adminCredentials,
    updateAdminPassword,
    logoutAdmin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'trainers' | 'students' | 'tenants' | 'audit' | 'settings'>('trainers');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [newMasterPasswordInput, setNewMasterPasswordInput] = useState('');

  // Search and filters for students credentials
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Password visibility map (studentId -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modal: Register new student with login & password
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    temporaryPassword: 'Fit@' + Math.floor(1000 + Math.random() * 9000),
    goal: 'Hipertrofia e Condicionamento',
    currentWeightKg: 70,
    targetWeightKg: 68,
    heightCm: 175,
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
        setRegisterForm(prev => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRandomPresetAvatar = () => {
    const randomIndex = Math.floor(Math.random() * PRESET_AVATARS.length);
    setRegisterForm(prev => ({ ...prev, avatarUrl: PRESET_AVATARS[randomIndex] }));
  };

  // Modal: Reset password
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [targetStudentForReset, setTargetStudentForReset] = useState<Student | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Modal: Send Access Link
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [targetStudentForShare, setTargetStudentForShare] = useState<Student | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const getStudentAccessLink = (student: Student) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${pathname}?access=student&id=${student.id}&login=${encodeURIComponent(student.email)}`;
  };

  const getStudentInviteMessage = (student: Student) => {
    const link = getStudentAccessLink(student);
    const pwd = student.temporaryPassword || 'Omega@2026';
    const cleanEmail = (student.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining');
    return `⚡ *Omega Training — Acesso do Aluno*

Olá, *${student.fullName}*!
Seu acesso ao seu aplicativo exclusivo de treinos Omega Training já está liberado.

📱 *Acesse seu app por este link direto:*
${link}

🔑 *Suas Credenciais de Acesso:*
• *Login (E-mail):* ${cleanEmail}
• *Senha Inicial:* ${pwd}

🔒 *Instruções de Acesso:*
1. Clique no link acima;
2. Digite sua senha de acesso na tela inicial para entrar diretamente no ambiente do aluno;
3. No celular (Chrome ou Safari), toque em *"Adicionar à Tela de Início"* para salvar como aplicativo.

Bons treinos! 🔥`;
  };

  const handleOpenShareModal = (student: Student) => {
    setTargetStudentForShare(student);
    setIsShareModalOpen(true);
  };

  const handleCopyStudentLink = (student: Student) => {
    const link = getStudentAccessLink(student);
    handleCopy(link, `link-${student.id}`);
    setShareToast('Link copiado para a área de transferência!');
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleCopyInviteMessage = (student: Student) => {
    const msg = getStudentInviteMessage(student);
    handleCopy(msg, `msg-${student.id}`);
    setShareToast('Mensagem de convite copiada!');
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleSendWhatsApp = (student: Student) => {
    const msg = getStudentInviteMessage(student);
    let phoneDigits = (student.phone || '').replace(/\D/g, '');
    if (phoneDigits.length === 10 || phoneDigits.length === 11) {
      phoneDigits = '55' + phoneDigits;
    }
    const waUrl = phoneDigits
      ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    addAuditLog('INVITE_LINK_SENT_WHATSAPP', `${student.fullName} (${student.phone || 'WhatsApp'})`);
  };

  const handleSendEmail = (student: Student) => {
    const msg = getStudentInviteMessage(student);
    const subject = encodeURIComponent('Seu Acesso ao Omega Training');
    const body = encodeURIComponent(msg);
    const cleanEmail = (student.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining');
    window.open(`mailto:${cleanEmail}?subject=${subject}&body=${body}`, '_blank');
    addAuditLog('INVITE_LINK_SENT_EMAIL', `${student.fullName} (${cleanEmail})`);
  };

  // Internal Audit Logs with live logging
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log-1', action: 'SECURITY_CREDENTIALS_ROTATED', target: 'Omega Training', user: 'admin@omegatraining.pro', timestamp: '2026-10-14 08:30:12', ip: '189.45.12.98' },
    { id: 'log-2', action: 'AUTH_RLS_POLICY_CHECK', target: 'Supabase PostgreSQL', user: 'system', timestamp: '2026-10-14 06:00:00', ip: '127.0.0.1' },
    { id: 'log-3', action: 'NEW_ORGANIZATION_ONBOARDED', target: 'CrossElite Academy', user: 'onboarding-worker', timestamp: '2026-10-13 19:42:05', ip: '201.17.88.4' },
  ]);

  const addAuditLog = (action: string, target: string) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      target,
      user: 'admin@omegatraining.pro',
      timestamp,
      ip: '127.0.0.1 (Sessão Local)',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const mockOrganizations = [
    { id: 'org-1', name: 'Omega Training', slug: 'omega-training', students: students.length, status: 'active', createdAt: '2025-01-15' },
    { id: 'org-2', name: 'Studio Iron & Pulse', slug: 'iron-pulse', students: 142, status: 'active', createdAt: '2025-03-20' },
    { id: 'org-3', name: 'Consultoria Personal Lucas', slug: 'lucas-fit', students: 12, status: 'active', createdAt: '2025-05-10' },
    { id: 'org-4', name: 'CrossElite Academy', slug: 'cross-elite', students: 185, status: 'active', createdAt: '2025-06-02' },
  ];

  const totalGlobalStudents = mockOrganizations.reduce((sum, o) => sum + o.students, 0);

  // Active / Blocked calculations
  const activeStudentsList = students.filter(s => !s.accessBlocked && s.status !== 'blocked');
  const blockedStudentsList = students.filter(s => s.accessBlocked || s.status === 'blocked');

  // Filtered students for table
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const isBlocked = s.accessBlocked || s.status === 'blocked';
    if (statusFilter === 'active') return matchesSearch && !isBlocked;
    if (statusFilter === 'blocked') return matchesSearch && isBlocked;
    return matchesSearch;
  });

  const togglePasswordVisibility = (studentId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = 'Fit@';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRegisterForm(prev => ({ ...prev, temporaryPassword: result }));
  };

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName || !registerForm.email) return;

    const finalAvatar = registerForm.avatarUrl || `https://images.unsplash.com/photo-${1534528741775 + students.length}?auto=format&fit=crop&w=150&q=80`;
    const generatedId = `stud-${Date.now()}`;
    addStudent({
      fullName: registerForm.fullName,
      email: registerForm.email,
      phone: registerForm.phone,
      avatarUrl: registerForm.avatarUrl || undefined,
      goal: registerForm.goal,
      currentWeightKg: Number(registerForm.currentWeightKg),
      targetWeightKg: Number(registerForm.targetWeightKg),
      heightCm: Number(registerForm.heightCm),
      status: 'active',
      temporaryPassword: registerForm.temporaryPassword,
      accessBlocked: false,
    });

    addAuditLog('STUDENT_REGISTERED_WITH_CREDENTIALS', `${registerForm.fullName} (${registerForm.email})`);
    setIsRegisterModalOpen(false);

    // Prompt immediate sharing modal
    const createdStudent: Student = {
      id: generatedId,
      organizationId: organization.id,
      proId: 'user-pro-1',
      fullName: registerForm.fullName,
      email: registerForm.email,
      phone: registerForm.phone,
      avatarUrl: finalAvatar,
      goal: registerForm.goal,
      currentWeightKg: Number(registerForm.currentWeightKg),
      targetWeightKg: Number(registerForm.targetWeightKg),
      heightCm: Number(registerForm.heightCm),
      status: 'active',
      temporaryPassword: registerForm.temporaryPassword,
      accessBlocked: false,
      joinDate: new Date().toISOString().split('T')[0],
      adherenceRate: 100,
      completedWorkouts: 0,
      lastActive: new Date().toISOString(),
    };

    setTargetStudentForShare(createdStudent);
    setIsShareModalOpen(true);
    setShareToast('Aluno cadastrado com sucesso! Envie o link de acesso abaixo.');

    setRegisterForm({
      fullName: '',
      email: '',
      phone: '',
      avatarUrl: '',
      temporaryPassword: 'Fit@' + Math.floor(1000 + Math.random() * 9000),
      goal: 'Hipertrofia e Condicionamento',
      currentWeightKg: 70,
      targetWeightKg: 68,
      heightCm: 175,
    });
  };

  const handleBlockStudent = (student: Student) => {
    const reason = prompt(`Confirma o bloqueio de acesso para ${student.fullName}?\nInforme o motivo do bloqueio:`, 'Suspensão de acesso pelo Administrador');
    if (reason !== null) {
      blockStudent(student.id, reason);
      addAuditLog('USER_ACCESS_BLOCKED', `${student.fullName} — Motivo: ${reason}`);
    }
  };

  const handleUnblockStudent = (student: Student) => {
    if (confirm(`Deseja desbloquear e restaurar o acesso de ${student.fullName}?`)) {
      unblockStudent(student.id);
      addAuditLog('USER_ACCESS_RESTORED', `${student.fullName} (${student.email})`);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Atenção: Deseja EXCLUIR permanentemente o aluno "${student.fullName}" da plataforma?\n\nO cadastro e todas as credenciais de acesso serão removidos.`)) {
      deleteStudent(student.id);
      addAuditLog('STUDENT_ACCOUNT_EXCLUDED', `${student.fullName} — Excluído permanentemente da plataforma`);
      setShareToast(`Aluno "${student.fullName}" excluído com sucesso!`);
      setTimeout(() => setShareToast(null), 3500);
    }
  };

  const handleOpenResetModal = (student: Student) => {
    setTargetStudentForReset(student);
    setNewPasswordInput('Fit@' + Math.floor(1000 + Math.random() * 9000));
    setIsResetModalOpen(true);
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForReset || !newPasswordInput) return;

    resetStudentPassword(targetStudentForReset.id, newPasswordInput);
    addAuditLog('STUDENT_PASSWORD_RESET', `${targetStudentForReset.fullName} (${targetStudentForReset.email})`);
    setIsResetModalOpen(false);
    alert(`Senha de ${targetStudentForReset.fullName} atualizada com sucesso para: ${newPasswordInput}`);
  };

  // ==========================================
  // TRAINER MANAGEMENT STATE & LOGIC
  // ==========================================
  const [trainerSearchQuery, setTrainerSearchQuery] = useState('');
  const [trainerStatusFilter, setTrainerStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [visibleTrainerPasswords, setVisibleTrainerPasswords] = useState<Record<string, boolean>>({});

  const toggleTrainerPasswordVisibility = (trainerId: string) => {
    setVisibleTrainerPasswords(prev => ({
      ...prev,
      [trainerId]: !prev[trainerId],
    }));
  };

  // Modal: Register new trainer
  const [isTrainerRegisterModalOpen, setIsTrainerRegisterModalOpen] = useState(false);
  const [trainerRegisterForm, setTrainerRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cref: '',
    specialty: 'Hipertrofia & Musculação Avançada',
    avatarUrl: '',
    temporaryPassword: 'Omega@' + Math.floor(1000 + Math.random() * 9000),
  });

  const PRESET_TRAINER_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80',
  ];

  const handleTrainerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setTrainerRegisterForm(prev => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRandomPresetTrainerAvatar = () => {
    const randomIndex = Math.floor(Math.random() * PRESET_TRAINER_AVATARS.length);
    setTrainerRegisterForm(prev => ({ ...prev, avatarUrl: PRESET_TRAINER_AVATARS[randomIndex] }));
  };

  // Modal: Send Access Link to Trainer
  const [isTrainerShareModalOpen, setIsTrainerShareModalOpen] = useState(false);
  const [targetTrainerForShare, setTargetTrainerForShare] = useState<Trainer | null>(null);

  // Modal: Reset Trainer Password
  const [isTrainerResetModalOpen, setIsTrainerResetModalOpen] = useState(false);
  const [targetTrainerForReset, setTargetTrainerForReset] = useState<Trainer | null>(null);
  const [trainerNewPasswordInput, setTrainerNewPasswordInput] = useState('');

  // Organization Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    orgName: organization.name || 'Omega Training',
    orgSlug: organization.slug || 'omega-training',
    slogan: 'Plataforma Fitness & Alta Performance',
    symbol: 'Ω',
    supportPhone: '(11) 98765-4321',
    supportEmail: 'contato@omegatraining.pro',
    defaultPasswordPrefix: 'Omega@',
    requireConsent: true,
    maxStudents: organization.maxStudents || 50,
  });
  const [settingsToast, setSettingsToast] = useState<string | null>(null);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name: settingsForm.orgName,
      slug: settingsForm.orgSlug,
      maxStudents: Number(settingsForm.maxStudents),
    });
    addAuditLog('ORGANIZATION_SETTINGS_UPDATED', `${settingsForm.orgName} (Parâmetros Globais da Empresa)`);
    setIsSettingsSaved(true);
    setSettingsToast('Configurações salvas e aplicadas com sucesso!');
    setTimeout(() => {
      setIsSettingsSaved(false);
      setSettingsToast(null);
    }, 3500);
  };

  const getTrainerAccessLink = (trainer: Trainer) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${pathname}?access=pro&id=${trainer.id}&login=${encodeURIComponent(trainer.email)}`;
  };

  const getTrainerInviteMessage = (trainer: Trainer) => {
    const link = getTrainerAccessLink(trainer);
    const pwd = trainer.temporaryPassword || 'Omega@2026';
    const cleanEmail = (trainer.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining');
    return `⚡ *Omega Training — Acesso de Treinador (Coach)*

Olá, Professor(a) *${trainer.fullName}*!
Seu acesso profissional à plataforma Omega Training foi configurado com sucesso.

🏆 *Portal do Treinador (Acesso Direto):*
${link}

🔑 *Credenciais de Login:*
• *Login (E-mail):* ${cleanEmail}
• *Senha Provisória:* ${pwd}
• *CREF:* ${trainer.cref || 'Confirmado'}
• *Especialidade:* ${trainer.specialty || 'Treinamento & Musculação'}

🔒 *Instruções de Acesso:*
1. Clique no link acima;
2. Digite sua senha de acesso na tela de login para validar sua conta de treinador;
3. Acesse seu painel completo para gerenciar alunos, treinos e dietas.

🎯 *Recursos do Painel:*
• Prescrição e periodização completa de treinos
• Montagem de dietas e cardápios com a Tabela TACO
• Avaliações físicas, bioimpedância e acompanhamento de metas
• Gestão de alunos, check-ins e histórico evolutivo

Bons atendimentos e sucesso! 🚀`;
  };

  const handleOpenTrainerShareModal = (trainer: Trainer) => {
    setTargetTrainerForShare(trainer);
    setIsTrainerShareModalOpen(true);
  };

  const handleCopyTrainerLink = (trainer: Trainer) => {
    const link = getTrainerAccessLink(trainer);
    handleCopy(link, `t-link-${trainer.id}`);
    setShareToast('Link do treinador copiado para a área de transferência!');
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleCopyTrainerInviteMessage = (trainer: Trainer) => {
    const msg = getTrainerInviteMessage(trainer);
    handleCopy(msg, `t-msg-${trainer.id}`);
    setShareToast('Mensagem de convite do treinador copiada!');
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleSendTrainerWhatsApp = (trainer: Trainer) => {
    const msg = getTrainerInviteMessage(trainer);
    let phoneDigits = (trainer.phone || '').replace(/\D/g, '');
    if (phoneDigits.length === 10 || phoneDigits.length === 11) {
      phoneDigits = '55' + phoneDigits;
    }
    const waUrl = phoneDigits
      ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    addAuditLog('TRAINER_INVITE_SENT_WHATSAPP', `${trainer.fullName} (${trainer.phone || 'WhatsApp'})`);
  };

  const handleSendTrainerEmail = (trainer: Trainer) => {
    const msg = getTrainerInviteMessage(trainer);
    const subject = encodeURIComponent('Acesso Profissional — Omega Training Coach');
    const body = encodeURIComponent(msg);
    const cleanEmail = (trainer.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining');
    window.open(`mailto:${cleanEmail}?subject=${subject}&body=${body}`, '_blank');
    addAuditLog('TRAINER_INVITE_SENT_EMAIL', `${trainer.fullName} (${cleanEmail})`);
  };

  const handleRegisterTrainerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerRegisterForm.fullName || !trainerRegisterForm.email) {
      alert('Por favor informe o nome completo e o e-mail do treinador.');
      return;
    }

    const generatedId = `trainer-${Date.now()}`;
    const finalAvatar = trainerRegisterForm.avatarUrl || PRESET_TRAINER_AVATARS[0];

    addTrainer({
      organizationId: organization.id,
      fullName: trainerRegisterForm.fullName,
      email: trainerRegisterForm.email,
      phone: trainerRegisterForm.phone,
      avatarUrl: finalAvatar,
      role: 'pro',
      status: 'active',
      cref: trainerRegisterForm.cref || 'CREF Em Homologação',
      specialty: trainerRegisterForm.specialty || 'Musculação e Hipertrofia',
      temporaryPassword: trainerRegisterForm.temporaryPassword,
      accessBlocked: false,
      assignedStudentsCount: 0,
    });

    addAuditLog('TRAINER_REGISTERED_WITH_CREDENTIALS', `${trainerRegisterForm.fullName} (${trainerRegisterForm.email})`);
    setIsTrainerRegisterModalOpen(false);

    // Open share modal immediately
    const createdTrainer: Trainer = {
      id: generatedId,
      organizationId: organization.id,
      fullName: trainerRegisterForm.fullName,
      email: trainerRegisterForm.email,
      phone: trainerRegisterForm.phone,
      avatarUrl: finalAvatar,
      role: 'pro',
      status: 'active',
      cref: trainerRegisterForm.cref || 'CREF Em Homologação',
      specialty: trainerRegisterForm.specialty || 'Musculação e Hipertrofia',
      temporaryPassword: trainerRegisterForm.temporaryPassword,
      accessBlocked: false,
      assignedStudentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setTargetTrainerForShare(createdTrainer);
    setIsTrainerShareModalOpen(true);
    setShareToast('Treinador cadastrado com sucesso! Compartilhe o acesso abaixo.');

    setTrainerRegisterForm({
      fullName: '',
      email: '',
      phone: '',
      cref: '',
      specialty: 'Hipertrofia & Musculação Avançada',
      avatarUrl: '',
      temporaryPassword: 'Omega@' + Math.floor(1000 + Math.random() * 9000),
    });
  };

  const handleBlockTrainer = (trainer: Trainer) => {
    const reason = prompt(
      `Confirma o BLOQUEIO de acesso do(a) treinador(a) ${trainer.fullName}?\nInforme o motivo do bloqueio (será exibido ao treinador):`,
      'Suspensão temporária do acesso profissional pelo Administrador'
    );
    if (reason !== null) {
      blockTrainer(trainer.id, reason);
      addAuditLog('TRAINER_ACCESS_BLOCKED', `${trainer.fullName} — Motivo: ${reason}`);
    }
  };

  const handleUnblockTrainer = (trainer: Trainer) => {
    if (confirm(`Deseja desbloquear e restaurar o acesso profissional de ${trainer.fullName}?`)) {
      unblockTrainer(trainer.id);
      addAuditLog('TRAINER_ACCESS_RESTORED', `${trainer.fullName} (${trainer.email})`);
    }
  };

  const handleDeleteTrainer = (trainer: Trainer) => {
    if (confirm(`Atenção: Deseja EXCLUIR permanentemente o(a) treinador(a) "${trainer.fullName}" da plataforma?\n\nO cadastro profissional e credenciais serão removidos.`)) {
      deleteTrainer(trainer.id);
      addAuditLog('TRAINER_ACCOUNT_EXCLUDED', `${trainer.fullName} — Excluído permanentemente da plataforma`);
      setShareToast(`Treinador "${trainer.fullName}" excluído com sucesso!`);
      setTimeout(() => setShareToast(null), 3500);
    }
  };

  const handleOpenTrainerResetModal = (trainer: Trainer) => {
    setTargetTrainerForReset(trainer);
    setTrainerNewPasswordInput('Omega@' + Math.floor(1000 + Math.random() * 9000));
    setIsTrainerResetModalOpen(true);
  };

  const handleConfirmTrainerResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTrainerForReset || !trainerNewPasswordInput) return;

    resetTrainerPassword(targetTrainerForReset.id, trainerNewPasswordInput);
    addAuditLog('TRAINER_PASSWORD_RESET', `${targetTrainerForReset.fullName} (${targetTrainerForReset.email})`);
    setIsTrainerResetModalOpen(false);
    alert(`Senha de ${targetTrainerForReset.fullName} atualizada com sucesso para: ${trainerNewPasswordInput}`);
  };

  // Active / Blocked calculations for trainers
  const activeTrainersList = trainers.filter(t => !t.accessBlocked && t.status !== 'blocked');
  const blockedTrainersList = trainers.filter(t => t.accessBlocked || t.status === 'blocked');

  // Filtered trainers for table
  const filteredTrainers = trainers.filter((t) => {
    const q = trainerSearchQuery.toLowerCase();
    const matchesSearch =
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.phone && t.phone.toLowerCase().includes(q)) ||
      (t.cref && t.cref.toLowerCase().includes(q)) ||
      (t.specialty && t.specialty.toLowerCase().includes(q));

    const isBlocked = t.accessBlocked || t.status === 'blocked';
    if (trainerStatusFilter === 'active') return matchesSearch && !isBlocked;
    if (trainerStatusFilter === 'blocked') return matchesSearch && isBlocked;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Lock className="h-3 w-3" /> Console Global do Administrador
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-1 flex items-center gap-2">
            Painel do Superadministrador <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted">
            Cadastramento de acessos (login e senha), bloqueio de alunos excluídos e auditoria de segurança da plataforma.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="danger" size="md">
            Acesso Restrito Superadmin
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={logoutAdmin}
            className="border-rose-500/40 text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            id="superadmin-banner-logout-btn"
            title="Encerrar sessão de Administrador e voltar à tela de login"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sair do Admin</span>
          </Button>
        </div>
      </div>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === 'trainers' ? (
          <>
            <MetricCard
              title="Treinadores Cadastrados"
              value={trainers.length}
              changeLabel="Equipe técnica da consultoria"
              icon={<Dumbbell className="h-5 w-5" />}
              variant="primary"
            />
            <MetricCard
              title="Acessos Liberados (Ativos)"
              value={activeTrainersList.length}
              changeLabel="Treinadores com login ativo"
              icon={<UserCheck className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Acessos Bloqueados"
              value={blockedTrainersList.length}
              changeLabel="Treinadores com acesso suspenso"
              icon={<UserX className="h-5 w-5" />}
              variant={blockedTrainersList.length > 0 ? 'warning' : 'default'}
            />
            <MetricCard
              title="Total de Alunos Vinculados"
              value={students.length}
              changeLabel="Gerenciados pelos treinadores"
              icon={<Users className="h-5 w-5" />}
              variant="default"
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Alunos Cadastrados"
              value={students.length}
              change={12}
              changeLabel="Total na base da consultoria"
              icon={<Users className="h-5 w-5" />}
              variant="primary"
            />
            <MetricCard
              title="Acessos Liberados (Ativos)"
              value={activeStudentsList.length}
              changeLabel="Credenciais funcionais ativas"
              icon={<UserCheck className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Acessos Bloqueados / Excluídos"
              value={blockedStudentsList.length}
              changeLabel="Acessos revogados pelo admin"
              icon={<UserX className="h-5 w-5" />}
              variant={blockedStudentsList.length > 0 ? 'warning' : 'default'}
            />
            <MetricCard
              title="Status do Servidor"
              value="99.98%"
              changeLabel="Supabase PostgreSQL & Edge"
              icon={<Server className="h-5 w-5" />}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Mobile-only Navigation: Grid 2x2 Direta (Sem menu sanduíche) */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('trainers')}
          className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            activeTab === 'trainers'
              ? 'bg-primary text-background border-primary shadow-neon-sm font-black'
              : 'bg-card text-muted hover:text-foreground border-border'
          }`}
        >
          <Dumbbell className="h-4 w-4 shrink-0" />
          <span className="truncate">Treinadores ({trainers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tenants')}
          className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            activeTab === 'tenants'
              ? 'bg-primary text-background border-primary shadow-neon-sm font-black'
              : 'bg-card text-muted hover:text-foreground border-border'
          }`}
        >
          <Building className="h-4 w-4 shrink-0" />
          <span className="truncate">Ambientes ({mockOrganizations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            activeTab === 'audit'
              ? 'bg-primary text-background border-primary shadow-neon-sm font-black'
              : 'bg-card text-muted hover:text-foreground border-border'
          }`}
        >
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span className="truncate">Auditoria ({auditLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            activeTab === 'settings'
              ? 'bg-primary text-background border-primary shadow-neon-sm font-black'
              : 'bg-card text-muted hover:text-foreground border-border'
          }`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="truncate">Configurações</span>
        </button>
      </div>

      {/* Switcher Tabs - Desktop Only */}
      <div className="hidden md:flex space-x-2 border-b border-border pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('trainers')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'trainers'
              ? 'bg-primary text-background font-black shadow-neon-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Treinadores & Acessos ({trainers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tenants'
              ? 'bg-primary text-background font-black shadow-neon-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Organizações & Ambientes ({mockOrganizations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-primary text-background font-black shadow-neon-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Logs de Auditoria ({auditLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-primary text-background font-black shadow-neon-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Configurações</span>
        </button>
      </div>

      {/* TAB 0: CADASTRAMENTO & ACESSO DE TREINADORES */}
      {activeTab === 'trainers' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <span>Credenciais de Login & Gestão de Treinadores (Coaches)</span>
                  </CardTitle>
                  <CardDescription>
                    Cadastre novos treinadores com login e senha, acompanhe CREF e especialidades, bloqueie acessos em caso de desligamento e envie o link de acesso direto via WhatsApp ou E-mail.
                  </CardDescription>
                </div>

                <Button
                  variant="primary"
                  onClick={() => setIsTrainerRegisterModalOpen(true)}
                  className="flex items-center gap-1.5 shrink-0 shadow-neon-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar Novo Treinador</span>
                </Button>
              </div>

              {/* Informative Banner: Coach Access Link */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs mt-3 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">Como o treinador acessa a plataforma no modo Coach?</p>
                    <p className="text-muted text-[11px] break-words">
                      Você pode enviar o link direto com credenciais de login e senha geradas abaixo. O treinador terá controle total de treinos, dietas (Tabela TACO) e alunos.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0 min-w-0">
                  <span className="font-mono text-[11px] bg-background px-2.5 py-1.5 rounded-lg border border-border text-primary font-medium truncate max-w-full sm:max-w-xs text-center sm:text-left">
                    {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?role=pro` : '...'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const generalLink = `${window.location.origin}${window.location.pathname}?role=pro`;
                      navigator.clipboard.writeText(generalLink);
                      setShareToast('Link geral de treinador copiado!');
                      setTimeout(() => setShareToast(null), 3000);
                    }}
                    className="text-xs text-primary border border-primary/30 hover:bg-primary/10 h-8 px-2.5 shrink-0 justify-center"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span>Copiar Link Geral</span>
                  </Button>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border mt-3 w-full max-w-full">
                <div className="w-full sm:w-80">
                  <Input
                    placeholder="Buscar por nome, CREF ou login..."
                    value={trainerSearchQuery}
                    onChange={(e) => setTrainerSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border text-xs overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => setTrainerStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      trainerStatusFilter === 'all'
                        ? 'bg-primary text-background font-bold shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    Todos ({trainers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrainerStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      trainerStatusFilter === 'active'
                        ? 'bg-primary text-background font-bold shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    Liberados ({activeTrainersList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrainerStatusFilter('blocked')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      trainerStatusFilter === 'blocked'
                        ? 'bg-rose-500 text-white font-bold shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    Bloqueados ({blockedTrainersList.length})
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {filteredTrainers.length === 0 ? (
                <div className="p-8 text-center text-muted border border-dashed border-border rounded-xl">
                  Nenhum treinador encontrado para os critérios de busca selecionados.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTrainers.map((trainer) => {
                    const isBlocked = trainer.accessBlocked || trainer.status === 'blocked';
                    const isPasswordVisible = !!visibleTrainerPasswords[trainer.id];
                    const password = trainer.temporaryPassword || 'Omega@2026';

                    return (
                      <div
                        key={trainer.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-4 w-full max-w-full overflow-hidden ${
                          isBlocked
                            ? 'bg-rose-500/5 border-rose-500/30'
                            : 'bg-surface/50 border-border hover:border-primary/40'
                        }`}
                      >
                        {/* Trainer Info */}
                        <div className="flex items-start gap-3 min-w-0 w-full overflow-hidden">
                          <img
                            src={trainer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                            alt={trainer.fullName}
                            className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover ring-2 shrink-0 ${
                              isBlocked ? 'ring-rose-500/50 grayscale' : 'ring-primary/40'
                            }`}
                          />
                          <div className="min-w-0 flex-1 overflow-hidden">
                            {/* Header: Name + Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <h4 className="font-bold text-sm text-foreground break-words">{trainer.fullName}</h4>
                              <div className="flex flex-wrap items-center gap-1">
                                {isBlocked ? (
                                  <Badge variant="danger" size="sm" className="flex items-center gap-1 shrink-0 text-[11px] py-0.5 px-2">
                                    <Lock className="h-3 w-3" />
                                    <span>Acesso Bloqueado</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="success" size="sm" className="flex items-center gap-1 shrink-0 text-[11px] py-0.5 px-2">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Acesso Liberado</span>
                                  </Badge>
                                )}
                                {trainer.cref && (
                                  <Badge variant="outline" size="sm" className="text-[10px] font-mono border-primary/30 text-primary shrink-0 py-0.5 px-1.5">
                                    {trainer.cref}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Specialty & Students count with clean wrapping */}
                            <div className="text-xs text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-muted/90 font-medium break-words leading-tight">
                                {trainer.specialty || 'Musculação e Hipertrofia'}
                              </span>
                              <span className="text-muted/40">•</span>
                              <span className="text-foreground/80 font-medium shrink-0">
                                {trainer.assignedStudentsCount || 0} alunos vinculados
                              </span>
                            </div>

                            {isBlocked && trainer.blockedReason && (
                              <p className="text-[11px] text-rose-400 mt-1 flex items-start gap-1 break-words">
                                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                                <span className="break-words">Motivo: {trainer.blockedReason}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Credentials Card (Login & Password) */}
                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-card/80 p-2 sm:p-2.5 rounded-xl border border-border text-xs min-w-0 max-w-full overflow-hidden">
                          {/* Login / Email */}
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-surface px-2.5 py-1.5 rounded-lg border border-border/60 min-w-0 flex-1 sm:flex-initial">
                            <div className="flex items-center gap-1.5 text-muted shrink-0">
                              <Mail className="h-3.5 w-3.5 text-primary" />
                              <span className="font-bold">Login:</span>
                            </div>
                            <span className="font-mono text-foreground font-semibold truncate min-w-0 max-w-[130px] xs:max-w-[180px] sm:max-w-[200px]" title={trainer.email}>
                              {trainer.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(trainer.email, `t-email-${trainer.id}`)}
                              className="text-muted hover:text-foreground p-1 transition-colors shrink-0"
                              title="Copiar login do treinador"
                            >
                              {copiedField === `t-email-${trainer.id}` ? (
                                <Check className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Password */}
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-surface px-2.5 py-1.5 rounded-lg border border-border/60 min-w-0 flex-1 sm:flex-initial">
                            <div className="flex items-center gap-1.5 text-muted shrink-0">
                              <Key className="h-3.5 w-3.5 text-primary" />
                              <span className="font-bold">Senha:</span>
                            </div>
                            <span className="font-mono text-foreground font-semibold truncate min-w-0 max-w-[120px] xs:max-w-[160px] sm:max-w-[180px]">
                              {isPasswordVisible ? password : '••••••••••••'}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleTrainerPasswordVisibility(trainer.id)}
                                className="text-muted hover:text-foreground p-1 transition-colors"
                                title={isPasswordVisible ? 'Ocultar senha' : 'Ver senha'}
                              >
                                {isPasswordVisible ? (
                                  <EyeOff className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(password, `t-pwd-${trainer.id}`)}
                                className="text-muted hover:text-foreground p-1 transition-colors"
                                title="Copiar senha do treinador"
                              >
                                {copiedField === `t-pwd-${trainer.id}` ? (
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 w-full lg:w-auto justify-start sm:justify-end flex-wrap">
                          {/* Mandar Link / Enviar Acesso */}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenTrainerShareModal(trainer)}
                            className="text-xs flex items-center gap-1 shadow-sm font-bold bg-primary hover:bg-primary-hover text-background h-8 px-2.5"
                            title="Compartilhar link de acesso direto e credenciais com o treinador"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Mandar Link</span>
                          </Button>

                          {/* Quick WhatsApp Send */}
                          <button
                            type="button"
                            onClick={() => handleSendTrainerWhatsApp(trainer)}
                            className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                            title="Enviar convite e credenciais via WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenTrainerResetModal(trainer)}
                            className="p-1.5 sm:p-2 rounded-lg bg-surface text-muted hover:text-foreground border border-border hover:border-primary/40 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                            title="Redefinir senha do treinador"
                          >
                            <Key className="h-4 w-4" />
                          </button>

                          {/* Block or Unblock */}
                          {isBlocked ? (
                            <button
                              type="button"
                              onClick={() => handleUnblockTrainer(trainer)}
                              className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                              title="Restaurar e desbloquear acesso do treinador"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBlockTrainer(trainer)}
                              className="p-1.5 sm:p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                              title="Bloquear/Suspender acesso do treinador"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete Trainer */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTrainer(trainer)}
                            className="p-1.5 sm:p-2 rounded-lg bg-surface text-muted hover:text-rose-400 border border-border hover:border-rose-500/40 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                            title="Desativar e excluir cadastro de treinador"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 1: CADASTRAMENTO & ACESSO DE ALUNOS */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <span>Credenciais de Login & Controle de Acesso dos Alunos</span>
                  </CardTitle>
                  <CardDescription>
                    Gerencie o e-mail de login, senha provisória de acesso e bloqueie o aluno caso ele seja excluído ou desativado.
                  </CardDescription>
                </div>

                <Button
                  variant="primary"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="flex items-center gap-1.5 shrink-0 shadow-neon-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar Novo Aluno com Acesso</span>
                </Button>
              </div>

              {/* Informative Banner: Student Access Link */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs mt-3 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">Como o aluno acessa o aplicativo no modo aluno?</p>
                    <p className="text-muted text-[11px] break-words">
                      Você pode enviar o link direto com login e senha via WhatsApp para cada aluno, ou fornecer o link geral da consultoria.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0 min-w-0">
                  <span className="font-mono text-[11px] bg-background px-2.5 py-1.5 rounded-lg border border-border text-primary font-medium truncate max-w-full sm:max-w-xs text-center sm:text-left">
                    {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?role=student` : '...'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const generalLink = `${window.location.origin}${window.location.pathname}?role=student`;
                      navigator.clipboard.writeText(generalLink);
                      setShareToast('Link geral de acesso copiado!');
                      setTimeout(() => setShareToast(null), 3000);
                    }}
                    className="text-xs text-primary border border-primary/30 hover:bg-primary/10 h-8 px-2.5 shrink-0 justify-center"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span>Copiar Link Geral</span>
                  </Button>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border mt-3 w-full max-w-full">
                <div className="w-full sm:w-80">
                  <Input
                    placeholder="Buscar por nome, login ou e-mail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border text-xs overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      statusFilter === 'all'
                        ? 'bg-primary text-background font-bold shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    Todos ({students.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      statusFilter === 'active'
                        ? 'bg-primary text-background font-bold shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    Liberados ({activeStudentsList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('blocked')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      statusFilter === 'blocked'
                        ? 'bg-rose-500 text-white font-bold shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    Bloqueados ({blockedStudentsList.length})
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-muted border border-dashed border-border rounded-xl">
                  Nenhum aluno encontrado para os critérios de busca selecionados.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => {
                    const isBlocked = student.accessBlocked || student.status === 'blocked';
                    const isPasswordVisible = !!visiblePasswords[student.id];
                    const password = student.temporaryPassword || 'Fit@2026';

                    return (
                      <div
                        key={student.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-4 w-full max-w-full overflow-hidden ${
                          isBlocked
                            ? 'bg-rose-500/5 border-rose-500/30'
                            : 'bg-surface/50 border-border hover:border-primary/40'
                        }`}
                      >
                        {/* Student Info */}
                        <div className="flex items-start gap-3 min-w-0 w-full overflow-hidden">
                          <img
                            src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={student.fullName}
                            className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover ring-2 shrink-0 ${
                              isBlocked ? 'ring-rose-500/50 grayscale' : 'ring-primary/40'
                            }`}
                          />
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <h4 className="font-bold text-sm text-foreground break-words">{student.fullName}</h4>
                              <div className="flex flex-wrap items-center gap-1">
                                {isBlocked ? (
                                  <Badge variant="danger" size="sm" className="flex items-center gap-1 shrink-0 text-[11px] py-0.5 px-2">
                                    <Lock className="h-3 w-3" />
                                    <span>Acesso Bloqueado</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="success" size="sm" className="flex items-center gap-1 shrink-0 text-[11px] py-0.5 px-2">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Acesso Liberado</span>
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-muted mt-1 break-words leading-tight">{student.goal}</p>

                            {isBlocked && student.blockedReason && (
                              <p className="text-[11px] text-rose-400 mt-1 flex items-start gap-1 break-words">
                                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                                <span className="break-words">Motivo: {student.blockedReason}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Credentials Card (Login & Password) */}
                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-card/80 p-2 sm:p-2.5 rounded-xl border border-border text-xs min-w-0 max-w-full overflow-hidden">
                          {/* Login / Email */}
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-surface px-2.5 py-1.5 rounded-lg border border-border/60 min-w-0 flex-1 sm:flex-initial">
                            <div className="flex items-center gap-1.5 text-muted shrink-0">
                              <Mail className="h-3.5 w-3.5 text-primary" />
                              <span className="font-bold">Login:</span>
                            </div>
                            <span className="font-mono text-foreground font-semibold truncate min-w-0 max-w-[130px] xs:max-w-[180px] sm:max-w-[200px]" title={student.email}>
                              {student.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(student.email, `email-${student.id}`)}
                              className="text-muted hover:text-foreground p-1 transition-colors shrink-0"
                              title="Copiar login"
                            >
                              {copiedField === `email-${student.id}` ? (
                                <Check className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Password */}
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-surface px-2.5 py-1.5 rounded-lg border border-border/60 min-w-0 flex-1 sm:flex-initial">
                            <div className="flex items-center gap-1.5 text-muted shrink-0">
                              <Key className="h-3.5 w-3.5 text-primary" />
                              <span className="font-bold">Senha:</span>
                            </div>
                            <span className="font-mono text-foreground font-semibold truncate min-w-0 max-w-[120px] xs:max-w-[160px] sm:max-w-[180px]">
                              {isPasswordVisible ? password : '••••••••••••'}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(student.id)}
                                className="text-muted hover:text-foreground p-1 transition-colors"
                                title={isPasswordVisible ? 'Ocultar senha' : 'Ver senha'}
                              >
                                {isPasswordVisible ? (
                                  <EyeOff className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(password, `pwd-${student.id}`)}
                                className="text-muted hover:text-foreground p-1 transition-colors"
                                title="Copiar senha"
                              >
                                {copiedField === `pwd-${student.id}` ? (
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 w-full lg:w-auto justify-start sm:justify-end flex-wrap">
                          {/* Mandar Link / Enviar Acesso */}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenShareModal(student)}
                            className="text-xs flex items-center gap-1 shadow-sm font-bold bg-primary hover:bg-primary-hover text-background h-8 px-2.5"
                            title="Enviar link de acesso direto e credenciais para o aluno"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Mandar Link</span>
                          </Button>

                          {/* Quick WhatsApp Send */}
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(student)}
                            className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                            title="Enviar convite e credenciais via WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetModal(student)}
                            className="p-1.5 sm:p-2 rounded-lg bg-surface text-muted hover:text-foreground border border-border hover:border-primary/40 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                            title="Redefinir senha do aluno"
                          >
                            <Key className="h-4 w-4" />
                          </button>

                          {/* Block or Unblock */}
                          {isBlocked ? (
                            <button
                              type="button"
                              onClick={() => handleUnblockStudent(student)}
                              className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                              title="Restaurar e desbloquear acesso do aluno"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBlockStudent(student)}
                              className="p-1.5 sm:p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                              title="Bloquear/Suspender acesso do aluno"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete Student */}
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student)}
                            className="p-1.5 sm:p-2 rounded-lg bg-surface text-muted hover:text-rose-400 border border-border hover:border-rose-500/40 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                            title="Excluir aluno e revogar credenciais"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: TENANTS & AMBIENTES */}
      {activeTab === 'tenants' && (
        <Card>
          <CardHeader>
            <CardTitle>Organizações & Ambientes da Plataforma</CardTitle>
            <CardDescription>Isolamento total de banco garantido via RLS por tenant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockOrganizations.map((org) => (
              <div
                key={org.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-surface/50 border border-border gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center font-black text-primary text-sm">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{org.name}</h4>
                    <p className="text-muted">Slug: <code className="text-primary font-mono">{org.slug}</code> • Criada em {org.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block font-extrabold text-foreground">{org.students} alunos</span>
                    <span className="text-[11px] text-muted">Tenant isolado</span>
                  </div>

                  <Badge variant="success" size="sm">
                    {org.status === 'active' ? 'Operacional' : org.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Trilha de Auditoria (LGPD & Segurança)</CardTitle>
            <CardDescription>Registro imutável de ações administrativas, bloqueios e criação de credenciais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-surface/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-mono text-primary font-bold">{log.action}</span>
                  <p className="text-muted mt-0.5">Alvo: <strong className="text-foreground">{log.target}</strong> | Executor: {log.user}</p>
                </div>

                <div className="text-left sm:text-right text-muted">
                  <span>{log.timestamp}</span>
                  <span className="block font-mono text-[10px]">Origem: {log.ip}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: CONFIGURAÇÕES DA ORGANIZAÇÃO & SISTEMA */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {settingsToast && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{settingsToast}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Card 1: Identidade da Marca & Organização */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl">
                    Ω
                  </div>
                  <div>
                    <CardTitle>Identidade da Marca & Organização</CardTitle>
                    <CardDescription>
                      Personalize o nome fantasia, o símbolo visual Omega (Ω) e os parâmetros globais da consultoria.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Nome da Organização / Marca *</label>
                    <Input
                      required
                      value={settingsForm.orgName}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, orgName: e.target.value }))}
                      placeholder="Ex: Omega Training"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Identificador Único (Slug) *</label>
                    <Input
                      required
                      value={settingsForm.orgSlug}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, orgSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      placeholder="Ex: omega-training"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Slogan / Subtítulo Institucional</label>
                    <Input
                      value={settingsForm.slogan}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, slogan: e.target.value }))}
                      placeholder="Ex: Plataforma Fitness & Alta Performance"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Símbolo Oficial da Marca</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={settingsForm.symbol}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, symbol: e.target.value }))}
                        className="font-black text-center w-20 text-lg text-primary"
                        maxLength={2}
                      />
                      <span className="text-xs text-muted">
                        Símbolo da letra grega Omega (Ω) exibido no topo e nos aplicativos dos alunos e treinadores.
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Capacidade Operacional & Licenciamento */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Capacidade Operacional & Licenciamento</CardTitle>
                    <CardDescription>
                      Monitore as cotas de alunos, treinadores e banco de dados isolado da consultoria.
                    </CardDescription>
                  </div>
                  <Badge variant="primary" size="md">
                    Plano PRO Ativo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-surface/50 border border-border">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted font-medium">Alunos Ativos</span>
                      <span className="font-bold text-foreground">{students.length} / {settingsForm.maxStudents}</span>
                    </div>
                    <div className="w-full bg-card rounded-full h-2 overflow-hidden border border-border/50">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (students.length / Number(settingsForm.maxStudents || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted mt-1 block">
                      {Math.max(0, Number(settingsForm.maxStudents) - students.length)} vagas disponíveis
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface/50 border border-border">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted font-medium">Treinadores</span>
                      <span className="font-bold text-foreground">{trainers.length} / 5</span>
                    </div>
                    <div className="w-full bg-card rounded-full h-2 overflow-hidden border border-border/50">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (trainers.length / 5) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted mt-1 block">
                      {5 - trainers.length} vagas de treinadores
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface/50 border border-border">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted font-medium">Isolamento Multi-tenant</span>
                      <span className="font-bold text-emerald-400">Ativo</span>
                    </div>
                    <div className="w-full bg-card rounded-full h-2 overflow-hidden border border-border/50">
                      <div className="bg-emerald-400 h-full w-full" />
                    </div>
                    <span className="text-[10px] text-muted mt-1 block">
                      PostgreSQL RLS 100% isolado
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-foreground">Limite de Alunos Contratados</label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={settingsForm.maxStudents}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, maxStudents: Number(e.target.value) }))}
                    className="max-w-xs"
                  />
                  <p className="text-[11px] text-muted">
                    Defina o teto de alunos que sua consultoria pode cadastrar simultaneamente.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Segurança, Governança & Suporte */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Segurança, Governança & Suporte</CardTitle>
                <CardDescription>
                  Políticas de credenciais automáticas, consentimento LGPD e canais de atendimento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Prefixo das Senhas Provisórias</label>
                    <Input
                      value={settingsForm.defaultPasswordPrefix}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, defaultPasswordPrefix: e.target.value }))}
                      placeholder="Ex: Omega@"
                      className="font-mono text-xs max-w-xs"
                    />
                    <p className="text-[11px] text-muted">
                      Prefixo utilizado na geração randômica de senhas iniciais para novos alunos e treinadores.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">E-mail de Suporte Administrativo</label>
                    <Input
                      type="email"
                      value={settingsForm.supportEmail}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, supportEmail: e.target.value }))}
                      placeholder="contato@omegatraining.pro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">WhatsApp Oficial da Consultoria</label>
                    <Input
                      value={settingsForm.supportPhone}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, supportPhone: e.target.value }))}
                      placeholder="(11) 98765-4321"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-surface/50 border border-border flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-foreground block">Termos de Uso e LGPD</span>
                      <span className="text-[11px] text-muted">Exigir aceite de termos no primeiro login do usuário</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.requireConsent}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, requireConsent: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-card peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Credenciais de Acesso do Administrador (Master Login & Senha) */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>Credenciais de Acesso ao Painel Admin</span>
                      <Badge variant="danger" size="sm">Master</Badge>
                    </CardTitle>
                    <CardDescription>
                      Login e senha mestres necessários para autenticar e desbloquear este console de administração.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Login / E-mail do Administrador</label>
                    <Input
                      type="text"
                      value={adminCredentials.email}
                      readOnly
                      className="bg-surface/50 border-border font-mono text-xs text-foreground"
                    />
                    <p className="text-[11px] text-muted">
                      Identificador mestre de acesso administrativo (também aceita <code>admin</code>).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">Senha Master do Painel Admin</label>
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        {showAdminPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showAdminPassword ? 'Ocultar' : 'Exibir'}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={newMasterPasswordInput || adminCredentials.password}
                        onChange={(e) => setNewMasterPasswordInput(e.target.value)}
                        placeholder="Nova senha master"
                        className="font-mono text-xs"
                      />
                      {newMasterPasswordInput && newMasterPasswordInput !== adminCredentials.password && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            updateAdminPassword(newMasterPasswordInput);
                            setSettingsToast('Senha do Superadministrador atualizada com sucesso!');
                            setTimeout(() => setSettingsToast(null), 3000);
                          }}
                          className="shrink-0 text-xs font-bold"
                        >
                          Salvar Senha
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted">
                      Senha padrão: <code>Omega@Admin2026</code>. Altere aqui para definir uma nova senha master.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/70 border border-border shadow-sm">
              <span className="text-xs text-muted">
                As alterações de marca e parâmetros são refletidas instantaneamente em toda a plataforma.
              </span>
              <Button
                type="submit"
                variant="primary"
                className={`flex items-center gap-1.5 font-bold px-6 transition-all duration-200 ${
                  isSettingsSaved
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/30'
                    : 'shadow-neon-sm'
                }`}
              >
                {isSettingsSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    <span>✓ Configurações Salvas com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Salvar Configurações</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Card 5: Encerrar Sessão do Superadministrador */}
          <Card className="border-rose-500/30 bg-rose-500/5 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-rose-400">Sair do Modo Administrador</CardTitle>
                  <CardDescription>
                    Encerre a sessão administrativa global. O painel será bloqueado imediatamente e a tela de login e senha será exibida com isolamento total.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-rose-500/20">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">
                    Desconectar Superadmin ({adminCredentials.email})
                  </span>
                  <span className="text-[11px] text-muted block">
                    Nenhum dado, métrica ou configuração do console permanecerá visível após desconectar.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={logoutAdmin}
                  className="border-rose-500/40 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors font-bold text-xs flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                  id="superadmin-settings-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Encerrar Sessão e Sair</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 1: CADASTRAR NOVO ALUNO COM LOGIN E SENHA */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Cadastrar Aluno com Login e Senha"
        description="Gere as credenciais de acesso ao aplicativo mobile e ative a conta do aluno."
      >
        <form onSubmit={handleRegisterStudent} className="space-y-4">
          {/* Foto de Perfil do Aluno */}
          <div className="p-3.5 rounded-xl border border-border bg-surface/50 space-y-3">
            <label className="text-xs font-semibold text-foreground block">
              Foto de Perfil do Aluno
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-border group-hover:border-primary/50 bg-background flex items-center justify-center transition-colors">
                  {registerForm.avatarUrl ? (
                    <img
                      src={registerForm.avatarUrl}
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
                {registerForm.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setRegisterForm(prev => ({ ...prev, avatarUrl: '' }))}
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
                    htmlFor="student-photo-upload"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-primary/50 text-xs font-semibold text-foreground hover:text-primary transition-all shadow-sm active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>Carregar Foto</span>
                    <input
                      id="student-photo-upload"
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
            placeholder="Ex: Carlos Daniel Moreira"
            value={registerForm.fullName}
            onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="E-mail de Login *"
              type="email"
              placeholder="carlos.aluno@email.com"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
            />

            <Input
              label="Telefone / WhatsApp *"
              placeholder="(11) 98765-4321"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
              required
            />
          </div>

          {/* Password with generator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Senha de Acesso Inicial *
              </label>
              <button
                type="button"
                onClick={handleGenerateRandomPassword}
                className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Gerar Senha Segura</span>
              </button>
            </div>
            <Input
              value={registerForm.temporaryPassword}
              onChange={(e) => setRegisterForm({ ...registerForm, temporaryPassword: e.target.value })}
              required
            />
            <p className="text-[11px] text-muted">
              Esta senha provisória permitirá ao aluno acessar a plataforma via Web ou Mobile PWA.
            </p>
          </div>

          <Input
            label="Objetivo do Aluno"
            placeholder="Ex: Emagrecimento e Definição Muscular"
            value={registerForm.goal}
            onChange={(e) => setRegisterForm({ ...registerForm, goal: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Peso Inicial (kg)"
              type="number"
              step="0.1"
              value={registerForm.currentWeightKg}
              onChange={(e) => setRegisterForm({ ...registerForm, currentWeightKg: Number(e.target.value) })}
            />
            <Input
              label="Meta Peso (kg)"
              type="number"
              step="0.1"
              value={registerForm.targetWeightKg}
              onChange={(e) => setRegisterForm({ ...registerForm, targetWeightKg: Number(e.target.value) })}
            />
            <Input
              label="Altura (cm)"
              type="number"
              value={registerForm.heightCm}
              onChange={(e) => setRegisterForm({ ...registerForm, heightCm: Number(e.target.value) })}
            />
          </div>

          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>As credenciais serão criptografadas e salvas com isolamento multi-tenant ativo para <strong>Omega Training</strong>.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsRegisterModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cadastrar e Liberar Acesso
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: RESETAR / NOVA SENHA */}
      {targetStudentForReset && (
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title={`Nova Senha — ${targetStudentForReset.fullName}`}
          description={`Defina uma nova senha de acesso para o aluno (${targetStudentForReset.email}).`}
        >
          <form onSubmit={handleConfirmResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nova Senha de Acesso *
              </label>
              <Input
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setIsResetModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Confirmar Nova Senha
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: ENVIAR ACESSO AO ALUNO (LINK & CREDENCIAIS) */}
      {targetStudentForShare && (
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Mandar Link de Acesso ao Aluno"
          description={`Envie o link direto e as credenciais de acesso para ${targetStudentForShare.fullName}.`}
        >
          <div className="space-y-4">
            {/* Student mini-header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={targetStudentForShare.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={targetStudentForShare.fullName}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/40 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">{targetStudentForShare.fullName}</h4>
                  <p className="text-xs text-muted flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{targetStudentForShare.email}</span>
                  </p>
                </div>
              </div>

              {targetStudentForShare.accessBlocked || targetStudentForShare.status === 'blocked' ? (
                <Badge variant="danger" size="sm" className="flex items-center gap-1 shrink-0">
                  <Lock className="h-3 w-3" />
                  <span>Bloqueado</span>
                </Badge>
              ) : (
                <Badge variant="success" size="sm" className="flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Liberado</span>
                </Badge>
              )}
            </div>

            {(targetStudentForShare.accessBlocked || targetStudentForShare.status === 'blocked') && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>
                  <strong>Atenção:</strong> Este aluno está com status bloqueado. Ao tentar acessar, ele verá a tela de <strong>Acesso Suspenso</strong> até que você o desbloqueie.
                </span>
              </div>
            )}

            {/* Direct App Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Link Direto do App (Modo Aluno)</span>
                <span className="text-[11px] text-muted font-normal">Abre direto no app do aluno</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={getStudentAccessLink(targetStudentForShare)}
                  className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono text-primary truncate focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyStudentLink(targetStudentForShare)}
                  className="shrink-0 text-xs flex items-center gap-1"
                >
                  {copiedField === `link-${targetStudentForShare.id}` ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>Copiar Link</span>
                </Button>
                <button
                  type="button"
                  onClick={() => window.open(getStudentAccessLink(targetStudentForShare), '_blank')}
                  className="p-2 rounded-xl border border-border text-muted hover:text-foreground hover:border-primary/40 transition-colors"
                  title="Testar em nova aba"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Formatted Invite Message Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Mensagem Pronta de Convite (WhatsApp / E-mail)
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyInviteMessage(targetStudentForShare)}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === `msg-${targetStudentForShare.id}` ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Mensagem Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar Mensagem</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/80 font-mono text-xs text-muted leading-relaxed whitespace-pre-wrap select-all">
                {getStudentInviteMessage(targetStudentForShare)}
              </div>
            </div>

            {/* Quick Send Action Buttons */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(targetStudentForShare)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Enviar pelo WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendEmail(targetStudentForShare)}
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

      {/* MODAL 4: CADASTRAR NOVO TREINADOR COM LOGIN E SENHA */}
      <Modal
        isOpen={isTrainerRegisterModalOpen}
        onClose={() => setIsTrainerRegisterModalOpen(false)}
        title="Cadastrar Treinador com Login e Senha"
        description="Gere as credenciais de acesso profissional ao painel de consultoria Omega Training."
      >
        <form onSubmit={handleRegisterTrainerSubmit} className="space-y-4">
          {/* Foto de Perfil do Treinador */}
          <div className="p-3.5 rounded-xl border border-border bg-surface/50 space-y-3">
            <label className="text-xs font-semibold text-foreground block">
              Foto de Perfil do Treinador
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-border group-hover:border-primary/50 bg-background flex items-center justify-center transition-colors">
                  {trainerRegisterForm.avatarUrl ? (
                    <img
                      src={trainerRegisterForm.avatarUrl}
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
                {trainerRegisterForm.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setTrainerRegisterForm(prev => ({ ...prev, avatarUrl: '' }))}
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
                    htmlFor="trainer-photo-upload"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-primary/50 text-xs font-semibold text-foreground hover:text-primary transition-all shadow-sm active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>Carregar Foto</span>
                    <input
                      id="trainer-photo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleTrainerPhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRandomPresetTrainerAvatar}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-xs font-semibold text-primary transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Avatar Rápido</span>
                  </button>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Envie uma foto do treinador do seu computador (JPG, PNG ou WebP até 5MB) ou selecione um dos modelos abaixo:
                </p>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="pt-2 border-t border-border/60">
              <span className="text-[11px] text-muted font-medium mb-1.5 block">
                Sugestões de Avatares Profissionais:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_TRAINER_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTrainerRegisterForm(prev => ({ ...prev, avatarUrl: url }))}
                    className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      trainerRegisterForm.avatarUrl === url
                        ? 'border-primary ring-2 ring-primary/40 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Nome Completo do Treinador *</label>
              <Input
                required
                placeholder="Ex: Prof. Nilson Rocha"
                value={trainerRegisterForm.fullName}
                onChange={(e) => setTrainerRegisterForm(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">E-mail (Login de Acesso) *</label>
              <Input
                type="email"
                required
                placeholder="treinador@omegatraining.pro"
                value={trainerRegisterForm.email}
                onChange={(e) => setTrainerRegisterForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">WhatsApp / Telefone *</label>
              <Input
                required
                placeholder="(11) 98765-4321"
                value={trainerRegisterForm.phone}
                onChange={(e) => setTrainerRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Registro Profissional / CREF</label>
              <Input
                placeholder="Ex: CREF 042918-G/SP"
                value={trainerRegisterForm.cref}
                onChange={(e) => setTrainerRegisterForm(prev => ({ ...prev, cref: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Especialidade Principal</label>
            <select
              value={trainerRegisterForm.specialty}
              onChange={(e) => setTrainerRegisterForm(prev => ({ ...prev, specialty: e.target.value }))}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="Hipertrofia & Musculação Avançada">Hipertrofia & Musculação Avançada</option>
              <option value="Emagrecimento & Definição Corporal">Emagrecimento & Definição Corporal</option>
              <option value="Treinamento Funcional & Calistenia">Treinamento Funcional & Calistenia</option>
              <option value="Reabilitação & Biomecânica Postural">Reabilitação & Biomecânica Postural</option>
              <option value="Preparação Física & Performance Esportiva">Preparação Física & Performance Esportiva</option>
              <option value="Nutrição Esportiva Aplicada & Dieta">Nutrição Esportiva Aplicada & Dieta</option>
            </select>
          </div>

          {/* Senha Provisória Inicial */}
          <div className="p-3 rounded-xl bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-primary" />
                <span>Senha Inicial Provisória</span>
              </label>
              <button
                type="button"
                onClick={() => setTrainerRegisterForm(prev => ({
                  ...prev,
                  temporaryPassword: 'Omega@' + Math.floor(1000 + Math.random() * 9000),
                }))}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Gerar Nova Senha</span>
              </button>
            </div>
            <Input
              required
              value={trainerRegisterForm.temporaryPassword}
              onChange={(e) => setTrainerRegisterForm(prev => ({ ...prev, temporaryPassword: e.target.value }))}
              className="font-mono text-sm tracking-wider"
            />
            <p className="text-[11px] text-muted">
              Esta senha provisória será incluída na mensagem de boas-vindas do treinador.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsTrainerRegisterModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="shadow-neon-sm font-bold"
            >
              Cadastrar Treinador & Compartilhar Acesso
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: COMPARTILHAR ACESSO DO TREINADOR (LINK & CREDENCIAIS) */}
      {targetTrainerForShare && (
        <Modal
          isOpen={isTrainerShareModalOpen}
          onClose={() => setIsTrainerShareModalOpen(false)}
          title="Compartilhar Acesso de Treinador"
          description={`Envie o link direto e as credenciais de acesso profissional para ${targetTrainerForShare.fullName}.`}
        >
          <div className="space-y-4">
            {/* Trainer mini-header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={targetTrainerForShare.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={targetTrainerForShare.fullName}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/40 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">{targetTrainerForShare.fullName}</h4>
                  <p className="text-xs text-muted flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{(targetTrainerForShare.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining')}</span>
                  </p>
                  {targetTrainerForShare.cref && (
                    <span className="text-[10px] text-primary font-mono">{targetTrainerForShare.cref}</span>
                  )}
                </div>
              </div>

              {targetTrainerForShare.accessBlocked || targetTrainerForShare.status === 'blocked' ? (
                <Badge variant="danger" size="sm" className="flex items-center gap-1 shrink-0">
                  <Lock className="h-3 w-3" />
                  <span>Bloqueado</span>
                </Badge>
              ) : (
                <Badge variant="success" size="sm" className="flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Liberado</span>
                </Badge>
              )}
            </div>

            {(targetTrainerForShare.accessBlocked || targetTrainerForShare.status === 'blocked') && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>
                  <strong>Atenção:</strong> Este treinador está com status bloqueado. Ao tentar acessar, ele verá a tela de <strong>Acesso Suspenso</strong> até que você o desbloqueie.
                </span>
              </div>
            )}

            {/* Direct App Link for Trainer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Link Direto do Painel (Modo Treinador)</span>
                <span className="text-[11px] text-muted font-normal">Abre direto como treinador autenticado</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={getTrainerAccessLink(targetTrainerForShare)}
                  className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono text-primary truncate focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyTrainerLink(targetTrainerForShare)}
                  className="shrink-0 text-xs flex items-center gap-1"
                >
                  {copiedField === `t-link-${targetTrainerForShare.id}` ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>Copiar Link</span>
                </Button>
                <button
                  type="button"
                  onClick={() => window.open(getTrainerAccessLink(targetTrainerForShare), '_blank')}
                  className="p-2 rounded-xl border border-border text-muted hover:text-foreground hover:border-primary/40 transition-colors"
                  title="Testar em nova aba"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Formatted Invite Message Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Mensagem Pronta de Convite (WhatsApp / E-mail)
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyTrainerInviteMessage(targetTrainerForShare)}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === `t-msg-${targetTrainerForShare.id}` ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Mensagem Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar Mensagem</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/80 font-mono text-xs text-muted leading-relaxed whitespace-pre-wrap select-all">
                {getTrainerInviteMessage(targetTrainerForShare)}
              </div>
            </div>

            {/* Quick Send Action Buttons */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSendTrainerWhatsApp(targetTrainerForShare)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Enviar pelo WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendTrainerEmail(targetTrainerForShare)}
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
                    onClick={() => setIsTrainerShareModalOpen(false)}
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

      {/* MODAL 6: RESETAR SENHA DO TREINADOR */}
      {targetTrainerForReset && (
        <Modal
          isOpen={isTrainerResetModalOpen}
          onClose={() => setIsTrainerResetModalOpen(false)}
          title="Redefinir Senha do Treinador"
          description={`Gere uma nova senha para ${targetTrainerForReset.fullName} (${(targetTrainerForReset.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining')}).`}
        >
          <form onSubmit={handleConfirmTrainerResetPassword} className="space-y-4">
            <div className="p-3 bg-surface rounded-xl border border-border text-xs space-y-1">
              <span className="text-muted block">E-mail de Login do Treinador:</span>
              <span className="font-mono text-foreground font-bold">{(targetTrainerForReset.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining')}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Nova Senha Provisória</label>
                <button
                  type="button"
                  onClick={() => setTrainerNewPasswordInput('Omega@' + Math.floor(1000 + Math.random() * 9000))}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Gerar Aleatória</span>
                </button>
              </div>

              <Input
                required
                value={trainerNewPasswordInput}
                onChange={(e) => setTrainerNewPasswordInput(e.target.value)}
                placeholder="Digite ou gere uma nova senha"
                className="font-mono text-sm tracking-wider"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsTrainerResetModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="shadow-neon-sm font-bold"
              >
                Salvar Nova Senha
              </Button>
            </div>
          </form>
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
