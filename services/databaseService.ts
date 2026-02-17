import { supabase, DBCourse } from './supabaseClient';
import { SavedCourse } from '../types';

// Convertir SavedCourse a formato de base de datos
const toDBCourse = (course: SavedCourse): Omit<DBCourse, 'user_id'> => ({
  id: course.id,
  created_at: course.createdAt,
  last_updated: course.lastUpdated,
  step: course.step,
  topic: course.topic,
  related_topics: course.relatedTopics || [],
  pillars: course.pillars || [],
  selected_pillar: course.selectedPillar,
  variations: course.variations || [],
  selected_variation: course.selectedVariation,
  course: course.course,
  depth: course.depth,
  completed_module_ids: course.completedModuleIds || [],
  user_highlights: course.userHighlights || {},
  quiz_results: course.quizResults || {}
});

// Convertir de formato DB a SavedCourse
const fromDBCourse = (dbCourse: DBCourse): SavedCourse => ({
  id: dbCourse.id,
  createdAt: dbCourse.created_at,
  lastUpdated: dbCourse.last_updated,
  step: dbCourse.step as any,
  topic: dbCourse.topic,
  relatedTopics: dbCourse.related_topics,
  pillars: dbCourse.pillars,
  selectedPillar: dbCourse.selected_pillar,
  variations: dbCourse.variations,
  selectedVariation: dbCourse.selected_variation,
  course: dbCourse.course,
  depth: dbCourse.depth as any,
  completedModuleIds: dbCourse.completed_module_ids,
  userHighlights: dbCourse.user_highlights,
  quizResults: dbCourse.quiz_results
});

// Guardar o actualizar un curso
export const saveCourse = async (course: SavedCourse): Promise<{ success: boolean; error?: string }> => {
  try {
    const dbCourse = toDBCourse(course);
    
    // Log para debugging
    console.log('💾 Guardando curso en Supabase:', {
      id: dbCourse.id,
      topic: dbCourse.topic,
      step: dbCourse.step,
      hasPillars: dbCourse.pillars.length > 0,
      hasVariations: dbCourse.variations.length > 0,
      hasCourse: !!dbCourse.course,
      courseModules: dbCourse.course?.modules?.length || 0
    });
    
    const { data, error } = await supabase
      .from('courses')
      .upsert(dbCourse, { onConflict: 'id' })
      .select();
    
    if (error) {
      console.error('❌ Error guardando en Supabase:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message };
    }
    
    console.log('✅ Curso guardado exitosamente en Supabase');
    console.log('✅ Datos guardados:', data);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Error catch:', err);
    console.error('❌ Error completo:', JSON.stringify(err, null, 2));
    return { success: false, error: String(err) };
  }
};

// Obtener todos los cursos del usuario
export const getAllCourses = async (): Promise<SavedCourse[]> => {
  try {
    console.log('📂 Cargando cursos desde Supabase...');
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('❌ Error obteniendo cursos:', error);
      return [];
    }
    
    console.log(`✅ ${data?.length || 0} cursos cargados desde Supabase`);
    return (data || []).map(fromDBCourse);
  } catch (err) {
    console.error('❌ Error:', err);
    return [];
  }
};

// Eliminar un curso
export const deleteCourse = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error eliminando curso:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error:', err);
    return { success: false, error: String(err) };
  }
};

// Obtener un curso específico
export const getCourse = async (id: string): Promise<SavedCourse | null> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error obteniendo curso:', error);
      return null;
    }
    
    return fromDBCourse(data);
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
};

// Buscar un curso por tema, pilar y variación
export const findCourseByVariation = async (
  topic: string, 
  pillarTitle: string, 
  variationTitle: string
): Promise<SavedCourse | null> => {
  try {
    console.log('🔍 Buscando curso en BD:', { topic, pillarTitle, variationTitle });
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('topic', topic)
      .eq('selected_pillar->>title', pillarTitle)
      .eq('selected_variation->>title', variationTitle)
      .not('course', 'is', null)
      .order('last_updated', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Error buscando curso:', error);
      return null;
    }
    
    if (data) {
      console.log('✅ Curso encontrado en BD');
      return fromDBCourse(data);
    }
    
    console.log('ℹ️ Curso no encontrado en BD, se generará uno nuevo');
    return null;
  } catch (err) {
    console.error('❌ Error:', err);
    return null;
  }
};
