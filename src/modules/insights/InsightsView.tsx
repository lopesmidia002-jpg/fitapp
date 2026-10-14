import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Calendar,
  User,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Insight } from '../../types';

export function InsightsView() {
  const { insights, resolveInsight } = useApp();

  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [aiDraftMessage, setAiDraftMessage] = useState<string>('');

  const activeInsights = insights.filter(ins => {
    const matchesPriority = filterPriority === 'all' || ins.priority === filterPriority;
    return matchesPriority && ins.status === 'active';
  });

  const handleOpenAiAssistant = (ins: Insight) => {
    setSelectedInsight(ins);
    // Deterministic Smart Draft based on insight type
    if (ins.type === 'retention_risk') {
      setAiDraftMessage(
        `Olá ${ins.studentName?.split(' ')[0]}! Notei que sua rotina ficou mais corrida esses dias. Que tal ajustarmos o treino para uma versão express de 20 min esta semana? Conte comigo!`
      );
    } else if (ins.type === 'assessment_due') {
      setAiDraftMessage(
        `Oi ${ins.studentName?.split(' ')[0]}, tudo bem? Nossa reavaliação física está prevista para os próximos dias. Gostaria de agendar seu horário na quinta ou na sexta?`
      );
    } else {
      setAiDraftMessage(
        `Parabéns pelo ritmo de treinos e consistência esta semana, ${ins.studentName?.split(' ')[0]}! O resultado vem da disciplina constante.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Omega Insights & Alertas Inteligentes <span className="text-primary">●</span>
          </h1>
          <p className="text-sm text-muted">
            Detecção proativa de risco de evasão, reavaliações vencidas e quebras de consistência.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                filterPriority === p
                  ? 'bg-primary text-background font-bold'
                  : 'bg-surface text-muted hover:text-foreground'
              }`}
            >
              {p === 'all' ? 'Todos' : p === 'high' ? 'Críticos' : p === 'medium' ? 'Médios' : 'Baixos'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase">Riscos de Churn</p>
            <p className="text-xl font-extrabold text-foreground">
              {insights.filter(i => i.type === 'retention_risk' && i.status === 'active').length} Alunos
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase">Avaliações Vencendo</p>
            <p className="text-xl font-extrabold text-foreground">
              {insights.filter(i => i.type === 'assessment_due' && i.status === 'active').length} Próximas
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase">Taxa de Resolução</p>
            <p className="text-xl font-extrabold text-primary">87% em 48h</p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {activeInsights.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted">
              <CheckCircle2 className="h-10 w-10 mx-auto text-primary mb-2 opacity-80" />
              <p className="font-bold text-foreground">Tudo em dia!</p>
              <p className="text-xs mt-1">Nenhum alerta pendente para a sua carteira de alunos no momento.</p>
            </CardContent>
          </Card>
        ) : (
          activeInsights.map((insight) => (
            <Card key={insight.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={insight.priority === 'high' ? 'danger' : insight.priority === 'medium' ? 'warning' : 'primary'} size="sm">
                      {insight.priority === 'high' ? 'Crítico' : insight.priority === 'medium' ? 'Atenção' : 'Info'}
                    </Badge>
                    <span className="text-xs text-muted">Detectado em {formatDate(insight.createdAt)}</span>
                    {insight.studentName && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Aluno: {insight.studentName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-foreground text-base">{insight.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{insight.description}</p>

                  <div className="p-3 rounded-xl bg-surface border border-border/80 text-xs">
                    <strong className="text-primary">Ação Sugerida pelo Omega:</strong> {insight.suggestedAction}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenAiAssistant(insight)}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <Bot className="h-4 w-4" />
                    <span>Redigir Mensagem IA</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resolveInsight(insight.id);
                      alert('Alerta resolvido com sucesso!');
                    }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Marcar Resolvido</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* AI Assistant Modal */}
      {selectedInsight && (
        <Modal
          isOpen={!!selectedInsight}
          onClose={() => setSelectedInsight(null)}
          title="Assistente de Comunicação Omega AI"
          description="Rascunho inteligente baseado no histórico do aluno. Todas as mensagens são revisadas pelo profissional."
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-surface border border-border text-xs text-muted flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                Diretriz de Segurança: A IA não prescreve treinos ou dietas automaticamente. Ela prepara um rascunho de acolhimento para sua revisão antes do envio.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase">Rascunho Sugerido (Editável)</label>
              <textarea
                rows={4}
                value={aiDraftMessage}
                onChange={(e) => setAiDraftMessage(e.target.value)}
                className="w-full bg-card text-foreground text-base sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setSelectedInsight(null)}>Cancelar</Button>
              <Button
                variant="primary"
                onClick={() => {
                  resolveInsight(selectedInsight.id);
                  alert(`Mensagem enviada com sucesso para ${selectedInsight.studentName}!`);
                  setSelectedInsight(null);
                }}
                className="flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                <span>Enviar pelo WhatsApp / App</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
