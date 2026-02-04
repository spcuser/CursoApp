
import React, { useState } from 'react';
import { Pillar, Variation, CourseDepth, TranslationDictionary } from '../types';
import { BookOpen, ArrowLeft, BarChart, Clock, Users, ArrowRight, Zap, Layers, Book, CheckCircle2, AlertCircle } from 'lucide-react';

interface VariationSelectionProps {
  pillar: Pillar;
  variations: Variation[];
  onSelect: (variation: Variation, depth: CourseDepth) => void;
  onBack: () => void;
  t: TranslationDictionary;
  searchTerm?: string;
  variationScores?: Record<string, { score: number; total: number }>;
}

const cleanMarkdown = (text: string = '') => {
  if (!text) return "";
  return text.toString().replace(/\*\*/g, '').replace(/__/g, '').replace(/###/g, '').replace(/##/g, '').replace(/#/g, '');
};

export const VariationSelection: React.FC<VariationSelectionProps> = ({ pillar, variations, onSelect, onBack, t, searchTerm, variationScores = {} }) => {
  const [depth, setDepth] = useState<CourseDepth>('standard');

  const highlightMatch = (text: string = '') => {
    const cleaned = cleanMarkdown(text);
    const term = searchTerm?.trim();
    if (!term || term.length < 2) return cleaned;
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeTerm})`, 'gi');
    const parts = cleaned.split(regex);
    return (
      <span>
        {parts.map((p, i) => 
          regex.test(p) ? (
            <mark key={i} className="bg-orange-500/30 text-orange-100 rounded-[2px] px-[2px] mx-[-1px] font-medium border-b border-orange-300">
              {p}
            </mark>
          ) : p
        )}
      </span>
    );
  };

  return (
    <div className="space-y-12 animate-fade-in-up px-6 py-8">
      <div className="flex items-start justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-slate-400 hover:text-orange-500 transition-all px-5 py-2.5 rounded-xl hover:bg-[#444444] font-bold text-lg"
        >
          <ArrowLeft size={22} />
          <span>{t.variations.back}</span>
        </button>
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 text-orange-400 text-sm font-black uppercase tracking-widest border border-orange-500/20">
          <BookOpen size={16} />
          <span>{t.steps.step2}</span>
        </div>
      </div>

      <div className="text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-6xl font-black text-white tracking-tighter">{t.variations.title}</h2>
        <p className="text-white text-2xl font-medium">
          {t.variations.subtitle} <span className="font-black text-orange-500">"{cleanMarkdown(pillar?.title)}"</span>
        </p>

        <div className="bg-[#444444] p-2 inline-flex rounded-2xl shadow-2xl mt-[30px] border border-white/5">
          <button onClick={() => setDepth('express')} className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold transition-all ${depth === 'express' ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-300 hover:bg-white/5'}`}><Zap size={18} />{t.variations.depth.express}</button>
          <button onClick={() => setDepth('standard')} className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold transition-all ${depth === 'standard' ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-300 hover:bg-white/5'}`}><Layers size={18} />{t.variations.depth.standard}</button>
          <button onClick={() => setDepth('deep')} className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold transition-all ${depth === 'deep' ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-300 hover:bg-white/5'}`}><Book size={18} />{t.variations.depth.deep}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[27px] pt-8">
        {(Array.isArray(variations) ? variations : []).map((v) => v && (
          <button key={v.id} onClick={() => onSelect(v, depth)} className="flex flex-col p-10 bg-[#444444] border border-white/5 rounded-[3rem] hover:border-orange-500/50 hover:shadow-2xl transition-all text-left group relative overflow-hidden active:scale-[0.98] mx-[5px]">
            <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0"><ArrowRight size={32} className="text-orange-500" /></div>
            <div className="flex justify-between items-start mb-6 gap-4">
              <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${v.level === 'Principiante' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' : v.level === 'Intermedio' ? 'bg-amber-900/20 text-amber-400 border-amber-800/50' : 'bg-rose-900/20 text-rose-400 border-rose-800/50'}`}>{v.level || 'General'}</span>
              {variationScores?.[v.id] && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-white ${variationScores[v.id].score === variationScores[v.id].total ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                  <span className="text-xs font-black">{variationScores[v.id].score} / {variationScores[v.id].total}</span>
                </div>
              )}
            </div>
            <h3 className="text-3xl font-black text-white mb-4 group-hover:text-orange-500 tracking-tight leading-tight pr-8">{highlightMatch(v.title || "")}</h3>
            <p className="text-slate-300 text-xl mb-10 leading-relaxed line-clamp-3 font-medium">{highlightMatch(v.description || "")}</p>
            <div className="mt-auto flex items-center gap-4 text-sm font-bold text-slate-400 border-t border-white/5 pt-8"><Users size={20} className="text-orange-500" /><span className="uppercase tracking-widest">{v.targetAudience || 'Todos'}</span></div>
          </button>
        ))}
      </div>
    </div>
  );
};
