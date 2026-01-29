
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Course, TranslationDictionary, GlossaryTerm, QuizQuestion } from '../types';
import { 
  Book, Highlighter, Star, Hash, ArrowLeft, PlusCircle, Trash2, XCircle, Trophy, ClipboardCheck, ArrowRight, RotateCcw, CornerUpLeft
} from 'lucide-react';

interface CourseViewProps {
  course: Course;
  onBack: () => void;
  t: TranslationDictionary;
  searchTerm?: string;
  completedModuleIds: string[];
  userHighlights?: Record<string, string[]>;
  onToggleModule: (moduleId: string) => void;
  onUpdateHighlights: (moduleId: string, highlights: string[]) => void;
  onGenerateEbook: () => void;
  language: string;
}

const cleanMarkdown = (text: string) => {
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
}> = ({ text, glossary, onTermClick, onRemoveHighlight, searchTerm, userHighlights }) => {
  const cleanText = cleanMarkdown(text);
  const patterns = useMemo(() => {
    const list = new Set<string>();
    if (searchTerm && searchTerm.trim().length > 1) list.add(searchTerm.trim());
    userHighlights.forEach(h => { if (h.trim().length > 1) list.add(h.trim()); });
    glossary.forEach(g => { if (g.term.trim().length > 1) list.add(g.term.trim()); });
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
        const isUserHighlight = userHighlights.some(h => h.trim().toLowerCase() === lowerPart);
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

        const glossaryEntry = glossary.find(g => g.term.trim().toLowerCase() === lowerPart);
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
  course, t, searchTerm, completedModuleIds, userHighlights = {}, onToggleModule, onUpdateHighlights
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(course.modules[0]?.id || '');
  const [viewMode, setViewMode] = useState<'module' | 'glossary' | 'highlights' | 'quiz'>('module');
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, text: string } | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Persistencia de scroll
  const lastScrollPosRef = useRef(0);
  const prevViewModeRef = useRef(viewMode);
  const prevModuleIdRef = useRef(activeModuleId);

  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // EFECTO PARA GESTIONAR EL SCROLL INTELIGENTE
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    // 1. Si cambió el módulo (lección diferente), siempre al principio
    if (prevModuleIdRef.current !== activeModuleId) {
      container.scrollTo({ top: 0, behavior: 'auto' });
      lastScrollPosRef.current = 0;
    } 
    // 2. Si regresamos a la lección desde el glosario o notas, restaurar posición
    else if (viewMode === 'module' && prevViewModeRef.current !== 'module') {
      container.scrollTo({ top: lastScrollPosRef.current, behavior: 'smooth' });
    }
    // 3. Si entramos a glosario/quiz/notas, ir al principio de esa vista
    else if (viewMode !== 'module') {
      container.scrollTo({ top: 0, behavior: 'auto' });
    }

    // Actualizar referencias previas para el siguiente cambio
    prevViewModeRef.current = viewMode;
    prevModuleIdRef.current = activeModuleId;
  }, [activeModuleId, viewMode]);

  const activeModule = course.modules.find(m => m.id === activeModuleId) || course.modules[0];
  const isModuleCompleted = completedModuleIds.includes(activeModule.id);
  const moduleHighlights = userHighlights[activeModule.id] || [];

  const allModulesCompleted = useMemo(() => {
    return course.modules.every(m => completedModuleIds.includes(m.id));
  }, [course.modules, completedModuleIds]);

  const allQuestions = useMemo(() => {
    return course.modules.flatMap(m => m.quiz);
  }, [course.modules]);

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
    // Guardar posición de lectura antes de saltar al glosario
    if (contentRef.current && viewMode === 'module') {
      lastScrollPosRef.current = contentRef.current.scrollTop;
    }
    setSelectedGlossaryTerm(term);
    setViewMode('glossary');
    setTimeout(() => {
      document.getElementById(`term-${term}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const changeViewWithSave = (mode: 'module' | 'glossary' | 'highlights' | 'quiz') => {
    if (contentRef.current && viewMode === 'module') {
      lastScrollPosRef.current = contentRef.current.scrollTop;
    }
    setViewMode(mode);
  };

  return (
    <div className="flex h-full w-full overflow-hidden" onMouseUp={handleMouseUp}>
      <aside className="w-[440px] border-r border-slate-900 bg-slate-950 flex flex-col p-8 overflow-y-auto shrink-0">
        <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">CONTENIDO</h3>
        <div className="space-y-[19px] flex-1">
          {course.modules.map((mod, idx) => {
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
                changeViewWithSave('quiz');
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
          <button onClick={() => changeViewWithSave('glossary')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all ${viewMode === 'glossary' ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/30' : 'bg-[#444444] border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'}`}><Book size={24} /><span className="text-[11px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded">GLOSARIO</span></button>
          <button onClick={() => changeViewWithSave('highlights')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all ${viewMode === 'highlights' ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/30' : 'bg-[#444444] border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'}`}><Highlighter size={24} /><span className="text-[11px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded">MIS NOTAS</span></button>
        </div>
      </aside>

      <div ref={contentRef} className="flex-1 overflow-y-auto px-16 py-16 bg-[#0a0f1d] relative scroll-smooth">
        {selectionBox && (
          <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={addHighlight} style={{ left: selectionBox.x, top: selectionBox.y }} className="fixed -translate-x-1/2 z-[300] flex items-center gap-3 px-6 py-3 bg-orange-500 text-white rounded-full shadow-2xl font-black text-sm uppercase tracking-widest animate-fade-in-up border-2 border-white/40 hover:scale-110 hover:bg-orange-600 transition-all cursor-pointer"><PlusCircle size={20} /><span>Resaltar</span></button>
        )}

        <div className="max-w-4xl mx-auto space-y-20">
          {viewMode === 'module' ? (
            <>
              <div className="p-12 bg-orange-600 rounded-[3rem] text-white shadow-2xl flex flex-col items-center text-center space-y-8">
                <div className="flex items-center gap-3 text-[13px] font-black uppercase tracking-[0.3em] opacity-90"><Star size={20} fill="currentColor" /><span>{t.course.keyTakeaway}</span></div>
                <p className="text-3xl font-medium leading-[1.4]">{cleanMarkdown(activeModule.keyTakeaway)}</p>
              </div>
              <div className="space-y-12">
                <h1 className="text-5xl font-black text-white tracking-tight leading-tight">{cleanMarkdown(activeModule.title)}</h1>
                <div className="text-2xl leading-[1.7] text-slate-300 space-y-12 select-text">
                  {activeModule.contentMarkdown.split(/\n\n/).map((block, idx) => (
                    <div key={idx} className="whitespace-pre-wrap"><TextProcessor text={block} glossary={course.glossary} onTermClick={handleTermClick} onRemoveHighlight={removeHighlight} searchTerm={searchTerm} userHighlights={moduleHighlights} /></div>
                  ))}
                </div>
              </div>
              <div className="pt-16 pb-20 flex justify-center">
                <button onClick={() => onToggleModule(activeModule.id)} className={`px-16 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl ${isModuleCompleted ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-500/30'}`}>{isModuleCompleted ? '✓ MÓDULO COMPLETADO' : 'MARCAR COMO COMPLETADO'}</button>
              </div>
            </>
          ) : viewMode === 'quiz' ? (
            <div className="animate-fade-in-up space-y-12">
              {!quizFinished ? (
                <div className="space-y-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">Examen Final</h2>
                      <p className="text-slate-500 font-bold uppercase tracking-widest">Pregunta {quizIndex + 1} de {allQuestions.length}</p>
                    </div>
                    {/* REDUCCIÓN DE TAMAÑO DEL INDICADOR DE PORCENTAJE */}
                    <div className="w-24 h-24 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                        <circle cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={314} strokeDashoffset={314 - (314 * (quizIndex + 1)) / allQuestions.length} className="text-orange-500 transition-all duration-1000" />
                      </svg>
                      <span className="absolute text-xl font-black text-white">{Math.round(((quizIndex + 1) / allQuestions.length) * 100)}%</span>
                    </div>
                  </div>

                  <div className="bg-[#444444] p-16 rounded-[3rem] border border-white/5 shadow-2xl space-y-12">
                    <p className="text-3xl font-bold text-white leading-snug">{allQuestions[quizIndex]?.question}</p>
                    <div className="grid grid-cols-1 gap-6">
                      {allQuestions[quizIndex]?.options.map((opt, i) => {
                        const isSelected = selectedOption === i;
                        const isCorrect = i === allQuestions[quizIndex].correctAnswerIndex;
                        const bgColor = isSelected ? (isCorrect ? 'bg-emerald-600 border-emerald-400' : 'bg-rose-600 border-rose-400') : 'bg-black/20 border-white/10 hover:border-orange-500 hover:bg-white/5';
                        return (
                          <button key={i} onClick={() => handleQuizAnswer(i)} className={`p-8 rounded-[2rem] border transition-all text-left text-xl font-medium flex items-center justify-between group ${bgColor}`}>
                            <span className={isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}>{opt}</span>
                            {isSelected && (isCorrect ? <Trophy size={24} /> : <RotateCcw size={24} />)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-12 py-20">
                  <div className="w-48 h-48 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-[0_0_80px_rgba(249,115,22,0.4)] animate-bounce"><Trophy size={80} /></div>
                  <div>
                    <h2 className="text-6xl font-black text-white mb-6 uppercase tracking-tight">¡EXAMEN FINALIZADO!</h2>
                    <p className="text-3xl text-slate-400 font-medium max-w-2xl mx-auto">Has completado el curso con éxito. Tu puntuación final es:</p>
                  </div>
                  <div className="bg-white text-slate-950 px-16 py-10 rounded-[3rem] text-8xl font-black shadow-2xl">
                    {quizAnswers.filter((a, i) => a === allQuestions[i].correctAnswerIndex).length} / {allQuestions.length}
                  </div>
                  <div className="flex gap-6">
                    <button onClick={resetQuiz} className="flex items-center gap-3 px-12 py-6 bg-[#444444] text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"><RotateCcw size={24} /><span>Reintentar</span></button>
                    <button onClick={() => setViewMode('module')} className="flex items-center gap-3 px-12 py-6 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/30"><span>Terminar Curso</span><ArrowRight size={24} /></button>
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'glossary' ? (
            <div className="space-y-12 animate-fade-in-up">
               <div className="bg-[#444444] p-16 rounded-[4rem] border border-white/5 shadow-2xl">
                 <h2 className="text-6xl font-black text-white mb-16 uppercase tracking-tight text-center">GLOSARIO</h2>
                 <div className="grid grid-cols-1 gap-8">
                   {course.glossary.map((g, idx) => {
                     const isSelected = selectedGlossaryTerm === g.term;
                     return (
                       <div 
                        key={idx} 
                        id={`term-${g.term}`} 
                        onClick={() => setViewMode('module')}
                        className={`group relative p-12 rounded-[2.5rem] border-2 transition-all cursor-pointer hover:scale-[1.02] ${isSelected ? 'bg-orange-600 border-orange-400 shadow-2xl shadow-orange-600/40' : 'bg-black/20 border-white/5 hover:border-orange-500/50'}`}
                       >
                         <div className={`absolute top-10 right-10 transition-all ${isSelected ? 'text-white' : 'text-orange-500 opacity-0 group-hover:opacity-100'}`}>
                           <CornerUpLeft size={36} strokeWidth={2.5} />
                         </div>
                         <h3 className={`text-3xl font-black uppercase mb-4 tracking-tight ${isSelected ? 'text-white' : 'text-orange-500'}`}>{g.term}</h3>
                         <p className={`text-2xl leading-relaxed font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{g.definition}</p>
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>
          ) : (
            <div className="space-y-12 animate-fade-in-up">
               <div className="flex items-center justify-between mb-12"><button onClick={() => setViewMode('module')} className="flex items-center gap-4 text-slate-400 hover:text-orange-500 transition-all font-black text-xl group"><ArrowLeft size={32} strokeWidth={3} className="group-hover:-translate-x-2 transition-transform" /><span>VOLVER A LA LECCIÓN</span></button>{moduleHighlights.length > 0 && (<button onClick={clearAllHighlights} className="flex items-center gap-2 px-6 py-3 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white border border-rose-600/30 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"><XCircle size={18} /><span>Borrar Todo</span></button>)}</div>
               <div className="bg-[#444444] p-16 rounded-[3rem] border border-white/5 shadow-2xl"><h2 className="text-4xl font-black text-white mb-12 uppercase tracking-tight">MIS NOTAS</h2><div className="space-y-6">{moduleHighlights.length === 0 ? (<p className="text-slate-500 italic text-xl">Selecciona texto en la lección y usa el botón "Resaltar" para guardar fragmentos importantes. Haz clic en un texto resaltado para borrarlo.</p>) : (moduleHighlights.map((h, i) => (<div key={i} className="flex items-start justify-between p-8 bg-orange-600/10 border-l-8 border-orange-500 rounded-r-2xl group transition-all hover:bg-orange-600/20"><p className="text-xl font-bold text-slate-100 italic flex-1 pr-6">"{h}"</p><button onClick={() => removeHighlight(h)} className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="Eliminar nota"><Trash2 size={20} /></button></div>)))}</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
