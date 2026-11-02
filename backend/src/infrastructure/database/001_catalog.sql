-- ============================================================
-- 001_catalog.sql
-- Migración: catálogo global + ejercicios de usuario
-- ============================================================

-- Catálogo global (solo lectura para usuarios)
CREATE TABLE IF NOT EXISTS exercise_catalog (
    id                  TEXT PRIMARY KEY,
    muscle_group        TEXT NOT NULL,
    equipment           TEXT,
    contributed_by      TEXT,        -- user_id si fue promovido desde un usuario
    source_exercise_id  TEXT,        -- id en user_exercises si fue promovido
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Ejercicios custom creados por usuarios
CREATE TABLE IF NOT EXISTS user_exercises (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment    TEXT,
    promoted_to  TEXT,              -- id en exercise_catalog si fue promovido
    promoted_at  TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Nombres y aliases para ambas fuentes
CREATE TABLE IF NOT EXISTS exercise_names (
    id          TEXT PRIMARY KEY,
    source_id   TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('catalog', 'user')),
    lang        TEXT NOT NULL,      -- 'es', 'en', etc.
    name        TEXT NOT NULL,
    is_alias    INTEGER NOT NULL DEFAULT 0  -- 0 = nombre principal, 1 = alias
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_exercise_names_source
    ON exercise_names (source_id, source_type);

CREATE INDEX IF NOT EXISTS idx_exercise_names_search
    ON exercise_names (name, lang);

CREATE INDEX IF NOT EXISTS idx_user_exercises_user
    ON user_exercises (user_id);

-- Vista unificada: catálogo global + ejercicios del usuario
-- Uso: SELECT * FROM exercises_view WHERE user_id = ? OR is_global = 1
CREATE VIEW IF NOT EXISTS exercises_view AS
    SELECT
        ec.id,
        ec.muscle_group,
        ec.equipment,
        1               AS is_global,
        NULL            AS user_id,
        ec.contributed_by,
        ec.created_at
    FROM exercise_catalog ec

    UNION ALL

    SELECT
        ue.id,
        ue.muscle_group,
        ue.equipment,
        0               AS is_global,
        ue.user_id,
        NULL            AS contributed_by,
        ue.created_at
    FROM user_exercises ue;