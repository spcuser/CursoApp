
import React, { useState, useEffect, useMemo } from 'react';
import { Course, CourseModule, QuizQuestion, TranslationDictionary, GlossaryTerm } from '../types';
import { 
  CheckCircle, ArrowLeft, Award, BookOpen, ChevronRight, 
  Book, Check, Highlighter, X, Sparkles, HelpCircle, Target 
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

const highlightText = (text: string, searchTerms: string[] = [], searchTerm?: string) => {
  const allTerms = [
    ...(searchTerm && searchTerm.length >= 2 ? [searchTerm] : []),
    ...(searchTerms || [])
  ].filter(t => t.trim().length >= 2);

  if (allTerms.length === 0) return text;

  const pattern = allTerms
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
    .join('|');
    
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = allTerms.some(term => part.toLowerCase() === term.toLowerCase());
        if (!isMatch) return part;
        const isSearchTerm = searchTerm && part.toLowerCase() === searchTerm.toLowerCase();
        return (
          <mark key={i} className={isSearchTerm ? "bg-orange-500/30 text-orange-950 dark:text-orange-100" : ""}>
            {part}
          </mark>
        );
      })}
    </span>
  );
};

const TextProcessor: React.FC<{ 
  text: string, 
  glossary: GlossaryTerm[], 
  onTermClick: () => void, 
  searchTerm?: string, 
  userHighlights: string[], 
  forceBold?: boolean 
}> = ({ text, glossary, onTermClick, searchTerm, userHighlights, forceBold = false }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (<>{parts.map((part, i) => {
    const isBoldMark = part.startsWith('**') && part.endsWith('**');
    const content = isBoldMark ? part.slice(2, -2) : part;
    const renderBold = isBoldMark || forceBold;

    const processInner = (inner: string) => {
      if (!glossary || glossary.length === 0) return highlightText(inner, userHighlights, searchTerm);
      const sortedTerms = [...glossary].sort((a, b) => b.term.length - a.term.length);
      const pattern = new RegExp(`\\b(${sortedTerms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
      const termParts = inner.split(pattern);
      
      return termParts.map((tp, j) => {
        const termObj = sortedTerms.find(t => t.term.toLowerCase() === tp.toLowerCase());
        if (termObj) return (
          <button key={j} onClick={onTermClick} className="font-bold text-orange-600 dark:text-orange-400 hover:underline decoration-dotted decoration-2 underline-offset-4 cursor-pointer inline transition-colors">
            {highlightText(tp, userHighlights, searchTerm)}
          </button>
        );
        return highlightText(tp, userHighlights, searchTerm);
      });
    };

    return renderBold ? (
      <strong key={i} className="font-black text-slate-900 dark:text-white">
        {processInner(content)}
      </strong>
    ) : (
      <span key={i} className="font-medium">{processInner(content)}</span>
    );
  })}</>);
};

const MarkdownRenderer: React.FC<{ 
  content: string, 
  glossary: GlossaryTerm[], 
  onTermClick: () => void, 
  searchTerm?: string, 
  userHighlights: string[] 
}> = ({ content, glossary, onTermClick, searchTerm, userHighlights }) => {
  const blocks = content.split(/\n\s*\n/).map(b => b.trim()).filter(b => b !== '');
  
  return (
    <div className="space-y-6 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
      {blocks.map((block, idx) => {
        if (block.startsWith('#')) {
          const level = (block.match(/^#+/) || ['#'])[0].length;
          const text = block.replace(/^#+\s*/, '');
          const size = level === 1 ? 'text-2xl' : 'text-xl';
          return (
            <div key={idx} className={`${size} font-black text-slate-900 dark:text-white mt-10 mb-4 border-l-4 border-orange-500 pl-4`}>
              <TextProcessor text={text} glossary={glossary} onTermClick={onTermClick} searchTerm={searchTerm} userHighlights={userHighlights} forceBold={true} />
            </div>
          );
        }

        const isList = block.match(/^(\d+\.|[•\-\*])\s/m);
        if (isList) {
          const items = block.split(/\n(?=(\d+\.|[•\-\*])\s)/).filter(i => i && !i.match(/^(\d+\.|[•\-\*])$/));
          return (
            <ul key={idx} className="space-y-3 my-6 pl-2">
              {items.map((item, i) => (
                <li key={i} className="flex gap-4 items-start group">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2.5 shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                  <div className="flex-1">
                    <TextProcessor text={item.replace(/^(\d+\.|[•\-\*])\s*/, '')} glossary={glossary} onTermClick={onTermClick} searchTerm={searchTerm} userHighlights={userHighlights} />
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <TextProcessor text={block} glossary={glossary} onTermClick={onTermClick} searchTerm={searchTerm} userHighlights={userHighlights} />
          </p>
        );
      })}
    </div>
  );
};

const QuizBlock: React.FC<{ 
  questions: QuizQuestion[], 
  t: TranslationDictionary, 
  onComplete: () => void 
}> = ({ questions, t, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = () => {
    if (selectedOption === null) return;
    if (selectedOption === questions[currentQuestionIndex].correctAnswerIndex) setScore(s => s + 1);
    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      onComplete();
    }
  };

  if (showResults) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl animate-fade-in">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
          <Award size={32} className="text-orange-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.course.moduleCompleted}</h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold">{t.course.score}: <span className="text-orange-600">{score} / {questions.length}</span></p>
        </div>
        <button onClick={() => { setCurrentQuestionIndex(0); setShowResults(false); setScore(0); setSelectedOption(null); setIsAnswered(false); }} className="w-full py-3 bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20">
          {t.course.retry}
        </button>
      </div>
    );
  }

  const q = questions[currentQuestionIndex];

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.course.quizQuestion} {currentQuestionIndex + 1} / {questions.length}</span>
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{q.question}</h3>
      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          let styles = "w-full text-left p-4 rounded-2xl border-2 transition-all font-bold text-sm flex items-center gap-4 ";
          if (isAnswered) {
            if (idx === q.correctAnswerIndex) styles += "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
            else if (idx === selectedOption) styles += "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400";
            else styles += "border-slate-100 dark:border-slate-800 text-slate-400 opacity-50";
          } else {
            styles += selectedOption === idx ? "bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:text-orange-200" : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-800";
          }
          return (
            <button key={idx} disabled={isAnswered} onClick={() => setSelectedOption(idx)} className={styles}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${selectedOption === idx ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end pt-2">
        {!isAnswered ? (
          <button disabled={selectedOption === null} onClick={handleAnswer} className="px-8 py-3 bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-500/20">
            {t.course.checkAnswer}
          </button>
        ) : (
          <button onClick={nextQuestion} className="px-8 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2">
            <span>{currentQuestionIndex < questions.length - 1 ? t.course.nextQuestion : t.course.viewResults}</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export const CourseView: React.FC<CourseViewProps> = ({ 
  course, onBack, t, searchTerm, completedModuleIds, userHighlights = {}, onToggleModule, onUpdateHighlights, onGenerateEbook
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(course.modules[0]?.id || '');
  const [viewMode, setViewMode] = useState<'module' | 'glossary' | 'highlights'>('module');
  const [floatingMenu, setFloatingMenu] = useState<{ x: number, y: number, text: string } | null>(null);
  
  const activeModule = course.modules.find(m => m.id === activeModuleId) || course.modules[0];
  const isModuleCompleted = completedModuleIds.includes(activeModule.id);
  const moduleHighlights = userHighlights[activeModule.id] || [];

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setFloatingMenu({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY - 50,
          text: selection.toString().trim()
        });
      } else {
        setFloatingMenu(null);
      }
    };
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const addHighlight = () => {
    if (!floatingMenu) return;
    const current = [...moduleHighlights];
    if (!current.includes(floatingMenu.text)) {
      onUpdateHighlights(activeModule.id, [...current, floatingMenu.text]);
    }
    setFloatingMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in relative pb-20">
      {floatingMenu && (
        <button 
          onClick={addHighlight}
          className="fixed z-50 bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl text-[11px] font-black uppercase tracking-widest transform -translate-x-1/2 flex items-center gap-2 animate-fade-in-up border border-white/10"
          style={{ left: floatingMenu.x, top: floatingMenu.y }}
        >
          <Highlighter size={14} className="text-orange-500" />
          Resaltar
        </button>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors text-xs font-black uppercase tracking-widest mb-2 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t.course.back}</span>
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{course.title}</h1>
        </div>
        <button onClick={onGenerateEbook} className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 shadow-xl shadow-orange-500/20 transition-all active:scale-95">
          <BookOpen size={18} />
          <span>{t.ebook.generate}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-1/4 space-y-6">
          <div className="sticky top-24">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">{t.sidebar.courseContent}</h3>
            <nav className="space-y-2">
              {course.modules.map((mod, idx) => (
                <button 
                  key={mod.id} 
                  onClick={() => { setViewMode('module'); setActiveModuleId(mod.id); }} 
                  className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all group ${activeModuleId === mod.id && viewMode === 'module' ? 'bg-orange-600 text-white shadow-xl shadow-orange-500/20 scale-[1.02]' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-orange-500/50 hover:bg-orange-50/30'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${activeModuleId === mod.id && viewMode === 'module' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    {completedModuleIds.includes(mod.id) ? <Check size={16} className="text-emerald-500" /> : idx + 1}
                  </div>
                  <span className="font-bold text-sm leading-tight flex-1">{mod.title}</span>
                </button>
              ))}
              
              <div className="grid grid-cols-2 gap-2 mt-6">
                <button onClick={() => setViewMode('glossary')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all border ${viewMode === 'glossary' ? 'bg-orange-600 text-white border-orange-500 shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-orange-500/50'}`}>
                  <Book size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.course.glossary}</span>
                </button>
                <button onClick={() => setViewMode('highlights')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all border ${viewMode === 'highlights' ? 'bg-orange-600 text-white border-orange-500 shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-orange-500/50'}`}>
                  <Highlighter size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Mis Notas</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        <div className="lg:w-3/4 space-y-12">
          {viewMode === 'glossary' ? (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in-up">
               <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">{t.course.glossaryTitle}</h2>
               <div className="grid gap-4">
                {course.glossary.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-orange-500/30 transition-colors">
                    <p className="text-orange-600 dark:text-orange-400 font-black text-sm mb-2 uppercase tracking-widest">{item.term}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed font-medium">{item.definition}</p>
                  </div>
                ))}
               </div>
            </div>
          ) : viewMode === 'highlights' ? (
             <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in-up">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Notas Resaltadas</h2>
                <div className="space-y-8">
                  {Object.entries(userHighlights || {}).map(([id, items]) => (items as string[]).length > 0 && (
                    <div key={id} className="space-y-4">
                       <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border-b pb-2">{course.modules.find(m => m.id === id)?.title}</p>
                       <div className="grid gap-3">
                         {(items as string[]).map((item, i) => (
                           <div key={i} className="flex justify-between items-center bg-orange-50/50 dark:bg-orange-900/10 p-5 rounded-2xl border-l-4 border-orange-500 shadow-sm group">
                             <span className="text-slate-700 dark:text-slate-200 font-medium italic">"{item}"</span>
                             <button onClick={() => onUpdateHighlights(id, (items as string[]).filter(h => h !== item))} className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-100 rounded-full transition-all">
                               <X size={18} />
                             </button>
                           </div>
                         ))}
                       </div>
                    </div>
                  ))}
                  {Object.values(userHighlights).every(arr => (arr as string[]).length === 0) && (
                    <div className="p-20 text-center text-slate-400 space-y-4">
                      <Highlighter size={48} className="mx-auto opacity-20" />
                      <p className="font-bold">Aún no has resaltado ningún contenido.</p>
                    </div>
                  )}
                </div>
             </div>
          ) : (
            <article className="space-y-12">
              <div className="relative p-8 md:p-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-[2.5rem] text-white shadow-2xl overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
                    <Sparkles size={120} />
                 </div>
                 <div className="relative z-10 space-y-4">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                     <Target size={14} />
                     <span>Lo más importante</span>
                   </div>
                   <p className="text-2xl md:text-3xl font-black leading-tight italic">
                     <TextProcessor text={`"${activeModule.keyTakeaway}"`} glossary={course.glossary} onTermClick={() => setViewMode('glossary')} userHighlights={[]} forceBold={true} />
                   </p>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                <MarkdownRenderer 
                  content={activeModule.contentMarkdown} 
                  glossary={course.glossary} 
                  onTermClick={() => setViewMode('glossary')} 
                  searchTerm={searchTerm}
                  userHighlights={moduleHighlights}
                />
                
                <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                  <button 
                    onClick={() => onToggleModule(activeModule.id)} 
                    className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${isModuleCompleted ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20'}`}
                  >
                    {isModuleCompleted ? <CheckCircle size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                    <span>{isModuleCompleted ? 'Completado' : 'Marcar como completado'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col items-center space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t.course.quizTitle}</h3>
                  <div className="w-12 h-1.5 bg-orange-500 rounded-full" />
                </div>
                <QuizBlock key={activeModule.id} questions={activeModule.quiz} t={t} onComplete={() => !isModuleCompleted && onToggleModule(activeModule.id)} />
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
};
