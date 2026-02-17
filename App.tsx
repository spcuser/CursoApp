
import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  Pillar, 
  Variation, 
  Course, 
  AppStep,
  CourseDepth,
  SavedCourse,
  TranslationDictionary
} from './types';
import { 
  generatePillars, 
  generateVariations, 
  generateCourse
} from './services/geminiService';
import { 
  onAuthChange, 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile,
  resetPassword,
  UserProfile 
} from './services/firebaseAuth';
import { 
  saveCourse, 
  getUserCourses, 
  deleteCourse 
} from './services/firebaseDb';
import { TopicInput } from './components/TopicInput';
import { PillarSelection } from './components/PillarSelection';
import { VariationSelection } from './components/VariationSelection';
import { CourseView } from './components/CourseView';
import { LoadingScreen } from './components/LoadingScreen';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { 
  Folder, BrainCircuit, Settings, Sun, Moon, Search, Trash2, FileText, Upload, Download, Maximize, Minimize, Save, LogOut
} from 'lucide-react';

const TRANSLATIONS: Record<string, TranslationDictionary> = {
  'Español': {
    input: { title: '¿De qué quieres hablar hoy?', subtitle: 'Dime un tema y construiré una estrategia completa.', placeholder: 'Ej. Marketing Digital...', button: 'Crear Estrategia', suggestions: 'Prueba con:' },
    steps: { step1: 'Paso 1', step2: 'Paso 2', step3: 'Paso 3', input: 'Inicio', pillars: 'Pilares', variations: 'Ideas', course: 'Curso' },
    pillars: { title: 'Pilares Fundamentales', subtitle: 'He detectado estos pilares para:', relatedTitle: 'Te podría interesar...', relatedSubtitle: 'Otras estrategias:', downloadPartial: 'Descarga detenida.', downloadComplete: 'Descargar', generating: 'Generando...' },
    variations: { title: 'Variaciones de Lecciones', subtitle: 'Ideas para:', back: 'Volver', depth: { express: 'Express', standard: 'Estándar', deep: 'Profundo', expressDesc: 'Breve.', standardDesc: 'Equilibrada.', deepDesc: 'Detallada.' } },
    course: { back: 'Volver', download: 'Descargar PDF', tableOfContents: 'Índice', keyTakeaway: 'LO MÁS IMPORTANTE', quizTitle: 'Cuestionario', quizQuestion: 'Pregunta', checkAnswer: 'Comprobar', correct: '¡Correcto!', incorrect: 'Incorrecto.', nextQuestion: 'Siguiente', viewResults: 'Resultados', moduleCompleted: '¡Completado!', retry: 'Repetir', score: 'Aciertos', glossary: 'Glosario', glossaryTitle: 'Glosario', glossaryEmpty: 'Vacío', markAsCompleted: 'Completado', completed: 'Completado' },
    ebook: { generate: 'Descargar Ebook', generatingIndex: 'Planificando...', generatingContent: 'Escribiendo...', preparingFile: 'Finalizando...', success: '¡Éxito!', warning: 'Generación extensa.' },
    sidebar: { explorer: 'EXPLORADOR', newStrategy: 'NUEVA', loading: 'Cargando...', courseContent: 'CONTENIDO', myStrategies: 'MIS ESTRATEGIAS', history: 'HISTORIAL', emptyHistory: 'Vacío' },
    settings: { title: 'Ajustes', secureData: 'Secure', secureDesc: 'Historial local.', backup: 'Copia', backupBtn: 'Exportar', backupDesc: 'Copia de seguridad.' },
    loading: { analyzing: 'Analizando...', designing: 'Designing...', building: 'Construyendo...', translating: 'Traduciendo...' }
  }
};

const safeGenerateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export default function App() {
  // Estados de autenticación Firebase
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Estados existentes
  const [step, setStep] = useState<AppStep>('INPUT');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [language] = useState('Español');
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [currentDepth, setCurrentDepth] = useState<CourseDepth>('standard');
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [userHighlights, setUserHighlights] = useState<Record<string, string[]>>({});
  const [variationScores, setVariationScores] = useState<Record<string, { score: number, total: number }>>({});
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [fileHandle, setFileHandle] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<Array<{type: 'pillar' | 'variation' | 'module', title: string, description?: string, pillar?: Pillar, variation?: Variation, moduleId?: string}>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchHighlight, setSearchHighlight] = useState<string>('');
  const [pdfContext, setPdfContext] = useState<string>('');
  const [quizQuestionsCount, setQuizQuestionsCount] = useState<number>(() => {
    const saved = localStorage.getItem('cursoapp_quiz_questions_count');
    return saved ? parseInt(saved, 10) : 3;
  });
  const [isLoadedFromDatabase, setIsLoadedFromDatabase] = useState(false);
  
  const isRestoringRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileImportRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Observar cambios en autenticación
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('🔐 Estado de autenticación:', firebaseUser ? 'Autenticado' : 'No autenticado');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Usuario autenticado - cargar perfil y cursos
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
        
        // Cargar cursos del usuario desde Firestore
        const courses = await getUserCourses(firebaseUser.uid);
        setSavedCourses(courses);
      } else {
        // Usuario no autenticado - limpiar datos y mostrar login
        setUserProfile(null);
        setSavedCourses([]);
        setIsAuthModalOpen(true);
      }
      
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsHistoryOpen(false);
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) setShowSearchResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Guardar configuración de preguntas en localStorage
  useEffect(() => {
    localStorage.setItem('cursoapp_quiz_questions_count', quizQuestionsCount.toString());
  }, [quizQuestionsCount]);

  // Búsqueda incremental global
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results: Array<{type: 'pillar' | 'variation' | 'module', title: string, description?: string, pillar?: Pillar, variation?: Variation, moduleId?: string}> = [];

    // Buscar en pilares
    if (pillars && pillars.length > 0) {
      pillars.forEach(pillar => {
        if (pillar && pillar.title && pillar.description) {
          if (pillar.title.toLowerCase().includes(term) || pillar.description.toLowerCase().includes(term)) {
            results.push({ type: 'pillar', title: pillar.title, description: pillar.description, pillar });
          }
        }
      });
    }

    // Buscar en variaciones
    if (variations && variations.length > 0) {
      variations.forEach(variation => {
        if (variation && variation.title && variation.description) {
          if (variation.title.toLowerCase().includes(term) || variation.description.toLowerCase().includes(term)) {
            results.push({ type: 'variation', title: variation.title, description: variation.description, variation });
          }
        }
      });
    }

    // Buscar en módulos del curso
    if (course && course.modules && course.modules.length > 0) {
      course.modules.forEach(module => {
        if (module && module.title && module.content && module.id) {
          if (module.title.toLowerCase().includes(term) || module.content.toLowerCase().includes(term)) {
            results.push({ type: 'module', title: module.title, description: module.content.substring(0, 100) + '...', moduleId: module.id });
          }
        }
      });
    }

    setSearchResults(results.slice(0, 10)); // Limitar a 10 resultados
    setShowSearchResults(results.length > 0);
  }, [searchTerm, pillars, variations, course]);

  // Guardar sesión actual
  const saveCurrentSession = async () => {
    if (!currentSessionId || !topic) return;
    
    const sessionData: SavedCourse = {
      id: currentSessionId, createdAt: Date.now(), lastUpdated: Date.now(),
      step, topic, relatedTopics, pillars, selectedPillar: selectedPillar || undefined,
      variations, selectedVariation: selectedVariation || undefined, 
      course: course || undefined,
      depth: currentDepth, completedModuleIds, userHighlights,
      quizResults: variationScores
    };

    // Guardar en localStorage (principal)
    try {
      const localBackup = JSON.parse(localStorage.getItem('cursoapp_history') || '[]');
      const filtered = localBackup.filter((c: any) => c && c.id !== currentSessionId);
      const updated = [sessionData, ...filtered].slice(0, 50);
      localStorage.setItem('cursoapp_history', JSON.stringify(updated));
      console.log('✅ Guardado en localStorage');
      
      // Actualizar la lista en memoria
      setSavedCourses(updated);
    } catch (e) {
      console.error('❌ Error guardando en localStorage:', e);
    }
    
    // Guardar en archivo si hay un handle (backup adicional)
    if (fileHandle) {
      try {
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(sessionData, null, 2));
        await writable.close();
        console.log('✅ Guardado automáticamente en archivo');
      } catch (err) {
        console.error('❌ Error guardando en archivo:', err);
      }
    }
  };
  
  const selectFileToSave = async () => {
    try {
      // @ts-ignore - File System Access API
      if (!window.showSaveFilePicker) {
        alert('Tu navegador no soporta guardado automático. Usa Chrome o Edge.');
        return;
      }
      
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName: `${topic.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`,
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }]
      });
      
      setFileHandle(handle);
      await saveCurrentSession(); // Guardar inmediatamente
      alert('✅ Archivo seleccionado. Los cambios se guardarán automáticamente.');
    } catch (err) {
      console.log('Usuario canceló la selección de archivo');
    }
  };

  useEffect(() => {
    if (isRestoringRef.current) return;
    const timer = setTimeout(saveCurrentSession, 1000);
    return () => clearTimeout(timer);
  }, [step, topic, pillars, selectedPillar, variations, selectedVariation, course, currentDepth, completedModuleIds, userHighlights, variationScores]);

  const loadSavedStrategy = (saved: any) => {
    if (!saved) return;
    isRestoringRef.current = true;
    
    console.log('📂 Cargando curso desde localStorage:', saved.topic);
    setCurrentSessionId(saved.id || safeGenerateId());
    setTopic(saved.topic || '');
    setRelatedTopics(saved.relatedTopics || []);
    setPillars(saved.pillars || []);
    setSelectedPillar(saved.selectedPillar || null);
    setVariations(saved.variations || []);
    setSelectedVariation(saved.selectedVariation || null);
    setCourse(saved.course || null);
    setCurrentDepth(saved.depth || 'standard');
    setCompletedModuleIds(saved.completedModuleIds || []);
    setVariationScores(saved.quizResults || {});
    setStep(saved.step || 'INPUT');
    setActiveModuleId(saved.course?.modules?.[0]?.id || null);
    setUserHighlights(saved.userHighlights || {});
    setIsLoadedFromDatabase(true); // Marcar que viene del almacenamiento (NO hacer peticiones API)
    
    setIsHistoryOpen(false);
    setTimeout(() => { isRestoringRef.current = false; }, 300);
  };

  const handleExportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedCourses));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cursoapp_historial_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportHistory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        let strategies = Array.isArray(importedData) ? importedData : [importedData];
        const validStrategies = strategies.filter(s => s && (s.topic || s.id));
        if (validStrategies.length > 0) {
          setSavedCourses(prev => {
            const combined = [...validStrategies, ...prev];
            const unique = Array.from(new Map(combined.map(s => [s.id || safeGenerateId(), s])).values());
            return unique.slice(0, 50);
          });
          loadSavedStrategy(validStrategies[0]);
        }
      } catch (err) { alert("Error JSON"); }
      if (e.target) e.target.value = ''; 
    };
    reader.readAsText(file);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleRestart = () => { 
    setStep('INPUT'); setTopic(''); setPillars([]); setCourse(null); setCurrentSessionId(null); 
    setIsLoadedFromDatabase(false); // Resetear la bandera
  };

  const handleTopicSubmit = async (inputTopic: string, contextContent?: string) => {
    setTopic(inputTopic); 
    setPdfContext(contextContent || ''); // Guardar el contexto del PDF
    setIsLoadedFromDatabase(false); // Nuevo contenido, no viene de BD
    
    // DESHABILITADO: No cargar cursos guardados automáticamente
    // Esto causaba que al seleccionar diferentes variaciones, siempre mostrara el mismo curso
    /*
    const existingCourse = savedCourses.find(c => c.topic.toLowerCase() === inputTopic.toLowerCase());
    
    if (existingCourse) {
      const useExisting = confirm(`Ya tienes un curso guardado sobre "${inputTopic}". ¿Quieres cargarlo en lugar de generar uno nuevo?`);
      if (useExisting) {
        loadSavedStrategy(existingCourse);
        return;
      }
    }
    */
    
    setLoading(true); 
    setLoadingMessage(t.loading.analyzing);
    setCurrentSessionId(safeGenerateId());
    console.log('🎯 Generando pilares con la API para:', inputTopic);
    try {
      const data = await generatePillars(inputTopic, language, contextContent);
      setPillars(data.pillars || []); setRelatedTopics(data.relatedTopics || []); setStep('PILLARS');
    } catch (e: any) { 
      console.error('❌ Error generando pilares:', e);
      alert(`Error al generar pilares: ${e.message || 'Error desconocido'}`); 
    } finally { setLoading(false); }
  };

  const handlePillarSelect = async (pillar: Pillar) => {
    setSelectedPillar(pillar);
    
    // Si el contenido viene de la base de datos, NUNCA llamar a la API
    if (isLoadedFromDatabase) {
      console.log('✅ Contenido de BD, navegando sin llamar a la API');
      setStep('VARIATIONS');
      return;
    }
    
    // Si el pilar seleccionado es el mismo que ya teníamos, solo navegar
    if (selectedPillar?.id === pillar.id && variations.length > 0) {
      console.log('✅ Mismo pilar, navegando sin llamar a la API');
      setStep('VARIATIONS');
      return;
    }
    
    // Si tenemos variaciones Y curso cargados, solo navegar sin generar
    if (variations.length > 0 && course && course.modules && course.modules.length > 0) {
      console.log('✅ Variaciones y curso ya cargados, navegando sin llamar a la API');
      setStep('VARIATIONS');
      return;
    }
    
    // Si hay un curso pero no hay variaciones, advertir que se generará contenido nuevo
    if (course && course.modules && course.modules.length > 0 && variations.length === 0) {
      const confirmar = confirm('Ya tienes un curso cargado. Si cambias de pilar, se generará contenido nuevo y perderás el contenido actual. ¿Continuar?');
      if (!confirmar) return;
    }
    
    // Generar variaciones con la API
    console.log('🎯 Generando variaciones con la API para:', pillar.title);
    setLoading(true); 
    setLoadingMessage(t.loading.designing);
    try {
      const v = await generateVariations(pillar.title, topic, language, pdfContext);
      setVariations(v || []); 
      setStep('VARIATIONS');
    } catch (e: any) { 
      console.error('❌ Error generando variaciones:', e);
      alert(`Error al generar variaciones: ${e.message || 'Error desconocido'}`); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleVariationSelect = async (v: Variation, d: CourseDepth) => {
    setSelectedVariation(v); 
    setCurrentDepth(d);
    
    // Primero buscar si ya existe un curso en Firestore
    if (selectedPillar && user) {
      setLoading(true);
      setLoadingMessage('Buscando curso...');
      
      try {
        const { findCourseByVariation } = await import('./services/firebaseDb');
        const existingCourse = await findCourseByVariation(topic, selectedPillar.title, v.title);
        
        if (existingCourse && existingCourse.course) {
          console.log('✅ Curso encontrado en Firestore, cargando...');
          setCourse(existingCourse.course);
          setStep('COURSE');
          setActiveModuleId(existingCourse.course.modules[0]?.id || null);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error buscando curso:', error);
      }
    }
    
    // Si no existe, generar nuevo curso
    setLoading(true); 
    setLoadingMessage(t.loading.building);
    try {
      const c = await generateCourse(v.title, v.description, topic, d, language, pdfContext, quizQuestionsCount);
      setCourse(c); 
      setStep('COURSE'); 
      setActiveModuleId(c.modules[0]?.id || null);
      
      // Guardar el curso en Firestore para futuros usos
      if (user && selectedPillar) {
        try {
          const { saveCourse } = await import('./services/firebaseDb');
          const courseToSave: SavedCourse = {
            id: safeGenerateId(),
            createdAt: Date.now(),
            lastUpdated: Date.now(),
            step: 'COURSE',
            topic,
            relatedTopics,
            pillars,
            selectedPillar,
            variations,
            selectedVariation: v,
            course: c,
            depth: d,
            completedModuleIds: [],
            userHighlights: {},
            quizResults: {}
          };
          await saveCourse(user.uid, courseToSave);
          console.log('✅ Curso guardado en Firestore para futuros usos');
        } catch (saveError) {
          console.error('Error guardando curso:', saveError);
        }
      }
    } catch (e: any) { 
      console.error('❌ Error generando curso:', e);
      alert(`Error al generar curso: ${e.message || 'Error desconocido'}`); 
    } finally { 
      setLoading(false); 
    }
  };

  const scrollToTop = () => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    if (mainRef.current) mainRef.current.scrollTo({ top: mainRef.current.scrollHeight, behavior: 'smooth' });
  };

  const handleSearchResultClick = async (result: typeof searchResults[0]) => {
    const term = searchTerm;
    setSearchTerm('');
    setShowSearchResults(false);
    setSearchHighlight(term); // Guardar el término para resaltarlo

    if (result.type === 'pillar' && result.pillar) {
      // Simplemente seleccionar el pilar y mostrar la vista de pilares
      setSelectedPillar(result.pillar);
      setStep('PILLARS');
      
      // Hacer scroll al elemento después de que se renderice
      setTimeout(() => {
        const element = document.querySelector(`[data-pillar-id="${result.pillar?.id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Limpiar el resaltado después de 3 segundos
        setTimeout(() => setSearchHighlight(''), 3000);
      }, 100);
      
    } else if (result.type === 'variation' && result.variation) {
      // Seleccionar la variación y mostrar la vista de variaciones
      setSelectedVariation(result.variation);
      setStep('VARIATIONS');
      
      // Hacer scroll al elemento después de que se renderice
      setTimeout(() => {
        const element = document.querySelector(`[data-variation-id="${result.variation?.id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Limpiar el resaltado después de 3 segundos
        setTimeout(() => setSearchHighlight(''), 3000);
      }, 100);
      
    } else if (result.type === 'module' && result.moduleId) {
      // Ir directamente al módulo en el curso
      setStep('COURSE');
      setActiveModuleId(result.moduleId);
      
      // Hacer scroll al inicio y resaltar
      setTimeout(() => {
        scrollToTop();
        // Limpiar el resaltado después de 3 segundos
        setTimeout(() => setSearchHighlight(''), 3000);
      }, 100);
    }
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? 
        <span key={i} className="bg-orange-500 text-white px-1 rounded">{part}</span> : 
        part
    );
  };

  const highlightSearchInContent = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? 
        <span key={i} className="bg-blue-500 text-white px-2 py-1 rounded animate-pulse">{part}</span> : 
        part
    );
  };

  const canGoToPillars = pillars.length > 0;
  const canGoToVariations = selectedPillar !== null && variations.length > 0;
  const canGoToCourse = course !== null;

  // Manejar autenticación
  const handleLogin = async (email: string, password: string) => {
    try {
      await loginUser(email, password);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      throw error; // Propagar el error para que AuthModal lo muestre
    }
  };

  const handleRegister = async (email: string, password: string, displayName: string) => {
    try {
      await registerUser(email, password, displayName);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      throw error; // Propagar el error para que AuthModal lo muestre
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error: any) {
      throw error; // Propagar el error para que AuthModal lo muestre
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      // El estado se limpiará automáticamente en el useEffect de onAuthChange
    } catch (error: any) {
      alert(`Error al cerrar sesión: ${error.message}`);
    }
  };

  // Mostrar pantalla de carga mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <LoadingScreen message="Verificando autenticación..." />
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-all ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      {/* Modal de autenticación */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {}} // No permitir cerrar sin autenticarse
        onLogin={handleLogin}
        onRegister={handleRegister}
        onResetPassword={handleResetPassword}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onDownloadBackup={handleExportHistory} 
        t={t} 
        quizQuestionsCount={quizQuestionsCount} 
        onQuizQuestionsCountChange={setQuizQuestionsCount}
      />
      <input type="file" ref={fileImportRef} className="hidden" accept=".json" onChange={handleImportHistory} />

      <header className={`h-24 px-10 border-b flex items-center justify-between shrink-0 z-[100] transition-all
        ${isFullscreen ? 'rounded-none mx-0 mt-0' : 'rounded-t-[2.5rem] mx-6 mt-10'} bg-[#444444] border-white/5 shadow-2xl`}>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={handleRestart}>
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform"><BrainCircuit size={28} /></div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">CURSOAPP</span>
          </div>
          
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Buscar..." 
              className="w-full bg-black/30 border-2 border-white/10 rounded-xl py-3 pl-12 pr-10 text-white focus:border-orange-500 transition-all outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                title="Limpiar búsqueda"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
            
            {/* Desplegable de resultados de búsqueda */}
            {showSearchResults && searchResults.length > 0 && (
              <div ref={searchDropdownRef} className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[300] overflow-hidden animate-fade-in-up max-h-[400px] overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSearchResultClick(result)}
                    className="p-4 border-b border-slate-800 hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        result.type === 'pillar' ? 'bg-blue-600/20 text-blue-400' :
                        result.type === 'variation' ? 'bg-purple-600/20 text-purple-400' :
                        'bg-orange-600/20 text-orange-400'
                      }`}>
                        {result.type === 'pillar' && <BrainCircuit size={16} />}
                        {result.type === 'variation' && <FileText size={16} />}
                        {result.type === 'module' && <FileText size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider ${
                            result.type === 'pillar' ? 'text-blue-400' :
                            result.type === 'variation' ? 'text-purple-400' :
                            'text-orange-400'
                          }`}>
                            {result.type === 'pillar' ? 'PILAR' : result.type === 'variation' ? 'IDEA' : 'MÓDULO'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                          {highlightSearchTerm(result.title, searchTerm)}
                        </p>
                        {result.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {highlightSearchTerm(result.description, searchTerm)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          <button onClick={() => setStep('INPUT')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-orange-500 ${step === 'INPUT' ? 'text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-400'}`}>{t.steps.input}</button>
          <button disabled={!canGoToPillars} onClick={() => setStep('PILLARS')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${canGoToPillars ? 'hover:text-orange-500 cursor-pointer' : 'opacity-30 cursor-not-allowed'} ${step === 'PILLARS' ? 'text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-400'}`}>{t.steps.pillars}</button>
          <button disabled={!canGoToVariations} onClick={() => setStep('VARIATIONS')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${canGoToVariations ? 'hover:text-orange-500 cursor-pointer' : 'opacity-30 cursor-not-allowed'} ${step === 'VARIATIONS' ? 'text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-400'}`}>{t.steps.variations}</button>
          <button disabled={!canGoToCourse} onClick={() => setStep('COURSE')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${canGoToCourse ? 'hover:text-orange-500 cursor-pointer' : 'opacity-30 cursor-not-allowed'} ${step === 'COURSE' ? 'text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-400'}`}>{t.steps.course}</button>
        </nav>

        <div className="flex items-center gap-8 relative" ref={dropdownRef}>
          <button onClick={fileHandle ? saveCurrentSession : selectFileToSave} className="w-14 h-14 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg" title={fileHandle ? "Guardar en archivo" : "Seleccionar archivo para guardar"}><Save size={24} /></button>
          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isHistoryOpen ? 'bg-orange-600 shadow-orange-500/40' : 'bg-orange-600/10 hover:bg-orange-600/20'} text-white active:scale-90 shadow-lg`}><Folder size={24} className={isHistoryOpen ? 'text-white' : 'text-orange-500'} /></button>
          
          {isHistoryOpen && (
            <div className="absolute top-full mt-4 right-0 w-[420px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-[200] overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-800 bg-slate-950/50 space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gestión de Archivos</span>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleExportHistory} className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase rounded-xl border border-white/5 transition-colors"><Download size={16} className="text-orange-500" /><span>Exportar</span></button>
                  <button onClick={() => fileImportRef.current?.click()} className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase rounded-xl border border-white/5 transition-colors"><Upload size={16} className="text-orange-500" /><span>Cargar JSON</span></button>
                </div>
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {savedCourses.length === 0 ? <p className="p-10 text-center text-slate-500 italic text-sm">No hay registros.</p> : savedCourses.map(s => {
                  const isComplete = s.step === 'COURSE' && s.course && s.course.modules && s.course.modules.length > 0;
                  const stepLabels = {
                    'INPUT': { label: 'Tema', color: 'bg-slate-600', icon: '📝' },
                    'PILLARS': { label: 'Pilares', color: 'bg-blue-600', icon: '🏛️' },
                    'VARIATIONS': { label: 'Ideas', color: 'bg-purple-600', icon: '💡' },
                    'COURSE': { label: 'Completo', color: 'bg-emerald-600', icon: '✅' }
                  };
                  const stepInfo = stepLabels[s.step as keyof typeof stepLabels] || stepLabels['INPUT'];
                  
                  return (
                    <div key={s.id} onClick={() => loadSavedStrategy(s)} className={`flex items-center justify-between p-5 border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer group ${currentSessionId === s.id ? 'bg-orange-600/5' : ''}`}>
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${currentSessionId === s.id ? 'bg-orange-600 text-white' : 'bg-orange-600/10 text-orange-500'}`}><FileText size={20} /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-bold truncate ${currentSessionId === s.id ? 'text-orange-500' : 'text-white'}`}>{s.topic || "Sin título"}</p>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${stepInfo.color} text-white shrink-0`}>
                              {stepInfo.icon} {stepInfo.label}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider">{new Date(s.lastUpdated).toLocaleString()}</p>
                        </div>
                      </div>
                      <button onClick={(e) => { 
                        e.stopPropagation(); 
                        try {
                          // Eliminar de localStorage
                          const stored = localStorage.getItem('cursoapp_history');
                          if (stored) {
                            const courses = JSON.parse(stored);
                            const filtered = courses.filter((c: any) => c.id !== s.id);
                            localStorage.setItem('cursoapp_history', JSON.stringify(filtered));
                          }
                          // Actualizar estado
                          setSavedCourses(prev => prev.filter(c => c.id !== s.id));
                          console.log('✅ Curso eliminado');
                        } catch (err) {
                          console.error('❌ Error eliminando curso:', err);
                          alert('Error al eliminar el curso');
                        }
                      }} className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 pl-8 border-l border-white/10">
            <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">{isFullscreen ? <Minimize size={26} /> : <Maximize size={26} />}</button>
            <button onClick={() => setDarkMode(!darkMode)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">{darkMode ? <Sun size={26} /> : <Moon size={26} />}</button>
            <button onClick={() => setIsSettingsOpen(true)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"><Settings size={26} /></button>
            {user && (
              <button 
                onClick={handleLogout} 
                className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-white/5 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={26} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className={`flex-1 flex overflow-hidden transition-all ${isFullscreen ? 'p-0' : 'pb-6'}`}>
        <main ref={mainRef} className={`flex-1 overflow-y-auto pt-10 ${darkMode ? 'bg-[#0a0f1d]' : 'bg-slate-50'} transition-all ${isFullscreen ? 'rounded-none' : 'rounded-b-[2.5rem] mx-6 shadow-inner border-x border-b border-white/5 relative'}`}>
          <div className="w-full h-full pb-20">
            {loading ? <LoadingScreen message={loadingMessage} /> : (
              <div className="w-full h-full animate-fade-in-up">
                {step === 'INPUT' && <div className="max-w-5xl mx-auto"><TopicInput onSubmit={handleTopicSubmit} t={t} /></div>}
                {step === 'PILLARS' && <div className="max-w-5xl mx-auto"><PillarSelection topic={topic} pillars={pillars} relatedTopics={relatedTopics} onSelect={handlePillarSelect} onSelectTopic={handleTopicSubmit} language={language} t={t} searchTerm={searchTerm} searchHighlight={searchHighlight} /></div>}
                {step === 'VARIATIONS' && selectedPillar && <div className="max-w-5xl mx-auto"><VariationSelection pillar={selectedPillar} variations={variations} onSelect={handleVariationSelect} onBack={() => setStep('PILLARS')} t={t} searchTerm={searchTerm} variationScores={variationScores} searchHighlight={searchHighlight} /></div>}
                {step === 'COURSE' && course && (
                  /* Fix: Remove onGenerateEbook prop because it is not defined in CourseViewProps */
                  <CourseView 
                    course={course} activeModuleId={activeModuleId || ""} setActiveModuleId={setActiveModuleId} pillarTitle={selectedPillar?.title || ''} 
                    t={t} completedModuleIds={completedModuleIds} onToggleModule={(id) => setCompletedModuleIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    onUpdateHighlights={(mid, h) => setUserHighlights(prev => ({...prev, [mid]: h}))} language={language} 
                    userHighlights={userHighlights} onQuizComplete={(score, total) => { if(selectedVariation) setVariationScores(prev => ({...prev, [selectedVariation.id]: {score, total}})) }}
                    onScrollToTop={scrollToTop} onScrollToBottom={scrollToBottom} searchHighlight={searchHighlight}
                  />
                )}
              </div>
            )}
          </div>
        </main>
        {step !== 'INPUT' && (
          <Sidebar 
            topic={topic} pillars={pillars} selectedPillar={selectedPillar} variations={variations} selectedVariation={selectedVariation} 
            course={course} activeModuleId={activeModuleId} onSetActiveModule={setActiveModuleId} onSelectPillar={handlePillarSelect} 
            onSelectVariation={(v) => handleVariationSelect(v, currentDepth)} isVisible={true} mobileOpen={false} onCloseMobile={() => {}} t={t} variationScores={variationScores}
          />
        )}
      </div>
    </div>
  );
}
