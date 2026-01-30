
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Course, TranslationDictionary, GlossaryTerm, QuizQuestion, CourseModule } from '../types';
import { 
  Book, Highlighter, Star, Hash, ArrowLeft, PlusCircle, Trash2, XCircle, Trophy, ClipboardCheck, ArrowRight, RotateCcw, CornerUpLeft, Image as ImageIcon, AlertCircle, ChevronRight, Save, CheckCircle2
} from 'lucide-react';

interface CourseViewProps {
  course: Course;
  pillarTitle: string;
  onBack: () => void;
  t: TranslationDictionary;
  searchTerm?: string;
  completedModuleIds: string[];
  userHighlights?: Record<string, string[]>;
  onToggleModule: (moduleId: string) => void;
  onUpdateHighlights: (moduleId: string, highlights: string[]) => void;
  onGenerateEbook: () => void;
  language: string;
  onSaveCurrent?: () => Promise<void>;
}

const cleanMarkdown = (text: string = '') => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/^(\s*)\d+\.\s+/gm, '$1• ');
};

const TextProcessor: React.FC<{ 
  text: string, 
  glossary: GlossaryTerm[], 
  onTermClick: (term: string) => void, 
  onRemoveHighlight: (text: string) => void,
  searchTerm?: string, 
  userHighlights: string[]
}> = ({ text = '', glossary = [], onTermClick, onRemoveHighlight, searchTerm, userHighlights = [] }) => {
  const cleanText = cleanMarkdown(text);
  if (!cleanText) return null;

  const patterns = useMemo(() => {
    const list = new Set<string>();
    if (searchTerm && searchTerm.trim().length > 1) list.add(searchTerm.trim());
    userHighlights.forEach(h => { if (h && h.trim().length > 1) list.add(h.trim()); });
    patterns_loop: glossary.forEach(g => { if (g.term && g.term.trim().length > 1) list.add(g.term.trim()); });
    return Array.from(list).sort((a, b) => b.length - a.length);
  }, [searchTerm, userHighlights, glossary]);

  if (patterns.length === 0) return <span className="font-normal">{cleanText}</span>;

  const patternRegex = patterns.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${patternRegex})`, 'gi');
  const parts = cleanText.split(regex);

  return (
    <span className="font-normal">
      {parts.map((part, i) => {
        if (!part) return null;
        const lowerPart = part.toLowerCase();
        const isUserHighlight = userHighlights.some(h => h && h.trim().toLowerCase() === lowerPart);
        const isSearchMatch = searchTerm && lowerPart === searchTerm.trim().toLowerCase();

        if (isUserHighlight || isSearchMatch) {
          return (
            <mark 
              key={i} 
              onClick={() => isUserHighlight && onRemoveHighlight(part)}
              className={`px-1.5 py-0.5 rounded-md font-bold shadow-lg shadow-orange-500/20 cursor-pointer transition-all ${isUserHighlight ? 'bg-orange-500 text-white hover:bg-rose-500 hover:shadow-rose-500/40 group/mark relative' : 'bg-orange-600 text-white'}`}
            >
              {part}
              {isUserHighlight && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-rose-600 text-[10px] text-white px-2 py-1 rounded opacity-0 group-hover/mark:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-black uppercase tracking-tighter shadow-xl">Borrar</span>
              )}
            </mark>
          );
        }

        const glossaryEntry = glossary.find(g => g.term && g.term.trim().toLowerCase() === lowerPart);
        if (glossaryEntry) {
          return (
            <button key={i} onClick={() => onTermClick(glossaryEntry.term)} className="border-b-2 border-orange-500/50 hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer font-bold inline text-left">
              {part}
            </button>
          );
        }
        return part;
      })}
    </span>
  );
};

export const CourseView: React.FC<CourseViewProps> = ({ 
  course, pillarTitle, t, searchTerm, completedModuleIds, userHighlights = {}, onToggleModule, onUpdateHighlights, onSaveCurrent
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(course?.modules?.[0]?.id || '');
  const [viewMode, setViewMode] = useState<'module' | 'glossary' | 'highlights' | 'quiz'>('module');
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const lastScrollPosRef = useRef(0);
  const prevViewModeRef = useRef(viewMode);
  const prevModuleIdRef = useRef(activeModuleId);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    if (prevModuleIdRef.current !== activeModuleId) {
      container.scrollTo({ top: 0, behavior: 'auto' });
      lastScrollPosRef.current = 0;
    } 
    else if (viewMode === 'module' && prevViewModeRef.current !== 'module') {
      container.scrollTo({ top: lastScrollPosRef.current, behavior: 'smooth' });
    }
    else if (viewMode !== 'module') {
      container.scrollTo({ top: 0, behavior: 'auto' });
    }
    prevViewModeRef.current = viewMode;
    prevModuleIdRef.current = activeModuleId;
  }, [activeModuleId, viewMode]);

  const activeModule: CourseModule | undefined = course?.modules?.find(m => m.id === activeModuleId) || course?.modules?.[0];

  if (!activeModule) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 text-center bg-slate-900">
        <AlertCircle className="text-orange-500 mb-4" size={48} />
        <p className="text-slate-300 font-bold">Lección no disponible.</p>
      </div>
    );
  }

  const isModuleCompleted = completedModuleIds.includes(activeModule.id);
  const moduleHighlights = userHighlights[activeModule.id] || [];

  const allModulesCompleted = useMemo(() => {
    return (course?.modules || []).every(m => completedModuleIds.includes(m.id));
  }, [course?.modules, completedModuleIds]);

  const allQuestions = useMemo(() => {
    return (course?.modules || []).flatMap(m => m.quiz || []);
  }, [course?.modules]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionBox(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionBox({ x: rect.left + rect.width / 2, y: rect.top - 60, text });
    }
  };

  const handleSave = async () => {
    if (!onSaveCurrent || isSaving) return;
    setIsSaving(true);
    try {
      await onSaveCurrent();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error("Error al guardar", e);
    } finally {
      setIsSaving(false);
    }
  };

  const addHighlight = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (selectionBox) {
      const current = userHighlights[activeModule.id] || [];
      if (!current.includes(selectionBox.text)) onUpdateHighlights(activeModule.id, [...current, selectionBox.text]);
      setSelectionBox(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const removeHighlight = (text: string) => {
    const current = userHighlights[activeModule.id] || [];
    onUpdateHighlights(activeModule.id, current.filter(h => h.toLowerCase() !== text.toLowerCase()));
  };

  const clearAllHighlights = () => {
    onUpdateHighlights(activeModule.id, []);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    const newAnswers = [...quizAnswers, optionIdx];
    setQuizAnswers(newAnswers);

    setTimeout(() => {
      if (quizIndex < allQuestions.length - 1) {
        setQuizIndex(quizIndex + 1);
        setSelectedOption(null);
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizAnswers([]);
    setQuizFinished(false);
    setSelectedOption(null);
  };

  const handleTermClick = (term: string) => {
    if (contentRef.current && viewMode === 'module') {
      lastScrollPosRef.current = contentRef.current.scrollTop;
    }
    setSelectedGlossaryTerm(term);
    setViewMode('glossary');
    setTimeout(() => {
      document.getElementById(`term-${term}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ 
        top: contentRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden" onMouseUp={handleMouseUp}>
      <aside className="w-[440px] border-r border-slate-900 bg-slate-950 flex flex-col p-8 overflow-y-auto shrink-0">
        <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">CONTENIDO</h3>
        <div className="space-y-[19px] flex-1">
          {(course?.modules || []).map((mod, idx) => {
            const isActive = activeModuleId === mod.id && viewMode === 'module';
            const isCompleted = completedModuleIds.includes(mod.id);
            return (
              <button 
                key={mod.id} onClick={() => { 
                  if (activeModuleId !== mod.id) lastScrollPosRef.current = 0;
                  setViewMode('module'); 
                  setActiveModuleId(mod.id); 
                }}
                className={`w-[calc(100%-10px)] flex items-center gap-6 p-7 rounded-[2.5rem] transition-all text-left group mx-[5px] ${isActive ? 'bg-white text-slate-950 shadow-2xl scale-[1.03]' : 'bg-[#444444] border border-white/5 text-slate-300 hover:border-orange-500/50'} ${isCompleted && !isActive ? 'opacity-80' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shrink-0 transition-colors ${isActive ? 'bg-orange-500 text-white' : isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800/50 text-slate-500'}`}>{idx + 1}</div>
                <span className={`font-bold text-lg leading-snug flex-1 ${isActive ? 'text-slate-900' : 'group-hover:text-white'}`}>{cleanMarkdown(mod.title)}</span>
              </button>
            );
          })}

          <button 
            disabled={!allModulesCompleted}
            onClick={() => { 
              if (allModulesCompleted) {
                setViewMode('quiz');
                resetQuiz();
              }
            }}
            className={`w-[calc(100%-10px)] flex items-center gap-6 p-7 rounded-[2.5rem] transition-all text-left group mx-[5px] mt-8 ${!allModulesCompleted ? 'opacity-30 grayscale cursor-not-allowed border-dashed border-slate-700' : viewMode === 'quiz' ? 'bg-orange-600 text-white shadow-2xl scale-[1.03]' : 'bg-orange-500/10 border-2 border-orange-500/30 text-orange-500 hover:bg-orange-500/20'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shrink-0 ${viewMode === 'quiz' ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'}`}><ClipboardCheck size={24} /></div>
            <div className="flex-1">
              <span className="font-black text-lg leading-tight block">EXAMEN FINAL</span>
              {!allModulesCompleted && <span className="text-[10px] uppercase tracking-widest opacity-60">Bloqueado</span>}
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-12">
          <button onClick={() => setViewMode('glossary')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all ${viewMode === 'glossary' ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/30' : 'bg-[#444444] border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'}`}><Book size={24} /><span className="text-[11px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded">GLOSARIO</span></button>
          <button onClick={() => setViewMode('highlights')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all ${viewMode === 'highlights' ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/30' : 'bg-[#444444] border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'}`}><Highlighter size={24} /><span className="text-[11px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded">MIS NOTAS</span></button>
        </div>
      </aside>

      <div className="flex-1 relative overflow-hidden bg-[#0a0f1d]">
        {viewMode === 'module' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[250] flex flex-col gap-8 animate-fade-in pointer-events-auto">
            <button onClick={scrollToTop} className="group relative w-12 h-12 flex items-center justify-center transition-all hover:scale-110 active:scale-90" title="Volver al principio">
              <svg width="44" height="44" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                <path d="M20 5L35 30H5L20 5Z" fill="white" stroke="#F97316" strokeWidth="5" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={scrollToBottom} className="group relative w-12 h-12 flex items-center justify-center transition-all hover:scale-110 active:scale-90" title="Ir al final">
              <svg width="44" height="44" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                <path d="M20 35L5 10H35L20 35Z" fill="white" stroke="#F97316" strokeWidth="5" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        <div ref={contentRef} className="h-full overflow-y-auto px-16 py-10 scroll-smooth select-text relative custom-scrollbar">
          {selectionBox && (
            <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={addHighlight} style={{ left: selectionBox.x, top: selectionBox.y }} className="fixed -translate-x-1/2 z-[400] flex items-center gap-3 px-6 py-3 bg-orange-500 text-white rounded-full shadow-2xl font-black text-sm uppercase tracking-widest animate-fade-in-up border-2 border-white/40 hover:scale-110 hover:bg-orange-600 transition-all cursor-pointer"><PlusCircle size={20} /><span>Resaltar</span></button>
          )}

          <div className="max-w-4xl mx-auto space-y-16">
            {viewMode === 'module' ? (
              <>
                <div className="flex items-center justify-between border-b border-white/5 pb-8 animate-fade-in-up">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] opacity-80">
                      <span>{cleanMarkdown(pillarTitle)}</span>
                      <ChevronRight size={10} className="text-slate-600" />
                      <span className="text-slate-500">Estrategia</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-tight max-w-2xl">{cleanMarkdown(course.title)}</h2>
                  </div>
                  
                  {onSaveCurrent && (
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      title="Actualizar Archivo Original (Sobrescribir)"
                      className={`group relative flex flex-col items-center gap-2 p-5 rounded-[1.5rem] transition-all shadow-xl active:scale-90 ${saveSuccess ? 'bg-emerald-600 shadow-emerald-500/40' : 'bg-orange-600/10 hover:bg-orange-600 border border-orange-500/30 hover:shadow-orange-500/40'}`}
                    >
                      {saveSuccess ? (
                        <CheckCircle2 size={32} className="text-white animate-bounce" />
                      ) : (
                        <Save size={32} className={`transition-colors ${isSaving ? 'animate-pulse text-orange-500' : 'text-orange-500 group-hover:text-white'}`} />
                      )}
                      <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${saveSuccess ? 'text-white' : 'text-orange-400 group-hover:text-white'}`}>
                        {saveSuccess ? 'Guardado' : isSaving ? 'Guardando...' : 'Actualizar'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-10 bg-orange-600 rounded-[2.5rem] text-white shadow-2xl flex flex-col items-center text-center space-y-6">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-90"><Star size={16} fill="currentColor" /><span>{t.course.keyTakeaway}</span></div>
                  <p className="text-2xl font-medium leading-[1.4]">{cleanMarkdown(activeModule.keyTakeaway)}</p>
                </div>

                <div className="relative group animate-fade-in-up min-h-[100px] flex flex-col">
                  <div className="bg-slate-800 rounded-t-xl p-3 flex items-center gap-2 border-x border-t border-white/10 shadow-2xl">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex-1 text-center pr-10">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-50">Visualización • AI Generated</span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden border-x border-b border-white/10 rounded-b-xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] bg-slate-900/50 flex items-center justify-center min-h-[250px]">
                    {activeModule.imageUrl ? (
                      <img 
                        src={activeModule.imageUrl} 
                        alt={activeModule.title} 
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-1000" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-700 animate-pulse">
                        <ImageIcon size={40} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Generando visualización...</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-10">
                  <h1 className="text-4xl font-black text-white tracking-tight leading-tight">{cleanMarkdown(activeModule.title)}</h1>
                  <div className="text-xl leading-[1.8] text-slate-300 space-y-10 select-text">
                    {(activeModule.contentMarkdown || '').split(/\n\n/).map((block, idx) => (
                      <div key={idx} className="whitespace-pre-wrap"><TextProcessor text={block} glossary={course?.glossary || []} onTermClick={handleTermClick} onRemoveHighlight={removeHighlight} searchTerm={searchTerm} userHighlights={moduleHighlights} /></div>
                    ))}
                  </div>
                </div>
                <div className="pt-12 pb-16 flex justify-center">
                  <button onClick={() => onToggleModule(activeModule.id)} className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl ${isModuleCompleted ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-500/30'}`}>{isModuleCompleted ? '✓ MÓDULO COMPLETADO' : 'MARCAR COMO COMPLETADO'}</button>
                </div>
              </>
            ) : viewMode === 'quiz' ? (
              <div className="animate-fade-in-up space-y-12">
                {!quizFinished ? (
                  <div className="space-y-10">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter">Examen Final</h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Pregunta {quizIndex + 1} de {allQuestions.length}</p>
                      </div>
                      <div className="w-20 h-20 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                          <circle cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                          <circle cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={314} strokeDashoffset={314 - (314 * (quizIndex + 1)) / (allQuestions.length || 1)} className="text-orange-500 transition-all duration-1000" />
                        </svg>
                        <span className="absolute text-lg font-black text-white">{Math.round(((quizIndex + 1) / (allQuestions.length || 1)) * 100)}%</span>
                      </div>
                    </div>
                    <div className="bg-[#444444] p-12 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-10">
                      <p className="text-2xl font-bold text-white leading-snug">{allQuestions[quizIndex]?.question}</p>
                      <div className="grid grid-cols-1 gap-5">
                        {(allQuestions[quizIndex]?.options || []).map((opt, i) => {
                          const isSelected = selectedOption === i;
                          const isCorrect = i === allQuestions[quizIndex].correctAnswerIndex;
                          const bgColor = isSelected ? (isCorrect ? 'bg-emerald-600 border-emerald-400' : 'bg-rose-600 border-rose-400') : 'bg-black/20 border-white/10 hover:border-orange-500 hover:bg-white/5';
                          return (
                            <button key={i} onClick={() => handleQuizAnswer(i)} className={`p-6 rounded-2xl border transition-all text-left text-lg font-medium flex items-center justify-between group ${bgColor}`}>
                              <span className={isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}>{opt}</span>
                              {isSelected && (isCorrect ? <Trophy size={20} /> : <RotateCcw size={20} />)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-10 py-16">
                    <div className="w-40 h-40 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-[0_0_80px_rgba(249,115,22,0.4)] animate-bounce"><Trophy size={60} /></div>
                    <div>
                      <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tight">¡EXAMEN FINALIZADO!</h2>
                      <p className="text-2xl text-slate-400 font-medium max-w-2xl mx-auto">Has completado el curso con éxito.</p>
                    </div>
                    <div className="bg-white text-slate-950 px-12 py-8 rounded-[2rem] text-7xl font-black shadow-2xl">
                      {quizAnswers.filter((a, i) => a === allQuestions[i].correctAnswerIndex).length} / {allQuestions.length}
                    </div>
                    <div className="flex gap-4">
                      <button onClick={resetQuiz} className="flex items-center gap-3 px-10 py-5 bg-[#444444] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"><RotateCcw size={20} /><span>Reintentar</span></button>
                      <button onClick={() => setViewMode('module')} className="flex items-center gap-3 px-10 py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/30"><span>Terminar Curso</span><ArrowRight size={20} /></button>
                    </div>
                  </div>
                )}
              </div>
            ) : viewMode === 'glossary' ? (
              <div className="space-y-12 animate-fade-in-up">
                 <div className="bg-[#444444] p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
                   <h2 className="text-4xl font-black text-white mb-12 uppercase tracking-tight text-center">GLOSARIO</h2>
                   <div className="grid grid-cols-1 gap-6">
                     {(course?.glossary || []).map((g, idx) => {
                       const isSelected = selectedGlossaryTerm === g.term;
                       return (
                         <div key={idx} id={`term-${g.term}`} onClick={() => setViewMode('module')} className={`group relative p-10 rounded-3xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${isSelected ? 'bg-orange-600 border-orange-400 shadow-2xl shadow-orange-600/40' : 'bg-black/20 border-white/5 hover:border-orange-500/50'}`}>
                           <div className={`absolute top-8 right-8 transition-all ${isSelected ? 'text-white' : 'text-orange-500 opacity-0 group-hover:opacity-100'}`}><CornerUpLeft size={28} strokeWidth={2.5} /></div>
                           <h3 className={`text-2xl font-black uppercase mb-3 tracking-tight ${isSelected ? 'text-white' : 'text-orange-500'}`}>{g.term}</h3>
                           <p className={`text-xl leading-relaxed font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{g.definition}</p>
                         </div>
                       );
                     })}
                   </div>
                 </div>
              </div>
            ) : (
              <div className="space-y-12 animate-fade-in-up">
                 <div className="flex items-center justify-between mb-8"><button onClick={() => setViewMode('module')} className="flex items-center gap-4 text-slate-400 hover:text-orange-500 transition-all font-black text-lg group"><ArrowLeft size={28} strokeWidth={3} className="group-hover:-translate-x-2 transition-transform" /><span>VOLVER A LA LECCIÓN</span></button>{moduleHighlights.length > 0 && (<button onClick={clearAllHighlights} className="flex items-center gap-2 px-6 py-3 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white border border-rose-600/30 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"><XCircle size={18} /><span>Borrar Todo</span></button>)}</div>
                 <div className="bg-[#444444] p-12 rounded-[2.5rem] border border-white/5 shadow-2xl"><h2 className="text-3xl font-black text-white mb-10 uppercase tracking-tight">MIS NOTAS</h2><div className="space-y-6">{moduleHighlights.length === 0 ? (<p className="text-slate-500 italic text-lg">Selecciona texto en la lección y usa el botón "Resaltar" para guardar fragmentos importantes.</p>) : (moduleHighlights.map((h, i) => (<div key={i} className="flex items-start justify-between p-7 bg-orange-600/10 border-l-8 border-orange-500 rounded-r-2xl group transition-all hover:bg-orange-600/20"><p className="text-lg font-bold text-slate-100 italic flex-1 pr-6">"{h}"</p><button onClick={() => removeHighlight(h)} className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={18} /></button></div>)))}</div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
