
import React from 'react';
import { Pillar, Variation, Course, TranslationDictionary } from '../types';
import { Folder, FolderOpen, Layout, ChevronDown, ChevronRight, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface SidebarProps {
  topic: string;
  pillars: Pillar[];
  selectedPillar: Pillar | null;
  variations: Variation[];
  selectedVariation: Variation | null;
  course: Course | null;
  activeModuleId: string | null;
  onSetActiveModule: (id: string) => void;
  onSelectPillar: (pillar: Pillar) => void;
  onSelectVariation: (variation: Variation) => void;
  isVisible: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  t: TranslationDictionary;
  variationScores?: Record<string, { score: number; total: number }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  topic, pillars = [], selectedPillar, variations = [], selectedVariation, course, activeModuleId, onSetActiveModule,
  onSelectPillar, onSelectVariation, t, variationScores = {}
}) => {
  return (
    <aside className="w-[400px] bg-slate-950 border-l border-slate-900 flex flex-col p-8 overflow-y-auto shrink-0">
      <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">EXPLORADOR</h2>
      
      <div className="p-8 bg-[#444444] border border-white/5 rounded-[2rem] mb-10 group hover:border-orange-500 transition-all shadow-2xl mx-[5px]">
        <Folder size={24} className="text-orange-500 mb-6" />
        <p className="text-sm font-black text-white leading-relaxed tracking-tight">
          {topic || "Sin tema"}
        </p>
      </div>

      <div className="space-y-[27px]">
        <div className="space-y-[11px]">
          {pillars.map((pillar) => {
            const isPillarSelected = selectedPillar?.id === pillar.id;
            return (
              <div key={pillar.id} className="space-y-3">
                <button 
                  onClick={() => onSelectPillar(pillar)}
                  className={`w-[calc(100%-10px)] flex items-center gap-4 px-5 py-4 rounded-2xl transition-all mx-[5px] ${isPillarSelected ? 'bg-[#444444] border border-white/5 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <Folder size={18} className={isPillarSelected ? 'text-orange-500' : 'text-slate-700'} />
                  <span className="text-xs font-bold truncate leading-tight flex-1">{pillar.title}</span>
                  {isPillarSelected ? <ChevronDown size={16} className="ml-auto" /> : <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100" />}
                </button>

                {isPillarSelected && variations && variations.length > 0 && (
                  <div className="ml-5 pl-5 border-l border-slate-800 space-y-3 py-2">
                    {variations.map(v => {
                      const scoreData = variationScores[v.id];
                      const isCompleted = !!scoreData;
                      const isPerfect = scoreData && scoreData.score === scoreData.total;
                      const isVarSelected = selectedVariation?.id === v.id;
                      
                      return (
                        <div key={v.id} className="space-y-1">
                          <button 
                            onClick={() => onSelectVariation(v)}
                            className={`w-[calc(100%-10px)] flex items-center gap-4 p-4 rounded-xl text-[11px] font-black uppercase text-left transition-all mx-[5px] ${isVarSelected ? 'bg-orange-600/10 border border-orange-500/30 text-orange-500 shadow-inner' : 'bg-[#444444]/50 text-slate-400 hover:text-white hover:bg-[#444444]'}`}
                          >
                            {isCompleted ? (
                              isPerfect ? (
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                              ) : (
                                <AlertCircle size={16} className="text-rose-500 shrink-0" />
                              )
                            ) : (
                              <Layout size={16} className={isVarSelected ? 'text-orange-500' : 'text-slate-700'} />
                            )}
                            <span className="flex-1 truncate">{v.title}</span>
                          </button>

                          {/* MODULE LIST IF COURSE IS LOADED AND THIS VARIATION IS ACTIVE */}
                          {isVarSelected && course && (
                            <div className="ml-4 pl-4 border-l border-slate-800 space-y-2 mt-2 mb-4">
                              {course.modules.map((m, idx) => (
                                <button 
                                  key={m.id}
                                  onClick={() => onSetActiveModule(m.id)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold transition-all ${activeModuleId === m.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                                >
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${activeModuleId === m.id ? 'bg-orange-500 text-white' : 'bg-slate-800'}`}>{idx + 1}</div>
                                  <span className="truncate">{m.title}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
