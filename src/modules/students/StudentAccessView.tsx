import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Student } from '../../types';
import {
  Key,
  Users,
  Search,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Copy,
  Check,
  Eye,
  EyeOff,
  Send,
  MessageSquare,
  ExternalLink,
  UserCheck,
  UserX,
  Trash2,
  Smartphone,
  Phone
} from 'lucide-react';

export function StudentAccessView() {
  const {
    students,
    blockStudent,
    unblockStudent,
    deleteStudent,
    resetStudentPassword
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    const pwd = student.temporaryPassword || 'Omega@2026';
    return `${origin}${pathname}?access=student&id=${encodeURIComponent(student.id)}&login=${encodeURIComponent(student.email)}&name=${encodeURIComponent(student.fullName)}&pwd=${encodeURIComponent(pwd)}`;
  };

  const getStudentInviteMessage = (student: Student) => {
    const link = getStudentAccessLink(student);
    const pwd = student.temporaryPassword || 'Omega@2026';
    const cleanEmail = (student.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining');
    return `⚡ *Omega Training — Acesso do Aluno*

Olá, *${student.fullName}*!
Seu acesso ao seu aplicativo exclusivo de treinos Omega Training já está liberado pelo seu treinador.

📱 *Acesse seu app por este link direto:*
${link}

🔑 *Suas Credenciais de Acesso:*
• *Login (E-mail):* ${cleanEmail}
• *Senha Inicial:* ${pwd}

🔒 *Instruções de Acesso:*
1. Clique no link acima;
2. Digite sua senha de acesso na tela de login para validar seu perfil de aluno;
3. No celular (Chrome ou Safari), toque em *"Adicionar à Tela de Início"* para salvar como aplicativo nativo no seu aparelho.

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
  };

  const handleSendEmail = (student: Student) => {
    const msg = getStudentInviteMessage(student);
    const subject = encodeURIComponent('Seu Acesso ao Omega Training');
    const body = encodeURIComponent(msg);
    const cleanEmail = (student.email || '').replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro').replace(/fitcore/gi, 'omegatraining');
    window.open(`mailto:${cleanEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  // Active / Blocked calculations
  const activeStudentsList = students.filter(s => !s.accessBlocked && s.status !== 'blocked');
  const blockedStudentsList = students.filter(s => s.accessBlocked || s.status === 'blocked');

  // Filtered students for display
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const handleBlockStudent = (student: Student) => {
    const reason = prompt(`Confirma o bloqueio de acesso para ${student.fullName}?\nInforme o motivo do bloqueio:`, 'Suspensão temporária pelo Treinador');
    if (reason !== null) {
      blockStudent(student.id, reason);
    }
  };

  const handleUnblockStudent = (student: Student) => {
    if (confirm(`Deseja desbloquear e restaurar o acesso de ${student.fullName}?`)) {
      unblockStudent(student.id);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Atenção: Deseja EXCLUIR permanentemente o aluno "${student.fullName}"?\n\nO cadastro e todas as credenciais de acesso serão removidos.`)) {
      deleteStudent(student.id);
      setShareToast(`Aluno "${student.fullName}" excluído com sucesso!`);
      setTimeout(() => setShareToast(null), 3500);
    }
  };

  const handleOpenResetModal = (student: Student) => {
    setTargetStudentForReset(student);
    setNewPasswordInput('Omega@' + Math.floor(1000 + Math.random() * 9000));
    setIsResetModalOpen(true);
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForReset || !newPasswordInput) return;

    resetStudentPassword(targetStudentForReset.id, newPasswordInput);
    setIsResetModalOpen(false);
    alert(`Senha de ${targetStudentForReset.fullName} atualizada com sucesso para: ${newPasswordInput}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Key className="h-3 w-3" />
              <span>Modo Treinador • Gestão de Acessos</span>
            </span>
            <span className="text-xs text-muted font-medium">
              {students.length} alunos cadastrados
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <span>Login & Senhas dos Alunos</span>
            <span className="text-primary font-mono text-lg font-bold">({students.length})</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Gerencie credenciais de login, senhas provisórias e links diretos para cada aluno cadastrado no sistema. Novos cadastros são realizados pelo menu principal em Alunos (CRM).
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted">Total de Alunos</p>
            <p className="text-2xl font-black text-foreground mt-0.5">{students.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-400">Acessos Liberados</p>
            <p className="text-2xl font-black text-foreground mt-0.5">{activeStudentsList.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-400">Acessos Bloqueados</p>
            <p className="text-2xl font-black text-foreground mt-0.5">{blockedStudentsList.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Card with Table & Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <span>Credenciais de Login & Controle de Acesso dos Alunos</span>
              </CardTitle>
              <CardDescription>
                Gerencie o e-mail de login, senha provisória de acesso e bloqueie o aluno caso ele seja suspenso ou desativado.
              </CardDescription>
            </div>
          </div>

          {/* Informative Banner: Student Access Link */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs mt-3 w-full max-w-full overflow-hidden">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">Como o aluno acessa o aplicativo no modo aluno?</p>
                <p className="text-muted text-[11px] break-words">
                  Você pode enviar o link direto com login e senha via WhatsApp para cada aluno, ou fornecer o link geral do aplicativo.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0 min-w-0">
              <span className="font-mono text-[11px] bg-background px-2.5 py-1.5 rounded-lg border border-border text-primary font-medium truncate max-w-full sm:max-w-xs text-center sm:text-left">
                {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?access=student` : '...'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const generalLink = `${window.location.origin}${window.location.pathname}?access=student`;
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

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-surface p-1 rounded-xl border border-border text-xs overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-primary text-background dark:text-black font-extrabold shadow-sm'
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
                    ? 'bg-primary text-background dark:text-black font-extrabold shadow-sm'
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
                const password = student.temporaryPassword || 'Omega@2026';

                return (
                  <div
                    key={student.id}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-4 w-full max-w-full overflow-hidden ${
                      isBlocked
                        ? 'bg-rose-500/5 border-rose-500/30'
                        : 'bg-card border-border hover:border-primary/40 shadow-xs'
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

                        {student.phone && (
                          <p className="text-[11px] text-muted mt-1 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-primary shrink-0" />
                            <span>{student.phone}</span>
                          </p>
                        )}

                        {isBlocked && student.blockedReason && (
                          <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 flex items-start gap-1 break-words">
                            <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="break-words">Motivo: {student.blockedReason}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Credentials Card (Login & Password) */}
                    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50/80 dark:bg-card/80 p-2 sm:p-2.5 rounded-xl border border-border text-xs min-w-0 max-w-full overflow-hidden">
                      {/* Login / Email */}
                      <div className="flex items-center justify-between sm:justify-start gap-2 bg-card dark:bg-surface px-2.5 py-1.5 rounded-lg border border-border/60 min-w-0 flex-1 sm:flex-initial">
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
                      <div className="flex items-center justify-between sm:justify-start gap-2 bg-card dark:bg-surface px-2.5 py-1.5 rounded-lg border border-border/60 min-w-0 flex-1 sm:flex-initial">
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
    </div>
  );
}
