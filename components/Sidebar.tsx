
import React from 'react';
import { Pillar, Variation, Course, TranslationDictionary } from '../types';
import { Folder, FolderOpen, FileText, Layout, ChevronDown, ChevronRight, Hash } from 'lucide-react';

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
  topic,
  pillars,
  selectedPillar,
  variations,
  selectedVariation,
  course,
  onSelectPillar,
  onSelectVariation,
  isVisible,
  mobileOpen,
  onCloseMobile,
  t
}) => {
  if (!isVisible && !mobileOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-40
        w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        flex flex-col h-full
        ${!isVisible ? 'hidden md:hidden' : ''}
      `}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t.sidebar.explorer}</h2>
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm whitespace-normal leading-tight" title={topic}>
             📂 {topic || t.sidebar.newStrategy}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-0.5">
            {pillars.map((pillar) => {
              const isPillarSelected = selectedPillar?.id === pillar.id;
              
              return (
                <div key={pillar.id} className="select-none">
                  {/* Pillar Node */}
                  <button
                    onClick={() => {
                      onSelectPillar(pillar);
                      if (window.innerWidth < 768) onCloseMobile();
                    }}
                    className={`
                      w-full flex items-center gap-2 px-2 py-2.5 rounded-md text-sm text-left transition-colors
                      ${isPillarSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                    `}
                  >
                    {isPillarSelected ? (
                      <ChevronDown size={14} className="shrink-0 text-indigo-400" />
                    ) : (
                      <ChevronRight size={14} className="shrink-0 text-slate-400" />
                    )}
                    {isPillarSelected ? (
                      <FolderOpen size={16} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                    ) : (
                      <Folder size={16} className="shrink-0 text-slate-400" />
                    )}
                    <span className="whitespace-normal leading-tight">{pillar.title}</span>
                  </button>

                  {/* Children: Variations (Only if this pillar is selected) */}
                  {isPillarSelected && (
                    <div className="ml-4 pl-2 border-l border-slate-200 dark:border-slate-700 mt-1 space-y-0.5">
                      {variations.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-slate-400 italic">{t.sidebar.loading}</div>
                      ) : (
                        variations.map((variation) => {
                          const isVariationSelected = selectedVariation?.id === variation.id;
                          
                          return (
                            <div key={variation.id}>
                              {/* Variation Node */}
                              <button
                                onClick={() => {
                                  onSelectVariation(variation);
                                  if (window.innerWidth < 768) onCloseMobile();
                                }}
                                className={`
                                  w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs text-left transition-colors
                                  ${isVariationSelected 
                                    ? 'bg-indigo-100 dark:bg-indigo-800/40 text-indigo-800 dark:text-indigo-200 font-medium' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                `}
                              >
                                <Layout size={14} className={`shrink-0 ${isVariationSelected ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400'}`} />
                                <span className="whitespace-normal leading-tight">{variation.title}</span>
                              </button>

                              {/* Children: Course (Only if this variation is selected AND course exists) */}
                              {isVariationSelected && course && (
                                <div className="ml-4 pl-2 border-l border-slate-200 dark:border-slate-700 mt-1">
                                   <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30">
                                      <FileText size={14} className="shrink-0" />
                                      <span className="whitespace-normal leading-tight">{t.sidebar.courseContent}</span>
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
