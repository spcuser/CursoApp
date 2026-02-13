-- Script SQL para verificar el contenido de la tabla courses en Supabase
-- Ejecuta estas consultas en el SQL Editor de Supabase

-- 1. Ver todos los cursos guardados (solo campos básicos)
SELECT 
  id,
  topic,
  step,
  depth,
  created_at,
  last_updated,
  jsonb_array_length(pillars) as num_pillars,
  jsonb_array_length(variations) as num_variations,
  CASE 
    WHEN course IS NOT NULL THEN 'Sí'
    ELSE 'No'
  END as tiene_curso
FROM courses
ORDER BY last_updated DESC;

-- 2. Ver el contenido completo de un curso específico (reemplaza 'COURSE_ID' con el ID real)
-- SELECT * FROM courses WHERE id = 'COURSE_ID';

-- 3. Ver cuántos módulos tiene cada curso
SELECT 
  id,
  topic,
  jsonb_array_length(course->'modules') as num_modulos
FROM courses
WHERE course IS NOT NULL
ORDER BY last_updated DESC;

-- 4. Ver el tamaño de los datos guardados (en bytes)
SELECT 
  id,
  topic,
  pg_column_size(course) as tamaño_curso_bytes,
  pg_column_size(pillars) as tamaño_pilares_bytes,
  pg_column_size(variations) as tamaño_variaciones_bytes
FROM courses
ORDER BY last_updated DESC;

-- 5. Contar total de cursos
SELECT COUNT(*) as total_cursos FROM courses;

-- 6. Ver los últimos 5 cursos con más detalle
SELECT 
  id,
  topic,
  step,
  depth,
  to_timestamp(created_at/1000) as fecha_creacion,
  to_timestamp(last_updated/1000) as ultima_actualizacion,
  jsonb_array_length(pillars) as pilares,
  jsonb_array_length(variations) as variaciones,
  CASE 
    WHEN course IS NOT NULL THEN jsonb_array_length(course->'modules')
    ELSE 0
  END as modulos
FROM courses
ORDER BY last_updated DESC
LIMIT 5;
