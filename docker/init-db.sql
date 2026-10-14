-- ==============================================================================
-- OMEGA TRAINING (Ω) — POSTGRESQL DDL & MULTI-TENANT INITIALIZATION SCRIPT
-- ==============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supabase auth mock compatibility schema for standalone PostgreSQL
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
    SELECT '00000000-0000-0000-0000-000000000001'::UUID;
$$ LANGUAGE SQL;

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

-- 2. PERFIS DE USUÁRIO
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    private_notes TEXT,
    adherence_rate INT DEFAULT 100,
    completed_workouts INT DEFAULT 0,
    join_date DATE DEFAULT CURRENT_DATE,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BIBLIOTECA DE EXERCÍCIOS
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    equipment VARCHAR(100),
    video_url TEXT,
    video_duration INT DEFAULT 30,
    instructions TEXT,
    precautions TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PERIODIZAÇÃO & PLANOS DE TREINO
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    pro_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    objective VARCHAR(255),
    notes TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DIETAS & PLANOS NUTRICIONAIS
CREATE TABLE IF NOT EXISTS nutrition_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_calories INT NOT NULL,
    protein_g NUMERIC(5,1) NOT NULL,
    carbs_g NUMERIC(5,1) NOT NULL,
    fat_g NUMERIC(5,1) NOT NULL,
    water_ml INT NOT NULL DEFAULT 2500,
    meals JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_hidden_from_student BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AVALIAÇÕES FÍSICAS
CREATE TABLE IF NOT EXISTS physical_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5,2) NOT NULL,
    height_cm INT NOT NULL,
    body_fat_pct NUMERIC(4,1),
    muscle_mass_kg NUMERIC(5,2),
    waist_cm NUMERIC(5,1),
    hip_cm NUMERIC(5,1),
    chest_cm NUMERIC(5,1),
    arm_left_cm NUMERIC(5,1),
    arm_right_cm NUMERIC(5,1),
    thigh_left_cm NUMERIC(5,1),
    thigh_right_cm NUMERIC(5,1),
    clinical_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. LOGS DE AUDITORIA (LGPD)
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

-- Initial Seed Organization
INSERT INTO organizations (id, name, slug, plan_id, owner_id, max_students)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Omega Training',
    'omega-training',
    'business',
    '00000000-0000-0000-0000-000000000001',
    50
) ON CONFLICT (id) DO NOTHING;

-- Initial Seed Admin Profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@omegatraining.com',
    'Administrador Geral',
    'superadmin'
) ON CONFLICT (id) DO NOTHING;

-- Initial Seed Organization Member
INSERT INTO organization_members (organization_id, user_id, role)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'owner'
) ON CONFLICT (organization_id, user_id) DO NOTHING;

