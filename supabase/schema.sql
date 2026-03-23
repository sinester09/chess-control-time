-- ============================================================
-- Chess Control Time – Supabase Schema
-- ============================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.
-- Habilita Row Level Security (RLS) en producción y crea políticas
-- adecuadas para que cada usuario sólo acceda a sus propios datos.
-- ============================================================

-- ── Tabla de tareas ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  user_uid              TEXT    NOT NULL,
  task_id               INTEGER NOT NULL,
  name                  TEXT    NOT NULL,
  estimated_time        INTEGER NOT NULL DEFAULT 0,   -- segundos
  elapsed_time          INTEGER NOT NULL DEFAULT 0,   -- segundos
  is_active             BOOLEAN NOT NULL DEFAULT false,
  is_completed          BOOLEAN NOT NULL DEFAULT false,
  time_exceeded_notified BOOLEAN NOT NULL DEFAULT false,
  created_at            BIGINT  NOT NULL,             -- timestamp ms
  completed_at          BIGINT,                       -- timestamp ms (nullable)

  PRIMARY KEY (user_uid, task_id)
);

-- ── Tabla de configuración por usuario ───────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_uid            TEXT    PRIMARY KEY,
  tolerance_time      INTEGER NOT NULL DEFAULT 300,    -- segundos (5 min)
  pause_interval      INTEGER NOT NULL DEFAULT 7200,   -- segundos (2 h)
  pause_duration      INTEGER NOT NULL DEFAULT 15,     -- minutos
  snooze_duration     INTEGER NOT NULL DEFAULT 15,     -- minutos
  focus_mode_enabled  BOOLEAN NOT NULL DEFAULT false,
  pomodoro_timer      INTEGER NOT NULL DEFAULT 25,     -- minutos
  work_day            JSONB                            -- { start: "HH:MM", end: "HH:MM" }
);

-- ── Índices de rendimiento ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_user_uid ON tasks (user_uid);
CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks (user_uid, is_active);

-- ── Row Level Security (recomendado para producción) ──────────
-- Si usas Supabase Auth, habilita RLS y crea políticas como:
--
--   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "Users can manage their own tasks"
--     ON tasks FOR ALL
--     USING (user_uid = auth.uid()::text);
--
--   ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "Users can manage their own settings"
--     ON user_settings FOR ALL
--     USING (user_uid = auth.uid()::text);
--
-- Si prefieres usar el UID anónimo de localStorage sin auth, deja
-- RLS deshabilitado y asegúrate de que el anon key sólo tenga
-- permisos de INSERT/UPDATE/DELETE sobre estas dos tablas.
