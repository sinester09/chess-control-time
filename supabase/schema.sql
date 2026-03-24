-- ============================================================
-- Chess Control Time – Supabase Schema
-- ============================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Proyectos ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  color      TEXT    NOT NULL DEFAULT '#3b82f6',
  created_at BIGINT  NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects (user_id);

-- ── Tareas ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  user_uid               TEXT    NOT NULL,
  task_id                INTEGER NOT NULL,
  project_id             UUID    REFERENCES projects(id) ON DELETE SET NULL,
  name                   TEXT    NOT NULL,
  estimated_time         INTEGER NOT NULL DEFAULT 0,
  elapsed_time           INTEGER NOT NULL DEFAULT 0,
  is_active              BOOLEAN NOT NULL DEFAULT false,
  is_completed           BOOLEAN NOT NULL DEFAULT false,
  time_exceeded_notified BOOLEAN NOT NULL DEFAULT false,
  created_at             BIGINT  NOT NULL,
  completed_at           BIGINT,
  PRIMARY KEY (user_uid, task_id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_uid   ON tasks (user_uid);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_active  ON tasks (user_uid, is_active);

-- ── Configuración por usuario ─────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_uid           TEXT    PRIMARY KEY,
  tolerance_time     INTEGER NOT NULL DEFAULT 300,
  pause_interval     INTEGER NOT NULL DEFAULT 7200,
  pause_duration     INTEGER NOT NULL DEFAULT 15,
  snooze_duration    INTEGER NOT NULL DEFAULT 15,
  focus_mode_enabled BOOLEAN NOT NULL DEFAULT false,
  pomodoro_timer     INTEGER NOT NULL DEFAULT 25,
  work_day           JSONB
);

-- ── Registros de tiempo por día/proyecto ─────────────────────
CREATE TABLE IF NOT EXISTS time_records (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT    NOT NULL,
  project_id    UUID    REFERENCES projects(id) ON DELETE SET NULL,
  date          DATE    NOT NULL,
  total_seconds INTEGER NOT NULL DEFAULT 0,
  task_count    INTEGER NOT NULL DEFAULT 0,
  created_at    BIGINT  NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_time_records_user_id ON time_records (user_id);
CREATE INDEX IF NOT EXISTS idx_time_records_date    ON time_records (user_id, date);

-- ── Row Level Security (habilitar en producción) ──────────────
-- ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE time_records   ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "own_projects"     ON projects      FOR ALL USING (user_id  = auth.uid()::text);
-- CREATE POLICY "own_tasks"        ON tasks         FOR ALL USING (user_uid = auth.uid()::text);
-- CREATE POLICY "own_settings"     ON user_settings FOR ALL USING (user_uid = auth.uid()::text);
-- CREATE POLICY "own_time_records" ON time_records   FOR ALL USING (user_id  = auth.uid()::text);
