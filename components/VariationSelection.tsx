
import React from 'react';
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
      <div className="flex items-start justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
          <span>{t.variations.back}</span>
        </button>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
          <BookOpen size={14} />
          <span>{t.steps.step2}</span>
        </div>
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.variations.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          {t.variations.subtitle} <span className="font-semibold text-slate-900 dark:text-slate-200">"{pillar.title}"</span>
        </p>

        {/* Depth Selector */}
        <div className="bg-white dark:bg-slate-800 p-1 inline-flex rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
          <button
            onClick={() => setDepth('express')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              depth === 'express' 
                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Zap size={16} />
            {t.variations.depth.express}
          </button>
          <button
            onClick={() => setDepth('standard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              depth === 'standard' 
                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Layers size={16} />
            {t.variations.depth.standard}
          </button>
          <button
            onClick={() => setDepth('deep')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              depth === 'deep' 
                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Book size={16} />
            {t.variations.depth.deep}
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {depth === 'express' && t.variations.depth.expressDesc}
          {depth === 'standard' && t.variations.depth.standardDesc}
          {depth === 'deep' && t.variations.depth.deepDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variations.map((variation) => (
          <button
            key={variation.id}
            onClick={() => onSelect(variation, depth)}
            className="flex flex-col p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg hover:ring-1 hover:ring-purple-400 dark:hover:ring-purple-500 transition-all text-left group"
          >
            <div className="flex justify-between items-start mb-2 w-full">
              <span className={`
                text-xs font-semibold px-2 py-1 rounded-md
                ${variation.level === 'Principiante' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                  variation.level === 'Intermedio' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
              `}>
                {variation.level}
              </span>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-400">
              {highlightMatch(variation.title)}
            </h3>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow">
              {highlightMatch(variation.description)}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-4 w-full">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{variation.targetAudience}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
import { useState } from 'react';
