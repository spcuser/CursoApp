
import React, { useState, useRef } from 'react';
import { Pillar, TranslationDictionary } from '../types';
import { Target, ArrowRight, Layers, Download, Loader2, Square, Sparkles } from 'lucide-react';
import { jsPDF } from "jspdf";
import { generateVariations, generateCourse } from '../services/geminiService';

interface PillarSelectionProps {
  topic: string;
  pillars: Pillar[];
  relatedTopics: string[];
  onSelect: (pillar: Pillar) => void;
  onSelectTopic: (topic: string) => void;
  language: string;
  t: TranslationDictionary;
  searchTerm?: string;
}

export const PillarSelection: React.FC<PillarSelectionProps> = ({ topic, pillars, relatedTopics, onSelect, onSelectTopic, language, t, searchTerm }) => {
  const [downloadingPillarId, setDownloadingPillarId] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const cancelRef = useRef(false);
  
  const handleDownloadPillar = async (e: React.MouseEvent, pillar: Pillar) => {
    e.stopPropagation(); 
    if (downloadingPillarId === pillar.id) { cancelRef.current = true; setLoadingStep('Deteniendo...'); return; }
    if (downloadingPillarId !== null) return; 

    setDownloadingPillarId(pillar.id);
    setLoadingStep(t.pillars.generating);
    cancelRef.current = false;

    try {
      const variations = await generateVariations(pillar.title, topic, language);
      if (cancelRef.current) throw new Error("CANCELLED");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const bottomLimit = pageHeight - 25; 
      const width = pageWidth - (margin * 2);
      let cursorY = 20;

      const checkPageBreak = (h: number) => {
        if (cursorY + h > bottomLimit) { doc.addPage(); cursorY = 20; return true; }
        return false;
      };

      const cleanMD = (txt: string) => (txt || "").replace(/#{1,6}\s?/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/`/g, '').trim();

      doc.setFillColor(15, 23, 42); doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(32);
      const mainLines = doc.splitTextToSize(`Estrategia: ${pillar.title}`, width);
      doc.text(mainLines, pageWidth / 2, 80, { align: 'center' });
      doc.setFontSize(14); doc.setTextColor(148, 163, 184);
      doc.text(`TEMA MAESTRO: ${topic.toUpperCase()}`, pageWidth / 2, 90 + (mainLines.length * 10), { align: 'center' });
      doc.addPage();

      for (let i = 0; i < variations.length; i++) {
        if (cancelRef.current) break;
        setLoadingStep(`${i + 1}/${variations.length}...`);
        const course = await generateCourse(variations[i].title, variations[i].description, topic, 'standard', language);
        
        cursorY = 20;
        doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(79, 70, 229);
        const vTitleLines = doc.splitTextToSize(`${i + 1}. ${course.title}`, width);
        doc.text(vTitleLines, margin, cursorY);
        cursorY += (vTitleLines.length * 9) + 10;

        course.modules.forEach(mod => {
          checkPageBreak(20);
          doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(30, 41, 59);
          const mTitleLines = doc.splitTextToSize(mod.title, width);
          doc.text(mTitleLines, margin, cursorY);
          cursorY += (mTitleLines.length * 8) + 5;

          doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(51, 65, 85);
          const paraLines = doc.splitTextToSize(cleanMD(mod.contentMarkdown), width);
          paraLines.forEach(line => {
            checkPageBreak(7);
            doc.text(line, margin, cursorY);
            cursorY += 7;
          });
          cursorY += 10;
        });
        if (i < variations.length - 1) doc.addPage();
      }

      const pages = doc.internal.pages.length - 1;
      for (let p = 1; p <= pages; p++) {
        doc.setPage(p); doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`${p} / ${pages}`, pageWidth / 2, pageHeight - 12.5, { align: 'center' });
      }

      doc.save(`Estrategia_${pillar.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err: any) { if (err.message !== "CANCELLED") alert("Error."); } finally { setDownloadingPillarId(null); setLoadingStep(''); }
  };

  const highlightMatch = (text: string) => {
    if (!searchTerm || searchTerm.length < 2) return text;
    const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeTerm})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((p, i) => 
          regex.test(p) ? (
            <mark key={i} className="bg-yellow-100 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-100 rounded-[2px] px-[2px] mx-[-1px] font-medium border-b border-yellow-300 dark:border-yellow-700/50">
              {p}
            </mark>
          ) : p
        )}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
          <Target size={14} />
          <span>{t.steps.step1}</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.pillars.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          {t.pillars.subtitle} <span className="font-semibold text-slate-900 dark:text-slate-200">"{topic}"</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">Sin resultados.</div>
        ) : pillars.map((pillar) => (
          <div key={pillar.id} className="relative group flex flex-col h-full">
            <button
              onClick={() => onSelect(pillar)}
              className="flex-1 flex flex-col items-start p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 text-left w-full"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 pointer-events-none">
                <ArrowRight size={24} />
              </div>
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors mb-4 shrink-0">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors pr-6">
                {highlightMatch(pillar.title)}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                {highlightMatch(pillar.description)}
              </p>
            </button>
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
               {downloadingPillarId === pillar.id && (
                  <span className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded shadow-sm">
                    <Loader2 size={12} className="animate-spin" />
                    {loadingStep}
                  </span>
               )}
              <button
                onClick={(e) => handleDownloadPillar(e, pillar)}
                disabled={downloadingPillarId !== null && downloadingPillarId !== pillar.id}
                className={`p-2 rounded-full transition-all shadow-sm border
                  ${downloadingPillarId === pillar.id 
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200' 
                    : 'bg-white dark:bg-slate-700 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-slate-200 dark:border-slate-600'
                  } ${downloadingPillarId !== null && downloadingPillarId !== pillar.id ? 'opacity-30' : ''}`}
              >
                {downloadingPillarId === pillar.id ? <Square size={18} className="fill-current" /> : <Download size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
