
import React, { useState, useMemo } from 'react';
import { Pillar, TranslationDictionary } from '../types';
import { Target, ArrowRight, Layers, Sparkles, Zap, ChevronRight } from 'lucide-react';

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

export const PillarSelection: React.FC<PillarSelectionProps> = ({ 
  topic, 
  pillars, 
  relatedTopics, 
  onSelect, 
  onSelectTopic, 
  t, 
  searchTerm 
}) => {
  const suggestedTopics = useMemo(() => {
    return [...relatedTopics]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [relatedTopics]);

  const highlightMatch = (text: string) => {
    if (!searchTerm || searchTerm.length < 2) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
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
    <div className="space-y-12 animate-fade-in-up pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
          <Target size={14} />
          <span>{t.steps.step1}</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">{t.pillars.title}</h2>
        <p className="text-slate-400 text-lg">
          {t.pillars.subtitle} <span className="font-black text-orange-500">"{topic}"</span>
        </p>
      </div>

      {/* MARGEN DE 30PX SOLICITADO ENTRE ENCABEZADO Y CONTENIDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[19px] mt-[30px]">
        {pillars.map((pillar) => (
          <div key={pillar.id} className="relative group flex flex-col h-full">
            <button
              onClick={() => onSelect(pillar)}
              className="flex-1 flex flex-col items-start p-8 bg-[#444444] border border-white/5 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-orange-500 transition-all duration-500 text-left w-[calc(100%-10px)] overflow-hidden mx-[5px]"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 text-orange-500">
                <ArrowRight size={28} />
              </div>
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all mb-6 shrink-0 shadow-inner">
                <Layers size={28} />
              </div>
              <h3 className="text-xl font-black text-white mb-3 group-hover:text-orange-500 transition-colors pr-6 leading-tight">
                {highlightMatch(pillar.title)}
              </h3>
              <p className="text-slate-300 text-sm font-medium leading-relaxed mb-8 line-clamp-4">
                {highlightMatch(pillar.description)}
              </p>
              
              <div className="mt-auto pt-4 border-t border-white/5 w-full">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  <span>Explorar este pilar</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {suggestedTopics.length > 0 && (
        <div className="pt-12 border-t border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-orange-500">
                <Sparkles size={18} className="animate-pulse" />
                <h3 className="text-xl font-black text-white tracking-tight">{t.pillars.relatedTitle}</h3>
              </div>
              <p className="text-sm text-slate-500 font-bold">{t.pillars.relatedSubtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[11px]">
            {suggestedTopics.map((related, idx) => (
              <button
                key={idx}
                onClick={() => onSelectTopic(related)}
                className="group flex items-center justify-between p-5 bg-[#444444] border border-white/5 rounded-2xl hover:border-orange-500 hover:shadow-lg transition-all text-left w-[calc(100%-10px)] mx-[5px]"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Zap size={14} />
                  </div>
                  <span className="text-sm font-black text-slate-200 truncate pr-2 group-hover:text-orange-500 transition-colors">
                    {related}
                  </span>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
