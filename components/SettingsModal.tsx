
import React from 'react';
import { X, Download, ShieldCheck, Key, ExternalLink } from 'lucide-react';
import { TranslationDictionary } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadBackup: () => void;
  t: TranslationDictionary;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onDownloadBackup,
  t
}) => {
  if (!isOpen) return null;

  const handleOpenSelectKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
      } else {
        alert("El selector de claves no está disponible.");
      }
    } catch (e) {
      console.error("Error opening key selector", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transition-colors border border-slate-200 dark:border-slate-700">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">{t.settings.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg"><Key size={18} /></div>
              <h4 className="font-bold text-slate-900 dark:text-white">Uso de API</h4>
            </div>
            <button onClick={handleOpenSelectKey} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg">Configurar Mi Clave API</button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-[10px] text-indigo-500 hover:underline font-bold uppercase">
              <span>Doc. de Facturación</span>
              <ExternalLink size={10} />
            </a>
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"><ShieldCheck size={20} /></div>
            <h4 className="font-bold text-slate-900 dark:text-white">{t.settings.secureData}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 px-4">{t.settings.secureDesc}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{t.settings.backup}</h4>
             <button onClick={onDownloadBackup} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors text-xs font-bold uppercase shadow-sm">
               <Download size={18} />
               <span>{t.settings.backupBtn}</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
