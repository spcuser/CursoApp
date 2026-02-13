-- Script SQL para crear/actualizar la tabla de cursos en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar tabla existente si quieres empezar de cero (CUIDADO: borra todos los datos)
-- DROP TABLE IF EXISTS courses;

-- Crear tabla de cursos con todos los campos necesarios
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  created_at BIGINT NOT NULL,
  last_updated BIGINT NOT NULL,
  step TEXT NOT NULL,
  topic TEXT NOT NULL,
  related_topics JSONB DEFAULT '[]'::jsonb,
  pillars JSONB DEFAULT '[]'::jsonb,
  selected_pillar JSONB,
  variations JSONB DEFAULT '[]'::jsonb,
  selected_variation JSONB,
  course JSONB,
  depth TEXT DEFAULT 'standard',
  completed_module_ids JSONB DEFAULT '[]'::jsonb,
  user_highlights JSONB DEFAULT '{}'::jsonb,
  quiz_results JSONB DEFAULT '{}'::jsonb
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_courses_last_updated ON courses(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_courses_topic ON courses(topic);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);

-- Habilitar Row Level Security (RLS) - IMPORTANTE para seguridad
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones sin autenticación (para desarrollo)
-- NOTA: En producción, deberías implementar autenticación y políticas más restrictivas
DROP POLICY IF EXISTS "Allow all operations" ON courses;
CREATE POLICY "Allow all operations" ON courses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verificar que la tabla se creó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses'
ORDER BY ordinal_position;
