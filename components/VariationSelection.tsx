
import React, { useState } from 'react';
import { Pillar, Variation, CourseDepth, TranslationDictionary } from '../types';
import { BookOpen, ArrowLeft, BarChart, Clock, Users, ArrowRight, Zap, Layers, Book } from 'lucide-react';

interface VariationSelectionProps {
  pillar: Pillar;
  variations: Variation[];
  onSelect: (variation: Variation, depth: CourseDepth) => void;
  onBack: () => void;
  t: TranslationDictionary;
  searchTerm?: string;
}

export const VariationSelection: React.FC<VariationSelectionProps> = ({ pillar, variations, onSelect, onBack, t, searchTerm }) => {
  const [depth, setDepth] = useState<CourseDepth>('standard');

  const highlightMatch = (text: string) => {
    if (!searchTerm || searchTerm.length < 2) return text;
    const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeTerm})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((p, i) => 
          regex.test(p) ? (
            <mark key={i} className="bg-orange-100 dark:bg-orange-500/30 text-orange-900 dark:text-orange-100 rounded-[2px] px-[2px] mx-[-1px] font-medium border-b border-orange-300 dark:border-orange-700/50">
              {p}
            </mark>
          ) : p
        )}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
        >
          <ArrowLeft size={18} />
          <span>{t.variations.back}</span>
        </button>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-black uppercase tracking-wider border border-orange-100 dark:border-orange-800/50">
          <BookOpen size={14} />
          <span>{t.steps.step2}</span>
        </div>
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t.variations.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          {t.variations.subtitle} <span className="font-bold text-orange-600">"{pillar.title}"</span>
        </p>

        <div className="bg-white dark:bg-slate-800 p-1.5 inline-flex rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
          <button
            onClick={() => setDepth('express')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              depth === 'express' 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Zap size={16} />
            {t.variations.depth.express}
          </button>
          <button
            onClick={() => setDepth('standard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              depth === 'standard' 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Layers size={16} />
            {t.variations.depth.standard}
          </button>
          <button
            onClick={() => setDepth('deep')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              depth === 'deep' 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Book size={16} />
            {t.variations.depth.deep}
          </button>
        </div>
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 italic">
          {depth === 'express' && t.variations.depth.expressDesc}
          {depth === 'standard' && t.variations.depth.standardDesc}
          {depth === 'deep' && t.variations.depth.deepDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variations.map((variation) => (
          <button
            key={variation.id}
            onClick={() => onSelect(variation, depth)}
            className="flex flex-col p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-2xl transition-all text-left group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
              <ArrowRight size={24} className="text-orange-500" />
            </div>

            <div className="flex justify-between items-start mb-4">
              <span className={`
                text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border
                ${variation.level === 'Principiante' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' : 
                  variation.level === 'Intermedio' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' : 
                  'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50'}
              `}>
                {variation.level}
              </span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 transition-colors leading-tight">
              {highlightMatch(variation.title)}
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed line-clamp-3">
              {highlightMatch(variation.description)}
            </p>

            <div className="mt-auto flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-700/50 pt-6">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-orange-400" />
                <span>{variation.targetAudience}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
