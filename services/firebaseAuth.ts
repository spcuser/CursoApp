import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  geminiApiKey?: string;
  createdAt: number;
}

// Registrar nuevo usuario
export const registerUser = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Actualizar perfil con nombre
    await updateProfile(user, { displayName });
    
    // Crear documento de perfil en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      createdAt: Date.now()
    });
    
    return user;
  } catch (error: any) {
    console.error('Error registrando usuario:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Iniciar sesión
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error iniciando sesión:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Cerrar sesión
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error cerrando sesión:', error);
    throw new Error('Error al cerrar sesión');
  }
};

// Obtener perfil de usuario
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    return null;
  }
};

// Actualizar API key del usuario
export const updateUserApiKey = async (uid: string, apiKey: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, { geminiApiKey: apiKey }, { merge: true });
  } catch (error) {
    console.error('Error actualizando API key:', error);
    throw new Error('Error al guardar la API key');
  }
};

// Observar cambios en autenticación
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Mensajes de error en español
const getAuthErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'Email inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-disabled': 'Usuario deshabilitado',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión'
  };
  
  return messages[code] || 'Error de autenticación';
};
