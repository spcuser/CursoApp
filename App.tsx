
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  generateCourse,
  generateModuleImage
} from './services/geminiService';
import { TopicInput } from './components/TopicInput';
import { PillarSelection } from './components/PillarSelection';
import { VariationSelection } from './components/VariationSelection';
import { CourseView } from './components/CourseView';
import { LoadingScreen } from './components/LoadingScreen';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';
import { 
  Folder, BrainCircuit, ChevronDown, Settings, Sun, Moon, Search, X, History, Trash2, Clock, FileText, ChevronRight, Upload, Download, Maximize, Minimize, AlertCircle, RefreshCw
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
    loading: { analyzing: 'Analizando...', designing: 'Diseñando...', building: 'Construyendo...', translating: 'Traduciendo...' }
  }
};

export default function App() {
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
  const [currentDepth, setCurrentDepth] = useState<CourseDepth>('standard');
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [userHighlights, setUserHighlights] = useState<Record<string, string[]>>({});
  const [variationScores, setVariationScores] = useState<Record<string, { score: number, total: number }>>({});
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileImportRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  const sortedSavedCourses = useMemo(() => {
    return [...savedCourses].sort((a, b) => b.lastUpdated - a.lastUpdated);
  }, [savedCourses]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('cursoapp_history');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedCourses(parsed);
      } catch (e) { console.error("Error cargando historial", e); }
    }
  }, []);

  useEffect(() => {
    if (!currentSessionId || !topic) return;
    
    const sessionData: SavedCourse = {
      id: currentSessionId, createdAt: Date.now(), lastUpdated: Date.now(),
      step, topic, relatedTopics, pillars, selectedPillar: selectedPillar || undefined,
      variations, selectedVariation: selectedVariation || undefined, 
      course: course ? { 
        ...course, 
        modules: course.modules.map(m => ({ ...m, imageUrl: undefined })) 
      } : undefined,
      depth: currentDepth, completedModuleIds, userHighlights,
      quizResults: variationScores
    };

    const updated = [sessionData, ...savedCourses.filter(c => c.id !== currentSessionId)].slice(0, 50);
    
    try {
      localStorage.setItem('cursoapp_history', JSON.stringify(updated));
    } catch (e) {
      console.warn("LocalStorage lleno, no se pudo guardar el historial.");
    }
  }, [step, topic, pillars, selectedPillar, variations, selectedVariation, course, currentDepth, completedModuleIds, userHighlights, variationScores]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error al intentar activar pantalla completa: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRestart = () => { 
    setStep('INPUT'); setTopic(''); setPillars([]); setCourse(null); setCurrentSessionId(null); setVariationScores({});
  };

  const loadSavedStrategy = (saved: SavedCourse) => {
    if (!saved) return;
    setCurrentSessionId(saved.id || crypto.randomUUID());
    setTopic(saved.topic || '');
    setRelatedTopics(saved.relatedTopics || []);
    setPillars(saved.pillars || []);
    setSelectedPillar(saved.selectedPillar || null);
    setVariations(saved.variations || []);
    setSelectedVariation(saved.selectedVariation || null);
    setCourse(saved.course || null);
    setCurrentDepth(saved.depth || 'standard');
    setCompletedModuleIds(saved.completedModuleIds || []);
    setUserHighlights(saved.userHighlights || {});
    setVariationScores(saved.quizResults || {});
    setStep(saved.step || 'INPUT');
    setIsHistoryOpen(false);
  };

  const deleteSavedStrategy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedCourses.filter(c => c.id !== id);
    setSavedCourses(updated);
    try {
      localStorage.setItem('cursoapp_history', JSON.stringify(updated));
    } catch(err) {}
  };

  const handleExportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sortedSavedCourses));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `historial_cursoapp_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportCurrentStrategy = async () => {
    if (!currentSessionId || !topic) return;
    
    const sessionData: SavedCourse = {
      id: currentSessionId, 
      createdAt: Date.now(), 
      lastUpdated: Date.now(),
      step, topic, relatedTopics, pillars, selectedPillar: selectedPillar || undefined,
      variations, selectedVariation: selectedVariation || undefined, 
      course: course || undefined,
      depth: currentDepth, completedModuleIds, userHighlights,
      quizResults: variationScores
    };

    const jsonString = JSON.stringify(sessionData, null, 2);
    const fileName = `estrategia_${topic.toLowerCase().replace(/\s+/g, '_')}.json`;

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Archivo de Estrategia JSON',
            accept: {'application/json': ['.json']},
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn("Fallo showSaveFilePicker, recurriendo a descarga tradicional", err);
      }
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
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
        let content = event.target?.result as string;
        if (!content) throw new Error("Archivo vacío");
        
        content = content.trim();
        const importedData = JSON.parse(content);
        
        let normalizedList: SavedCourse[] = [];
        
        const processItem = (item: any): SavedCourse | null => {
          if (!item || typeof item !== 'object') return null;
          if (item.topic || (item.course && item.course.title)) {
            return {
              ...item,
              id: item.id || crypto.randomUUID(),
              lastUpdated: item.lastUpdated || Date.now(),
              createdAt: item.createdAt || Date.now()
            };
          }
          if (item.title && item.modules && Array.isArray(item.modules)) {
            return {
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              lastUpdated: Date.now(),
              step: 'COURSE',
              topic: item.title,
              course: item
            };
          }
          return null;
        };

        if (Array.isArray(importedData)) {
          normalizedList = importedData.map(processItem).filter(i => i !== null) as SavedCourse[];
        } else {
          const processed = processItem(importedData);
          if (processed) normalizedList = [processed];
        }

        if (normalizedList.length > 0) {
          setSavedCourses(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOnes = normalizedList.filter(n => !existingIds.has(n.id));
            const combined = [...newOnes, ...prev].slice(0, 50);
            localStorage.setItem('cursoapp_history', JSON.stringify(combined));
            return combined;
          });
          loadSavedStrategy(normalizedList[0]);
        } else {
          alert("El archivo no contiene un formato compatible con CursoAPP.");
        }
      } catch (err) { 
        alert("Error: No se pudo leer el archivo. Asegúrate de que sea un .json válido."); 
      } finally {
        if (fileImportRef.current) fileImportRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleTopicSubmit = async (inputTopic: string, contextContent?: string) => {
    setTopic(inputTopic); setLoading(true); setLoadingMessage(t.loading.analyzing);
    setCurrentSessionId(crypto.randomUUID());
    try {
      const { pillars: p, relatedTopics: rt } = await generatePillars(inputTopic, language, contextContent);
      setPillars(p || []); setRelatedTopics(rt || []); setStep('PILLARS');
    } catch (e) { alert('Error de conexión'); } finally { setLoading(false); }
  };

  const handlePillarSelect = async (pillar: Pillar) => {
    setSelectedPillar(pillar); setLoading(true); setLoadingMessage(t.loading.designing);
    try {
      const v = await generateVariations(pillar.title, topic, language);
      setVariations(v || []); setStep('VARIATIONS');
    } catch (e) { alert('Error al generar ideas'); } finally { setLoading(false); }
  };

  const handleVariationSelect = async (v: Variation, d: CourseDepth) => {
    setSelectedVariation(v); setCurrentDepth(d); setLoading(true); setLoadingMessage(t.loading.building);
    try {
      const c = await generateCourse(v.title, v.description, topic, d, language);
      if (c && c.modules && Array.isArray(c.modules) && c.modules.length > 0) {
        setCourse(c); setStep('COURSE'); setLoading(false);
        c.modules.forEach(async (mod, idx) => {
          if (mod.imageDescription) {
            try {
              const imgUrl = await generateModuleImage(mod.imageDescription);
              if (imgUrl) {
                setCourse(prev => {
                  if (!prev || !prev.modules[idx]) return prev;
                  const updatedModules = [...prev.modules];
                  updatedModules[idx] = { ...updatedModules[idx], imageUrl: imgUrl };
                  return { ...prev, modules: updatedModules };
                });
              }
            } catch (err) {}
          }
        });
      } else { throw new Error("Curso vacío"); }
    } catch (e) { setLoading(false); alert('Error al construir el curso.'); }
  };

  const handleQuizFinish = (score: number, total: number) => {
    if (selectedVariation) {
      setVariationScores(prev => ({
        ...prev,
        [selectedVariation.id]: { score, total }
      }));
    }
  };

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-all ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onDownloadBackup={() => {}} t={t} />
      <input type="file" ref={fileImportRef} className="hidden" accept=".json" onChange={handleImportHistory} />

      <header className={`h-24 px-10 border-b flex items-center justify-between shrink-0 z-[100] transition-all
        ${isFullscreen ? 'rounded-none mx-0 mt-0' : 'rounded-t-[2.5rem] mx-6 mt-10'} 
        bg-[#444444] border-white/5 shadow-2xl`}>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={handleRestart}>
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-orange-600/30 group-hover:scale-105 transition-transform">
              <BrainCircuit size={28} />
            </div>
            <span className={`text-2xl font-black tracking-tighter text-white uppercase`}>CURSOAPP</span>
          </div>
          
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Búsqueda..." 
              className={`w-full border-2 rounded-xl py-3 pl-12 pr-12 text-base font-medium focus:ring-0 focus:border-orange-500 transition-all bg-black/30 text-white placeholder:text-slate-500 border-white/10`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all shadow-lg active:scale-90 z-50 border-2 border-white/20"><X size={16} strokeWidth={4} /></button>
            )}
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-6 text-lg font-medium uppercase tracking-[0.2em] text-slate-400">
          <button onClick={() => setStep('INPUT')} className={`transition-colors ${step === 'INPUT' ? 'text-white font-black' : 'hover:text-white'}`}>Inicio</button>
          <span className="opacity-10 text-white">/</span>
          <button onClick={() => setStep('PILLARS')} className={`transition-colors ${step === 'PILLARS' ? 'text-white font-black' : 'hover:text-white'}`}>Pilares</button>
          <span className="opacity-10 text-white">/</span>
          <button onClick={() => setStep('VARIATIONS')} className={`transition-colors ${step === 'VARIATIONS' ? 'text-white font-black' : 'hover:text-white'}`}>Ideas</button>
          <span className="opacity-10 text-white">/</span>
          <button onClick={() => setStep('COURSE')} className={`transition-colors ${step === 'COURSE' ? 'text-orange-500 font-black' : 'hover:text-white'}`}>Curso</button>
        </nav>

        <div className="flex items-center gap-8 relative" ref={dropdownRef}>
          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} title="MIS ESTRATEGIAS" className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-600/30 active:scale-90`}><Folder size={24} /></button>
          {isHistoryOpen && (
            <div className="absolute top-full mt-4 right-0 w-[450px] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border bg-slate-900 border-slate-800 overflow-hidden animate-fade-in-up z-[200]">
              <div className="p-8 border-b border-slate-800 bg-slate-950/40">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3 text-orange-500"><History size={20} /><span className="text-xs font-black uppercase tracking-widest text-slate-400">Tus Documentos</span></div>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleExportHistory} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase rounded-xl border border-slate-700 transition-colors"><Download size={16} className="text-orange-500" /><span>Guardar PC</span></button>
                  <button onClick={() => fileImportRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase rounded-xl border border-slate-700 transition-colors"><Upload size={16} className="text-orange-500" /><span>Cargar PC</span></button>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {sortedSavedCourses.length === 0 ? (<p className="p-16 text-center text-slate-500 italic font-medium">Historial vacío</p>) : (
                  sortedSavedCourses.map(saved => (
                    <div key={saved.id} onClick={() => loadSavedStrategy(saved)} className="flex items-center justify-between p-7 border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer group transition-all">
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-12 h-12 bg-orange-600/10 text-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner"><FileText size={24} /></div>
                        <div className="min-w-0"><p className="text-white font-black truncate leading-tight mb-1">{saved.topic}</p><p className="text-[10px] text-slate-500 flex items-center gap-2 uppercase font-bold tracking-wider"><Clock size={12}/>{new Date(saved.lastUpdated).toLocaleDateString()}</p></div>
                      </div>
                      <button onClick={(e) => deleteSavedStrategy(saved.id, e)} className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-6 pl-8 border-l border-white/10">
            <button onClick={toggleFullscreen} title={isFullscreen ? "Restaurar" : "Maximizar"} className="text-slate-400 hover:text-white transition-all p-2 rounded-lg hover:bg-white/5">
              {isFullscreen ? <Minimize size={26} /> : <Maximize size={26} />}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="text-slate-400 hover:text-white transition-all p-2 rounded-lg hover:bg-white/5">{darkMode ? <Sun size={26} /> : <Moon size={26} />}</button>
            <button onClick={() => setIsSettingsOpen(true)} className="text-slate-400 hover:text-white transition-all p-2 rounded-lg hover:bg-white/5"><Settings size={26} /></button>
          </div>
        </div>
      </header>

      <div className={`flex-1 flex overflow-hidden transition-all ${isFullscreen ? 'p-0' : 'pb-6'}`}>
        <main className={`flex-1 overflow-y-auto pt-10 ${darkMode ? 'bg-[#0a0f1d]' : 'bg-slate-50'} transition-all ${isFullscreen ? 'rounded-none' : 'rounded-b-[2.5rem] mx-6 shadow-inner border-x border-b border-white/5'}`}>
          <div className="max-w-screen-2xl mx-auto min-h-full pb-20">
            {loading ? (
              <LoadingScreen message={loadingMessage} />
            ) : (
              <div className="w-full h-full">
                {step === 'INPUT' && <TopicInput onSubmit={handleTopicSubmit} t={t} />}
                {step === 'PILLARS' && pillars.length > 0 && <PillarSelection topic={topic} pillars={pillars} relatedTopics={relatedTopics} onSelect={handlePillarSelect} onSelectTopic={handleTopicSubmit} language={language} t={t} searchTerm={searchTerm} />}
                {step === 'VARIATIONS' && selectedPillar && variations.length > 0 && <VariationSelection pillar={selectedPillar} variations={variations} onSelect={handleVariationSelect} onBack={() => setStep('PILLARS')} t={t} searchTerm={searchTerm} variationScores={variationScores} />}
                {step === 'COURSE' && (
                  course ? (
                    <CourseView 
                      course={course}
                      pillarTitle={selectedPillar?.title || ''}
                      language={language} onBack={() => setStep('VARIATIONS')} t={t} searchTerm={searchTerm} 
                      completedModuleIds={completedModuleIds} userHighlights={userHighlights} 
                      onToggleModule={(id) => setCompletedModuleIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} 
                      onUpdateHighlights={(id, h) => setUserHighlights(prev => ({ ...prev, [id]: h }))} 
                      onGenerateEbook={() => {}} 
                      onSaveCurrent={handleExportCurrentStrategy}
                      onQuizFinish={handleQuizFinish}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in py-20">
                      <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center"><AlertCircle size={48} /></div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tight">Error al cargar curso</h2>
                      <button onClick={() => setStep('VARIATIONS')} className="flex items-center gap-3 px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all"><RefreshCw size={20} /><span>Reintentar</span></button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </main>
        
        {step !== 'INPUT' && (
          <Sidebar 
            topic={topic} 
            pillars={pillars} 
            selectedPillar={selectedPillar} 
            variations={variations} 
            selectedVariation={selectedVariation} 
            course={course} 
            onSelectPillar={handlePillarSelect} 
            onSelectVariation={(v) => handleVariationSelect(v, currentDepth)} 
            isVisible={true} 
            mobileOpen={false} 
            onCloseMobile={() => {}} 
            t={t} 
            variationScores={variationScores}
          />
        )}
      </div>
    </div>
  );
}
