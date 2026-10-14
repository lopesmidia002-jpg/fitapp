export type UserRole = 'superadmin' | 'owner' | 'pro' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  phone?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planId: 'starter' | 'pro' | 'business';
  ownerId: string;
  studentCount: number;
  maxStudents: number;
  proCount: number;
  createdAt: string;
}

export interface Trainer {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: 'pro';
  status: 'active' | 'blocked' | 'inactive';
  cref?: string;
  specialty?: string;
  temporaryPassword?: string;
  accessBlocked?: boolean;
  blockedAt?: string;
  blockedReason?: string;
  assignedStudentsCount?: number;
  createdAt: string;
  lastLogin?: string;
}

export interface Student {
  id: string;
  organizationId: string;
  proId: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: 'active' | 'inactive' | 'archived' | 'blocked';
  goal: string;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  joinDate: string;
  lastActive: string;
  adherenceRate: number; // 0 - 100%
  completedWorkouts: number;
  nextAssessmentDate?: string;
  privateNotes?: string;
  temporaryPassword?: string;
  accessBlocked?: boolean;
  blockedAt?: string;
  blockedReason?: string;
}

export type ExerciseMuscleGroup = 'Peitoral' | 'Costas' | 'Pernas' | 'Ombros' | 'Braços' | 'Abdômen' | 'Cardio';

export type ExerciseEquipment =
  | 'Halteres'
  | 'Barra'
  | 'Máquina'
  | 'Peso Corporal'
  | 'Cabo'
  | 'Kettlebell'
  | 'Esteira Ergométrica'
  | 'Bicicleta Ergométrica'
  | 'Bicicleta Ergométrica Horizontal'
  | 'Simulador de Escada'
  | 'Elíptico'
  | 'Remo Seco (Air Rower)'
  | 'Air Bike'
  | 'Corda Naval'
  | 'Corda de Pular'
  | string;

export interface Exercise {
  id: string;
  organizationId?: string; // null = global library
  name: string;
  muscleGroup: ExerciseMuscleGroup;
  equipment: ExerciseEquipment;
  instructions: string;
  precautions?: string;
  targetSetsDefault: number;
  targetRepsDefault: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  videoDuration?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  weightKg?: number;
  notes?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  videoDuration?: string;
}

export interface WorkoutPlan {
  id: string;
  organizationId: string;
  studentId: string;
  proId: string;
  title: string;
  split: 'A' | 'B' | 'C' | 'D' | 'Fullbody';
  description: string;
  exercises: WorkoutExercise[];
  validUntil: string;
  createdAt: string;
}

export interface WorkoutSessionLog {
  id: string;
  workoutPlanId: string;
  studentId: string;
  date: string;
  durationMinutes: number;
  completedSets: number;
  totalSets: number;
  feedbackRating?: number; // 1 to 5 stars
  studentNotes?: string;
}

export interface MealItem {
  id: string;
  name: string;
  amount: string; // e.g., "150g"
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

export interface Meal {
  id: string;
  time: string;
  title: string;
  items: MealItem[];
  notes?: string;
}

export interface NutritionPlan {
  id: string;
  organizationId: string;
  studentId: string;
  proId: string;
  title: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
  waterIntakeMl: number;
  meals: Meal[];
  validUntil: string;
  isHiddenForStudent?: boolean;
}

export interface FoodDiaryEntry {
  id: string;
  studentId: string;
  date: string;
  mealTitle: string;
  consumedItems: string;
  caloriesEstimated: number;
  photoUrl?: string;
  difficultyNotes?: string;
}

export interface PhysicalAssessment {
  id: string;
  studentId: string;
  proId: string;
  date: string;
  weightKg: number;
  bodyFatPercentage: number;
  method: 'Pollock 7 Dobras' | 'Pollock 3 Dobras' | 'Bioimpedância';
  heightCm?: number;
  bmi?: number;
  bmiCategory?: string;
  riskLevel?: 'safe' | 'info' | 'warning' | 'danger';
  technicalRecommendations?: string[];
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  photosUrls?: string[];
  proObservations: string;
}

export interface CheckIn {
  id: string;
  studentId: string;
  date: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  sleepHours: number;
  dietAdherence: 1 | 2 | 3 | 4 | 5;
  workoutAdherence: 1 | 2 | 3 | 4 | 5;
  notes: string;
  status: 'pending' | 'reviewed';
  proFeedback?: string;
}

export interface Goal {
  id: string;
  studentId: string;
  title: string;
  category: 'workout' | 'nutrition' | 'weight' | 'habit';
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  isCompleted: boolean;
}

export interface Insight {
  id: string;
  organizationId: string;
  studentId?: string;
  studentName?: string;
  type: 'retention_risk' | 'checkin_pending' | 'assessment_due' | 'workout_milestone' | 'plan_expiring';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
  createdAt: string;
  status: 'active' | 'resolved' | 'snoozed';
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'workout' | 'nutrition' | 'checkin' | 'assessment' | 'billing' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface SaaSPlan {
  id: 'starter' | 'pro' | 'business';
  name: string;
  priceMonthly: number;
  maxStudents: number;
  maxPros: number;
  features: string[];
  isPopular?: boolean;
}
