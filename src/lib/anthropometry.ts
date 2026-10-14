/**
 * Utilitários e Algoritmos Clínicos de Avaliação Antropométrica
 * Embasamento: Diretrizes da OMS (WHO), ACSM (American College of Sports Medicine)
 * e Protocolo Jackson & Pollock / Pollock 7 Dobras.
 */

export type BMICategory =
  | 'underweight_severe'
  | 'underweight_moderate'
  | 'underweight_mild'
  | 'normal'
  | 'overweight'
  | 'obesity_1'
  | 'obesity_2'
  | 'obesity_3';

export type BodyFatCategory =
  | 'very_low'
  | 'athletic'
  | 'fitness'
  | 'acceptable'
  | 'elevated';

export type CardioRiskLevel = 'low' | 'moderate' | 'high';

export type ClinicalAlertSeverity = 'safe' | 'info' | 'warning' | 'danger';

export interface AnthropometricDiagnosis {
  // Índices
  bmi: number;
  bmiCategory: BMICategory;
  bmiCategoryLabel: string;
  isAthleticOverweight: boolean;

  // Gordura Corporal
  bodyFatPercentage: number;
  bodyFatCategory: BodyFatCategory;
  bodyFatLabel: string;

  // Relações Corporais
  waistToHipRatio: number | null;
  cardioRisk: CardioRiskLevel | null;
  cardioRiskLabel: string | null;
  waistToHeightRatio: number | null;

  // Classificação Integrada
  severity: ClinicalAlertSeverity;
  headline: string;
  badgeLabel: string;
  clinicalExplanation: string;

  // Recomendações Técnicas Estruturadas
  trainingRecommendations: string[];
  nutritionRecommendations: string[];
  healthRecommendations: string[];

  // Parecer condensado formatado para injeção automática
  formattedReportText: string;
}

/**
 * Calcula o IMC (Índice de Massa Corporal) em kg/m²
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Number(bmi.toFixed(1));
}

/**
 * Classifica o IMC conforme os padrões oficiais da OMS (Organização Mundial da Saúde)
 */
export function classifyBMI(bmi: number): { category: BMICategory; label: string } {
  if (bmi <= 0) return { category: 'normal', label: 'Indeterminado' };
  if (bmi < 16.0) return { category: 'underweight_severe', label: 'Baixo Peso Severo (Grau III)' };
  if (bmi < 17.0) return { category: 'underweight_moderate', label: 'Baixo Peso Moderado (Grau II)' };
  if (bmi < 18.5) return { category: 'underweight_mild', label: 'Baixo Peso Leve (Grau I)' };
  if (bmi < 25.0) return { category: 'normal', label: 'Eutrofia (Peso Normal / Saudável)' };
  if (bmi < 30.0) return { category: 'overweight', label: 'Sobrepeso (Pré-obesidade)' };
  if (bmi < 35.0) return { category: 'obesity_1', label: 'Obesidade Grau I (Leve a Moderada)' };
  if (bmi < 40.0) return { category: 'obesity_2', label: 'Obesidade Grau II (Severa)' };
  return { category: 'obesity_3', label: 'Obesidade Grau III (Mórbida)' };
}

/**
 * Classifica o Percentual de Gordura Corporal segundo ACSM / Jackson & Pollock
 */
export function classifyBodyFat(
  bodyFatPercentage: number,
  isFemale: boolean = true
): { category: BodyFatCategory; label: string } {
  const bf = bodyFatPercentage;
  if (isFemale) {
    if (bf < 14) return { category: 'very_low', label: 'Muito Baixo (Abaixo do Essencial Feminino)' };
    if (bf <= 20) return { category: 'athletic', label: 'Excelente / Atlético' };
    if (bf <= 24) return { category: 'fitness', label: 'Bom / Fitness' };
    if (bf <= 31.9) return { category: 'acceptable', label: 'Médio / Aceitável' };
    return { category: 'elevated', label: 'Elevado / Risco de Obesidade' };
  } else {
    if (bf < 6) return { category: 'very_low', label: 'Muito Baixo (Abaixo do Essencial Masculino)' };
    if (bf <= 13) return { category: 'athletic', label: 'Excelente / Atlético' };
    if (bf <= 17) return { category: 'fitness', label: 'Bom / Fitness' };
    if (bf <= 24.9) return { category: 'acceptable', label: 'Médio / Aceitável' };
    return { category: 'elevated', label: 'Elevado / Risco de Obesidade' };
  }
}

/**
 * Calcula a Relação Cintura-Quadril (RCQ) e classifica o risco cardiovascular (OMS)
 */
export function calculateWHR(
  waistCm?: number,
  hipsCm?: number,
  isFemale: boolean = true
): { ratio: number | null; risk: CardioRiskLevel | null; label: string | null } {
  if (!waistCm || !hipsCm || hipsCm <= 0 || waistCm <= 0) {
    return { ratio: null, risk: null, label: null };
  }
  const ratio = Number((waistCm / hipsCm).toFixed(2));
  if (isFemale) {
    if (ratio < 0.80) return { ratio, risk: 'low', label: 'Baixo Risco Cardiovascular (RCQ < 0.80)' };
    if (ratio <= 0.84) return { ratio, risk: 'moderate', label: 'Risco Moderado Cardiovascular (RCQ 0.80-0.84)' };
    return { ratio, risk: 'high', label: 'Alto Risco Cardiovascular (RCQ ≥ 0.85 - Acúmulo Visceral)' };
  } else {
    if (ratio < 0.90) return { ratio, risk: 'low', label: 'Baixo Risco Cardiovascular (RCQ < 0.90)' };
    if (ratio <= 0.99) return { ratio, risk: 'moderate', label: 'Risco Moderado Cardiovascular (RCQ 0.90-0.99)' };
    return { ratio, risk: 'high', label: 'Alto Risco Cardiovascular (RCQ ≥ 1.00 - Acúmulo Visceral)' };
  }
}

/**
 * Gera um diagnóstico antropométrico completo com alertas clínicos e recomendações
 */
export function generateAnthropometricDiagnosis(params: {
  weightKg: number;
  heightCm?: number;
  bodyFatPercentage: number;
  waistCm?: number;
  hipsCm?: number;
  studentName?: string;
  isFemale?: boolean;
}): AnthropometricDiagnosis {
  const {
    weightKg,
    heightCm = 170, // Altura padrão de segurança caso não informada
    bodyFatPercentage,
    waistCm,
    hipsCm,
    isFemale = true,
  } = params;

  const bmi = calculateBMI(weightKg, heightCm);
  const { category: bmiCategory, label: bmiCategoryLabel } = classifyBMI(bmi);
  const { category: bodyFatCategory, label: bodyFatLabel } = classifyBodyFat(bodyFatPercentage, isFemale);
  const { ratio: waistToHipRatio, risk: cardioRisk, label: cardioRiskLabel } = calculateWHR(waistCm, hipsCm, isFemale);

  const waistToHeightRatio = waistCm && heightCm ? Number((waistCm / heightCm).toFixed(2)) : null;

  // Análise de Sobrepeso Atlético (Hipertrofia Muscular sem Excesso de Gordura)
  const isAthleticOverweight =
    (bmiCategory === 'overweight' || (bmiCategory === 'obesity_1' && bmi <= 31)) &&
    (bodyFatCategory === 'athletic' || bodyFatCategory === 'fitness');

  let severity: ClinicalAlertSeverity = 'safe';
  let headline = 'Composição Corporal Adequada';
  let badgeLabel = 'Eutrofia (Peso Saudável)';
  let clinicalExplanation = '';
  const trainingRecommendations: string[] = [];
  const nutritionRecommendations: string[] = [];
  const healthRecommendations: string[] = [];

  // 1. AVALIAÇÃO DE CASOS DE OBESIDADE OU RISCO DE OBESIDADE
  if (bmiCategory === 'obesity_3') {
    severity = 'danger';
    headline = 'Alerta Crítico: Obesidade Grau III (Mórbida)';
    badgeLabel = 'Obesidade Grau III (Mórbida)';
    clinicalExplanation = `IMC de ${bmi} kg/m² e % de gordura em ${bodyFatPercentage}%. Risco cardiometabólico severo com alta probabilidade de sobrecarga articular (lombar e joelhos), resistência à insulina e risco cardiovascular elevado.`;
    trainingRecommendations.push(
      'Priorizar treinos resistidos com exercícios de cadeia cinética fechada e baixo impacto articular.',
      'Cardio contínuo em ergômetros sem impacto (bike horizontal, elíptico, natação) de 30-40 min, 4 a 5x por semana.',
      'Evitar saltos, pliometria e corridas de impacto até regressão ponderal consistente.'
    );
    nutritionRecommendations.push(
      'Déficit calórico estruturado de 500 a 700 kcal/dia sob supervisão conjunta de nutricionista.',
      'Aporte proteico mantido em 1.8 a 2.0g/kg de massa magra para preservação muscular.',
      'Hidratação mandatória mínima de 40 a 45 ml/kg de peso corporal por dia.'
    );
    healthRecommendations.push(
      'Recomendada liberação cardiológica com teste ergométrico recente.',
      'Monitorar pressão arterial antes e após cada sessão de treino.',
      'Reavaliação física e bioimpedância a cada 30 dias.'
    );
  } else if (bmiCategory === 'obesity_2') {
    severity = 'danger';
    headline = 'Alerta Clínico: Obesidade Grau II (Severa)';
    badgeLabel = 'Obesidade Grau II (Severa)';
    clinicalExplanation = `IMC de ${bmi} kg/m² e gordura corporal em ${bodyFatPercentage}%. Apresenta sobrecarga mecânica e metabólica substancial.`;
    trainingRecommendations.push(
      'Foco em musculação com volume moderado e intervalos de recuperação adequados (60 a 90s).',
      'Atividades aeróbicas de baixo impacto 4x na semana com monitoramento de frequência cardíaca.',
      'Fortalecimento do complexo do core e estabilizadores de coluna e quadril.'
    );
    nutritionRecommendations.push(
      'Déficit calórico progressivo de 400 a 600 kcal/dia.',
      'Controle rigoroso de alimentos ultraprocessados e carboidratos de alta densidade energética.',
      'Consumo hídrico mínimo de 40 ml/kg/dia.'
    );
    healthRecommendations.push(
      'Avaliar periodicamente circunferência abdominal e perfil glicêmico.',
      'Atenção a dores patelares e na articulação tibiofêmoral.',
      'Reavaliação antropométrica a cada 30 a 45 dias.'
    );
  } else if (bmiCategory === 'obesity_1') {
    if (isAthleticOverweight) {
      severity = 'info';
      headline = 'Perfil Atlético com Alta Densidade Muscular';
      badgeLabel = 'Massa Magra Elevada (Atlético)';
      clinicalExplanation = `IMC de ${bmi} kg/m² decorrente de grande hipertrofia muscular esquelética (% gordura de apenas ${bodyFatPercentage}%). Não configura obesidade metabólica, evidenciando excelente densidade corporal.`;
      trainingRecommendations.push(
        'Manter periodização de força máxima e hipertrofia miofibrilar.',
        'Incluir treinos de mobilidade articular e flexibilidade para preservar amplitude de movimento.',
        'Aeróbio moderado 2 a 3x por semana para condicionamento cardiorrespiratório.'
      );
      nutritionRecommendations.push(
        'Dieta hiperproteica (2.0 a 2.4 g/kg) com balanço energético equilibrado.',
        'Aporte hídrico de 40 ml/kg para suportar a alta demanda da massa muscular.',
        'Distribuição equilibrada de carboidratos complexos em torno dos treinos.'
      );
      healthRecommendations.push(
        'Perfil lipídico e função hepático-renal periódicos para atletas de alta demanda.',
        'Manutenção da rotina de recuperação ativa e sono regenerativo (7 a 8 horas).'
      );
    } else {
      severity = 'warning';
      headline = 'Atenção: Obesidade Grau I (Leve a Moderada)';
      badgeLabel = 'Obesidade Grau I';
      clinicalExplanation = `IMC de ${bmi} kg/m² acompanhado de % de gordura elevado (${bodyFatPercentage}%). Sinaliza necessidade de intervenção para redução de gordura corporal e proteção cardiovascular.`;
      trainingRecommendations.push(
        'Treino de força prioritário focado em grandes grupos musculares (agachamentos guiados, puxadas, supinos).',
        'Treinamento intervalado de intensidade moderada (HIIT progressivo) ou cardio contínuo 150-200 min/semana.',
        'Cadência controlada nas fases excêntricas para maximizar gasto energético e recrutamento motor.'
      );
      nutritionRecommendations.push(
        'Déficit calórico moderado e sustentável (350 a 500 kcal/dia).',
        'Aporte proteico de 1.8 a 2.2 g/kg para preservar massa muscular durante o processo de emagrecimento.',
        'Aumento expressivo no consumo de fibras (25-35g/dia) e água (35 a 40 ml/kg/dia).'
      );
      healthRecommendations.push(
        'Acompanhar RCQ (Relação Cintura-Quadril) e circunferência da cintura quinzenalmente.',
        'Reavaliação física em 45 dias.'
      );
    }
  } else if (bmiCategory === 'overweight') {
    if (isAthleticOverweight) {
      severity = 'info';
      headline = 'Sobrepeso por Hipertrofia Muscular (Atlético)';
      badgeLabel = 'Sobrepeso Atlético (Massa Magra)';
      clinicalExplanation = `O IMC indica ${bmi} kg/m² (sobrepeso), porém o percentual de gordura de ${bodyFatPercentage}% atesta que o peso é composto predominantemente por massa muscular livre de gordura. Sem risco de obesidade.`;
      trainingRecommendations.push(
        'Periodização ondulatória de força e hipertrofia com sobrecarga progressiva.',
        'Trabalho de condicionamento com aeróbio de suporte 2 a 3x por semana.',
        'Foco em simetria e proporção muscular dos membros.'
      );
      nutritionRecommendations.push(
        'Dieta normocalórica ou ligeiro superávit limpo conforme objetivo de ganho.',
        'Proteína entre 1.8 e 2.2 g/kg/dia fracionada em 4 a 5 refeições.',
        'Ingestão hídrica de 35 a 40 ml/kg/dia.'
      );
      healthRecommendations.push(
        'Excelente prognóstico físico. Manter acompanhamento antropométrico a cada 60 dias.'
      );
    } else {
      severity = 'warning';
      headline = 'Alerta de Pré-Obesidade / Sobrepeso com Risco Adiposo';
      badgeLabel = 'Sobrepeso / Risco de Obesidade';
      clinicalExplanation = `IMC de ${bmi} kg/m² com percentual de gordura elevado (${bodyFatPercentage}%). Quadro compatível com pré-obesidade, indicando fase ideal para reversão precoce com ajustes de treino e rotina alimentar.`;
      trainingRecommendations.push(
        'Aumentar o gasto energético diário combinando treino de musculação 4x/sem e cardio 3x/sem.',
        'Circuitos funcionais ou treinos com densidade metabólica elevada.',
        'Progressão contínua de volume de séries de trabalho semanais.'
      );
      nutritionRecommendations.push(
        'Déficit calórico controlado de 300 a 400 kcal/dia para redução de 1 a 2 kg de gordura ao mês.',
        'Redução de açúcares refinados e bebidas calóricas.',
        'Meta de ingestão proteica de 1.8g/kg/dia.'
      );
      healthRecommendations.push(
        'Monitorar gordura visceral através da medida de cintura a cada 30 dias.',
        'Reavaliação física em 45 dias para checar recomposição corporal.'
      );
    }
  } else if (bmiCategory === 'underweight_severe' || bmiCategory === 'underweight_moderate') {
    // 2. AVALIAÇÃO DE CASOS DE BAIXO PESO GRAVE OU MODERADO
    severity = 'danger';
    headline = 'Alerta Clínico: Abaixo do Peso (Risco de Desnutrição)';
    badgeLabel = 'Baixo Peso Severo / Moderado';
    clinicalExplanation = `IMC de ${bmi} kg/m² indica déficit ponderal severo. Risco elevado de perda de massa magra, fragilidade óssea, disfunção hormonal (queda de testosterona/estrogênio) e comprometimento do sistema imune.`;
    trainingRecommendations.push(
      'Foco exclusivo em treinamento de força e hipertrofia com cargas moderadas a altas e repetições de 6 a 10.',
      'Descanso completo e ampliado entre as séries (2 a 3 minutos) para evitar catabolismo excessivo.',
      'Suspender temporariamente atividades aeróbicas extenuantes para conter o gasto calórico.'
    );
    nutritionRecommendations.push(
      'Superávit calórico controlado e limpo de 400 a 600 kcal/dia acima do gasto energético total.',
      'Aporte proteico mínimo de 1.8 a 2.0g/kg acompanhado de carboidratos de alta densidade e gorduras saudáveis (azeite, pasta de amendoim, abacate).',
      'Refeições regulares fracionadas a cada 3 horas.'
    );
    healthRecommendations.push(
      'Investigação médica para descartar causas metabólicas (tireoide, má-absorção gastrointestinal).',
      'Acompanhar densidade mineral óssea e marcadores hormonais.',
      'Reavaliação antropométrica em 30 dias para checar recuperação ponderal.'
    );
  } else if (bmiCategory === 'underweight_mild') {
    severity = 'warning';
    headline = 'Atenção: Abaixo do Peso Ideal (Grau I)';
    badgeLabel = 'Abaixo do Peso Leve (Grau I)';
    clinicalExplanation = `IMC de ${bmi} kg/m² aponta peso abaixo da faixa de eutrofia recomendada pela OMS. Requer estímulo direcionado para ganho de massa livre de gordura.`;
    trainingRecommendations.push(
      'Programa de musculação focado em hipertrofia miofibrilar 3 a 4x por semana.',
      'Priorizar exercícios multiarticulares básicos (supino, agachamento, levantamento terra, remadas).',
      'Limitar treinos de endurance/cardio a no máximo 15-20 minutos pós-treino.'
    );
    nutritionRecommendations.push(
      'Superávit calórico moderado de 300 kcal/dia.',
      'Aporte proteico de 1.8g/kg/dia com suporte de suplementação se necessário (creatina, whey protein).',
      'Hidratação orientada em 35 ml/kg/dia.'
    );
    healthRecommendations.push(
      'Reavaliação física em 45 dias com objetivo de ganho ponderal magro de 0.5 a 1.0 kg/mês.'
    );
  } else {
    // 3. EUTROFIA / PESO NORMAL / EXCELENTE
    if (bodyFatCategory === 'very_low') {
      severity = 'warning';
      headline = 'Atenção: Gordura Corporal Excessivamente Baixa';
      badgeLabel = 'Gordura Abaixo do Essencial';
      clinicalExplanation = `Apesar do IMC em faixa normal (${bmi} kg/m²), o percentual de gordura de ${bodyFatPercentage}% está abaixo da gordura essencial fisiológica, elevando risco de fadiga crônica, amenorreia em mulheres e disfunção imune.`;
      trainingRecommendations.push(
        'Moderar o volume e a densidade dos treinos para evitar overtraining.',
        'Reduzir a frequência de cardios de alta intensidade.'
      );
      nutritionRecommendations.push(
        'Leve superávit calórico com ênfase em ácidos graxos essenciais (ômega 3, azeite, castanhas) para restauração hormonal.'
      );
      healthRecommendations.push(
        'Acompanhamento hormonal e verificação de sinais de fadiga do sistema nervoso central.'
      );
    } else {
      severity = 'safe';
      headline = 'Eutrofia: Peso Saudável e Composição Adequada';
      badgeLabel = 'Peso Saudável (Eutrófico)';
      clinicalExplanation = `IMC de ${bmi} kg/m² dentro da faixa de referência saudável da OMS (18.5 - 24.9), acompanhado de percentual de gordura equilibrado (${bodyFatPercentage}% - ${bodyFatLabel}). Risco cardiometabólico mínimo.`;
      trainingRecommendations.push(
        'Manter periodização estruturada focada nas metas individuais (hipertrofia, definição estética ou força atlética).',
        'Alternar mesociclos de sobrecarga com semanas de deload a cada 6 a 8 semanas.',
        'Incluir treino aeróbico preventivo 2 a 3x por semana para condicionamento cardiovascular.'
      );
      nutritionRecommendations.push(
        'Dieta equilibrada normocalórica ou ligeiro ajuste conforme os objetivos do plano.',
        'Ingestão proteica de 1.6 a 2.0g/kg/dia.',
        'Consumo hídrico regular de 35 ml/kg de peso corporal.'
      );
      healthRecommendations.push(
        'Excelente estado antropométrico. Manter reavaliações preventivas a cada 45 a 60 dias.'
      );
    }
  }

  // Agrega alerta de risco cardiovascular se RCQ estiver alto
  if (cardioRisk === 'high') {
    clinicalExplanation += ` Alerta adicional: Relação Cintura-Quadril (RCQ: ${waistToHipRatio}) indica acúmulo de gordura intra-abdominal (visceral), aumentando o risco cardiovascular independente do IMC.`;
  }

  // Montagem do parecer condensado formatado para injeção automática no formulário
  const reportParts = [
    `[DIAGNÓSTICO ANTROPOMÉTRICO: ${badgeLabel.toUpperCase()}]`,
    `• Métricas: IMC ${bmi} kg/m² (${bmiCategoryLabel}) | Gordura: ${bodyFatPercentage}% (${bodyFatLabel})${
      waistToHipRatio ? ` | RCQ: ${waistToHipRatio} (${cardioRiskLabel})` : ''
    }.`,
    `• Parecer Clínico: ${clinicalExplanation}`,
    `• Prescrição de Treino: ${trainingRecommendations[0] || 'Periodização personalizada conforme meta.'}`,
    `• Diretrizes Nutricionais: ${nutritionRecommendations[0] || 'Manter aporte calórico e proteico adequado.'}`,
    `• Monitoramento: ${healthRecommendations[0] || 'Reavaliação antropométrica em 45 dias.'}`
  ];

  return {
    bmi,
    bmiCategory,
    bmiCategoryLabel,
    isAthleticOverweight,
    bodyFatPercentage,
    bodyFatCategory,
    bodyFatLabel,
    waistToHipRatio,
    cardioRisk,
    cardioRiskLabel,
    waistToHeightRatio,
    severity,
    headline,
    badgeLabel,
    clinicalExplanation,
    trainingRecommendations,
    nutritionRecommendations,
    healthRecommendations,
    formattedReportText: reportParts.join('\n')
  };
}
