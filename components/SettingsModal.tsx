
import React from 'react';
import { X, Download, ShieldCheck, Key, ExternalLink, HelpCircle } from 'lucide-react';
import { TranslationDictionary } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadBackup: () => void;
  t: TranslationDictionary;
  quizQuestionsCount: number;
  onQuizQuestionsCountChange: (count: number) => void;
  onOpenApiKeySetup?: () => void;
  hasApiKey?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onDownloadBackup,
  t,
  quizQuestionsCount,
  onQuizQuestionsCountChange,
  onOpenApiKeySetup,
  hasApiKey = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-32 pb-8 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden transition-colors border border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">{t.settings.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* API Key Configuration */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            hasApiKey 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30' 
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg text-white ${hasApiKey ? 'bg-green-600' : 'bg-orange-600'}`}>
                <Key size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white">Tu API Key de Gemini</h4>
                {hasApiKey ? (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Configurada correctamente</p>
                ) : (
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">⚠ No configurada</p>
                )}
              </div>
            </div>
            
            {onOpenApiKeySetup && (
              <button 
                onClick={onOpenApiKeySetup}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-colors ${
                  hasApiKey
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white animate-pulse'
                }`}
              >
                {hasApiKey ? 'Cambiar API Key' : '🔑 Configurar Mi API Key'}
              </button>
            )}
            
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {hasApiKey 
                ? 'Tu clave está guardada de forma segura. Solo tú pagas por tu uso.'
                : 'Necesitas tu propia API key de Google Gemini para generar cursos.'
              }
            </p>
          </div>

          <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg"><Key size={18} /></div>
              <h4 className="font-bold text-slate-900 dark:text-white">Información de Uso</h4>
            </div>
            <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-[10px] text-indigo-500 hover:underline font-bold uppercase">
              <span>Ver Precios y Cuotas</span>
              <ExternalLink size={10} />
            </a>
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"><ShieldCheck size={20} /></div>
            <h4 className="font-bold text-slate-900 dark:text-white">{t.settings.secureData}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 px-4">{t.settings.secureDesc}</p>
          </div>

          <div className="p-5 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 text-white rounded-lg"><HelpCircle size={18} /></div>
              <h4 className="font-bold text-slate-900 dark:text-white">Preguntas por Quiz</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Número de preguntas:</span>
                <span className="text-2xl font-black text-orange-600 dark:text-orange-500">{quizQuestionsCount}</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="10" 
                value={quizQuestionsCount} 
                onChange={(e) => onQuizQuestionsCountChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>3 (Rápido)</span>
                <span>10 (Completo)</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Este ajuste se aplicará a los nuevos cursos que generes.</p>
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
