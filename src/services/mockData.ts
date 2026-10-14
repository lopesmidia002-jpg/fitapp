import {
  UserProfile,
  Organization,
  Student,
  Exercise,
  WorkoutPlan,
  PhysicalAssessment,
  Insight,
  SaaSPlan,
  CheckIn,
  Goal,
  NotificationItem,
  NutritionPlan,
  Trainer
} from '../types';

export const INITIAL_ORGANIZATION: Organization = {
  id: 'org-alpha-1',
  name: 'Omega Training',
  slug: 'omega-training',
  planId: 'pro',
  ownerId: 'user-pro-1',
  studentCount: 38,
  maxStudents: 50,
  proCount: 3,
  createdAt: '2025-01-15T10:00:00Z',
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-pro-1',
    email: 'nilson.coach@omegatraining.pro',
    fullName: 'Professor Nilson',
    role: 'pro',
    organizationId: 'org-alpha-1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    phone: '(11) 98765-4321',
  },
  {
    id: 'user-student-1',
    email: 'marina.aluna@email.com',
    fullName: 'Marina Silva Rocha',
    role: 'student',
    organizationId: 'org-alpha-1',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    phone: '(11) 91234-5678',
  },
  {
    id: 'user-superadmin-1',
    email: 'admin@omegatraining.pro',
    fullName: 'Admin Master Global',
    role: 'superadmin',
    organizationId: 'org-master',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  }
];

export const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 'user-pro-1',
    organizationId: 'org-alpha-1',
    fullName: 'Professor Nilson Rocha',
    email: 'nilson.coach@omegatraining.pro',
    phone: '(11) 98765-4321',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'pro',
    status: 'active',
    cref: '048219-G/SP',
    specialty: 'Hipertrofia, Biomecânica e Avaliação Física',
    temporaryPassword: 'Omega@Coach2026',
    accessBlocked: false,
    assignedStudentsCount: 38,
    createdAt: '2025-01-15T10:00:00Z',
    lastLogin: '2026-10-14 09:30:00',
  },
  {
    id: 'trainer-2',
    organizationId: 'org-alpha-1',
    fullName: 'Camila Ferreira Personal',
    email: 'camila.personal@omegatraining.pro',
    phone: '(11) 97654-3210',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    role: 'pro',
    status: 'active',
    cref: '059142-G/SP',
    specialty: 'Emagrecimento, Treinamento Funcional e Mobilidade',
    temporaryPassword: 'Omega@Coach2026',
    accessBlocked: false,
    assignedStudentsCount: 14,
    createdAt: '2025-04-10T14:20:00Z',
    lastLogin: '2026-10-13 18:45:00',
  },
  {
    id: 'trainer-3',
    organizationId: 'org-alpha-1',
    fullName: 'Rodrigo Siqueira Personal',
    email: 'rodrigo.coach@omegatraining.pro',
    phone: '(11) 96543-2109',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    role: 'pro',
    status: 'active',
    cref: '061230-G/SP',
    specialty: 'Força, Powerlifting e Condicionamento Atlético',
    temporaryPassword: 'Omega@Coach2026',
    accessBlocked: false,
    assignedStudentsCount: 8,
    createdAt: '2025-07-22T08:15:00Z',
    lastLogin: '2026-10-12 11:10:00',
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stud-1',
    organizationId: 'org-alpha-1',
    proId: 'user-pro-1',
    fullName: 'Marina Silva Rocha',
    email: 'marina.aluna@email.com',
    phone: '(11) 91234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    goal: 'Hipertrofia e Definição Muscular',
    currentWeightKg: 62.4,
    targetWeightKg: 64.0,
    heightCm: 168,
    joinDate: '2025-06-10',
    lastActive: '2026-10-13T18:30:00Z',
    adherenceRate: 94,
    completedWorkouts: 42,
    nextAssessmentDate: '2026-10-25',
    privateNotes: 'Apresenta leve desconforto patelar no joelho esquerdo em flexão profunda.',
    temporaryPassword: 'Fit@Marina2026',
    accessBlocked: false,
  },
  {
    id: 'stud-2',
    organizationId: 'org-alpha-1',
    proId: 'user-pro-1',
    fullName: 'Rodrigo Barreto Lima',
    email: 'rodrigo.barreto@gmail.com',
    phone: '(11) 97711-2233',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    goal: 'Redução de % de Gordura e Condicionamento',
    currentWeightKg: 88.5,
    targetWeightKg: 80.0,
    heightCm: 181,
    joinDate: '2025-08-01',
    lastActive: '2026-10-12T07:15:00Z',
    adherenceRate: 88,
    completedWorkouts: 31,
    nextAssessmentDate: '2026-11-05',
    temporaryPassword: 'Fit@Rodrigo2026',
    accessBlocked: false,
  },
  {
    id: 'stud-3',
    organizationId: 'org-alpha-1',
    proId: 'user-pro-1',
    fullName: 'Fernanda Albuquerque',
    email: 'fernanda.alb@outlook.com',
    phone: '(11) 99882-3344',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    status: 'inactive',
    goal: 'Fortalecimento de Coluna e Postura',
    currentWeightKg: 58.0,
    targetWeightKg: 59.0,
    heightCm: 162,
    joinDate: '2025-04-12',
    lastActive: '2026-10-02T19:00:00Z',
    adherenceRate: 45,
    completedWorkouts: 16,
    nextAssessmentDate: '2026-10-18',
    privateNotes: 'Viajando a trabalho com frequência.',
    temporaryPassword: 'Fit@Fernanda2026',
    accessBlocked: false,
  },
  {
    id: 'stud-4',
    organizationId: 'org-alpha-1',
    proId: 'user-pro-1',
    fullName: 'Gabriel Costa Nogueira',
    email: 'gabriel.costa@empresa.com',
    phone: '(11) 96543-2109',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    goal: 'Preparação para Meia Maratona',
    currentWeightKg: 73.2,
    targetWeightKg: 72.0,
    heightCm: 176,
    joinDate: '2025-09-15',
    lastActive: '2026-10-14T06:45:00Z',
    adherenceRate: 98,
    completedWorkouts: 28,
    temporaryPassword: 'Fit@Gabriel2026',
    accessBlocked: false,
  }
];

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Supino Reto com Barra',
    muscleGroup: 'Peitoral',
    equipment: 'Barra',
    instructions: 'Mantenha as escápulas retraídas, pés firmes no chão, desça a barra até a linha do esterno e empurre com controle.',
    precautions: 'Evite rebater a barra contra o peito e controle a descida (2-3 segundos).',
    targetSetsDefault: 4,
    targetRepsDefault: '8 a 10',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Bench_press_-_exercise_demonstration_video.webm',
    videoDuration: '0:22',
  },
  {
    id: 'ex-2',
    name: 'Agachamento Livre com Barra',
    muscleGroup: 'Pernas',
    equipment: 'Barra',
    instructions: 'Pés na largura dos ombros, peito aberto, desça até que as coxas fiquem paralelas ao chão mantendo joelhos alinhados com as pontas dos pés.',
    precautions: 'Evite o valgo dinâmico (joelhos para dentro) e flexão excessiva da lombar.',
    targetSetsDefault: 4,
    targetRepsDefault: '6 a 8',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
    videoDuration: '0:28',
  },
  {
    id: 'ex-3',
    name: 'Puxada Alta no Pulley',
    muscleGroup: 'Costas',
    equipment: 'Cabo',
    instructions: 'Pegada aberta pronada, puxe a barra em direção à parte superior do peitoral com foco na contração dos dorsais.',
    precautions: 'Não jogue o tronco excessivamente para trás durante a fase concêntrica.',
    targetSetsDefault: 3,
    targetRepsDefault: '10 a 12',
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    videoDuration: '0:30',
  },
  {
    id: 'ex-4',
    name: 'Elevação Lateral com Halteres',
    muscleGroup: 'Ombros',
    equipment: 'Halteres',
    instructions: 'Cotovelos levemente flexionados, eleve os braços no plano escapular até a altura dos ombros.',
    precautions: 'Evite compensar com elevação dos trapézios ou impulsos do tronco.',
    targetSetsDefault: 4,
    targetRepsDefault: '12 a 15',
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    videoDuration: '0:24',
  },
  {
    id: 'ex-5',
    name: 'Rosca Direta com Barra W',
    muscleGroup: 'Braços',
    equipment: 'Barra',
    instructions: 'Cotovelos junto ao corpo, flexione os braços mantendo a pegada anatômica na barra W e desça com controle.',
    targetSetsDefault: 3,
    targetRepsDefault: '10 a 12',
    videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    videoDuration: '0:22',
  },
  {
    id: 'ex-6',
    name: 'Tríceps Corda no Cross',
    muscleGroup: 'Braços',
    equipment: 'Cabo',
    instructions: 'Mantenha os cotovelos travados na linha do corpo, estenda totalmente os braços afastando a corda no final.',
    targetSetsDefault: 3,
    targetRepsDefault: '12 a 15',
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    videoDuration: '0:25',
  },
  {
    id: 'ex-7',
    name: 'Prancha Abdominal Isométrica',
    muscleGroup: 'Abdômen',
    equipment: 'Peso Corporal',
    instructions: 'Antebraços apoiados no solo, corpo alinhado da cabeça aos calcanhares, glúteos e abdômen contraídos.',
    precautions: 'Não deixe a pelve cair nem eleve o quadril formando um arco.',
    targetSetsDefault: 3,
    targetRepsDefault: '45 a 60 seg',
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    videoDuration: '0:30',
  },
  // Exercícios de Cardio com Equipamentos, Instruções de Execução e Cuidados Posturais
  {
    id: 'ex-cardio-1',
    name: 'Corrida / Caminhada Inclinada na Esteira',
    muscleGroup: 'Cardio',
    equipment: 'Esteira Ergométrica',
    instructions: 'Manter cadência constante de passadas, olhar para frente na linha do horizonte, tronco levemente inclinado a favor do movimento, aterrissagem suave com o mediopé e braços flexionados a 90° sincronizados com as pernas.',
    precautions: 'Não segurar nas barras de apoio (reduz em até 30% o gasto calórico e altera a marcha natural). Evitar passadas excessivamente longas (overstriding) para proteger meniscos e lombar. Manter ombros relaxados para não tensionar o trapézio.',
    targetSetsDefault: 1,
    targetRepsDefault: '20 a 30 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:25',
  },
  {
    id: 'ex-cardio-2',
    name: 'Bicicleta Ergométrica Vertical (Spinning)',
    muscleGroup: 'Cardio',
    equipment: 'Bicicleta Ergométrica',
    instructions: 'Ajustar a altura do selim na altura da crista ilíaca (osso do quadril). Pedalada fluida em 360°, mantendo joelhos paralelos (sem abrir para fora). Manter cadência controlada entre 75 a 90 RPM com carga progressiva.',
    precautions: 'O joelho deve manter leve flexão de 25° a 30° no ponto mais baixo do pedal (evitar hiperextensão articular). Não curvar excessivamente a coluna lombar nem descarregar peso excessivo nos punhos sobre o guidão.',
    targetSetsDefault: 1,
    targetRepsDefault: '25 a 35 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Stationary_bicycle_exercise.webm',
    videoDuration: '0:20',
  },
  {
    id: 'ex-cardio-3',
    name: 'Bicicleta Ergométrica Horizontal (Recumbent)',
    muscleGroup: 'Cardio',
    equipment: 'Bicicleta Ergométrica Horizontal',
    instructions: 'Acomodar as costas totalmente apoiadas no encosto ergonômico. Ajustar a distância do assento para que a perna não trave esticada no fim do curso. Segurar suavemente nas manoplas laterais com respiração contínua.',
    precautions: 'Ideal para alunos com dor lombar, gestantes ou sobrepeso severo. Manter o quadril colado no encosto sem deslizar para frente. Manter os pés seguros nas presilhas dos pedais para poupar os tornozelos.',
    targetSetsDefault: 1,
    targetRepsDefault: '20 a 30 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Stationary_bicycle_exercise.webm',
    videoDuration: '0:20',
  },
  {
    id: 'ex-cardio-4',
    name: 'Simulador de Escada (StairMaster)',
    muscleGroup: 'Cardio',
    equipment: 'Simulador de Escada',
    instructions: 'Subir degrau por degrau apoiando a planta inteira do pé no centro do degrau. Empurrar com calcanhares e glúteos para máxima ativação da cadeia posterior. Manter ritmo constante e respiração diafragmática.',
    precautions: 'Não apoiar o peso do corpo sobre o corrimão (as mãos servem apenas para equilíbrio sutil). Não inclinar o tronco excessivamente à frente ("corcunda"). Manter joelhos sem valgo dinâmico.',
    targetSetsDefault: 1,
    targetRepsDefault: '15 a 20 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:25',
  },
  {
    id: 'ex-cardio-5',
    name: 'Elíptico / Transport',
    muscleGroup: 'Cardio',
    equipment: 'Elíptico',
    instructions: 'Movimento contínuo sincronizado empurrando e puxando as hastes com os membros superiores e pedalando com os inferiores em movimento elíptico suave sem impacto articular.',
    precautions: 'Manter calcanhares em contato com a plataforma durante o ciclo (não pedalar nas pontas dos pés para evitar fascite plantar). Manter coluna ereta e abdômen ativado.',
    targetSetsDefault: 1,
    targetRepsDefault: '20 a 30 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Stationary_bicycle_exercise.webm',
    videoDuration: '0:20',
  },
  {
    id: 'ex-cardio-6',
    name: 'Remo Seco Indoor (Air Rower)',
    muscleGroup: 'Cardio',
    equipment: 'Remo Seco (Air Rower)',
    instructions: 'Ciclo biomecânico: Ataque (Catch) -> Propulsão (Drive: estender pernas 60%, inclinar tronco 20%, puxar braços 20%) -> Finalização (Finish) -> Retorno suave (Recovery inverso).',
    precautions: 'Não iniciar a puxada flexionando as costas. A força inicial nasce 100% da extensão dos membros inferiores. Na propulsão, estenda os joelhos antes de puxar a manopla ao esterno.',
    targetSetsDefault: 1,
    targetRepsDefault: '15 a 20 min',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:22',
  },
  {
    id: 'ex-cardio-7',
    name: 'Air Bike (Assault Bike)',
    muscleGroup: 'Cardio',
    equipment: 'Air Bike',
    instructions: 'Pedalada de alta intensidade combinando empurrar e puxar vigoroso das manoplas, aproveitando a resistência do ar proporcional à potência gerada em tiros ou cadência contínua.',
    precautions: 'Evitar oscilação lateral excessiva do tronco. Manter o core ativado e ombros afastados das orelhas. Atenção ao alinhamento dos joelhos na fase de fadiga aguda.',
    targetSetsDefault: 4,
    targetRepsDefault: '30s tiro / 30s leve',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Stationary_bicycle_exercise.webm',
    videoDuration: '0:20',
  },
  {
    id: 'ex-cardio-8',
    name: 'Corda Naval (Battle Rope)',
    muscleGroup: 'Cardio',
    equipment: 'Corda Naval',
    instructions: 'Base semiagachada com joelhos flexionados, core firme e peito aberto. Produzir ondas alternadas ou simultâneas movimentando os braços com potência a partir dos ombros.',
    precautions: 'Não arquear ou arredondar a coluna lombar durante os impulsos. Manter joelhos alinhados sem colapso medial e peso distribuído nos calcanhares.',
    targetSetsDefault: 4,
    targetRepsDefault: '30 a 45 seg',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:20',
  },
  {
    id: 'ex-cardio-9',
    name: 'Corda de Pular (Jump Rope)',
    muscleGroup: 'Cardio',
    equipment: 'Corda de Pular',
    instructions: 'Giro da corda pelos punhos com cotovelos próximos às costelas. Saltos baixos (1 a 2 cm do solo) aterrissando suavemente na ponta dos pés com joelhos destravados.',
    precautions: 'Não saltar flexionando os joelhos para trás. Aterrissagem suave e elástica para proteger o tendão de Aquiles e a coluna vertebral.',
    targetSetsDefault: 4,
    targetRepsDefault: '60 a 90 seg',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Treadmill_running_exercise.webm',
    videoDuration: '0:25',
  }
];

export const INITIAL_WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'plan-1',
    organizationId: 'org-alpha-1',
    studentId: 'stud-1',
    proId: 'user-pro-1',
    title: 'Treino A — Foco Peitoral, Ombros & Tríceps',
    split: 'A',
    description: 'Ênfase em volume progressivo com controle excêntrico de 3 segundos.',
    validUntil: '2026-11-30',
    createdAt: '2026-09-01T10:00:00Z',
    exercises: [
      {
        exerciseId: 'ex-1',
        name: 'Supino Reto com Barra',
        sets: 4,
        reps: '8-10',
        restSeconds: 90,
        weightKg: 40,
        notes: 'Aquecer 2 séries com peso leve antes das séries de trabalho.',
        videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Bench_press_-_exercise_demonstration_video.webm',
        videoDuration: '0:22'
      },
      {
        exerciseId: 'ex-4',
        name: 'Elevação Lateral com Halteres',
        sets: 4,
        reps: '12-15',
        restSeconds: 60,
        weightKg: 8,
        videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
        videoDuration: '0:24'
      },
      {
        exerciseId: 'ex-6',
        name: 'Tríceps Corda no Cross',
        sets: 3,
        reps: '12-15',
        restSeconds: 60,
        weightKg: 25,
        videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
        videoDuration: '0:25'
      }
    ]
  }
];

export const INITIAL_INSIGHTS: Insight[] = [
  {
    id: 'ins-1',
    organizationId: 'org-alpha-1',
    studentId: 'stud-3',
    studentName: 'Fernanda Albuquerque',
    type: 'retention_risk',
    title: 'Risco de Churn: 12 dias sem registrar treino',
    description: 'Fernanda reduziu sua frequência em 65% nos últimos 15 dias. Histórico indica sobrecarga no trabalho.',
    priority: 'high',
    suggestedAction: 'Enviar mensagem de suporte e sugerir rotina express de 20 minutos.',
    createdAt: '2026-10-14T08:00:00Z',
    status: 'active',
  },
  {
    id: 'ins-2',
    organizationId: 'org-alpha-1',
    studentId: 'stud-1',
    studentName: 'Marina Silva Rocha',
    type: 'assessment_due',
    title: 'Reavaliação Física Próxima',
    description: 'A avaliação física de Marina vence em 11 dias (25/10/2026). Agende o horário.',
    priority: 'medium',
    suggestedAction: 'Enviar convite de agendamento de avaliação presencial ou online.',
    createdAt: '2026-10-13T11:20:00Z',
    status: 'active',
  },
  {
    id: 'ins-3',
    organizationId: 'org-alpha-1',
    studentId: 'stud-4',
    studentName: 'Gabriel Costa Nogueira',
    type: 'workout_milestone',
    title: 'Marco Concluído: 98% de Adesão',
    description: 'Gabriel bateu a meta semanal de 5 treinos consecutivos sem faltas.',
    priority: 'low',
    suggestedAction: 'Enviar mensagem de reconhecimento para reforçar a disciplina.',
    createdAt: '2026-10-14T07:00:00Z',
    status: 'active',
  }
];

export const SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'starter',
    name: 'STARTER',
    priceMonthly: 89,
    maxStudents: 15,
    maxPros: 1,
    features: [
      'Até 15 alunos ativos',
      'Montagem de treinos ilimitada',
      'Biblioteca completa de exercícios',
      'Dashboard essencial',
      'PWA Mobile para o aluno',
      'Suporte via e-mail'
    ]
  },
  {
    id: 'pro',
    name: 'PRO',
    priceMonthly: 179,
    maxStudents: 50,
    maxPros: 2,
    isPopular: true,
    features: [
      'Até 50 alunos ativos',
      'Tudo do plano Starter',
      'Módulo de Nutrição e Diário',
      'Avaliações físicas e evolução com fotos',
      'Motor Omega Insights e Alertas',
      'Check-ins periódicos automatizados',
      'Suporte prioritário via WhatsApp'
    ]
  },
  {
    id: 'business',
    name: 'BUSINESS',
    priceMonthly: 349,
    maxStudents: 200,
    maxPros: 10,
    features: [
      'Até 200 alunos ativos',
      'Tudo do plano PRO',
      'Gestão de equipe (múltiplos profissionais)',
      'Permissões granulares de acesso',
      'Relatórios financeiros e exportação avançada',
      'Domínio customizado e marca própria (White-label)',
      'Gerente de conta dedicado'
    ]
  }
];

export const INITIAL_ASSESSMENTS: PhysicalAssessment[] = [
  // Marina Silva Rocha (stud-1)
  {
    id: 'ass-1',
    studentId: 'stud-1',
    proId: 'user-pro-1',
    date: '2026-08-20',
    weightKg: 64.2,
    bodyFatPercentage: 22.4,
    method: 'Pollock 7 Dobras',
    chestCm: 88,
    waistCm: 68,
    hipsCm: 99,
    armsCm: 28.5,
    thighsCm: 56,
    proObservations: 'Excelente resposta à periodização de força. Diminuição consistente da circunferência abdominal.'
  },
  {
    id: 'ass-2',
    studentId: 'stud-1',
    proId: 'user-pro-1',
    date: '2026-09-22',
    weightKg: 62.4,
    bodyFatPercentage: 20.1,
    method: 'Pollock 7 Dobras',
    chestCm: 87.5,
    waistCm: 66,
    hipsCm: 98,
    armsCm: 29.2,
    thighsCm: 56.5,
    proObservations: 'Ganho de massa magra nos membros superiores e redução acentuada da gordura visceral.'
  },
  {
    id: 'ass-3',
    studentId: 'stud-1',
    proId: 'user-pro-1',
    date: '2026-10-10',
    weightKg: 61.8,
    bodyFatPercentage: 19.5,
    method: 'Pollock 7 Dobras',
    chestCm: 87,
    waistCm: 65,
    hipsCm: 97.5,
    armsCm: 29.5,
    thighsCm: 56.5,
    proObservations: 'Atingiu a meta de definição com preservação muscular total.'
  },
  // Rodrigo Barreto Lima (stud-2)
  {
    id: 'ass-4',
    studentId: 'stud-2',
    proId: 'user-pro-1',
    date: '2026-08-01',
    weightKg: 92.0,
    bodyFatPercentage: 26.5,
    method: 'Pollock 7 Dobras',
    chestCm: 104,
    waistCm: 96,
    hipsCm: 105,
    armsCm: 37,
    thighsCm: 62,
    proObservations: 'Ponto de partida da consultoria. Foco em déficit calórico moderado e treino resistido.'
  },
  {
    id: 'ass-5',
    studentId: 'stud-2',
    proId: 'user-pro-1',
    date: '2026-09-05',
    weightKg: 90.2,
    bodyFatPercentage: 24.2,
    method: 'Pollock 7 Dobras',
    chestCm: 103,
    waistCm: 93,
    hipsCm: 103,
    armsCm: 37.5,
    thighsCm: 61.5,
    proObservations: 'Redução de 3cm na cintura e aumento da capacidade cardiorrespiratória.'
  },
  {
    id: 'ass-6',
    studentId: 'stud-2',
    proId: 'user-pro-1',
    date: '2026-10-10',
    weightKg: 88.5,
    bodyFatPercentage: 22.0,
    method: 'Pollock 7 Dobras',
    chestCm: 102,
    waistCm: 90,
    hipsCm: 101,
    armsCm: 38,
    thighsCm: 61,
    proObservations: 'Evolução notável: -3.5kg e -4.5% de gordura corporal mantendo volume nos membros superiores.'
  },
  // Fernanda Albuquerque (stud-3)
  {
    id: 'ass-7',
    studentId: 'stud-3',
    proId: 'user-pro-1',
    date: '2026-05-15',
    weightKg: 59.5,
    bodyFatPercentage: 24.0,
    method: 'Pollock 3 Dobras',
    chestCm: 84,
    waistCm: 68,
    hipsCm: 94,
    armsCm: 26,
    thighsCm: 53,
    proObservations: 'Avaliação postural inicial. Foco em core e cadeia posterior para alívio de dores lombares.'
  },
  {
    id: 'ass-8',
    studentId: 'stud-3',
    proId: 'user-pro-1',
    date: '2026-07-20',
    weightKg: 58.0,
    bodyFatPercentage: 22.5,
    method: 'Pollock 3 Dobras',
    chestCm: 84.5,
    waistCm: 66,
    hipsCm: 93.5,
    armsCm: 26.5,
    thighsCm: 53.5,
    proObservations: 'Melhora expressiva no alinhamento pélvico e diminuição da lordose acentuada.'
  },
  // Gabriel Costa Nogueira (stud-4)
  {
    id: 'ass-9',
    studentId: 'stud-4',
    proId: 'user-pro-1',
    date: '2026-09-18',
    weightKg: 74.8,
    bodyFatPercentage: 15.2,
    method: 'Bioimpedância',
    chestCm: 96,
    waistCm: 79,
    hipsCm: 96,
    armsCm: 32,
    thighsCm: 55,
    proObservations: 'Avaliação pré-temporada de corrida. Excelente índice de massa magra nos membros inferiores.'
  },
  {
    id: 'ass-10',
    studentId: 'stud-4',
    proId: 'user-pro-1',
    date: '2026-10-12',
    weightKg: 73.2,
    bodyFatPercentage: 13.8,
    method: 'Bioimpedância',
    chestCm: 96,
    waistCm: 77,
    hipsCm: 95,
    armsCm: 32.2,
    thighsCm: 55.5,
    proObservations: 'Redução de gordura sem perda de força. Ótimo VO2 estimado e composição corporal ideal para endurance.'
  }
];

export const INITIAL_CHECKINS: CheckIn[] = [
  {
    id: 'chk-1',
    studentId: 'stud-1',
    date: '2026-10-12',
    energyLevel: 4,
    sleepHours: 7.5,
    dietAdherence: 5,
    workoutAdherence: 5,
    notes: 'Treinos da semana fluíram muito bem, carga do supino subiu com tranquilidade.',
    status: 'reviewed',
    proFeedback: 'Parabéns pela dedicação Marina! Na próxima semana vamos programar uma semana regenerativa.'
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g-1',
    studentId: 'stud-1',
    title: 'Completar 16 treinos no mês',
    category: 'workout',
    currentValue: 12,
    targetValue: 16,
    unit: 'treinos',
    deadline: '2026-10-31',
    isCompleted: false,
  },
  {
    id: 'g-2',
    studentId: 'stud-1',
    title: 'Ingestão de 2.5L de água diários',
    category: 'habit',
    currentValue: 2.2,
    targetValue: 2.5,
    unit: 'litros',
    deadline: '2026-10-31',
    isCompleted: false,
  }
];

export const INITIAL_NUTRITION_PLANS: NutritionPlan[] = [
  // 1. Marina Silva Rocha (stud-1) - Hipertrofia e Definição
  {
    id: 'nutri-1',
    organizationId: 'org-alpha-1',
    studentId: 'stud-1',
    proId: 'user-pro-1',
    title: 'Plano Alimentar para Hipertrofia Limpa',
    targetCalories: 2200,
    targetProteinG: 140,
    targetCarbsG: 260,
    targetFatsG: 65,
    waterIntakeMl: 3000,
    validUntil: '2026-11-30',
    meals: [
      {
        id: 'm-1',
        time: '07:30',
        title: 'Café da Manhã / Desjejum',
        items: [
          { id: 'i-1', name: 'Ovos mexidos inteiros', amount: '3 unidades', calories: 215, proteinGrams: 18, carbsGrams: 1, fatsGrams: 15 },
          { id: 'i-2', name: 'Pão 100% integral', amount: '2 fatias (50g)', calories: 120, proteinGrams: 5, carbsGrams: 22, fatsGrams: 2 },
          { id: 'i-3', name: 'Mamão papaia com aveia', amount: '1/2 unidade + 20g aveia', calories: 130, proteinGrams: 3, carbsGrams: 26, fatsGrams: 2 },
        ]
      },
      {
        id: 'm-2',
        time: '12:30',
        title: 'Almoço Completo',
        items: [
          { id: 'i-4', name: 'Peito de frango grelhado', amount: '150g', calories: 240, proteinGrams: 46, carbsGrams: 0, fatsGrams: 5 },
          { id: 'i-5', name: 'Arroz branco ou integral', amount: '150g cozido', calories: 195, proteinGrams: 4, carbsGrams: 42, fatsGrams: 0.5 },
          { id: 'i-6', name: 'Feijão carioca', amount: '1 concha (100g)', calories: 76, proteinGrams: 5, carbsGrams: 13, fatsGrams: 0.5 },
          { id: 'i-7', name: 'Salada de folhas verdes à vontade', amount: 'À vontade', calories: 25, proteinGrams: 1, carbsGrams: 4, fatsGrams: 0 },
        ]
      },
      {
        id: 'm-3',
        time: '16:30',
        title: 'Lanche Pré-Treino',
        items: [
          { id: 'i-8', name: 'Iogurte natural desnatado', amount: '170g', calories: 85, proteinGrams: 9, carbsGrams: 12, fatsGrams: 0 },
          { id: 'i-9', name: 'Banana prata com mel e canela', amount: '1 unidade + 10g mel', calories: 125, proteinGrams: 1, carbsGrams: 31, fatsGrams: 0 },
          { id: 'i-10', name: 'Whey Protein concentrado', amount: '30g', calories: 120, proteinGrams: 24, carbsGrams: 3, fatsGrams: 1.5 },
        ]
      },
      {
        id: 'm-4',
        time: '20:00',
        title: 'Jantar Pós-Treino',
        items: [
          { id: 'i-11', name: 'Patinho moído ou filé de tilápia', amount: '150g', calories: 220, proteinGrams: 40, carbsGrams: 0, fatsGrams: 6 },
          { id: 'i-12', name: 'Batata doce cozida', amount: '180g', calories: 155, proteinGrams: 2, carbsGrams: 36, fatsGrams: 0 },
          { id: 'i-13', name: 'Legumes no vapor (brócolis e cenoura)', amount: '100g', calories: 45, proteinGrams: 2, carbsGrams: 8, fatsGrams: 0 },
        ]
      }
    ]
  },
  // 2. Rodrigo Barreto Lima (stud-2) - Redução de % de Gordura
  {
    id: 'nutri-2',
    organizationId: 'org-alpha-1',
    studentId: 'stud-2',
    proId: 'user-pro-1',
    title: 'Plano de Déficit Calórico Controlado & Alta Saciedade',
    targetCalories: 2050,
    targetProteinG: 185,
    targetCarbsG: 170,
    targetFatsG: 65,
    waterIntakeMl: 3500,
    validUntil: '2026-11-20',
    meals: [
      {
        id: 'm-21',
        time: '07:00',
        title: 'Desjejum Proteico & Fibras',
        items: [
          { id: 'i-21', name: 'Omelete de 4 claras + 1 gema', amount: '4 claras, 1 gema', calories: 140, proteinGrams: 20, carbsGrams: 1, fatsGrams: 6 },
          { id: 'i-22', name: 'Queijo cottage ou ricota fresca', amount: '60g', calories: 65, proteinGrams: 8, carbsGrams: 2, fatsGrams: 2 },
          { id: 'i-23', name: 'Morangos frescos com sementes de chia', amount: '100g morango + 10g chia', calories: 80, proteinGrams: 3, carbsGrams: 12, fatsGrams: 3 },
          { id: 'i-24', name: 'Café preto sem açúcar', amount: '200ml', calories: 5, proteinGrams: 0, carbsGrams: 1, fatsGrams: 0 },
        ]
      },
      {
        id: 'm-22',
        time: '12:00',
        title: 'Almoço Low-Carb / Alta Densidade Nutricional',
        items: [
          { id: 'i-25', name: 'Filé de peito de frango ou alcatra magra', amount: '200g grelhado', calories: 310, proteinGrams: 58, carbsGrams: 0, fatsGrams: 7 },
          { id: 'i-26', name: 'Arroz integral com grãos', amount: '100g cozido', calories: 125, proteinGrams: 3, carbsGrams: 26, fatsGrams: 1 },
          { id: 'i-27', name: 'Feijão preto', amount: '1 concha rasa (80g)', calories: 60, proteinGrams: 4, carbsGrams: 10, fatsGrams: 0.5 },
          { id: 'i-28', name: 'Brócolis e couve-flor ao azeite extravirgem', amount: '150g + 5ml azeite', calories: 85, proteinGrams: 4, carbsGrams: 8, fatsGrams: 5 },
        ]
      },
      {
        id: 'm-23',
        time: '16:00',
        title: 'Lanche da Tarde Pré-Treino',
        items: [
          { id: 'i-29', name: 'Whey Protein Isolado batido com água', amount: '35g', calories: 130, proteinGrams: 28, carbsGrams: 2, fatsGrams: 1 },
          { id: 'i-30', name: 'Maçã verde com pasta de amendoim integral', amount: '1 unidade + 15g pasta', calories: 160, proteinGrams: 4, carbsGrams: 20, fatsGrams: 8 },
        ]
      },
      {
        id: 'm-24',
        time: '19:30',
        title: 'Jantar Cetogênico Leve / Recuperação',
        items: [
          { id: 'i-31', name: 'Filé de tilápia ou salmão grelhado', amount: '200g', calories: 250, proteinGrams: 50, carbsGrams: 0, fatsGrams: 5 },
          { id: 'i-32', name: 'Abobrinha e aspargos grelhados', amount: '150g', calories: 45, proteinGrams: 3, carbsGrams: 8, fatsGrams: 0.5 },
          { id: 'i-33', name: 'Salada mista com azeite de oliva e limão', amount: 'Prato fundo + 5ml azeite', calories: 75, proteinGrams: 1, carbsGrams: 4, fatsGrams: 6 },
        ]
      }
    ]
  },
  // 3. Fernanda Albuquerque (stud-3) - Fortalecimento & Equilíbrio Postural
  {
    id: 'nutri-3',
    organizationId: 'org-alpha-1',
    studentId: 'stud-3',
    proId: 'user-pro-1',
    title: 'Plano Nutricional Anti-inflamatório & Equilíbrio',
    targetCalories: 1850,
    targetProteinG: 120,
    targetCarbsG: 200,
    targetFatsG: 55,
    waterIntakeMl: 2500,
    validUntil: '2026-11-15',
    meals: [
      {
        id: 'm-31',
        time: '08:00',
        title: 'Café da Manhã Anti-inflamatório',
        items: [
          { id: 'i-34', name: 'Iogurte grego zero com sementes de linhaça', amount: '150g + 10g linhaça', calories: 130, proteinGrams: 14, carbsGrams: 8, fatsGrams: 4 },
          { id: 'i-35', name: 'Pão sourdough ou integral com ovo pochê', amount: '1 fatia + 1 ovo', calories: 160, proteinGrams: 10, carbsGrams: 18, fatsGrams: 5 },
          { id: 'i-36', name: 'Chá verde com gengibre e limão', amount: '250ml', calories: 5, proteinGrams: 0, carbsGrams: 1, fatsGrams: 0 },
        ]
      },
      {
        id: 'm-32',
        time: '12:30',
        title: 'Almoço Funcional / Ômega 3',
        items: [
          { id: 'i-37', name: 'Filé de salmão grelhado', amount: '140g', calories: 260, proteinGrams: 32, carbsGrams: 0, fatsGrams: 14 },
          { id: 'i-38', name: 'Quinoa real cozida com cúrcuma', amount: '120g cozida', calories: 145, proteinGrams: 5, carbsGrams: 26, fatsGrams: 2.5 },
          { id: 'i-39', name: 'Mix de folhas escuras, tomate cereja e azeite', amount: 'Porção grande + 5ml azeite', calories: 70, proteinGrams: 2, carbsGrams: 5, fatsGrams: 5 },
        ]
      },
      {
        id: 'm-33',
        time: '16:30',
        title: 'Lanche Prático para o Trabalho',
        items: [
          { id: 'i-40', name: 'Mix de castanhas do Pará e nozes', amount: '25g', calories: 160, proteinGrams: 4, carbsGrams: 4, fatsGrams: 15 },
          { id: 'i-41', name: 'Maçã gala ou pera fatiada', amount: '1 unidade média', calories: 75, proteinGrams: 0.5, carbsGrams: 19, fatsGrams: 0 },
          { id: 'i-42', name: 'Barra de proteína vegetal', amount: '1 barra (35g)', calories: 130, proteinGrams: 12, carbsGrams: 11, fatsGrams: 3.5 },
        ]
      },
      {
        id: 'm-34',
        time: '20:00',
        title: 'Jantar Digestivo / Recuperação Noturna',
        items: [
          { id: 'i-43', name: 'Iscas de peito de frango com ervas finas', amount: '140g', calories: 190, proteinGrams: 38, carbsGrams: 0, fatsGrams: 3.5 },
          { id: 'i-44', name: 'Purê de abóbora cabotiá', amount: '150g', calories: 85, proteinGrams: 2, carbsGrams: 19, fatsGrams: 0.5 },
          { id: 'i-45', name: 'Espinafre refogado no alho e azeite', amount: '80g', calories: 45, proteinGrams: 2, carbsGrams: 3, fatsGrams: 2.5 },
        ]
      }
    ]
  },
  // 4. Gabriel Costa Nogueira (stud-4) - Preparação Meia Maratona
  {
    id: 'nutri-4',
    organizationId: 'org-alpha-1',
    studentId: 'stud-4',
    proId: 'user-pro-1',
    title: 'Plano de Endurance & Recarga de Glicogênio',
    targetCalories: 2650,
    targetProteinG: 150,
    targetCarbsG: 350,
    targetFatsG: 70,
    waterIntakeMl: 4000,
    validUntil: '2026-11-25',
    meals: [
      {
        id: 'm-41',
        time: '06:00',
        title: 'Café Pré-Treino de Corrida (Glicose Rápida)',
        items: [
          { id: 'i-46', name: 'Pão de forma com geleia de frutas 100%', amount: '2 fatias + 20g geleia', calories: 190, proteinGrams: 5, carbsGrams: 42, fatsGrams: 1 },
          { id: 'i-47', name: 'Banana com canela e mel silvestre', amount: '1 banana + 15g mel', calories: 150, proteinGrams: 1, carbsGrams: 38, fatsGrams: 0 },
          { id: 'i-48', name: 'Café expresso ou isotônico natural', amount: '250ml', calories: 30, proteinGrams: 0, carbsGrams: 7, fatsGrams: 0 },
        ]
      },
      {
        id: 'm-42',
        time: '09:00',
        title: 'Desjejum Pós-Treino Regenerativo',
        items: [
          { id: 'i-49', name: 'Shake de Whey Protein com água de coco', amount: '30g whey + 250ml água coco', calories: 180, proteinGrams: 24, carbsGrams: 14, fatsGrams: 1 },
          { id: 'i-50', name: 'Tapioca com ovos mexidos e queijo minas', amount: '60g goma + 2 ovos + 30g queijo', calories: 310, proteinGrams: 18, carbsGrams: 34, fatsGrams: 11 },
        ]
      },
      {
        id: 'm-43',
        time: '12:30',
        title: 'Almoço de Alta Carga Energética',
        items: [
          { id: 'i-51', name: 'Filé de peito de frango ou patinho grelhado', amount: '180g', calories: 270, proteinGrams: 52, carbsGrams: 0, fatsGrams: 6 },
          { id: 'i-52', name: 'Massa integral com molho de tomate caseiro', amount: '180g cozida', calories: 260, proteinGrams: 10, carbsGrams: 54, fatsGrams: 1.5 },
          { id: 'i-53', name: 'Salada colorida de legumes cozidos no vapor', amount: '120g', calories: 60, proteinGrams: 2, carbsGrams: 12, fatsGrams: 0 },
        ]
      },
      {
        id: 'm-44',
        time: '16:30',
        title: 'Lanche da Tarde Energético',
        items: [
          { id: 'i-54', name: 'Açaí puro batido com banana e granola tradicional', amount: '200g açaí + 30g granola', calories: 280, proteinGrams: 5, carbsGrams: 52, fatsGrams: 7 },
          { id: 'i-55', name: 'Iogurte proteico desnatado', amount: '150g', calories: 95, proteinGrams: 14, carbsGrams: 8, fatsGrams: 0 },
        ]
      },
      {
        id: 'm-45',
        time: '20:30',
        title: 'Jantar Restaurador / Sono Reparador',
        items: [
          { id: 'i-56', name: 'Filé de tilápia ou sobrecoxa desossada sem pele', amount: '180g', calories: 240, proteinGrams: 42, carbsGrams: 0, fatsGrams: 7 },
          { id: 'i-57', name: 'Arroz branco com feijão preto', amount: '150g arroz + 1 concha feijão', calories: 270, proteinGrams: 8, carbsGrams: 55, fatsGrams: 1 },
          { id: 'i-58', name: 'Azeite extravirgem sobre salada crua', amount: '10ml azeite', calories: 90, proteinGrams: 0, carbsGrams: 0, fatsGrams: 10 },
        ]
      }
    ]
  }
];
