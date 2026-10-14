-- ==============================================================================
-- FITCORE PRO — POSTGRESQL & SUPABASE MIGRATION (MULTI-TENANT COM RLS)
-- Versão: 20261014_init_fitcore_schema.sql
-- ==============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZAÇÕES (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan_id VARCHAR(50) NOT NULL DEFAULT 'pro',
    owner_id UUID NOT NULL,
    max_students INT NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PERFIS DE USUÁRIO (Vínculo com auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- referencia auth.users(id)
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'owner', 'pro', 'student')),
    avatar_url TEXT,
    phone VARCHAR(30),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEMBROS DA ORGANIZAÇÃO
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'pro', 'student')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. ALUNOS (CRM)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    pro_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    goal TEXT,
    current_weight_kg NUMERIC(5,2),
    target_weight_kg NUMERIC(5,2),
    height_cm INT,
    private_notes TEXT, -- Apenas visível para treinadores e nutricionistas
    adherence_rate INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BIBLIOTECA DE EXERCÍCIOS
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = global da plataforma
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    equipment VARCHAR(100) NOT NULL,
    instructions TEXT NOT NULL,
    precautions TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROGRAMAS DE TREINO (FICHAS)
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    pro_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    split VARCHAR(20) NOT NULL,
    description TEXT,
    exercises_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SESSÕES DE TREINO EXECUTADAS (LOGS DO ALUNO)
CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_minutes INT,
    feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5),
    student_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PLANOS ALIMENTARES (NUTRIÇÃO)
CREATE TABLE IF NOT EXISTS nutrition_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    pro_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    target_calories INT NOT NULL,
    target_protein_g INT NOT NULL,
    target_carbs_g INT NOT NULL,
    target_fats_g INT NOT NULL,
    water_intake_ml INT DEFAULT 2500,
    meals_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AVALIAÇÕES FÍSICAS E MEDIDAS
CREATE TABLE IF NOT EXISTS physical_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    pro_id UUID NOT NULL REFERENCES profiles(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5,2) NOT NULL,
    body_fat_percentage NUMERIC(4,1) NOT NULL,
    method VARCHAR(100) NOT NULL,
    chest_cm NUMERIC(5,1),
    waist_cm NUMERIC(5,1),
    hips_cm NUMERIC(5,1),
    arms_cm NUMERIC(5,1),
    thighs_cm NUMERIC(5,1),
    photos_urls TEXT[],
    pro_observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. METAS E CHECK-INS
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    current_value NUMERIC(6,2) DEFAULT 0,
    target_value NUMERIC(6,2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    deadline DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
    sleep_hours NUMERIC(4,1),
    diet_adherence INT CHECK (diet_adherence BETWEEN 1 AND 5),
    workout_adherence INT CHECK (workout_adherence BETWEEN 1 AND 5),
    notes TEXT,
    status VARCHAR(30) DEFAULT 'pending',
    pro_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FITCORE INSIGHTS
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(30) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    suggested_action TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'snoozed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. LOGS DE AUDITORIA (LGPD)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(100),
    target_id UUID,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Exemplo de política de isolamento estrito por tenant:
CREATE POLICY "Tenant isolation for students"
ON students FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Student sees only own workouts"
ON workout_plans FOR SELECT
USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    OR
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('pro', 'owner'))
);
