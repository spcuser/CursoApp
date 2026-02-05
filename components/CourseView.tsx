
import React, { useState, useEffect, useRef } from 'react';
import { Course, TranslationDictionary, CourseModule, QuizQuestion } from '../types';
import { Book, Star, Trophy, CheckCircle2, ChevronUp, ChevronDown, Highlighter, HelpCircle, BookOpen, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { generateModuleImage } from '../services/geminiService';

interface CourseViewProps {
  course: Course;
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  pillarTitle: string;
  t: TranslationDictionary;
  completedModuleIds: string[];
  onToggleModule: (moduleId: string) => void;
  onUpdateHighlights: (moduleId: string, highlights: string[]) => void;
  onQuizComplete: (score: number, total: number) => void;
  userHighlights: Record<string, string[]>;
  language: string;
  onScrollToTop: () => void;
  onScrollToBottom: () => void;
}

const cleanMarkdown = (text: string = '') => {
  if (!text) return '';
  return text.toString().replace(/[#*]/g, '').trim();
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export const CourseView: React.FC<CourseViewProps> = ({ 
  course, activeModuleId, setActiveModuleId, pillarTitle, t, completedModuleIds, onToggleModule, onUpdateHighlights, userHighlights, onQuizComplete, onScrollToTop, onScrollToBottom
}) => {
  const [viewMode, setViewMode] = useState<'module' | 'quiz' | 'glossary'>('module');
  const [moduleImage, setModuleImage] = useState<string>('');
  const [shuffledQuiz, setShuffledQuiz] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<{
    currentIdx: number, 
    score: number, 
    finished: boolean,
    selectedIdx: number | null,
    showFeedback: boolean
  }>({
    currentIdx: 0, 
    score: 0, 
    finished: false,
    selectedIdx: null,
    showFeedback: false
  });
  
  const activeModule = course.modules.find(m => m.id === activeModuleId) || course.modules[0];
  const isCompleted = completedModuleIds.includes(activeModule?.id || '');

  useEffect(() => {
    if (activeModule?.imageDescription) {
      setModuleImage(''); // Reset while loading
      generateModuleImage(activeModule.imageDescription).then(setModuleImage).catch(() => setModuleImage(''));
    }
    if (activeModule?.quiz) {
      setShuffledQuiz(shuffleArray(activeModule.quiz));
    }
    setQuizState({currentIdx: 0, score: 0, finished: false, selectedIdx: null, showFeedback: false});
    setViewMode('module');
  }, [activeModuleId]);

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const text = selection.toString().trim();
    if (!text) return;
    const currentHighlights = userHighlights[activeModule.id] || [];
    if (!currentHighlights.includes(text)) {
      onUpdateHighlights(activeModule.id, [...currentHighlights, text]);
    }
    selection.removeAllRanges();
  };

  const handleRemoveHighlight = (text: string) => {
    const currentHighlights = userHighlights[activeModule.id] || [];
    const newHighlights = currentHighlights.filter(h => h !== text);
    onUpdateHighlights(activeModule.id, newHighlights);
  };

  const renderContentWithHighlights = (text: string, highlightClass: string = 'bg-orange-500') => {
    const highlights = userHighlights[activeModule.id] || [];
    if (highlights.length === 0) return text;
    let parts: (string | React.ReactNode)[] = [text];
    
    highlights.forEach(h => {
      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach(p => {
        if (typeof p !== 'string') { newParts.push(p); return; }
        const split = p.split(h);
        split.forEach((s, i) => {
          newParts.push(s);
          if (i < split.length - 1) newParts.push(`__MARK__${h}__MARK__`);
        });
      });
      parts = newParts;
    });

    return parts.map((p, i) => {
      if (typeof p === 'string' && p.includes('__MARK__')) {
        const content = p.replace(/__MARK__/g, '');
        return (
          <mark 
            key={i} 
            className={`${highlightClass} text-white rounded-[4px] px-1 cursor-pointer hover:opacity-80 transition-opacity inline font-bold`} 
            title="Eliminar resaltado" 
            onClick={(e) => { e.stopPropagation(); handleRemoveHighlight(content); }}
          >
            {content}
          </mark>
        );
      }
      return p;
    });
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizState.showFeedback || shuffledQuiz.length === 0) return;
    const currentQuestion = shuffledQuiz[quizState.currentIdx];
    const isCorrect = idx === currentQuestion.correctAnswerIndex;
    setQuizState(prev => ({ ...prev, selectedIdx: idx, showFeedback: true, score: isCorrect ? prev.score + 1 : prev.score }));
  };

  const handleNextQuestion = () => {
    const nextIdx = quizState.currentIdx + 1;
    if (nextIdx < shuffledQuiz.length) {
      setQuizState(prev => ({ ...prev, currentIdx: nextIdx, selectedIdx: null, showFeedback: false }));
    } else {
      setQuizState(prev => ({ ...prev, finished: true, showFeedback: false }));
      onQuizComplete(quizState.score, shuffledQuiz.length);
    }
  };

  const handleResetQuiz = () => {
    if (activeModule?.quiz) setShuffledQuiz(shuffleArray(activeModule.quiz));
    setQuizState({currentIdx: 0, score: 0, finished: false, selectedIdx: null, showFeedback: false});
  };

  if (!activeModule) return null;

  return (
    /* Aumentamos el padding izquierdo global (pl-[60px]) para desplazar todo el contenido 20px más a la derecha */
    <div className="flex w-full pl-[60px] pr-10 animate-fade-in pb-20 relative">
      
      {/* ÍNDICE IZQUIERDA - Añadido px-6 para evitar el recorte del botón activo al escalar */}
      <aside className="w-80 space-y-4 shrink-0 sticky top-0 h-fit max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar px-6 border-r border-white/5">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 pl-2">ÍNDICE</h3>
        <div className="space-y-3">
          {course.modules.map((m, i) => {
            const isActive = activeModuleId === m.id;
            const isDone = completedModuleIds.includes(m.id);
            return (
              <button 
                key={m.id} 
                onClick={() => setActiveModuleId(m.id)} 
                className={`w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 ${isActive ? 'bg-white text-slate-900 shadow-2xl scale-105 z-10' : 'bg-[#444444] text-slate-400 border border-white/5 hover:border-orange-500'}`}
              >
                {/* ICONO PÍLDORA VERTICAL */}
                <div className={`w-6 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-orange-600 text-white shadow-inner' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {isDone || isActive ? <CheckCircle2 size={16} strokeWidth={3} /> : <span className="text-[10px] font-black">{i + 1}</span>}
                </div>
                <span className={`text-sm font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{cleanMarkdown(m.title)}</span>
              </button>
            );
          })}
        </div>
        <div className="pt-8 space-y-3">
          <button onClick={() => setViewMode('quiz')} className={`w-full flex items-center gap-3 p-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'quiz' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}><HelpCircle size={18} /><span>EXAMEN</span></button>
          <button onClick={() => setViewMode('glossary')} className={`w-full flex items-center gap-3 p-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'glossary' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}><BookOpen size={18} /><span>GLOSARIO</span></button>
        </div>
      </aside>

      {/* CONTENEDOR CENTRAL */}
      <div className="flex-1 flex justify-center pl-10 pr-4">
        <div className="flex w-full max-w-5xl relative">
          
          {/* ÁREA DE CONTENIDO */}
          <div className="flex-1 min-w-0">
            <div className="mb-12">
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-2">{pillarTitle}</p>
              <h2 className="text-4xl font-black text-white leading-none tracking-tighter">{course.title}</h2>
            </div>

            {viewMode === 'module' && (
              <div className="space-y-12 animate-fade-in-up">
                {moduleImage && (
                  <div className="w-full aspect-video rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-slate-900">
                    <img src={moduleImage} alt="Ilustración AI" className="w-full h-full object-cover opacity-80" />
                  </div>
                )}
                
                {/* CAJA NARANJA (LO MÁS IMPORTANTE) */}
                <div className="p-10 bg-gradient-to-br from-orange-600 to-orange-500 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group/card" onMouseUp={handleHighlight}>
                   <Star className="absolute top-[-10px] right-[-10px] w-32 h-32 opacity-10 rotate-12" />
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">LO MÁS IMPORTANTE</h4>
                        <Highlighter size={14} className="opacity-0 group-hover/card:opacity-50 transition-opacity" />
                     </div>
                     <p className="text-2xl font-black leading-tight tracking-tight">
                        {renderContentWithHighlights(cleanMarkdown(activeModule.keyTakeaway), 'bg-[#254bdb]')}
                     </p>
                   </div>
                </div>

                {/* BLOQUE DE TEXTO */}
                <div className="bg-[#444444]/20 p-16 rounded-[4rem] border border-white/5 shadow-inner relative group" onMouseUp={handleHighlight}>
                  <div className="absolute top-8 right-8 text-slate-600 group-hover:text-orange-500 transition-colors pointer-events-none"><Highlighter size={24} /></div>
                  <h1 className="text-5xl font-black text-white leading-none tracking-tighter mb-12">{cleanMarkdown(activeModule.title)}</h1>
                  <div className="prose prose-invert max-w-none text-xl text-slate-300 font-medium leading-relaxed space-y-8">
                    {activeModule.contentMarkdown.split('\n').map((line, i) => (
                      <p key={i}>{renderContentWithHighlights(cleanMarkdown(line))}</p>
                    ))}
                  </div>
                  <div className="pt-16 mt-16 border-t border-white/5">
                    <button onClick={() => onToggleModule(activeModule.id)} className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all active:scale-[0.98] ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white shadow-orange-500/30 shadow-2xl hover:bg-orange-700'}`}>
                      {isCompleted ? 'LECCIÓN COMPLETADA ✓' : 'MARCAR COMO COMPLETADO'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'quiz' && (
              <div className="p-16 bg-[#444444] rounded-[4rem] border border-white/5 animate-fade-in shadow-2xl text-center relative overflow-hidden">
                < Trophy size={64} className="text-orange-500 mx-auto mb-8" />
                {!quizState.finished ? (
                  <div className="space-y-8 text-left max-w-2xl mx-auto">
                    <p className="text-sm font-black text-orange-500 uppercase tracking-widest">Pregunta {quizState.currentIdx + 1} de {shuffledQuiz.length}</p>
                    {shuffledQuiz.length > 0 && (
                      <>
                        <h3 className="text-3xl font-black text-white">{shuffledQuiz[quizState.currentIdx].question}</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {shuffledQuiz[quizState.currentIdx].options.map((opt, i) => {
                            const isSelected = quizState.selectedIdx === i;
                            const isCorrect = i === shuffledQuiz[quizState.currentIdx].correctAnswerIndex;
                            let feedbackClass = "bg-slate-900 border-white/5 text-slate-300";
                            if (quizState.showFeedback) {
                              if (isSelected) feedbackClass = isCorrect ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-rose-500/20 border-rose-500 text-rose-300";
                              else if (isCorrect) feedbackClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                            }
                            return (
                              <button key={i} onClick={() => handleQuizAnswer(i)} disabled={quizState.showFeedback} className={`p-6 border rounded-2xl text-left text-lg font-bold transition-all ${feedbackClass} ${!quizState.showFeedback && 'hover:border-orange-500 hover:bg-slate-800 hover:text-white'}`}>{opt}</button>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {quizState.showFeedback && (
                      <button onClick={handleNextQuestion} className="w-full mt-12 py-8 bg-orange-600 hover:bg-orange-700 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl shadow-orange-500/30 animate-fade-in-up"><span>SIGUIENTE PREGUNTA</span><ArrowRight size={24} /></button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-5xl font-black text-white">¡Examen Finalizado!</h2>
                    <div className="py-10"><div className="text-6xl font-black text-orange-500 mb-2">{quizState.score} / {shuffledQuiz.length}</div><p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Puntuación Final</p></div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button onClick={handleResetQuiz} className="px-12 py-4 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-orange-500/20">REPETIR EXAMEN</button>
                      <button onClick={() => setViewMode('module')} className="px-12 py-4 bg-slate-800 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all hover:bg-slate-700">Volver a la lección</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'glossary' && (
              <div className="p-16 bg-[#444444] rounded-[4rem] border border-white/5 animate-fade-in shadow-2xl">
                 <div className="flex items-center gap-4 mb-12"><BookOpen size={32} className="text-orange-500" /><h2 className="text-4xl font-black text-white uppercase tracking-tight">GLOSARIO TÉCNICO</h2></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {course.glossary.map((g, i) => (
                     <div key={i} className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 hover:border-orange-500/50 transition-all group">
                       <h4 className="text-xl font-black text-orange-500 mb-3 group-hover:translate-x-1 transition-transform">{g.term}</h4>
                       <p className="text-slate-400 font-medium leading-relaxed">{g.definition}</p>
                     </div>
                   ))}
                 </div>
                 <button onClick={() => setViewMode('module')} className="mt-12 block mx-auto text-slate-500 font-bold hover:text-white transition-colors">Volver a la lección</button>
              </div>
            )}
          </div>

          {/* COLUMNA DE FLECHAS (AJUSTADA A top-[72%]) */}
          <div className="w-[60px] flex-none relative ml-6">
            <div className="sticky top-[72%] flex flex-col gap-4 items-center z-[100]">
              <button 
                onClick={onScrollToTop} 
                className="w-12 h-12 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-orange-500 hover:bg-orange-600 hover:text-white transition-all shadow-xl active:scale-90 group"
                title="Ir al inicio"
              >
                <ChevronUp size={24} className="group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button 
                onClick={onScrollToBottom} 
                className="w-12 h-12 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-orange-500 hover:bg-orange-600 hover:text-white transition-all shadow-xl active:scale-90 group"
                title="Ir al final"
              >
                <ChevronDown size={24} className="group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
