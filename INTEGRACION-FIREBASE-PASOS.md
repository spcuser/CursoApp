# 🔥 Pasos para Integrar Firebase en App.tsx

## ⚠️ IMPORTANTE
El archivo App.tsx es muy grande (716 líneas). He creado los servicios y componentes necesarios.
Ahora necesitas hacer estos cambios en App.tsx:

## 📝 Cambios Necesarios

### 1. Agregar Imports (línea 1-30)

Agregar estos imports después de los existentes:

```typescript
import { User } from 'firebase/auth';
import { 
  onAuthChange, 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  updateUserApiKey, 
  UserProfile 
} from './services/firebaseAuth';
import { 
  saveCourse, 
  getUserCourses, 
  deleteCourse 
} from './services/firebaseDb';
import { AuthModal } from './components/AuthModal';
import { ApiKeySetup } from './components/ApiKeySetup';
import { LogOut } from 'lucide-react';
```

### 2. Agregar Estados de Firebase (después de `export default function App() {`)

```typescript
// Estados de autenticación Firebase
const [user, setUser] = useState<User | null>(null);
const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
const [userApiKey, setUserApiKey] = useState<string>('');
const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
const [isApiKeySetupOpen, setIsApiKeySetupOpen] = useState(false);
const [authLoading, setAuthLoading] = useState(true);
```

### 3. Agregar useEffect de Autenticación (después de los refs)

```typescript
// Observar cambios en autenticación
useEffect(() => {
  const unsubscribe = onAuthChange(async (firebaseUser) => {
    console.log('🔐 Estado de autenticación:', firebaseUser ? 'Autenticado' : 'No autenticado');
    setUser(firebaseUser);
    
    if (firebaseUser) {
      // Usuario autenticado - cargar perfil y cursos
      const profile = await getUserProfile(firebaseUser.uid);
      setUserProfile(profile);
      setUserApiKey(profile?.geminiApiKey || '');
      
      // Cargar cursos del usuario desde Firestore
      const courses = await getUserCourses(firebaseUser.uid);
      setSavedCourses(courses);
      
      // Si no tiene API key, mostrar modal de configuración
      if (!profile?.geminiApiKey) {
        console.log('⚠️ Usuario sin API key, mostrando modal de configuración');
        setIsApiKeySetupOpen(true);
      }
    } else {
      // Usuario no autenticado - limpiar datos y mostrar login
      setUserProfile(null);
      setUserApiKey('');
      setSavedCourses([]);
      setIsAuthModalOpen(true);
    }
    
    setAuthLoading(false);
  });
  
  return () => unsubscribe();
}, []);
```

### 4. ELIMINAR el useEffect que carga desde localStorage

Busca y ELIMINA este bloque completo:

```typescript
// Cargar cursos desde localStorage al iniciar
useEffect(() => {
  const loadCourses = () => {
    console.log('🔄 Cargando cursos desde localStorage...');
    // ... todo el código
  };
  loadCourses();
}, []);
```

### 5. Agregar Funciones de Autenticación (antes de saveCurrentSession)

```typescript
// Funciones de autenticación
const handleLogin = async (email: string, password: string) => {
  await loginUser(email, password);
  setIsAuthModalOpen(false);
};

const handleRegister = async (email: string, password: string, displayName: string) => {
  await registerUser(email, password, displayName);
  setIsAuthModalOpen(false);
};

const handleLogout = async () => {
  await logoutUser();
  handleRestart();
  setIsAuthModalOpen(true);
};

const handleSaveApiKey = async (apiKey: string) => {
  if (user) {
    await updateUserApiKey(user.uid, apiKey);
    setUserApiKey(apiKey);
    console.log('✅ API key guardada');
  }
};
```

### 6. Modificar saveCurrentSession

REEMPLAZAR la función completa `saveCurrentSession` con:

```typescript
const saveCurrentSession = async () => {
  if (!currentSessionId || !topic || !user) return;
  
  const sessionData: SavedCourse = {
    id: currentSessionId, 
    createdAt: Date.now(), 
    lastUpdated: Date.now(),
    step, 
    topic, 
    relatedTopics, 
    pillars, 
    selectedPillar: selectedPillar || undefined,
    variations, 
    selectedVariation: selectedVariation || undefined, 
    course: course || undefined,
    depth: currentDepth, 
    completedModuleIds, 
    userHighlights,
    quizResults: variationScores
  };

  // Guardar en Firestore
  try {
    await saveCourse(user.uid, sessionData);
    console.log('✅ Guardado en Firestore');
    
    // Actualizar la lista en memoria
    setSavedCourses(prev => {
      const filtered = prev.filter(c => c.id !== currentSessionId);
      return [sessionData, ...filtered].slice(0, 50);
    });
  } catch (e) {
    console.error('❌ Error guardando en Firestore:', e);
  }
};
```

### 7. Modificar handleTopicSubmit

Busca la línea:

```typescript
const data = await generatePillars(inputTopic, language, contextContent);
```

REEMPLAZAR con:

```typescript
const data = await generatePillars(inputTopic, language, contextContent, userApiKey);
```

### 8. Modificar handlePillarSelect

Busca la línea:

```typescript
const v = await generateVariations(pillar.title, topic, language, pdfContext);
```

REEMPLAZAR con:

```typescript
const v = await generateVariations(pillar.title, topic, language, pdfContext, userApiKey);
```

### 9. Modificar handleVariationSelect

Busca la línea:

```typescript
const c = await generateCourse(v.title, v.description, topic, d, language, pdfContext, quizQuestionsCount);
```

REEMPLAZAR con:

```typescript
const c = await generateCourse(v.title, v.description, topic, d, language, pdfContext, quizQuestionsCount, userApiKey);
```

### 10. Modificar el botón de eliminar curso en el historial

Busca el botón con `onClick` que elimina cursos (dentro del map de savedCourses).

REEMPLAZAR el onClick completo con:

```typescript
onClick={async (e) => { 
  e.stopPropagation(); 
  if (!user) return;
  
  try {
    await deleteCourse(user.uid, s.id);
    setSavedCourses(prev => prev.filter(c => c.id !== s.id));
    console.log('✅ Curso eliminado de Firestore');
  } catch (err) {
    console.error('❌ Error eliminando curso:', err);
    alert('Error al eliminar el curso');
  }
}}
```

### 11. Agregar Botón de Logout en el Header

Busca la sección del header donde están los botones de Settings, etc.

AGREGAR este botón ANTES del botón de Settings:

```typescript
{user && (
  <button 
    onClick={handleLogout}
    className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
    title="Cerrar Sesión"
  >
    <LogOut size={20} />
    <span className="text-xs font-bold">{userProfile?.displayName}</span>
  </button>
)}
```

### 12. Actualizar SettingsModal

Busca donde renderizas `<SettingsModal`:

AGREGAR estas props:

```typescript
<SettingsModal 
  isOpen={isSettingsOpen} 
  onClose={() => setIsSettingsOpen(false)} 
  onDownloadBackup={handleExportHistory} 
  t={t} 
  quizQuestionsCount={quizQuestionsCount} 
  onQuizQuestionsCountChange={setQuizQuestionsCount}
  onOpenApiKeySetup={() => setIsApiKeySetupOpen(true)}
  hasApiKey={!!userApiKey}
/>
```

### 13. Agregar Modales de Auth y API Key

AGREGAR estos componentes ANTES del return principal (después de todos los useEffect):

```typescript
// Mostrar loading mientras se verifica autenticación
if (authLoading) {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <LoadingScreen message="Iniciando..." />
    </div>
  );
}

return (
  <div className={`h-screen flex flex-col font-sans overflow-hidden transition-all ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
    {/* Modales de autenticación */}
    <AuthModal 
      isOpen={isAuthModalOpen && !user}
      onClose={() => setIsAuthModalOpen(false)}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />

    <ApiKeySetup
      isOpen={isApiKeySetupOpen}
      onClose={() => setIsApiKeySetupOpen(false)}
      currentApiKey={userApiKey}
      onSave={handleSaveApiKey}
      userName={userProfile?.displayName}
    />

    {/* Resto del código existente... */}
```

---

## ✅ Verificación

Después de hacer todos los cambios:

1. Verifica que no haya errores de TypeScript
2. Ejecuta: `npm run dev`
3. Deberías ver el modal de login
4. Regístrate con un email de prueba
5. Deberías ver el modal de configuración de API key
6. Configura tu API key
7. ¡Prueba generando un curso!

---

## 🆘 Si hay errores

1. Revisa la consola del navegador (F12)
2. Revisa que todas las importaciones estén correctas
3. Verifica que `.env.local` tenga las credenciales de Firebase
4. Asegúrate de que Firebase esté configurado (ver FIREBASE-SETUP.md)

---

¿Necesitas ayuda con algún paso específico?
