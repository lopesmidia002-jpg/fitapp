import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  ClipboardCheck,
  Target,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  Flame,
  Award
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export function CheckInsView() {
  const { checkIns, reviewCheckIn, goals, addGoal, toggleGoal } = useApp();

  const [activeTab, setActiveTab] = useState<'checkins' | 'goals'>('checkins');
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [coachFeedback, setCoachFeedback] = useState('');

  // New Goal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'workout' as const,
    currentValue: 0,
    targetValue: 16,
    unit: 'treinos',
    deadline: '2026-11-15',
  });

  const handleReview = (id: string) => {
    if (!coachFeedback) return;
    reviewCheckIn(id, coachFeedback);
    setSelectedCheckInId(null);
    setCoachFeedback('');
    alert('Feedback enviado para a aluna com sucesso!');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title) return;
    addGoal({
      ...newGoal,
      studentId: 'stud-1',
    });
    setIsGoalModalOpen(false);
    setNewGoal({
      title: '',
      category: 'workout',
      currentValue: 0,
      targetValue: 16,
      unit: 'treinos',
      deadline: '2026-11-15',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Metas & Check-ins Periódicos <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted">
            Monitore o nível de energia, sono, adesão dietética e feedback contínuo dos alunos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Definir Nova Meta</span>
          </Button>
        </div>
      </div>

      {/* Switcher */}
      <div className="flex space-x-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('checkins')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'checkins'
              ? 'bg-primary text-background font-black shadow-neon-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Check-ins Semanais ({checkIns.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'goals'
              ? 'bg-primary text-background font-black shadow-neon-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Metas e Gamificação Ativa ({goals.length})
        </button>
      </div>

      {/* CHECK-INS VIEW */}
      {activeTab === 'checkins' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checkIns.map((chk) => (
              <Card key={chk.id} className="hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={chk.status === 'reviewed' ? 'success' : 'warning'} size="sm">
                          {chk.status === 'reviewed' ? 'Revisado pelo Treinador' : 'Aguardando Parecer'}
                        </Badge>
                        <span className="text-xs text-muted">{formatDate(chk.date)}</span>
                      </div>
                      <CardTitle className="text-sm">Check-in de Marina Silva Rocha</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <span className="block text-[10px] text-muted font-bold">Energia</span>
                      <span className="font-extrabold text-primary">{chk.energyLevel} / 5</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <span className="block text-[10px] text-muted font-bold">Sono</span>
                      <span className="font-extrabold text-foreground">{chk.sleepHours}h</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <span className="block text-[10px] text-muted font-bold">Dieta</span>
                      <span className="font-extrabold text-emerald-400">{chk.dietAdherence}/5</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <span className="block text-[10px] text-muted font-bold">Treinos</span>
                      <span className="font-extrabold text-sky-400">{chk.workoutAdherence}/5</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface/50 border border-border text-xs text-muted">
                    <strong className="text-foreground">Relato da Aluna:</strong> "{chk.notes}"
                  </div>

                  {chk.proFeedback ? (
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground">
                      <strong className="text-primary flex items-center gap-1 mb-1">
                        <MessageSquare className="h-3.5 w-3.5" /> Seu Parecer de Treinador:
                      </strong>
                      <p className="leading-relaxed">{chk.proFeedback}</p>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedCheckInId(chk.id)}
                        className="w-full"
                      >
                        Responder Check-in
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* GOALS VIEW */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => {
              const progressPercent = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
              return (
                <Card key={g.id} className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{g.title}</h4>
                          <span className="text-[10px] uppercase font-bold text-muted">
                            Categoria: {g.category}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                          g.isCompleted
                            ? 'bg-primary border-primary text-background'
                            : 'border-border text-transparent hover:border-primary'
                        }`}
                        title="Marcar meta concluída"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted">Progresso:</span>
                        <span className="font-bold text-foreground">
                          {g.currentValue} / {g.targetValue} {g.unit} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-dark-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted">
                      <span>Prazo: {formatDate(g.deadline)}</span>
                      {g.isCompleted ? (
                        <Badge variant="success" size="sm">Concluída</Badge>
                      ) : (
                        <span className="text-amber-400 font-semibold">Em andamento</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Review CheckIn Modal */}
      {selectedCheckInId && (
        <Modal
          isOpen={!!selectedCheckInId}
          onClose={() => setSelectedCheckInId(null)}
          title="Responder Check-in Semanal"
          description="Envie um parecer construtivo e motivador para a aluna."
        >
          <div className="space-y-4">
            <Input
              label="Mensagem de Feedback *"
              value={coachFeedback}
              onChange={(e) => setCoachFeedback(e.target.value)}
              placeholder="Ex: Excelente evolução de cargas Marina! Mantenha a hidratação nesta fase."
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setSelectedCheckInId(null)}>Cancelar</Button>
              <Button variant="primary" onClick={() => handleReview(selectedCheckInId)}>
                Enviar Feedback
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Definir Nova Meta para Aluno"
        description="Metas quantitativas de curto/médio prazo."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Título da Meta *"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="Ex: Fazer 20 treinos no mês"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Alvo Numérico *"
              type="number"
              value={newGoal.targetValue}
              onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="Unidade (ex: treinos, km, litros)"
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
            />
          </div>

          <Input
            label="Prazo Limite"
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Criar Meta</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
