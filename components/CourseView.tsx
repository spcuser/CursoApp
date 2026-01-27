
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Course, CourseModule, QuizQuestion, TranslationDictionary, GlossaryTerm } from '../types';
import { CheckCircle, HelpCircle, ArrowLeft, Award, BookOpen, ChevronRight, Download, Book, Check, Highlighter, X, ListFilter } from 'lucide-react';
import { jsPDF } from "jspdf";

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

const highlightText = (text: string, searchTerms?: string[], searchTerm?: string, onRemoveHighlight?: (text: string) => void) => {
  if ((!searchTerm || searchTerm.length < 2) && (!searchTerms || searchTerms.length === 0)) return text;
  
  const allTerms = [
    ...(searchTerm ? [searchTerm] : []),
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
          <mark 
            key={i} 
            onClick={() => !isSearchTerm && onRemoveHighlight?.(part)}
            title={isSearchTerm ? undefined : "Haz clic para eliminar este resaltado"}
            className={`
              rounded-[2px] px-[2px] mx-[-1px] font-medium transition-all
              ${isSearchTerm 
                ? 'bg-yellow-200/80 dark:bg-yellow-500/50 text-yellow-900 dark:text-yellow-100 border-b border-yellow-400' 
                : 'bg-yellow-100/60 dark:bg-yellow-600/30 text-slate-800 dark:text-slate-100 border-b border-yellow-300/50 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-200 hover:border-red-400'}
            `}
          >
            {part}
          </mark>
        );
      })}
    </span>
  );
};

const TextProcessor: React.FC<{ text: string, color: string, glossary: GlossaryTerm[], onTermClick: () => void, searchTerm?: string, userHighlights: string[], onRemoveHighlight: (txt: string) => void }> = ({ text, color, glossary, onTermClick, searchTerm, userHighlights, onRemoveHighlight }) => {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return (<>{boldParts.map((part, i) => {
    const isBold = part.startsWith('**') && part.endsWith('**');
    const content = isBold ? part.slice(2, -2) : part;
    
    const processContent = (inner: string) => {
      if (!glossary || glossary.length === 0) return highlightText(inner, userHighlights, searchTerm, onRemoveHighlight);
      
      const sortedTerms = [...glossary].sort((a, b) => b.term.length - a.term.length);
      const pattern = new RegExp(`\\b(${sortedTerms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
      const termParts = inner.split(pattern);
      
      return termParts.map((tp, j) => {
        const termObj = sortedTerms.find(t => t.term.toLowerCase() === tp.toLowerCase());
        if (termObj) return (
          <button key={j} onClick={onTermClick} className={`font-medium text-${color}-600 dark:text-${color}-400 hover:underline decoration-dotted decoration-2 underline-offset-2 cursor-pointer bg-${color}-50/50 dark:bg-${color}-900/20 px-1 rounded transition-colors inline`} title={termObj.definition}>
            {highlightText(tp, userHighlights, searchTerm, onRemoveHighlight)}
          </button>
        );
        return highlightText(tp, userHighlights, searchTerm, onRemoveHighlight);
      });
    };
    
    return isBold ? (<strong key={i} className="font-bold text-slate-900 dark:text-white">{processContent(content)}</strong>) : (<span key={i}>{processContent(content)}</span>);
  })}</>);
};

const MarkdownRenderer: React.FC<{ content: string, color: string, glossary: GlossaryTerm[], onTermClick: () => void, searchTerm?: string, userHighlights: string[], onRemoveHighlight: (txt: string) => void }> = ({ content, color, glossary, onTermClick, searchTerm, userHighlights, onRemoveHighlight }) => {
  const sanitizedContent = content.replace(/\\n/g, '\n');
  const blocks = sanitizedContent.split(/\n\s*\n/).map(b => b.trim()).filter(b => b !== '');
  
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
      {blocks.map((block, idx) => {
        if (block.startsWith('#')) {
          const match = block.match(/^(#+)\s*(.*)/);
          if (match) {
            const level = match[1].length;
            const text = match[2];
            const Tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3' as any;
            return (
              <Tag key={idx} className={`${level === 1 ? 'text-4xl' : level === 2 ? 'text-3xl' : 'text-2xl'} font-black text-slate-900 dark:text-white mt-10 mb-5 pb-2 border-b border-slate-100 dark:border-slate-800`}>
                <TextProcessor text={text} color={color} glossary={glossary} onTermClick={onTermClick} searchTerm={searchTerm} userHighlights={userHighlights} onRemoveHighlight={onRemoveHighlight} />
              </Tag>
            );
          }
        }
        if (block.includes('\n- ') || block.startsWith('- ') || block.includes('\n* ') || block.startsWith('* ')) {
          const listItems = block.split(/\n[-*]\s*/).filter(i => i.trim());
          return (
            <ul key={idx} className="space-y-3 my-6 pl-4">
              {listItems.map((item, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className={`w-2 h-2 rounded-full bg-${color}-500 shrink-0 mt-3`}></span>
                  <p className="flex-1"><TextProcessor text={item.replace(/^[-*]\s*/, '')} color={color} glossary={glossary} onTermClick={onTermClick} searchTerm={searchTerm} userHighlights={userHighlights} onRemoveHighlight={onRemoveHighlight} /></p>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="leading-relaxed">
            <TextProcessor text={block} color={color} glossary={glossary} onTermClick={onTermClick} searchTerm={searchTerm} userHighlights={userHighlights} onRemoveHighlight={onRemoveHighlight} />
          </p>
        );
      })}
    </div>
  );
};

const QuizBlock: React.FC<{ questions: QuizQuestion[], color: string, t: TranslationDictionary, onComplete: () => void }> = ({ questions, color, t, onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const handleCheck = () => { if (selectedOpt === null) return; if (selectedOpt === questions[currentQ].correctAnswerIndex) setScore(s => s + 1); setShowResult(true); };
  const handleNext = () => { if (currentQ < questions.length - 1) { setCurrentQ(c => c + 1); setSelectedOpt(null); setShowResult(false); } else { setCompleted(true); onComplete(); } };
  
  if (completed) return (<div className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 rounded-xl p-8 text-center`}><div className={`w-16 h-16 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center mx-auto mb-4`}><Award size={32} /></div><h4 className="text-xl font-bold mb-2">{t.course.moduleCompleted}</h4><p className="text-slate-600 mb-4">{t.course.score}: {score} / {questions.length}</p><button onClick={() => { setCompleted(false); setCurrentQ(0); setScore(0); setSelectedOpt(null); setShowResult(false); }} className={`px-6 py-2 rounded-lg bg-${color}-600 text-white font-medium`}>{t.course.retry}</button></div>);
  const q = questions[currentQ];
  return (<div className="bg-white dark:bg-slate-800 border border-slate-200 rounded-xl p-6 shadow-sm"><div className="flex items-center gap-2 mb-6 text-slate-400 text-xs uppercase font-bold"><HelpCircle size={14} /><span>{t.course.quizQuestion} {currentQ + 1} / {questions.length}</span></div><h4 className="text-xl font-bold mb-8">{q.question}</h4><div className="space-y-3 mb-8">{q.options.map((opt, idx) => (<button key={idx} onClick={() => !showResult && setSelectedOpt(idx)} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${selectedOpt === idx ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-900` : 'border-slate-50 dark:border-slate-700/50 hover:border-slate-200'} ${showResult && idx === q.correctAnswerIndex ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}`} disabled={showResult}><div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-xs ${selectedOpt === idx ? `border-${color}-500 text-${color}-600` : 'border-slate-300'}`}>{String.fromCharCode(65 + idx)}</div>{opt}</button>))}</div>{!showResult ? (<button onClick={handleCheck} disabled={selectedOpt === null} className={`w-full py-4 rounded-xl font-bold text-white bg-${color}-600`}>{t.course.checkAnswer}</button>) : (<button onClick={handleNext} className={`w-full py-4 rounded-xl font-bold text-white bg-slate-900 flex items-center justify-center gap-2`}><span>{currentQ < questions.length - 1 ? t.course.nextQuestion : t.course.viewResults}</span><ChevronRight size={20} /></button>)}</div>);
};

export const CourseView: React.FC<CourseViewProps> = ({ 
  course, onBack, t, searchTerm, completedModuleIds, userHighlights = {}, onToggleModule, onUpdateHighlights, onGenerateEbook, language
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(course.modules[0]?.id || '');
  const [viewMode, setViewMode] = useState<'module' | 'glossary' | 'highlights'>('module');
  const [floatingMenu, setFloatingMenu] = useState<{ x: number, y: number, text: string } | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const activeModule = course.modules.find(m => m.id === activeModuleId) || course.modules[0];
  const color = course.primaryColor || 'indigo';
  const isModuleCompleted = completedModuleIds.includes(activeModule.id);
  const moduleHighlights = userHighlights[activeModule.id] || [];

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setFloatingMenu(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setFloatingMenu({
      x: rect.left + (rect.width / 2),
      y: rect.top - 45 + window.scrollY,
      text: selection.toString().trim()
    });
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, []);

  const addHighlight = () => {
    if (!floatingMenu) return;
    const textToHighlight = floatingMenu.text;
    const currentHighlights = [...moduleHighlights];
    if (!currentHighlights.includes(textToHighlight)) {
      currentHighlights.push(textToHighlight);
      onUpdateHighlights(activeModule.id, currentHighlights);
    }
    setFloatingMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const removeHighlight = (textToRemove: string) => {
    const currentHighlights = moduleHighlights.filter(h => h !== textToRemove);
    onUpdateHighlights(activeModule.id, currentHighlights);
  };

  const filteredGlossary = useMemo(() => {
    const sorted = [...course.glossary].sort((a, b) => a.term.localeCompare(b.term, 'es'));
    if (!searchTerm?.trim()) return sorted;
    const s = searchTerm.toLowerCase();
    return sorted.filter(item => item.term.toLowerCase().includes(s) || item.definition.toLowerCase().includes(s));
  }, [course.glossary, searchTerm]);

  const handleDownloadStandardPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomLimit = pageHeight - 25; 
    const width = pageWidth - (margin * 2);
    let y = 30;

    const clean = (txt: string) => (txt || "").replace(/#{1,6}\s?/g, '').replace(/\*\*/g, '').replace(/\*\*/g, '').replace(/__/g, '').replace(/`/g, '').trim();

    doc.setFont("helvetica", "bold"); doc.setFontSize(24);
    const titleLines = doc.splitTextToSize(course.title, width);
    doc.text(titleLines, margin, y);
    y += (titleLines.length * 10) + 15;

    course.modules.forEach((mod, i) => {
      if (y > bottomLimit - 20) { doc.addPage(); y = 30; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(79, 70, 229);
      doc.text(`${i+1}. ${mod.title}`, margin, y);
      y += 12;

      doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(clean(mod.contentMarkdown), width);
      lines.forEach(line => {
        if (y > bottomLimit) { doc.addPage(); y = 30; }
        doc.text(line, margin, y);
        y += 7;
      });
      y += 15;
    });

    doc.save(`${course.title.replace(/\s+/g, '_')}_Curso.pdf`);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-6 relative">
      {/* Floating Marker Tooltip */}
      {floatingMenu && (
        <div 
          className="fixed z-[100] transform -translate-x-1/2 animate-fade-in-up"
          style={{ left: floatingMenu.x, top: floatingMenu.y }}
        >
          <button 
            onMouseDown={(e) => { e.preventDefault(); addHighlight(); }}
            className="flex items-center gap-2 bg-slate-900 dark:bg-slate-950 text-white px-5 py-3 rounded-full shadow-2xl hover:bg-indigo-600 transition-all text-[11px] font-black uppercase tracking-widest border border-white/20 active:scale-95"
          >
            <Highlighter size={16} className="text-yellow-400 fill-current" />
            <span>Resaltar</span>
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 mb-3 text-sm font-medium"><ArrowLeft size={16} /><span>{t.course.back}</span></button>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-1">{highlightText(course.title, moduleHighlights, searchTerm, removeHighlight)}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">{highlightText(course.subtitle, moduleHighlights, searchTerm, removeHighlight)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onGenerateEbook} className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all font-black text-xs uppercase tracking-wider"><BookOpen size={20} className="stroke-[2.5]" /><span>{t.ebook.generate}</span></button>
          <button onClick={handleDownloadStandardPDF} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-xs uppercase"><Download size={18} /><span>{t.course.download}</span></button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-1/4 space-y-6">
          <div className="sticky top-24">
            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4 px-2">{t.course.tableOfContents}</h3>
            <nav className="space-y-3">
              {course.modules.map((mod, idx) => (
                <button key={mod.id} onClick={() => { setViewMode('module'); setActiveModuleId(mod.id); }} className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 border shadow-sm group min-h-[70px] ${activeModuleId === mod.id && viewMode === 'module' ? `bg-${color}-600 border-${color}-500 text-white` : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${activeModuleId === mod.id && viewMode === 'module' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>{completedModuleIds.includes(mod.id) ? <Check size={16} /> : idx + 1}</div>
                  <span className="text-sm font-bold whitespace-normal leading-tight flex-1">{mod.title}</span>
                </button>
              ))}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button onClick={() => setViewMode('glossary')} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl transition-all border shadow-sm min-h-[140px] text-center ${viewMode === 'glossary' ? `bg-${color}-600 border-${color}-500 text-white` : 'bg-slate-100/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${viewMode === 'glossary' ? 'bg-white/20' : 'bg-white dark:bg-slate-700 text-slate-500'}`}><Book size={24} /></div>
                  <span className="text-[11px] font-black uppercase tracking-widest leading-tight px-2">{t.course.glossary}</span>
                </button>
                <button onClick={() => setViewMode('highlights')} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl transition-all border shadow-sm min-h-[140px] text-center ${viewMode === 'highlights' ? `bg-${color}-600 border-${color}-500 text-white` : 'bg-slate-100/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${viewMode === 'highlights' ? 'bg-white/20' : 'bg-white dark:bg-slate-700 text-slate-500'}`}><Highlighter size={24} /></div>
                  <span className="text-[11px] font-black uppercase tracking-widest leading-tight px-2">Mis Resaltados</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        <div className="lg:w-3/4 space-y-12 pb-24">
          {viewMode === 'glossary' ? (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-[3rem] shadow-sm border border-slate-100 animate-fade-in-up">
               <button onClick={() => setViewMode('module')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-bold text-sm group">
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Volver al contenido</span>
               </button>
               <h2 className="text-4xl font-black mb-12">{t.course.glossaryTitle}</h2>
               <div className="grid grid-cols-1 gap-6">
                {filteredGlossary.length === 0 ? <p className="text-slate-400">{t.course.glossaryEmpty}</p> : filteredGlossary.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/30 p-10 rounded-[2.5rem] border border-slate-100">
                    <h3 className={`text-2xl font-black text-${color}-700 mb-4`}>{highlightText(item.term, moduleHighlights, searchTerm, removeHighlight)}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">{highlightText(item.definition, moduleHighlights, searchTerm, removeHighlight)}</p>
                  </div>
                ))}
               </div>
            </div>
          ) : viewMode === 'highlights' ? (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-[3rem] shadow-sm border border-slate-100 animate-fade-in-up">
               <button onClick={() => setViewMode('module')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-bold text-sm group">
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Volver al contenido</span>
               </button>
               <h2 className="text-4xl font-black mb-12">Mis Notas Importantes</h2>
               <p className="text-slate-500 mb-8 text-lg">Aquí aparecerán los fragmentos de texto que resaltes durante tu lectura.</p>
               <div className="space-y-8">
                 {Object.entries(userHighlights || {}).length === 0 ? (
                   <div className="p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-slate-400">
                     <Highlighter size={48} className="mx-auto mb-4 opacity-20" />
                     <p>Aún no has resaltado ningún texto. ¡Selecciona algo en el curso para empezar!</p>
                   </div>
                 ) : (
                   (Object.entries(userHighlights || {}) as [string, string[]][]).map(([modId, items]) => {
                     const mod = course.modules.find(m => m.id === modId);
                     return items.length > 0 && (
                       <div key={modId} className="space-y-4">
                         <h4 className="text-xs font-black uppercase text-indigo-500 tracking-widest pl-2">{mod?.title}</h4>
                         <div className="grid gap-4">
                           {items.map((item, i) => (
                             <div key={i} className="group relative bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-[2.5rem] border border-yellow-100 dark:border-yellow-800/50 flex justify-between items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
                               <p className="text-slate-800 dark:text-slate-200 italic text-xl leading-relaxed flex-1">"{item}"</p>
                               <button onClick={() => removeHighlight(item)} className="p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950 rounded-full shrink-0">
                                 <X size={20} />
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   })
                 )}
               </div>
            </div>
          ) : (
            <>
              <div className="relative h-[450px] rounded-[4rem] overflow-hidden shadow-2xl group">
                <img src={`https://picsum.photos/seed/${activeModule.id}/1200/800`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent flex items-end p-12 md:p-16"><h2 className="text-5xl font-black text-white leading-tight">{activeModule.title}</h2></div>
              </div>
              <article className="bg-white dark:bg-slate-800 p-12 md:p-20 rounded-[4rem] shadow-sm border border-slate-100" ref={contentRef}>
                <div className={`bg-${color}-50 dark:bg-${color}-900/20 border-l-[8px] border-${color}-500 p-10 rounded-3xl mb-16`}>
                   <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">{t.course.keyTakeaway}</h4>
                   <p className="text-2xl font-bold italic text-slate-800 dark:text-slate-200">"{activeModule.keyTakeaway}"</p>
                </div>
                <MarkdownRenderer 
                  content={activeModule.contentMarkdown} 
                  color={color} 
                  glossary={course.glossary} 
                  onTermClick={() => setViewMode('glossary')} 
                  searchTerm={searchTerm}
                  userHighlights={moduleHighlights}
                  onRemoveHighlight={removeHighlight}
                />
              </article>
              <div className="flex justify-center pt-10"><button onClick={() => onToggleModule(activeModule.id)} className={`flex items-center gap-4 px-12 py-6 rounded-[2.5rem] font-black text-xl transition-all shadow-xl hover:scale-105 active:scale-95 ${isModuleCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'}`}><CheckCircle size={28} /><span>{isModuleCompleted ? t.course.completed : t.course.markAsCompleted}</span></button></div>
              <div className="pt-24 mt-24 border-t border-slate-200"><h3 className="text-5xl font-black mb-16 text-center">{t.course.quizTitle}</h3><QuizBlock key={activeModule.id} questions={activeModule.quiz} color={color} t={t} onComplete={() => { if (!isModuleCompleted) onToggleModule(activeModule.id); }} /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
