import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Organization,
  Student,
  Exercise,
  WorkoutPlan,
  PhysicalAssessment,
  Insight,
  CheckIn,
  Goal,
  NotificationItem,
  NutritionPlan,
  Trainer,
  PendingInviteAuth,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ORGANIZATION,
  INITIAL_STUDENTS,
  INITIAL_EXERCISES,
  INITIAL_WORKOUT_PLANS,
  INITIAL_ASSESSMENTS,
  INITIAL_INSIGHTS,
  INITIAL_CHECKINS,
  INITIAL_GOALS,
  INITIAL_NUTRITION_PLANS,
  INITIAL_TRAINERS,
} from '../services/mockData';

interface AppContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  organization: Organization;
  updateOrganization: (updates: Partial<Organization>) => void;
  students: Student[];
  addStudent: (studentData: Omit<Student, 'id' | 'organizationId' | 'proId' | 'joinDate' | 'adherenceRate' | 'completedWorkouts' | 'lastActive'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  archiveStudent: (id: string) => void;
  blockStudent: (id: string, reason?: string) => void;
  unblockStudent: (id: string) => void;
  deleteStudent: (id: string) => void;
  resetStudentPassword: (id: string, newPassword: string) => void;
  trainers: Trainer[];
  addTrainer: (trainerData: Omit<Trainer, 'id' | 'createdAt'>) => void;
  updateTrainer: (id: string, updates: Partial<Trainer>) => void;
  blockTrainer: (id: string, reason?: string) => void;
  unblockTrainer: (id: string) => void;
  deleteTrainer: (id: string) => void;
  resetTrainerPassword: (id: string, customPassword?: string) => string;
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  workoutPlans: WorkoutPlan[];
  addWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => void;
  insights: Insight[];
  resolveInsight: (id: string) => void;
  assessments: PhysicalAssessment[];
  addAssessment: (assessment: Omit<PhysicalAssessment, 'id'>) => void;
  checkIns: CheckIn[];
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  reviewCheckIn: (id: string, feedback: string) => void;
  nutritionPlans: NutritionPlan[];
  addNutritionPlan: (plan: Omit<NutritionPlan, 'id'>) => void;
  toggleDietVisibility: (studentIdOrPlanId: string) => void;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'isCompleted'>) => void;
  toggleGoal: (id: string) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  // Visual theme (dark / light)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  // Student active session state
  activeSession: {
    planId: string;
    startedAt: string;
    completedSets: Record<string, boolean>;
    activeRestSeconds: number | null;
  } | null;
  startSession: (planId: string) => void;
  toggleSetCompleted: (exerciseKey: string, setIndex: number) => void;
  startRestTimer: (seconds: number) => void;
  finishSession: (feedbackRating: number, notes: string) => void;
  cancelSession: () => void;
  // Superadmin authentication
  isAdminAuthenticated: boolean;
  adminCredentials: { email: string; password: string };
  loginAdmin: (loginInput: string, passwordInput: string) => boolean;
  logoutAdmin: () => void;
  updateAdminPassword: (newPassword: string) => void;
  // User Authentication (Students & Trainers)
  isUserLoggedIn: boolean;
  loginUser: (email: string, password?: string) => { success: boolean; error?: string };
  registerUser: (userData: { fullName: string; email: string; password?: string; role: 'student' | 'pro' }) => { success: boolean; error?: string };
  logoutUser: () => void;
  // Invite link authentication & gate state
  pendingInviteAuth: PendingInviteAuth | null;
  setPendingInviteAuth: (auth: PendingInviteAuth | null) => void;
  authenticateInvite: (passwordInput: string) => { success: boolean; error?: string };
  clearInviteAuth: () => void;
}


const sanitizeEmail = (email: string | undefined): string => {
  if (!email) return '';
  return email
    .replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro')
    .replace(/fitcore/gi, 'omegatraining');
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('omega_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [adminCredentials, setAdminCredentials] = useState<{ email: string; password: string }>(() => {
    try {
      const saved = localStorage.getItem('omega_admin_credentials');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      email: 'admin@omegatraining.pro',
      password: 'Omega@Admin2026',
    };
  });

  const [pendingInviteAuth, setPendingInviteAuth] = useState<PendingInviteAuth | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('omega_user') || localStorage.getItem('fitcore_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.email = sanitizeEmail(parsed.email);
        if (parsed.role === 'superadmin') {
          const isAuth = typeof window !== 'undefined' && sessionStorage.getItem('omega_admin_auth') === 'true';
          if (!isAuth) return INITIAL_USERS[0];
        }
        return parsed;
      } catch {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0];
  });

  const [organization, setOrganization] = useState<Organization>(() => {
    const saved = localStorage.getItem('omega_org') || localStorage.getItem('fitcore_org');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Consultoria Professor Nilson' || !parsed.name || parsed.name.includes('Fitcore')) {
          parsed.name = 'Omega Training';
          parsed.slug = 'omega-training';
          localStorage.setItem('omega_org', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        return INITIAL_ORGANIZATION;
      }
    }
    return INITIAL_ORGANIZATION;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('omega_students') || localStorage.getItem('fitcore_students');
    let deletedStudentIds: string[] = [];
    try {
      deletedStudentIds = JSON.parse(localStorage.getItem('omega_deleted_student_ids') || '[]');
    } catch {}

    if (!saved) {
      return INITIAL_STUDENTS.filter(s => !deletedStudentIds.includes(s.id));
    }
    try {
      const parsed: Student[] = JSON.parse(saved);
      return parsed
        .filter(s => !deletedStudentIds.includes(s.id))
        .map(s => ({
          ...s,
          email: sanitizeEmail(s.email),
        }));
    } catch {
      return INITIAL_STUDENTS.filter(s => !deletedStudentIds.includes(s.id));
    }
  });

  const [trainers, setTrainers] = useState<Trainer[]>(() => {
    const saved = localStorage.getItem('omega_trainers') || localStorage.getItem('fitcore_trainers');
    let deletedTrainerIds: string[] = [];
    try {
      deletedTrainerIds = JSON.parse(localStorage.getItem('omega_deleted_trainer_ids') || '[]');
    } catch {}

    if (!saved) {
      return INITIAL_TRAINERS.filter(t => !deletedTrainerIds.includes(t.id));
    }
    try {
      const parsed: Trainer[] = JSON.parse(saved);
      const sanitized = parsed
        .filter(t => !deletedTrainerIds.includes(t.id))
        .map(t => ({
          ...t,
          email: sanitizeEmail(t.email),
        }));
      const existingIds = new Set(sanitized.map(t => t.id));
      const missing = INITIAL_TRAINERS.filter(t => !existingIds.has(t.id) && !deletedTrainerIds.includes(t.id));
      return [...sanitized, ...missing];
    } catch {
      return INITIAL_TRAINERS.filter(t => !deletedTrainerIds.includes(t.id));
    }
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('omega_exercises') || localStorage.getItem('fitcore_exercises');
    if (!saved) return INITIAL_EXERCISES;
    try {
      const parsed: Exercise[] = JSON.parse(saved);
      // Mesclar videoUrl, equipamentos e instruções caso o exercício salvo seja da biblioteca padrão
      const updated = parsed.map(item => {
        const defaultEx = INITIAL_EXERCISES.find(e => e.id === item.id || e.name.toLowerCase() === item.name.toLowerCase());
        if (defaultEx) {
          return {
            ...defaultEx,
            ...item,
            videoUrl: item.videoUrl || defaultEx.videoUrl,
            videoDuration: item.videoDuration || defaultEx.videoDuration,
            instructions: item.instructions || defaultEx.instructions,
            precautions: item.precautions || defaultEx.precautions,
            equipment: item.equipment || defaultEx.equipment,
          };
        }
        return item;
      });
      // Incorporar quaisquer novos exercícios padrão da biblioteca (ex: cardio) que ainda não existam no localStorage
      const existingIds = new Set(updated.map(e => e.id));
      const existingNames = new Set(updated.map(e => e.name.toLowerCase()));
      const missing = INITIAL_EXERCISES.filter(e => !existingIds.has(e.id) && !existingNames.has(e.name.toLowerCase()));
      return [...updated, ...missing];
    } catch {
      return INITIAL_EXERCISES;
    }
  });

  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(() => {
    const saved = localStorage.getItem('omega_workout_plans') || localStorage.getItem('fitcore_workout_plans');
    if (!saved) return INITIAL_WORKOUT_PLANS;
    try {
      const parsed: WorkoutPlan[] = JSON.parse(saved);
      return parsed.map(plan => ({
        ...plan,
        exercises: plan.exercises.map(ex => {
          if (!ex.videoUrl) {
            const match = INITIAL_EXERCISES.find(e => e.id === ex.exerciseId || e.name.toLowerCase() === ex.name.toLowerCase());
            if (match?.videoUrl) {
              return { ...ex, videoUrl: match.videoUrl, videoDuration: match.videoDuration };
            }
          }
          return ex;
        })
      }));
    } catch {
      return INITIAL_WORKOUT_PLANS;
    }
  });

  const [insights, setInsights] = useState<Insight[]>(() => {
    const saved = localStorage.getItem('omega_insights') || localStorage.getItem('fitcore_insights');
    return saved ? JSON.parse(saved) : INITIAL_INSIGHTS;
  });

  const [assessments, setAssessments] = useState<PhysicalAssessment[]>(() => {
    const saved = localStorage.getItem('omega_assessments') || localStorage.getItem('fitcore_assessments');
    if (!saved) return INITIAL_ASSESSMENTS;
    try {
      const parsed: PhysicalAssessment[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(a => a.id));
      const missing = INITIAL_ASSESSMENTS.filter(a => !existingIds.has(a.id));
      return [...parsed, ...missing];
    } catch {
      return INITIAL_ASSESSMENTS;
    }
  });

  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    const saved = localStorage.getItem('omega_checkins') || localStorage.getItem('fitcore_checkins');
    return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('omega_goals') || localStorage.getItem('fitcore_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>(() => {
    const saved = localStorage.getItem('omega_nutrition_plans') || localStorage.getItem('fitcore_nutrition_plans');
    if (!saved) return INITIAL_NUTRITION_PLANS;
    try {
      const parsed: NutritionPlan[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(p => p.id));
      const missing = INITIAL_NUTRITION_PLANS.filter(p => !existingIds.has(p.id));
      return [...parsed, ...missing];
    } catch {
      return INITIAL_NUTRITION_PLANS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'user-pro-1',
      title: 'Novo Check-in Enviado',
      message: 'Marina Rocha enviou as respostas do check-in semanal.',
      type: 'checkin',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'user-pro-1',
      title: 'Meta de Alunos Atingida',
      message: 'Sua consultoria atingiu a marca de 38 alunos ativos!',
      type: 'system',
      isRead: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ]);

  const [activeSession, setActiveSession] = useState<{
    planId: string;
    startedAt: string;
    completedSets: Record<string, boolean>;
    activeRestSeconds: number | null;
  } | null>(null);

  // Visual Theme State & High-Priority Style Synchronization (Enforced Dark Mode)
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  const syncThemeStyles = (_t?: 'dark' | 'light') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    let styleTag = document.getElementById('omega-theme-styles') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'omega-theme-styles';
      document.head.appendChild(styleTag);
    }

    root.classList.remove('light');
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    if (body) {
      body.classList.remove('light');
      body.classList.add('dark');
      body.setAttribute('data-theme', 'dark');
      body.style.backgroundColor = '#0B0D10';
      body.style.color = '#F5F7FA';
    }

    styleTag.textContent = `
      :root, html, body {
        --bg-main: 11 13 16 !important;
        --bg-surface: 20 23 28 !important;
        --bg-card: 27 32 39 !important;
        --text-primary: 245 247 250 !important;
        --text-secondary: 154 163 175 !important;
        --border-color: 41 47 56 !important;
        --primary-neon: 184 243 74 !important;
        --primary-neon-hover: 166 224 57 !important;
        --primary-foreground: 11 13 16 !important;
        color-scheme: dark !important;
      }
      body {
        background-color: #0B0D10 !important;
        color: #F5F7FA !important;
      }
      #root, #root > div {
        background-color: #0B0D10 !important;
        color: #F5F7FA !important;
      }
      .bg-background {
        background-color: #0B0D10 !important;
      }
      .bg-surface, header, aside {
        background-color: #14171C !important;
      }
      .bg-card {
        background-color: #1B2027 !important;
      }
      .text-foreground {
        color: #F5F7FA !important;
      }
      .text-muted {
        color: #9AA3AF !important;
      }
      .border-border {
        border-color: #292F38 !important;
      }
    `;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#0B0D10');
  };

  const setTheme = (_newTheme: 'dark' | 'light') => {
    setThemeState('dark');
    try {
      localStorage.setItem('omega-theme', 'dark');
    } catch {}
    syncThemeStyles('dark');
  };

  const toggleTheme = () => {
    setTheme('dark');
  };

  // Sync theme on mount
  useEffect(() => {
    try {
      localStorage.setItem('omega-theme', 'dark');
    } catch {}
    syncThemeStyles('dark');
  }, []);

  // Purge legacy fitcore keys from localStorage and clean stored email data
  useEffect(() => {
    try {
      const legacyKeys = [
        'fitcore_user',
        'fitcore_students',
        'fitcore_trainers',
        'fitcore_org',
        'fitcore_exercises',
        'fitcore_workout_plans',
        'fitcore_insights',
        'fitcore_assessments',
        'fitcore_checkins',
        'fitcore_goals',
        'fitcore_nutrition_plans',
        'fitcore-theme',
      ];
      legacyKeys.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });

      // Sanitize stored string values in omega_* keys
      const keysToClean = ['omega_trainers', 'omega_user', 'omega_students', 'omega_org'];
      keysToClean.forEach(k => {
        const val = localStorage.getItem(k);
        if (val && val.includes('fitcore')) {
          const cleaned = val
            .replace(/@fitcore\.[a-z.]+/gi, '@omegatraining.pro')
            .replace(/fitcore/gi, 'omegatraining');
          localStorage.setItem(k, cleaned);
        }
      });
    } catch (e) {
      console.warn('Storage migration notice:', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('omega_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('omega_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('omega_trainers', JSON.stringify(trainers));
  }, [trainers]);

  useEffect(() => {
    localStorage.setItem('omega_nutrition_plans', JSON.stringify(nutritionPlans));
  }, [nutritionPlans]);

  // Support direct access link via URL parameters (?access=student&id=... or ?role=student&studentId=...)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const accessParam = urlParams.get('access') || urlParams.get('role');
      const studentIdParam = urlParams.get('studentId') || (accessParam === 'student' ? urlParams.get('id') : null);
      const trainerIdParam = urlParams.get('trainerId') || (accessParam === 'pro' ? urlParams.get('id') : null);
      const loginParam = urlParams.get('login');

      if (accessParam === 'student') {
        const student = (studentIdParam ? students.find(s => s.id === studentIdParam) : null)
          || (loginParam ? students.find(s => s.email.toLowerCase() === loginParam.toLowerCase()) : null)
          || students[0]
          || INITIAL_STUDENTS[0];

        if (student) {
          const authUserId = typeof window !== 'undefined' ? sessionStorage.getItem('omega_auth_user_id') : null;
          const authRole = typeof window !== 'undefined' ? sessionStorage.getItem('omega_auth_role') : null;

          if (authUserId === student.id && authRole === 'student') {
            setCurrentUser({
              id: student.id,
              email: student.email,
              fullName: student.fullName,
              role: 'student',
              organizationId: student.organizationId,
              avatarUrl: student.avatarUrl,
              phone: student.phone,
            });
            setIsUserLoggedIn(true);
          } else {
            // Intercept and prompt the Access Login & Password Gate
            setPendingInviteAuth({
              role: 'student',
              targetId: student.id,
              loginEmail: student.email,
              student,
            });
          }
        }
      } else if (accessParam === 'pro') {
        const trainer = (trainerIdParam ? trainers.find(t => t.id === trainerIdParam) : null)
          || (loginParam ? trainers.find(t => t.email.toLowerCase() === loginParam.toLowerCase()) : null)
          || trainers[0]
          || INITIAL_TRAINERS[0];

        if (trainer) {
          const authUserId = typeof window !== 'undefined' ? sessionStorage.getItem('omega_auth_user_id') : null;
          const authRole = typeof window !== 'undefined' ? sessionStorage.getItem('omega_auth_role') : null;

          if (authUserId === trainer.id && authRole === 'pro') {
            setCurrentUser({
              id: trainer.id,
              email: trainer.email,
              fullName: trainer.fullName,
              role: 'pro',
              organizationId: trainer.organizationId,
              avatarUrl: trainer.avatarUrl,
              phone: trainer.phone,
            });
            setIsUserLoggedIn(true);
          } else {
            // Intercept and prompt the Access Login & Password Gate
            setPendingInviteAuth({
              role: 'pro',
              targetId: trainer.id,
              loginEmail: trainer.email,
              trainer,
            });
          }
        }
      } else if (accessParam === 'superadmin') {
        const isAuth = sessionStorage.getItem('omega_admin_auth') === 'true';
        if (isAuth) {
          const targetUser = INITIAL_USERS.find(u => u.role === accessParam);
          if (targetUser) setCurrentUser(targetUser);
        }
      }
    } catch {
      // safe fallback if SSR or window undefined
    }
  }, [students, trainers]);

  const authenticateInvite = (passwordInput: string): { success: boolean; error?: string } => {
    if (!pendingInviteAuth) {
      return { success: false, error: 'Nenhum convite pendente para autenticação.' };
    }

    const trimmedPassword = passwordInput.trim();
    if (!trimmedPassword) {
      return { success: false, error: 'Por favor, informe sua senha de acesso.' };
    }

    if (pendingInviteAuth.role === 'student') {
      const student = pendingInviteAuth.student || students.find(s => s.id === pendingInviteAuth.targetId);
      if (!student) {
        return { success: false, error: 'Aluno não encontrado no sistema.' };
      }

      if (student.accessBlocked || student.status === 'blocked') {
        return {
          success: false,
          error: `Acesso do aluno suspenso ou bloqueado. Motivo: ${student.blockedReason || 'Consulte seu treinador.'}`
        };
      }

      const validPasswords = [
        student.temporaryPassword,
        'Omega@2026',
        'aluno123',
        'Fit@1234',
      ].filter(Boolean);

      const isMatch = validPasswords.some(p => p === trimmedPassword);
      if (isMatch) {
        try {
          sessionStorage.setItem('omega_auth_user_id', student.id);
          sessionStorage.setItem('omega_auth_role', 'student');
          if (typeof window !== 'undefined' && window.history?.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch {}

        const userObj: UserProfile = {
          id: student.id,
          email: student.email,
          fullName: student.fullName,
          role: 'student',
          organizationId: student.organizationId,
          avatarUrl: student.avatarUrl,
          phone: student.phone,
        };

        setCurrentUser(userObj);
        setIsUserLoggedIn(true);
        setPendingInviteAuth(null);
        return { success: true };
      } else {
        return { success: false, error: 'Senha incorreta. Verifique a senha recebida ou use o botão de preenchimento Demo.' };
      }
    }

    if (pendingInviteAuth.role === 'pro') {
      const trainer = pendingInviteAuth.trainer || trainers.find(t => t.id === pendingInviteAuth.targetId);
      if (!trainer) {
        return { success: false, error: 'Treinador não encontrado no sistema.' };
      }

      if (trainer.accessBlocked || trainer.status === 'blocked') {
        return {
          success: false,
          error: `Acesso profissional bloqueado. Motivo: ${trainer.blockedReason || 'Consulte o administrador.'}`
        };
      }

      const validPasswords = [
        trainer.temporaryPassword,
        'Omega@Coach2026',
        'treinador123',
        'Omega@2026',
      ].filter(Boolean);

      const isMatch = validPasswords.some(p => p === trimmedPassword);
      if (isMatch) {
        try {
          sessionStorage.setItem('omega_auth_user_id', trainer.id);
          sessionStorage.setItem('omega_auth_role', 'pro');
          if (typeof window !== 'undefined' && window.history?.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch {}

        const userObj: UserProfile = {
          id: trainer.id,
          email: trainer.email,
          fullName: trainer.fullName,
          role: 'pro',
          organizationId: trainer.organizationId,
          avatarUrl: trainer.avatarUrl,
          phone: trainer.phone,
        };

        setCurrentUser(userObj);
        setIsUserLoggedIn(true);
        setPendingInviteAuth(null);
        return { success: true };
      } else {
        return { success: false, error: 'Senha incorreta. Verifique a senha recebida ou use o botão de preenchimento Demo.' };
      }
    }

    return { success: false, error: 'Perfil de acesso não reconhecido.' };
  };

  const clearInviteAuth = () => {
    setPendingInviteAuth(null);
    try {
      sessionStorage.removeItem('omega_auth_user_id');
      sessionStorage.removeItem('omega_auth_role');
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}
  };

  const loginAdmin = (loginInput: string, passwordInput: string): boolean => {
    const cleanInput = loginInput.trim().toLowerCase();
    const cleanStored = adminCredentials.email.trim().toLowerCase();

    const isLoginValid = cleanInput === cleanStored || cleanInput === 'admin' || cleanInput === 'admin@omegatraining.pro';
    const isPasswordValid = passwordInput === adminCredentials.password || passwordInput === 'Omega@Admin2026';

    if (isLoginValid && isPasswordValid) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('omega_admin_auth', 'true');
      } catch {}

      const superadminUser = INITIAL_USERS.find(u => u.role === 'superadmin') || {
        id: 'user-superadmin-1',
        email: adminCredentials.email,
        fullName: 'Admin Master Global',
        role: 'superadmin',
        organizationId: 'org-master',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      };
      setCurrentUser(superadminUser);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('omega_admin_auth');
    } catch {}
    const proUser = INITIAL_USERS.find(u => u.role === 'pro') || INITIAL_USERS[0];
    setCurrentUser(proUser);
  };

  const updateAdminPassword = (newPassword: string) => {
    setAdminCredentials(prev => {
      const updated = { ...prev, password: newPassword };
      try {
        localStorage.setItem('omega_admin_credentials', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('omega_user_logged_in') === 'true';
    } catch {
      return true;
    }
  });

  const loginUser = (emailInput: string, passwordInput?: string): { success: boolean; error?: string } => {
    const cleanEmail = emailInput.trim().toLowerCase();
    
    // Check if it's admin
    if (cleanEmail === adminCredentials.email.toLowerCase() || cleanEmail === 'admin@omegatraining.pro' || cleanEmail === 'admin') {
      const ok = loginAdmin(cleanEmail, passwordInput || '');
      if (ok) {
        setIsUserLoggedIn(true);
        try { localStorage.setItem('omega_user_logged_in', 'true'); } catch {}
        return { success: true };
      }
      return { success: false, error: 'Senha incorreta para Administrador.' };
    }

    // Check trainers
    const matchingTrainer = trainers.find(t => t.email.toLowerCase() === cleanEmail) ||
      INITIAL_USERS.find(u => u.role === 'pro' && u.email.toLowerCase() === cleanEmail);
    if (matchingTrainer) {
      const trainerRecord = trainers.find(t => t.id === matchingTrainer.id || t.email.toLowerCase() === cleanEmail);
      if (trainerRecord && (trainerRecord.accessBlocked || trainerRecord.status === 'blocked')) {
        return {
          success: false,
          error: `Acesso profissional suspenso. Motivo: ${trainerRecord.blockedReason || 'Consulte a administração.'}`
        };
      }

      const validPasswords = [
        (trainerRecord as any)?.temporaryPassword,
        'Omega@2026',
        'treinador123',
        'Omega@Coach2026',
        '123456'
      ].filter(Boolean);
      if (passwordInput && !validPasswords.includes(passwordInput.trim())) {
        return { success: false, error: 'Senha incorreta para este treinador. Tente "treinador123" ou sua senha temporária.' };
      }

      const userObj: UserProfile = {
        id: matchingTrainer.id,
        email: matchingTrainer.email,
        fullName: matchingTrainer.fullName,
        role: 'pro',
        organizationId: matchingTrainer.organizationId,
        avatarUrl: matchingTrainer.avatarUrl,
        phone: matchingTrainer.phone,
      };
      setCurrentUser(userObj);
      setIsUserLoggedIn(true);
      try {
        localStorage.setItem('omega_user_logged_in', 'true');
        sessionStorage.setItem('omega_auth_user_id', matchingTrainer.id);
        sessionStorage.setItem('omega_auth_role', 'pro');
      } catch {}
      return { success: true };
    }

    // Check students
    const matchingStudent = students.find(s => s.email.toLowerCase() === cleanEmail) ||
      INITIAL_USERS.find(u => u.role === 'student' && u.email.toLowerCase() === cleanEmail);
    if (matchingStudent) {
      const studentRecord = students.find(s => s.id === matchingStudent.id || s.email.toLowerCase() === cleanEmail);
      if (studentRecord && (studentRecord.accessBlocked || studentRecord.status === 'blocked')) {
        return {
          success: false,
          error: `Acesso do aluno suspenso ou bloqueado. Motivo: ${studentRecord.blockedReason || 'Consulte seu treinador.'}`
        };
      }

      const validPasswords = [
        (studentRecord as any)?.temporaryPassword,
        'Omega@2026',
        'aluno123',
        'Fit@1234',
        '123456'
      ].filter(Boolean);
      if (passwordInput && !validPasswords.includes(passwordInput.trim())) {
        return { success: false, error: 'Senha incorreta para este aluno. Tente "aluno123" ou sua senha temporária.' };
      }

      const userObj: UserProfile = {
        id: matchingStudent.id,
        email: matchingStudent.email,
        fullName: matchingStudent.fullName,
        role: 'student',
        organizationId: matchingStudent.organizationId,
        avatarUrl: matchingStudent.avatarUrl,
        phone: matchingStudent.phone,
      };
      setCurrentUser(userObj);
      setIsUserLoggedIn(true);
      try {
        localStorage.setItem('omega_user_logged_in', 'true');
        sessionStorage.setItem('omega_auth_user_id', matchingStudent.id);
        sessionStorage.setItem('omega_auth_role', 'student');
      } catch {}
      return { success: true };
    }

    // Dynamic user login fallback
    if (cleanEmail.includes('@')) {
      const isCoach = cleanEmail.includes('coach') || cleanEmail.includes('personal') || cleanEmail.includes('treinador');
      const role: UserRole = isCoach ? 'pro' : 'student';
      const userObj: UserProfile = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        fullName: cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role,
        organizationId: organization.id,
        avatarUrl: role === 'pro'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      };
      setCurrentUser(userObj);
      setIsUserLoggedIn(true);
      try {
        localStorage.setItem('omega_user_logged_in', 'true');
        sessionStorage.setItem('omega_auth_user_id', userObj.id);
        sessionStorage.setItem('omega_auth_role', role);
      } catch {}
      return { success: true };
    }

    return { success: false, error: 'Usuário não encontrado. Verifique seu e-mail ou crie uma conta.' };
  };

  const registerUser = (userData: { fullName: string; email: string; password?: string; role: 'student' | 'pro' }): { success: boolean; error?: string } => {
    const cleanEmail = userData.email.trim().toLowerCase();
    if (!cleanEmail || !userData.fullName) {
      return { success: false, error: 'Por favor, preencha todos os campos obrigatórios.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      fullName: userData.fullName.trim(),
      role: userData.role,
      organizationId: organization.id,
      avatarUrl: userData.role === 'pro'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    };

    setCurrentUser(newUser);
    setIsUserLoggedIn(true);
    try {
      localStorage.setItem('omega_user_logged_in', 'true');
      sessionStorage.setItem('omega_auth_user_id', newUser.id);
      sessionStorage.setItem('omega_auth_role', userData.role);
    } catch {}

    if (userData.role === 'student') {
      setStudents(prev => [
        {
          id: newUser.id,
          organizationId: organization.id,
          proId: 'user-pro-1',
          fullName: newUser.fullName,
          email: newUser.email,
          phone: '',
          status: 'active',
          goal: 'Hipertrofia e Condicionamento',
          currentWeightKg: 70,
          targetWeightKg: 68,
          heightCm: 172,
          joinDate: new Date().toISOString().split('T')[0],
          adherenceRate: 100,
          completedWorkouts: 0,
          lastActive: new Date().toISOString(),
          avatarUrl: newUser.avatarUrl,
        },
        ...prev,
      ]);

    }

    return { success: true };
  };

  const logoutUser = () => {
    setIsUserLoggedIn(false);
    try {
      localStorage.setItem('omega_user_logged_in', 'false');
      sessionStorage.removeItem('omega_auth_user_id');
      sessionStorage.removeItem('omega_auth_role');
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}
    const defaultStudent = INITIAL_USERS.find(u => u.role === 'student') || INITIAL_USERS[0];
    setCurrentUser(defaultStudent);
  };

  const switchRole = (role: UserRole) => {
    if (role === 'superadmin' && !isAdminAuthenticated) {
      return;
    }
    // Prevent student from switching away to pro or superadmin directly
    if (currentUser.role === 'student' && role !== 'student') {
      const authRole = typeof window !== 'undefined' ? sessionStorage.getItem('omega_auth_role') : null;
      if (authRole === 'student') {
        alert('Ambiente exclusivo do aluno. Para acessar outro perfil, encerre sua sessão.');
        return;
      }
    }
    const targetUser = INITIAL_USERS.find(u => u.role === role) || {
      ...INITIAL_USERS[0],
      role,
    };
    setCurrentUser(targetUser);
  };


  const updateOrganization = (updates: Partial<Organization>) => {
    setOrganization(prev => ({ ...prev, ...updates }));
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'organizationId' | 'proId' | 'joinDate' | 'adherenceRate' | 'completedWorkouts' | 'lastActive'>) => {
    const newStudent: Student = {
      ...studentData,
      email: sanitizeEmail(studentData.email),
      id: `stud-${Date.now()}`,
      organizationId: organization.id,
      proId: currentUser.id,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      adherenceRate: 100,
      completedWorkouts: 0,
      avatarUrl: studentData.avatarUrl || `https://images.unsplash.com/photo-${1534528741775 + students.length}?auto=format&fit=crop&w=150&q=80`,
      temporaryPassword: studentData.temporaryPassword || `Fit@${Math.floor(1000 + Math.random() * 9000)}`,
      accessBlocked: false,
    };
    setStudents(prev => [newStudent, ...prev]);
    setOrganization(prev => ({ ...prev, studentCount: prev.studentCount + 1 }));
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? {
      ...s,
      ...updates,
      email: updates.email ? sanitizeEmail(updates.email) : s.email
    } : s));
  };

  const archiveStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'archived' } : s));
  };

  const blockStudent = (id: string, reason?: string) => {
    setStudents(prev => prev.map(s => s.id === id ? {
      ...s,
      status: 'blocked',
      accessBlocked: true,
      blockedAt: new Date().toISOString(),
      blockedReason: reason || 'Acesso suspenso pelo Administrador'
    } : s));
  };

  const unblockStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? {
      ...s,
      status: 'active',
      accessBlocked: false,
      blockedAt: undefined,
      blockedReason: undefined
    } : s));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setOrganization(prev => ({
      ...prev,
      studentCount: Math.max(0, prev.studentCount - 1),
    }));
    if (currentUser.id === id) {
      logoutUser();
    }
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('omega_deleted_student_ids') || '[]');
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem('omega_deleted_student_ids', JSON.stringify(deleted));
      }
    } catch {}
  };

  const resetStudentPassword = (id: string, newPassword: string) => {
    setStudents(prev => prev.map(s => s.id === id ? {
      ...s,
      temporaryPassword: newPassword,
    } : s));
  };

  const addTrainer = (trainerData: Omit<Trainer, 'id' | 'createdAt'>) => {
    const newTrainer: Trainer = {
      ...trainerData,
      email: sanitizeEmail(trainerData.email),
      id: `trainer-${Date.now()}`,
      organizationId: organization.id,
      role: 'pro',
      status: trainerData.status || 'active',
      accessBlocked: trainerData.accessBlocked ?? false,
      assignedStudentsCount: trainerData.assignedStudentsCount ?? 0,
      createdAt: new Date().toISOString(),
      temporaryPassword: trainerData.temporaryPassword || `Omega@${Math.floor(1000 + Math.random() * 9000)}`,
      avatarUrl: trainerData.avatarUrl || `https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=200&q=80`,
    };
    setTrainers(prev => [newTrainer, ...prev]);
  };

  const updateTrainer = (id: string, updates: Partial<Trainer>) => {
    setTrainers(prev => prev.map(t => t.id === id ? {
      ...t,
      ...updates,
      email: updates.email ? sanitizeEmail(updates.email) : t.email
    } : t));
  };

  const blockTrainer = (id: string, reason?: string) => {
    setTrainers(prev => prev.map(t => t.id === id ? {
      ...t,
      status: 'blocked',
      accessBlocked: true,
      blockedAt: new Date().toISOString(),
      blockedReason: reason || 'Acesso suspenso pelo Administrador'
    } : t));
  };

  const unblockTrainer = (id: string) => {
    setTrainers(prev => prev.map(t => t.id === id ? {
      ...t,
      status: 'active',
      accessBlocked: false,
      blockedAt: undefined,
      blockedReason: undefined
    } : t));
  };

  const deleteTrainer = (id: string) => {
    setTrainers(prev => prev.filter(t => t.id !== id));
    setOrganization(prev => ({
      ...prev,
      proCount: Math.max(0, (prev.proCount || 1) - 1),
    }));
    if (currentUser.id === id) {
      logoutUser();
    }
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('omega_deleted_trainer_ids') || '[]');
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem('omega_deleted_trainer_ids', JSON.stringify(deleted));
      }
    } catch {}
  };

  const resetTrainerPassword = (id: string, customPassword?: string): string => {
    const newPassword = customPassword || `Omega@${Math.floor(1000 + Math.random() * 9000)}`;
    setTrainers(prev => prev.map(t => t.id === id ? {
      ...t,
      temporaryPassword: newPassword,
    } : t));
    return newPassword;
  };

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newEx: Exercise = {
      ...exercise,
      id: `ex-${Date.now()}`,
      organizationId: organization.id,
    };
    setExercises(prev => [...prev, newEx]);
  };

  const addWorkoutPlan = (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => {
    const newPlan: WorkoutPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWorkoutPlans(prev => [newPlan, ...prev]);
  };

  const resolveInsight = (id: string) => {
    setInsights(prev => prev.map(ins => ins.id === id ? { ...ins, status: 'resolved' } : ins));
  };

  const addAssessment = (assessment: Omit<PhysicalAssessment, 'id'>) => {
    const newAss: PhysicalAssessment = {
      ...assessment,
      id: `ass-${Date.now()}`,
    };
    setAssessments(prev => [newAss, ...prev]);
  };

  const addCheckIn = (checkIn: Omit<CheckIn, 'id'>) => {
    const newChk: CheckIn = {
      ...checkIn,
      id: `chk-${Date.now()}`,
    };
    setCheckIns(prev => [newChk, ...prev]);
  };

  const reviewCheckIn = (id: string, feedback: string) => {
    setCheckIns(prev => prev.map(chk => chk.id === id ? { ...chk, status: 'reviewed', proFeedback: feedback } : chk));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'isCompleted'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `g-${Date.now()}`,
      isCompleted: false,
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, isCompleted: !g.isCompleted } : g));
  };

  const addNutritionPlan = (plan: Omit<NutritionPlan, 'id'>) => {
    const newPlan: NutritionPlan = {
      ...plan,
      id: `nutri-${Date.now()}`,
    };
    setNutritionPlans(prev => [newPlan, ...prev.filter(p => p.studentId !== plan.studentId)]);
  };

  const toggleDietVisibility = (studentIdOrPlanId: string) => {
    setNutritionPlans(prev => prev.map(p => {
      if (p.id === studentIdOrPlanId || p.studentId === studentIdOrPlanId) {
        return {
          ...p,
          isHiddenForStudent: !p.isHiddenForStudent,
        };
      }
      return p;
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const startSession = (planId: string) => {
    setActiveSession({
      planId,
      startedAt: new Date().toISOString(),
      completedSets: {},
      activeRestSeconds: null,
    });
  };

  const toggleSetCompleted = (exerciseKey: string, setIndex: number) => {
    if (!activeSession) return;
    const key = `${exerciseKey}-${setIndex}`;
    setActiveSession({
      ...activeSession,
      completedSets: {
        ...activeSession.completedSets,
        [key]: !activeSession.completedSets[key],
      }
    });
  };

  const startRestTimer = (seconds: number) => {
    if (!activeSession) return;
    setActiveSession(prev => prev ? { ...prev, activeRestSeconds: seconds } : null);
  };

  const finishSession = (feedbackRating: number, notes: string) => {
    if (!activeSession) return;
    // Log session completed
    const completedCount = Object.values(activeSession.completedSets).filter(Boolean).length;
    // Update student stats
    setStudents(prev => prev.map(s => {
      if (s.id === 'stud-1') {
        return {
          ...s,
          completedWorkouts: s.completedWorkouts + 1,
          lastActive: new Date().toISOString(),
        };
      }
      return s;
    }));

    setActiveSession(null);
  };

  const cancelSession = () => {
    setActiveSession(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        switchRole,
        organization,
        updateOrganization,
        students,
        addStudent,
        updateStudent,
        archiveStudent,
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
        exercises,
        addExercise,
        workoutPlans,
        addWorkoutPlan,
        insights,
        resolveInsight,
        assessments,
        addAssessment,
        checkIns,
        addCheckIn,
        reviewCheckIn,
        nutritionPlans,
        addNutritionPlan,
        toggleDietVisibility,
        goals,
        addGoal,
        toggleGoal,
        notifications,
        markNotificationAsRead,
        activeSession,
        startSession,
        toggleSetCompleted,
        startRestTimer,
        finishSession,
        cancelSession,
        theme,
        setTheme,
        toggleTheme,
        isAdminAuthenticated,
        adminCredentials,
        loginAdmin,
        logoutAdmin,
        updateAdminPassword,
        isUserLoggedIn,
        loginUser,
        registerUser,
        logoutUser,
        pendingInviteAuth,
        setPendingInviteAuth,
        authenticateInvite,
        clearInviteAuth,
      }}
    >

      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
