
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Upload, FileText, Loader2, X, Layers, Zap, BookOpen, Download } from 'lucide-react';
import { TranslationDictionary } from '../types';
import { extractTextFromPDF } from '../services/geminiService';

const SUGGESTION_POOL = [
  "Marketing Digital 360",
  "Finanzas Personales",
  "Cocina Vegana",
  "Inteligencia Artificial",
  "Liderazgo",
  "Gestión del Tiempo",
  "Yoga para Principiantes",
  "Inversión en Bolsa"
];

const FEATURES = [
  {
    title: "Arquitectura Inteligente",
    description: "Analizamos tu tema y lo deconstruimos en pilares fundamentales.",
    icon: <Layers className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    color: "orange"
  },
  {
    title: "Adaptabilidad Total",
    description: "Genera variaciones instantáneas para diferentes niveles.",
    icon: <Zap className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    color: "amber"
  },
  {
    title: "Contenido Profundo",
    description: "Lecciones completas, cuestionarios y glosarios técnicos.",
    icon: <BookOpen className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop",
    color: "orange"
  },
  {
    title: "Exportación Profesional",
    description: "Descarga tu curso completo en un PDF perfectamente maquetado.",
    icon: <Download className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop",
    color: "amber"
  }
];

interface TopicInputProps {
  onSubmit: (topic: string, contextContent?: string) => void;
  t: TranslationDictionary;
}

export const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, t }) => {
  const [value, setValue] = useState('');
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const shuffled = [...SUGGESTION_POOL].sort(() => 0.5 - Math.random());
    setRandomSuggestions(shuffled.slice(0, 4));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value, uploadedFile?.content);
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      <section className="relative w-full py-16 md:py-24 px-4 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/10 dark:bg-orange-500/20 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="text-center space-y-8 max-w-4xl mx-auto mb-12 z-10">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-orange-500/30 backdrop-blur-md text-sm font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] animate-fade-in-up">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <Sparkles size={16} className="text-orange-400" />
            <span>Potenciado con Gemini AI</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none drop-shadow-2xl">
            Transforma ideas en <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">Cursos Expertos</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Tu copiloto inteligente para crear estrategias educativas y lecciones completas en segundos.
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto z-20 relative px-4">
          <form onSubmit={handleSubmit} className="relative group w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 dark:border-slate-700/50 flex flex-col overflow-hidden">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={uploadedFile ? `Basado en documento: ${uploadedFile.name}` : t.input.placeholder}
                className="w-full p-6 text-lg md:text-xl text-slate-800 dark:text-slate-100 bg-transparent border-0 focus:ring-0 placeholder:text-slate-500 resize-none h-32"
                autoFocus
              />
              <div className="flex flex-col sm:flex-row justify-between items-center p-3 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 gap-3">
                <div className="flex items-center w-full sm:w-auto">
                  <input type="file" ref={fileInputRef} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsProcessingFile(true);
                      const text = await extractTextFromPDF(file);
                      setUploadedFile({ name: file.name, content: text });
                      setIsProcessingFile(false);
                    }
                  }} accept="application/pdf" className="hidden" />
                  {isProcessingFile ? (
                     <div className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 font-bold"><Loader2 size={16} className="animate-spin" /><span>Analizando...</span></div>
                  ) : uploadedFile ? (
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 text-sm font-bold"><FileText size={14} /><span className="truncate max-w-[150px]">{uploadedFile.name}</span><button onClick={() => setUploadedFile(null)} className="hover:text-rose-500 transition-colors"><X size={12} /></button></div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-orange-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg font-bold transition-all"><Upload size={18} /><span>Subir PDF base</span></button>
                  )}
                </div>
                <button type="submit" disabled={!value.trim() && !uploadedFile} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/40 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"><span>{t.input.button}</span><Send size={18} /></button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="group relative bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-4 shadow-sm hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="relative h-64 w-full overflow-hidden rounded-[2rem] mb-6">
                <img src={feature.image} alt={feature.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80" />
                <div className={`absolute bottom-6 left-6 z-20 w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-orange-600 shadow-2xl`}>{feature.icon}</div>
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-orange-500 transition-colors tracking-tight">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-medium">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
