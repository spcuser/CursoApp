import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Upload, FileText, Loader2, X, Layers, Zap, BookOpen, Download } from 'lucide-react';
import { TranslationDictionary } from '../types';
import { extractTextFromPDF } from '../services/geminiService';

interface TopicInputProps {
  onSubmit: (topic: string, contextContent?: string) => void;
  t: TranslationDictionary;
}

// Expanded pool to ensure diversity and avoid repetition
const SUGGESTION_POOL = [
  "Inteligencia Artificial para Abogados",
  "Finanzas Personales para Jóvenes",
  "Marketing Digital 360",
  "Fotografía Móvil Profesional",
  "Liderazgo y Gestión de Equipos",
  "Cocina Saludable en 20 Minutos",
  "Introducción a Python",
  "Mindfulness para el Estrés",
  "Estrategias de Ventas B2B",
  "Diseño de Interiores Sostenible",
  "Hablar en Público con Confianza",
  "Gestión del Tiempo y Productividad",
  "Nutrición Deportiva Básica",
  "Ciberseguridad en el Hogar",
  "Escritura Creativa para Novelas",
  "Yoga para Principiantes",
  "Historia del Arte Moderno",
  "Desarrollo de Apps sin Código",
  "Huerto Urbano en Casa",
  "Psicología Positiva Aplicada",
  "Reparación de Bicicletas",
  "Jardinería Vertical",
  "Historia de Roma",
  "Excel Avanzado para Negocios",
  "Maquillaje FX",
  "Introducción al Blockchain",
  "Meditación Zazen",
  "Astrofísica para Curiosos",
  "Costura y Patrones",
  "Marketing de Afiliados",
  "Crianza Respetuosa",
  "Guitarra Flamenca Básica",
  "Primeros Auxilios Pediátricos",
  "Edición de Video con Smartphone",
  "Panadería Artesanal con Masa Madre",
  "SEO para E-commerce",
  "Dibujo Urbano (Urban Sketching)",
  "Gestión de Crisis en Redes Sociales",
  "Bioética y Medicina",
  "Astronomía de Patio",
  "Calistenia en Casa",
  "Introducción a la Filosofía Stoica",
  "Coctelería Clásica",
  "Cerámica y Modelado en Arcilla",
  "Acuarela Botánica",
  "Inversión en Bolsa para Principiantes",
  "Podcast: De la Idea a la Publicación",
  "Diseño de UX/UI",
  "Carpintería Básica",
  "Energías Renovables en el Hogar",
  "Cuidado de Bonsáis",
  "Composición Musical",
  "Derechos Laborales Básicos",
  "Inglés de Negocios",
  "Ilustración Digital",
  "Meteorología Práctica",
  "Origami Complejo",
  "Reiki Nivel 1",
  "Estrategia de Ajedrez",
  "Cata de Vinos",
  "Periodismo de Datos",
  "Robótica Educativa para Niños"
];

// Feature Data for the landing page
const FEATURES = [
  {
    title: "Arquitectura Inteligente",
    description: "Nuestra IA analiza tu tema y deconstruye el conocimiento en pilares fundamentales, asegurando una estructura lógica y sólida.",
    icon: <Layers className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop", // Abstract 3D shapes
    color: "indigo"
  },
  {
    title: "Adaptabilidad Total",
    description: "Genera variaciones instantáneas para diferentes niveles (Principiante a Experto) y audiencias específicas.",
    icon: <Zap className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop", // Tech/Circuitry minimalist
    color: "purple"
  },
  {
    title: "Contenido Profundo",
    description: "No solo esquemas. Creamos módulos completos, explicaciones detalladas, cuestionarios y glosarios técnicos.",
    icon: <BookOpen className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop", // Minimalist writing/book
    color: "emerald"
  },
  {
    title: "Exportación Profesional",
    description: "Descarga tu curso completo en un PDF perfectamente maquetado, listo para presentar, vender o estudiar.",
    icon: <Download className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop", // Clean white document style
    color: "blue"
  }
];

export const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, t }) => {
  const [value, setValue] = useState('');
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const shuffled = [...SUGGESTION_POOL].sort(() => 0.5 - Math.random());
    setRandomSuggestions(shuffled.slice(0, 4)); // Show 4 suggestions
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value, uploadedFile?.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSubmit(value, uploadedFile?.content);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Por favor sube un archivo PDF válido.');
      return;
    }

    setIsProcessingFile(true);
    try {
      const text = await extractTextFromPDF(file);
      if (text.length < 50) {
        alert('No se pudo extraer suficiente texto del PDF.');
        return;
      }
      setUploadedFile({ name: file.name, content: text });
      if (!value) setValue(file.name.replace('.pdf', ''));
    } catch (error) {
      console.error(error);
      alert('Error al leer el archivo PDF.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      
      {/* HERO SECTION */}
      <section className="relative w-full py-16 md:py-24 px-4 flex flex-col items-center justify-center overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-12 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/10 border border-slate-200 dark:border-slate-700 backdrop-blur-sm text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm animate-fade-in-up">
            <Sparkles size={14} className="text-indigo-500" />
            <span>Potenciado con Gemini AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Transforma ideas en <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Cursos Expertos</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tu copiloto inteligente para crear estrategias de contenido educativo, estructurar temarios y generar lecciones completas en segundos.
          </p>
        </div>

        {/* INPUT CARD */}
        <div className="w-full max-w-2xl mx-auto z-20 relative px-4">
          <form onSubmit={handleSubmit} className="relative group w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 dark:border-slate-700/50 flex flex-col overflow-hidden">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={uploadedFile ? `Basado en documento: ${uploadedFile.name}` : t.input.placeholder}
                className="w-full p-6 text-lg md:text-xl text-slate-800 dark:text-slate-100 bg-transparent border-0 focus:ring-0 placeholder:text-slate-400 resize-none h-32"
                autoFocus
              />
              
              <div className="flex flex-col sm:flex-row justify-between items-center p-3 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 gap-3">
                {/* File Upload */}
                <div className="flex items-center w-full sm:w-auto">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                  
                  {isProcessingFile ? (
                     <div className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Analizando...</span>
                     </div>
                  ) : uploadedFile ? (
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 text-sm max-w-full">
                        <FileText size={14} className="shrink-0" />
                        <span className="truncate max-w-[150px] font-medium">{uploadedFile.name}</span>
                        <button onClick={clearFile} type="button" className="p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full"><X size={12} /></button>
                     </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors w-full sm:w-auto justify-center sm:justify-start
                        ${isDragging ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'}
                      `}
                      title="Arrastra un PDF aquí"
                    >
                      <Upload size={18} />
                      <span className="font-medium">Subir libro base (PDF)</span>
                    </button>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={!value.trim() && !uploadedFile}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold transform hover:-translate-y-0.5"
                >
                  <span>{t.input.button}</span>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </form>

          {/* Suggestions */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium">{t.input.suggestions}</span>
            {randomSuggestions.map((suggestion, index) => (
              <button 
                key={index} 
                onClick={() => setValue(suggestion)} 
                className="hover:text-indigo-600 dark:hover:text-indigo-400 underline decoration-dotted decoration-indigo-300 dark:decoration-indigo-700 underline-offset-4 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {FEATURES.map((feature, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-slate-100 dark:border-slate-800"
            >
              {/* Image Container */}
              <div className="relative h-64 w-full overflow-hidden rounded-2xl mb-6">
                <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/40 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute bottom-4 left-4 z-20 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400 shadow-lg`}>
                  {feature.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="px-6 pb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};