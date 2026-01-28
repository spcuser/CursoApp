
import React from 'react';
import { Pillar, Variation, Course, TranslationDictionary } from '../types';
import { Folder, FolderOpen, FileText, Layout, ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarProps {
  topic: string;
  pillars: Pillar[];
  selectedPillar: Pillar | null;
  variations: Variation[];
  selectedVariation: Variation | null;
  course: Course | null;
  onSelectPillar: (pillar: Pillar) => void;
  onSelectVariation: (variation: Variation) => void;
  isVisible: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  t: TranslationDictionary;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  topic, pillars, selectedPillar, variations, selectedVariation, course, 
  onSelectPillar, onSelectVariation, isVisible, mobileOpen, onCloseMobile, t 
}) => {
  if (!isVisible && !mobileOpen) return null;

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={onCloseMobile} 
        />
      )}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-40 w-80 bg-white dark:bg-slate-900 
        border-l border-slate-200 dark:border-slate-800 transform transition-transform 
        duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} 
        flex flex-col h-full shadow-2xl md:shadow-none
      `}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            {t.sidebar.explorer}
          </h2>
          
          {/* TEMA PRINCIPAL - MEJORA DE LEGIBILIDAD */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 rounded-2xl shadow-sm">
            <div className="flex gap-3">
              <FolderOpen size={18} className="text-orange-600 shrink-0 mt-0.5" />
              <div className="font-bold text-orange-900 dark:text-orange-200 text-sm whitespace-normal leading-tight">
                {topic || t.sidebar.newStrategy}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="space-y-2">
            {pillars.map((pillar) => {
              const isPillarSelected = selectedPillar?.id === pillar.id;
              return (
                <div key={pillar.id} className="space-y-2">
                  <button 
                    onClick={() => onSelectPillar(pillar)} 
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm text-left transition-all
                      ${isPillarSelected 
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 border border-orange-200 dark:border-orange-800/50 font-black shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}
                    `}
                  >
                    <div className="shrink-0">
                      {isPillarSelected ? <ChevronDown size={14} className="text-orange-500" /> : <ChevronRight size={14} className="text-slate-300" />}
                    </div>
                    <Folder size={18} className={isPillarSelected ? 'text-orange-600' : 'text-slate-400'} />
                    <span className="whitespace-normal leading-tight">{pillar.title}</span>
                  </button>

                  {isPillarSelected && (
                    <div className="ml-5 pl-4 border-l-2 border-orange-200 dark:border-orange-800 space-y-2 py-1">
                      {variations.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-400 italic flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-slate-300 animate-pulse" />
                          {t.sidebar.loading}
                        </div>
                      ) : (
                        variations.map((variation) => {
                          const isVariationSelected = selectedVariation?.id === variation.id;
                          return (
                            <div key={variation.id} className="space-y-2">
                              <button 
                                onClick={() => onSelectVariation(variation)} 
                                className={`
                                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left transition-all
                                  ${isVariationSelected 
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800/50 font-bold shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}
                                `}
                              >
                                <Layout size={16} className={isVariationSelected ? 'text-amber-600' : 'text-slate-400'} />
                                <span className="whitespace-normal leading-tight">{variation.title}</span>
                              </button>

                              {isVariationSelected && course && (
                                <div className="ml-3 pl-3 border-l border-amber-200 dark:border-amber-800 py-1">
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 shadow-sm animate-fade-in-up">
                                    <FileText size={14} className="shrink-0" />
                                    <span>{t.sidebar.courseContent}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};
