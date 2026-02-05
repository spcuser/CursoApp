
import React, { useState, useEffect, useRef } from 'react';
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
import { TopicInput } from './components/TopicInput';
import { PillarSelection } from './components/PillarSelection';
import { VariationSelection } from './components/VariationSelection';
import { CourseView } from './components/CourseView';
import { LoadingScreen } from './components/LoadingScreen';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';
import { 
  Folder, BrainCircuit, Settings, Sun, Moon, Search, Trash2, FileText, Upload, Download, Maximize, Minimize, Save
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

const safeGenerateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

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
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [currentDepth, setCurrentDepth] = useState<CourseDepth>('standard');
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [userHighlights, setUserHighlights] = useState<Record<string, string[]>>({});
  const [variationScores, setVariationScores] = useState<Record<string, { score: number, total: number }>>({});
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const isRestoringRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileImportRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsHistoryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('cursoapp_history');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedCourses(parsed.filter(Boolean));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isRestoringRef.current) return;
    localStorage.setItem('cursoapp_history', JSON.stringify(savedCourses));
  }, [savedCourses]);

  const saveCurrentSession = () => {
    if (!currentSessionId || !topic) return;
    
    const sessionData: SavedCourse = {
      id: currentSessionId, createdAt: Date.now(), lastUpdated: Date.now(),
      step, topic, relatedTopics, pillars, selectedPillar: selectedPillar || undefined,
      variations, selectedVariation: selectedVariation || undefined, 
      course: course || undefined,
      depth: currentDepth, completedModuleIds, userHighlights,
      quizResults: variationScores
    };

    setSavedCourses(prev => {
      const filtered = prev.filter(c => c && c.id !== currentSessionId);
      return [sessionData, ...filtered].slice(0, 50);
    });
  };

  useEffect(() => {
    if (isRestoringRef.current) return;
    const timer = setTimeout(saveCurrentSession, 1000);
    return () => clearTimeout(timer);
  }, [step, topic, pillars, selectedPillar, variations, selectedVariation, course, currentDepth, completedModuleIds, userHighlights, variationScores]);

  const loadSavedStrategy = (saved: any) => {
    if (!saved) return;
    isRestoringRef.current = true;
    
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
  };

  const handleTopicSubmit = async (inputTopic: string, contextContent?: string) => {
    setTopic(inputTopic); setLoading(true); setLoadingMessage(t.loading.analyzing);
    setCurrentSessionId(safeGenerateId());
    try {
      const data = await generatePillars(inputTopic, language, contextContent);
      setPillars(data.pillars || []); setRelatedTopics(data.relatedTopics || []); setStep('PILLARS');
    } catch (e) { alert('Error IA'); } finally { setLoading(false); }
  };

  const handlePillarSelect = async (pillar: Pillar) => {
    setSelectedPillar(pillar); setLoading(true); setLoadingMessage(t.loading.designing);
    try {
      const v = await generateVariations(pillar.title, topic, language);
      setVariations(v || []); setStep('VARIATIONS');
    } catch (e) { alert('Error'); } finally { setLoading(false); }
  };

  const handleVariationSelect = async (v: Variation, d: CourseDepth) => {
    setSelectedVariation(v); setCurrentDepth(d); setLoading(true); setLoadingMessage(t.loading.building);
    try {
      const c = await generateCourse(v.title, v.description, topic, d, language);
      setCourse(c); setStep('COURSE'); setActiveModuleId(c.modules[0]?.id || null);
    } catch (e) { alert('Error'); } finally { setLoading(false); }
  };

  // Navigation conditions
  const canGoToPillars = pillars.length > 0;
  const canGoToVariations = selectedPillar !== null && variations.length > 0;
  const canGoToCourse = course !== null;

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-all ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onDownloadBackup={handleExportHistory} t={t} />
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
              className="w-full bg-black/30 border-2 border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-orange-500 transition-all outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Links Centrales */}
        <nav className="hidden lg:flex items-center gap-8">
          <button 
            onClick={() => setStep('INPUT')}
            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-orange-500 ${step === 'INPUT' ? 'text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-400'}`}
          >
            {t.steps.input}
          </button>
          <button 
            disabled={!canGoToPillars}
            onClick={() => setStep('PILLARS')}
            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${canGoToPillars ? 'hover:text-orange-500 cursor-pointer' : 'opacity-30 cursor-not-allowed'} ${step === 'PILLARS' ? 'text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-400'}`}
          >
            {t.steps.pillars}
          </button>
          <button 
            disabled={!canGoToVariations}
            onClick={() => setStep('VARIATIONS')}
            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${canGoToVariations ? 'hover:text-orange-500 cursor-pointer' : 'opacity-30 cursor-not-allowed'} ${step === 'VARIATIONS' ? 'text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-400'}`}
          >
            {t.steps.variations}
          </button>
          <button 
            disabled={!canGoToCourse}
            onClick={() => setStep('COURSE')}
            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${canGoToCourse ? 'hover:text-orange-500 cursor-pointer' : 'opacity-30 cursor-not-allowed'} ${step === 'COURSE' ? 'text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-400'}`}
          >
            {t.steps.course}
          </button>
        </nav>

        <div className="flex items-center gap-8 relative" ref={dropdownRef}>
          <button onClick={saveCurrentSession} className="w-14 h-14 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg" title="Guardar Progreso">
            <Save size={24} />
          </button>

          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isHistoryOpen ? 'bg-orange-600 shadow-orange-500/40' : 'bg-orange-600/10 hover:bg-orange-600/20'} text-white active:scale-90 shadow-lg`}>
            <Folder size={24} className={isHistoryOpen ? 'text-white' : 'text-orange-500'} />
          </button>
          
          {isHistoryOpen && (
            <div className="absolute top-full mt-4 right-0 w-[420px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-[200] overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-800 bg-slate-950/50 space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gestión de Archivos</span>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleExportHistory} className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase rounded-xl border border-white/5 transition-colors">
                    <Download size={16} className="text-orange-500" />
                    <span>Exportar</span>
                  </button>
                  <button onClick={() => fileImportRef.current?.click()} className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase rounded-xl border border-white/5 transition-colors">
                    <Upload size={16} className="text-orange-500" />
                    <span>Cargar JSON</span>
                  </button>
                </div>
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {savedCourses.length === 0 ? <p className="p-10 text-center text-slate-500 italic text-sm">No hay registros.</p> : savedCourses.map(s => (
                  <div key={s.id} onClick={() => loadSavedStrategy(s)} className={`flex items-center justify-between p-5 border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer group ${currentSessionId === s.id ? 'bg-orange-600/5' : ''}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${currentSessionId === s.id ? 'bg-orange-600 text-white' : 'bg-orange-600/10 text-orange-500'}`}><FileText size={20} /></div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${currentSessionId === s.id ? 'text-orange-500' : 'text-white'}`}>{s.topic || "Sin título"}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">{new Date(s.lastUpdated).toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setSavedCourses(prev => prev.filter(c => c.id !== s.id)); }} className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 pl-8 border-l border-white/10">
            <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">{isFullscreen ? <Minimize size={26} /> : <Maximize size={26} />}</button>
            <button onClick={() => setDarkMode(!darkMode)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">{darkMode ? <Sun size={26} /> : <Moon size={26} />}</button>
            <button onClick={() => setIsSettingsOpen(true)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"><Settings size={26} /></button>
          </div>
        </div>
      </header>

      <div className={`flex-1 flex overflow-hidden transition-all ${isFullscreen ? 'p-0' : 'pb-6'}`}>
        <main className={`flex-1 overflow-y-auto pt-10 ${darkMode ? 'bg-[#0a0f1d]' : 'bg-slate-50'} transition-all ${isFullscreen ? 'rounded-none' : 'rounded-b-[2.5rem] mx-6 shadow-inner border-x border-b border-white/5'}`}>
          <div className="w-full h-full pb-20">
            {loading ? <LoadingScreen message={loadingMessage} /> : (
              <div className="w-full h-full animate-fade-in-up">
                {step === 'INPUT' && <div className="max-w-5xl mx-auto"><TopicInput onSubmit={handleTopicSubmit} t={t} /></div>}
                {step === 'PILLARS' && <div className="max-w-5xl mx-auto"><PillarSelection topic={topic} pillars={pillars} relatedTopics={relatedTopics} onSelect={handlePillarSelect} onSelectTopic={handleTopicSubmit} language={language} t={t} searchTerm={searchTerm} /></div>}
                {step === 'VARIATIONS' && selectedPillar && <div className="max-w-5xl mx-auto"><VariationSelection pillar={selectedPillar} variations={variations} onSelect={handleVariationSelect} onBack={() => setStep('PILLARS')} t={t} searchTerm={searchTerm} variationScores={variationScores} /></div>}
                {step === 'COURSE' && course && (
                  <CourseView 
                    course={course} activeModuleId={activeModuleId || ""} setActiveModuleId={setActiveModuleId} pillarTitle={selectedPillar?.title || ''} 
                    t={t} completedModuleIds={completedModuleIds} onToggleModule={(id) => setCompletedModuleIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    onUpdateHighlights={(mid, h) => setUserHighlights(prev => ({...prev, [mid]: h}))} language={language} onGenerateEbook={() => {}} 
                    userHighlights={userHighlights} onQuizComplete={(score, total) => { if(selectedVariation) setVariationScores(prev => ({...prev, [selectedVariation.id]: {score, total}})) }}
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
