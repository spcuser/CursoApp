
import React from 'react';
import { Pillar, Variation, Course, TranslationDictionary } from '../types';
import { Folder, FolderOpen, Layout, ChevronDown, ChevronRight, BookOpen, Layers } from 'lucide-react';

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
  topic, pillars = [], selectedPillar, variations = [], selectedVariation, 
  onSelectPillar, onSelectVariation, t 
}) => {
  return (
    <aside className="w-[400px] bg-slate-950 border-l border-slate-900 flex flex-col p-8 overflow-y-auto shrink-0">
      <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">EXPLORADOR</h2>
      
      <div className="p-8 bg-[#444444] border border-white/5 rounded-[2rem] mb-10 group hover:border-orange-500 transition-all shadow-2xl mx-[5px]">
        <Folder size={24} className="text-orange-500 mb-6" />
        <p className="text-sm font-black text-white uppercase leading-relaxed tracking-tight">
          {topic || "SIN TEMA"}
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
                    {variations.map(v => (
                      <button 
                        key={v.id}
                        onClick={() => onSelectVariation(v)}
                        className={`w-[calc(100%-10px)] flex items-center gap-4 p-4 rounded-xl text-[11px] font-black uppercase text-left transition-all mx-[5px] ${selectedVariation?.id === v.id ? 'bg-white text-slate-950 shadow-2xl scale-[1.02]' : 'bg-[#444444]/50 text-slate-400 hover:text-white hover:bg-[#444444]'}`}
                      >
                        <Layout size={16} className={selectedVariation?.id === v.id ? 'text-orange-600' : 'text-slate-700'} />
                        <span className="flex-1 truncate">{v.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-8 border-t border-slate-900">
           <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">
             <BookOpen size={14} />
             <span>ESTADO</span>
           </div>
           <div className="space-y-3">
             <div className="flex items-center gap-4 p-4 bg-[#444444]/30 rounded-2xl text-slate-500 border border-white/5 mx-[5px]">
               <div className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center text-[11px] font-black">!</div>
               <span className="text-xs font-bold truncate">Lección en curso</span>
             </div>
           </div>
        </div>
      </div>
    </aside>
  );
};
