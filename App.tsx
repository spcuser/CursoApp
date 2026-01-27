
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { 
  Pillar, 
  Variation, 
  Course, 
  AppStep,
  CourseDepth,
  SavedCourse,
  TranslationDictionary,
  EbookStructure
} from './types';
import { 
  generatePillars, 
  generateVariations, 
  generateCourse,
  generateEbookIndex,
  generateEbookTopicContent
} from './services/geminiService';
import { TopicInput } from './components/TopicInput';
import { PillarSelection } from './components/PillarSelection';
import { VariationSelection } from './components/VariationSelection';
import { CourseView } from './components/CourseView';
import { LoadingScreen } from './components/LoadingScreen';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';
import { 
  BrainCircuit, ChevronRight, FolderOpen, Download, Upload, 
  Trash2, ChevronDown, Settings, Menu, Moon, Sun, 
  Search, X, BookOpen, Loader2, Maximize, Minimize
} from 'lucide-react';
import { jsPDF } from "jspdf";

const TRANSLATIONS: Record<string, TranslationDictionary> = {
  'Español': {
    input: { title: '¿De qué quieres hablar hoy?', subtitle: 'Dime un tema y construiré una estrategia completa.', placeholder: 'Ej. Marketing Digital, Cocina Vegana...', button: 'Crear Estrategia', suggestions: 'Prueba con:' },
    steps: { step1: 'Paso 1 de 3', step2: 'Paso 2 de 3', step3: 'Paso 3 de 3', input: 'Inicio', pillars: 'Pilares', variations: 'Ideas', course: 'Curso' },
    pillars: { title: 'Pilares Fundamentales', subtitle: 'He detectado estos grandes pilares para tu tema.', relatedTitle: 'Te podría interesar...', relatedSubtitle: 'Otras estrategias relacionadas:', downloadPartial: 'Descarga detenida.', downloadComplete: 'Descargar Estrategia', generating: 'Generando...' },
    variations: { title: 'Variaciones de Lecciones', subtitle: 'He diseñado estas ideas de cursos.', back: 'Volver a Pilares', depth: { express: 'Express', standard: 'Estándar', deep: 'Profundo', expressDesc: 'Lecciones breves (~200 palabras).', standardDesc: 'Lecciones equilibradas (~500 palabras).', deepDesc: 'Lecciones detalladas (~1000 palabras).' } },
    course: { back: 'Volver a Ideas', download: 'Descargar PDF', tableOfContents: 'Tabla de Contenidos', keyTakeaway: 'Lo más importante', quizTitle: 'Comprueba tu conocimiento', quizQuestion: 'Pregunta', checkAnswer: 'Comprobar', correct: '¡Correcto!', incorrect: 'Incorrecto.', nextQuestion: 'Siguiente', viewResults: 'Ver Resultados', moduleCompleted: '¡Módulo Completado!', retry: 'Repetir Test', score: 'Aciertos', glossary: 'Glosario', glossaryTitle: 'Términos Clave', glossaryEmpty: 'No hay términos en el glosario.', markAsCompleted: 'Marcar como completado', completed: 'Completado' },
    ebook: { generate: 'Descargar Ebook PDF', generatingIndex: 'Planificando 10 capítulos...', generatingContent: 'Escribiendo tema profundo...', preparingFile: 'Ensamblando PDF final...', success: '¡eBook generado con éxito!', warning: 'Generación extensa detectada. Si el servidor se satura, el proceso pausará 10s para reintentar. Se recomienda usar clave API propia en Configuración.' },
    sidebar: { explorer: 'Explorador', newStrategy: 'Nueva Estrategia', loading: 'Cargando...', courseContent: 'Contenido', myStrategies: 'Mis Estrategias', history: 'Historial', emptyHistory: 'No hay estrategias guardadas.' },
    settings: { title: 'Configuración', secureData: 'Datos Seguros', secureDesc: 'Tu historial se guarda en este dispositivo.', backup: 'Copia de Seguridad', backupBtn: 'Descargar Historial', backupDesc: 'Descarga una copia para no perder tus datos.' },
    loading: { analyzing: 'Analizando tendencias...', designing: 'Diseñando variaciones...', building: 'Construyendo el curso...', translating: 'Traduciendo contenido...' }
  }
};

export default function App() {
  const [step, setStep] = useState<AppStep>('INPUT');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ebookProgress, setEbookProgress] = useState<{current: number, total: number, msg: string, sub: string} | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return false;
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('Español');
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentDepth, setCurrentDepth] = useState<CourseDepth>('standard');
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [userHighlights, setUserHighlights] = useState<Record<string, string[]>>({});
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const historyMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoad = useRef(true);
  const t = TRANSLATIONS[language] || TRANSLATIONS['Español'];

  // --- PERSISTENCE LOGIC ---
  
  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('cursoapp_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedCourses(parsed);
      } catch (e) { console.error("History parse fail", e); }
    }
    isInitialLoad.current = false;
  }, []);

  // 2. Declarative Auto-Save
  // This effect synchronizes the current working session into the savedCourses list
  useEffect(() => {
    if (isInitialLoad.current || !currentSessionId || !topic) return;

    setSavedCourses(prev => {
      const now = Date.now();
      const updated = [...prev];
      const idx = updated.findIndex(c => c.id === currentSessionId);
      
      const sessionData: SavedCourse = {
        id: currentSessionId,
        createdAt: idx >= 0 ? updated[idx].createdAt : now,
        lastUpdated: now,
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
        userHighlights
      };

      if (idx >= 0) {
        updated[idx] = sessionData;
      } else {
        updated.unshift(sessionData);
      }
      
      localStorage.setItem('cursoapp_history', JSON.stringify(updated));
      return updated;
    });
  }, [currentSessionId, step, topic, relatedTopics, pillars, selectedPillar, variations, selectedVariation, course, currentDepth, completedModuleIds, userHighlights]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyMenuRef.current && !historyMenuRef.current.contains(e.target as Node)) setIsHistoryOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPillars = useMemo(() => {
    if (!searchTerm.trim()) return pillars;
    const s = searchTerm.toLowerCase();
    return pillars.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }, [pillars, searchTerm]);

  const filteredVariations = useMemo(() => {
    if (!searchTerm.trim()) return variations;
    const s = searchTerm.toLowerCase();
    return variations.filter(v => v.title.toLowerCase().includes(s) || v.description.toLowerCase().includes(s));
  }, [variations, searchTerm]);

  const handleTopicSubmit = async (inputTopic: string, contextContent?: string) => {
    setTopic(inputTopic); setLoading(true); setLoadingMessage(t.loading.analyzing);
    setCurrentSessionId(crypto.randomUUID()); setPillars([]); setVariations([]); setCourse(null);
    try {
      const { pillars: p, relatedTopics: rt } = await generatePillars(inputTopic, language, contextContent);
      setPillars(p); setRelatedTopics(rt); setStep('PILLARS');
    } catch (e) { alert('Error'); } finally { setLoading(false); }
  };

  const handlePillarSelect = async (pillar: Pillar) => {
    setSelectedPillar(pillar); setLoading(true); setLoadingMessage(t.loading.designing);
    try {
      const v = await generateVariations(pillar.title, topic, language);
      setVariations(v); setStep('VARIATIONS');
    } catch (e) { alert('Error'); } finally { setLoading(false); }
  };

  const handleVariationSelect = async (v: Variation, d: CourseDepth) => {
    setSelectedVariation(v); setCurrentDepth(d); setLoading(true); setLoadingMessage(t.loading.building);
    try {
      const c = await generateCourse(v.title, v.description, topic, d, language);
      setCourse(c); setStep('COURSE');
    } catch (e) { alert('Error'); } finally { setLoading(false); }
  };

  const handleLoadHistory = (saved: SavedCourse) => {
    // Prevent auto-save from triggering during state reset by pausing updates
    setCurrentSessionId(null);
    
    // Set all states from saved data
    setTopic(saved.topic);
    setPillars(saved.pillars || []);
    setRelatedTopics(saved.relatedTopics || []);
    setSelectedPillar(saved.selectedPillar || null);
    setVariations(saved.variations || []);
    setSelectedVariation(saved.selectedVariation || null);
    setCourse(saved.course || null);
    setStep(saved.step);
    setCurrentDepth(saved.depth || 'standard');
    setCompletedModuleIds(saved.completedModuleIds || []);
    setUserHighlights(saved.userHighlights || {});
    
    // Resume auto-save with the correct ID
    setTimeout(() => setCurrentSessionId(saved.id), 0);
    
    setIsHistoryOpen(false);
    setSearchTerm('');
  };

  const handleRestart = () => {
    setCurrentSessionId(null); setStep('INPUT'); setTopic(''); setPillars([]); setRelatedTopics([]);
    setSelectedPillar(null); setVariations([]); setSelectedVariation(null);
    setCourse(null); setCompletedModuleIds([]); setUserHighlights({}); setSearchTerm('');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleExportHistory = () => {
    const data = JSON.stringify(savedCourses, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cursoapp_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const handleImportHistory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed)) {
          setSavedCourses(parsed);
          localStorage.setItem('cursoapp_history', JSON.stringify(parsed));
          alert('Historial importado con éxito.');
        }
      } catch (err) { alert('Archivo JSON inválido.'); }
    };
    reader.readAsText(file);
  };

  const handleGenerateEbook = async () => {
    if (!course) return;
    setLoading(true);
    setEbookProgress({ current: 0, total: 100, msg: t.ebook.generatingIndex, sub: '' });
    
    try {
      const structure = await generateEbookIndex(course, language);
      const totalTopics = structure.chapters.reduce((acc, c) => acc + (c.topics?.length || 0), 0);
      let currentIdx = 0;
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const width = pageWidth - (margin * 2);
      const bottomLimit = pageHeight - 25;

      // Portada
      doc.setFillColor(15, 23, 42); doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(36);
      const portLines = doc.splitTextToSize(structure.title, 160);
      doc.text(portLines, pageWidth / 2, 100, { align: 'center' });
      doc.addPage();

      for (const chapter of structure.chapters) {
        if (!chapter.topics) continue;
        for (const topicItem of chapter.topics) {
          currentIdx++;
          setEbookProgress({ current: Math.round((currentIdx/totalTopics)*100), total: 100, msg: t.ebook.generatingContent, sub: topicItem.title });
          let content = "";
          let retries = 0;
          while (retries < 3) {
            try { await new Promise(r => setTimeout(r, 4000)); content = await generateEbookTopicContent(topicItem.title, chapter.title, structure.title, language); break; } 
            catch (e) { retries++; await new Promise(r => setTimeout(r, 10000)); }
          }
          
          let cursorY = 30;
          doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(30, 41, 59);
          const chLines = doc.splitTextToSize(chapter.title, width);
          doc.text(chLines, margin, cursorY);
          cursorY += (chLines.length * 9) + 10;
          
          doc.setFontSize(16); doc.setTextColor(79, 70, 229);
          const tpLines = doc.splitTextToSize(topicItem.title, width);
          doc.text(tpLines, margin, cursorY);
          cursorY += (tpLines.length * 8) + 15;
          
          doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(51, 65, 85);
          const lines = (content || "").split('\n');
          for (let l of lines) {
            const cleanL = l.replace(/#{1,6}\s?/g, '').replace(/\*\*/g, '').replace(/__/g, '').replace(/`/g, '').trim();
            if (!cleanL) { cursorY += 5; continue; }
            const paraLines = doc.splitTextToSize(cleanL, width);
            for (const pLine of paraLines) {
              if (cursorY > bottomLimit) { doc.addPage(); cursorY = 30; }
              doc.text(pLine, margin, cursorY);
              cursorY += 7;
            }
          }
          doc.addPage();
        }
      }

      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 12.5, { align: 'center' });
      }

      setEbookProgress({ current: 100, total: 100, msg: t.ebook.preparingFile, sub: '¡Finalizado!' });
      doc.save(`${structure.title.replace(/\s+/g, '_')}_Master.pdf`);
    } catch (e) { alert("Error generating ebook."); } finally { setLoading(false); setEbookProgress(null); }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onDownloadBackup={handleExportHistory} t={t} />
      
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 h-16 z-50 shadow-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button className="md:hidden p-2 text-slate-500" onClick={() => setShowMobileSidebar(!showMobileSidebar)}><Menu size={20} /></button>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleRestart}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><BrainCircuit size={20} /></div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">CursoAPP</h1>
          </div>
          <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>

        {step !== 'INPUT' && (
          <div className="flex flex-1 max-w-md mx-6">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Búsqueda rápida..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center"><X size={14} className="text-slate-400 hover:text-indigo-500" /></button>}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {(step !== 'INPUT' || pillars.length > 0) && (
            <nav className="hidden lg:flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 mr-2">
              <button onClick={() => setStep('INPUT')} className={`px-2 py-1 rounded transition-all ${step === 'INPUT' ? 'text-indigo-600 bg-white dark:bg-slate-700 shadow-sm scale-110' : 'hover:text-slate-600'}`}>{t.steps.input}</button>
              <ChevronRight size={10} className="text-slate-300" />
              <button onClick={() => setStep('PILLARS')} className={`px-2 py-1 rounded transition-all ${step === 'PILLARS' ? 'text-indigo-600 bg-white dark:bg-slate-700 shadow-sm scale-110' : 'hover:text-slate-600'}`}>{t.steps.pillars}</button>
              {variations.length > 0 && <><ChevronRight size={10} /><button onClick={() => setStep('VARIATIONS')} className={`px-2 py-1 rounded ${step === 'VARIATIONS' ? 'text-indigo-600 bg-white dark:bg-slate-700 shadow-sm scale-110' : ''}`}>{t.steps.variations}</button></>}
              {course && <><ChevronRight size={10} /><button onClick={() => setStep('COURSE')} className={`px-2 py-1 rounded ${step === 'COURSE' ? 'text-indigo-600 bg-white dark:bg-slate-700 shadow-sm scale-110' : ''}`}>{t.steps.course}</button></>}
            </nav>
          )}

          <div className="relative" ref={historyMenuRef}>
            <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              <FolderOpen size={18} />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">{t.sidebar.myStrategies}</span>
              <ChevronDown size={14} className={`transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {isHistoryOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.sidebar.history}</span>
                  <div className="flex gap-2">
                    <button onClick={handleExportHistory} title="Exportar Backup" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-indigo-600 transition-colors"><Download size={14} /></button>
                    <button onClick={() => fileInputRef.current?.click()} title="Importar Backup" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-indigo-600 transition-colors"><Upload size={14} /></button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportHistory} />
                  </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {savedCourses.length === 0 ? <div className="p-10 text-center text-slate-400 text-sm font-medium">{t.sidebar.emptyHistory}</div> : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {savedCourses.map(saved => (
                        <div key={saved.id} onClick={() => handleLoadHistory(saved)} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer group relative">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate pr-8">{saved.topic}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{new Date(saved.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Settings size={20} /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 w-full">
          <div className="max-w-7xl mx-auto px-4 py-8 min-h-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-12 py-20">
                <LoadingScreen message={loadingMessage} />
                {ebookProgress && (
                  <div className="w-full max-w-xl space-y-8 animate-fade-in p-10 bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl">
                    <div className="flex justify-between items-end"><div><span className="text-[10px] font-black uppercase text-indigo-500">{ebookProgress.msg}</span><p className="text-xl font-black truncate max-w-sm">{ebookProgress.sub}</p></div><span className="text-3xl font-black text-indigo-600">{ebookProgress.current}%</span></div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner"><div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000" style={{ width: `${ebookProgress.current}%` }}></div></div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {step === 'INPUT' && <TopicInput onSubmit={handleTopicSubmit} t={t} />}
                {step === 'PILLARS' && <PillarSelection topic={topic} pillars={filteredPillars} relatedTopics={relatedTopics} onSelect={handlePillarSelect} onSelectTopic={handleTopicSubmit} language={language} t={t} searchTerm={searchTerm} />}
                {step === 'VARIATIONS' && selectedPillar && <VariationSelection pillar={selectedPillar} variations={filteredVariations} onSelect={handleVariationSelect} onBack={() => setStep('PILLARS')} t={t} searchTerm={searchTerm} />}
                {step === 'COURSE' && course && <CourseView course={course} language={language} onBack={() => setStep('VARIATIONS')} t={t} searchTerm={searchTerm} completedModuleIds={completedModuleIds} userHighlights={userHighlights} onToggleModule={(id) => setCompletedModuleIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} onUpdateHighlights={(id, h) => setUserHighlights(prev => ({ ...prev, [id]: h }))} onGenerateEbook={handleGenerateEbook} />}
              </>
            )}
          </div>
        </main>
        <Sidebar topic={topic} pillars={pillars} selectedPillar={selectedPillar} variations={variations} selectedVariation={selectedVariation} course={course} onSelectPillar={handlePillarSelect} onSelectVariation={(v) => handleVariationSelect(v, 'standard')} isVisible={step !== 'INPUT'} mobileOpen={showMobileSidebar} onCloseMobile={() => setShowMobileSidebar(false)} t={t} />
      </div>
    </div>
  );
}
