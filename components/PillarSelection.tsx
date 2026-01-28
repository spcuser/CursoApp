
import React, { useState, useRef } from 'react';
import { Pillar, TranslationDictionary } from '../types';
import { Target, ArrowRight, Layers, Download, Loader2, Square, Sparkles } from 'lucide-react';

// Add missing PillarSelectionProps interface
interface PillarSelectionProps {
  topic: string;
  pillars: Pillar[];
  relatedTopics: string[];
  onSelect: (pillar: Pillar) => void;
  onSelectTopic: (topic: string) => void;
  language: string;
  t: TranslationDictionary;
  searchTerm: string;
}

export const PillarSelection: React.FC<PillarSelectionProps> = ({ topic, pillars, relatedTopics, onSelect, onSelectTopic, language, t, searchTerm }) => {
  const [downloadingPillarId, setDownloadingPillarId] = useState<string | null>(null);
  
  const highlightMatch = (text: string) => {
    if (!searchTerm || searchTerm.length < 2) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((p, i) => 
          regex.test(p) ? (
            <mark key={i} className="bg-orange-100 dark:bg-orange-500/30 text-orange-900 dark:text-orange-100 rounded-[2px] px-[2px] mx-[-1px] font-medium border-b border-orange-300">
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium">
          <Target size={14} />
          <span>{t.steps.step1}</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.pillars.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          {t.pillars.subtitle} <span className="font-semibold text-orange-600">"{topic}"</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((pillar) => (
          <div key={pillar.id} className="relative group flex flex-col h-full">
            <button
              onClick={() => onSelect(pillar)}
              className="flex-1 flex flex-col items-start p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 text-left w-full"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 pointer-events-none">
                <ArrowRight size={24} />
              </div>
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-50 transition-colors mb-4 shrink-0">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-700 transition-colors pr-6">
                {highlightMatch(pillar.title)}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                {highlightMatch(pillar.description)}
              </p>
            </button>
            <div className="absolute bottom-4 right-4 z-10">
              <button className="p-2 rounded-full bg-white dark:bg-slate-700 text-orange-600 border border-slate-200 hover:bg-orange-50"><Download size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
