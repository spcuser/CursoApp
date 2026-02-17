import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { SavedCourse } from '../types';

// Guardar curso del usuario
export const saveCourse = async (userId: string, course: SavedCourse): Promise<void> => {
  try {
    const courseRef = doc(db, 'courses', `${userId}_${course.id}`);
    await setDoc(courseRef, {
      ...course,
      userId,
      lastUpdated: Date.now()
    });
    console.log('✅ Curso guardado en Firestore');
  } catch (error) {
    console.error('❌ Error guardando curso:', error);
    throw new Error('Error al guardar el curso');
  }
};

// Obtener todos los cursos del usuario
export const getUserCourses = async (userId: string): Promise<SavedCourse[]> => {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(
      coursesRef,
      where('userId', '==', userId),
      orderBy('lastUpdated', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const courses: SavedCourse[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      courses.push(data as SavedCourse);
    });
    
    console.log(`✅ ${courses.length} cursos cargados de Firestore`);
    return courses;
  } catch (error) {
    console.error('❌ Error cargando cursos:', error);
    return [];
  }
};

// Obtener un curso específico
export const getCourse = async (userId: string, courseId: string): Promise<SavedCourse | null> => {
  try {
    const courseRef = doc(db, 'courses', `${userId}_${courseId}`);
    const docSnap = await getDoc(courseRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SavedCourse;
    }
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo curso:', error);
    return null;
  }
};

// Eliminar curso
export const deleteCourse = async (userId: string, courseId: string): Promise<void> => {
  try {
    const courseRef = doc(db, 'courses', `${userId}_${courseId}`);
    await deleteDoc(courseRef);
    console.log('✅ Curso eliminado de Firestore');
  } catch (error) {
    console.error('❌ Error eliminando curso:', error);
    throw new Error('Error al eliminar el curso');
  }
};

// Buscar curso por tema, pilar y variación (compartido entre todos los usuarios)
export const findCourseByVariation = async (
  topic: string,
  pillarTitle: string,
  variationTitle: string
): Promise<SavedCourse | null> => {
  try {
    console.log('🔍 Buscando curso en Firestore:', { topic, pillarTitle, variationTitle });
    
    const coursesRef = collection(db, 'courses');
    const q = query(
      coursesRef,
      where('topic', '==', topic),
      where('selectedPillar.title', '==', pillarTitle),
      where('selectedVariation.title', '==', variationTitle),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const courseData = querySnapshot.docs[0].data() as SavedCourse;
      // Verificar que tenga un curso completo generado
      if (courseData.course && courseData.course.modules && courseData.course.modules.length > 0) {
        console.log('✅ Curso encontrado en Firestore');
        return courseData;
      }
    }
    
    console.log('ℹ️ Curso no encontrado en Firestore, se generará uno nuevo');
    return null;
  } catch (error) {
    console.error('❌ Error buscando curso:', error);
    return null;
  }
};
