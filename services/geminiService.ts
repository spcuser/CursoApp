
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Pillar, Variation, Course, CourseDepth, EbookStructure } from "../types";
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;

// --- SCHEMAS ---

const ebookStructureSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    chapters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING }
              },
              required: ["title"]
            }
          }
        },
        required: ["title", "topics"]
      }
    }
  },
  required: ["title", "chapters"]
};

const pillarsResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    pillars: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          iconHint: { type: Type.STRING }
        },
        required: ["id", "title", "description", "iconHint"]
      }
    },
    relatedTopics: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["pillars", "relatedTopics"]
};

const variationsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    variations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          level: { type: Type.STRING, enum: ["Principiante", "Intermedio", "Avanzado"] }
        },
        required: ["id", "title", "description", "targetAudience", "level"]
      }
    }
  },
  required: ["variations"]
};

const courseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    description: { type: Type.STRING },
    primaryColor: { type: Type.STRING, enum: ["indigo", "emerald", "rose", "amber", "cyan", "violet"] },
    glossary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          definition: { type: Type.STRING }
        },
        required: ["term", "definition"]
      }
    },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          contentMarkdown: { type: Type.STRING },
          keyTakeaway: { type: Type.STRING },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER }
              },
              required: ["question", "options", "correctAnswerIndex"]
            }
          }
        },
        required: ["id", "title", "contentMarkdown", "keyTakeaway", "quiz"]
      }
    }
  },
  required: ["title", "subtitle", "description", "modules", "glossary", "primaryColor"]
};

// --- API CALLS ---

export const generateEbookIndex = async (course: Course, language: string): Promise<EbookStructure> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const context = `
    Analiza este curso actual:
    Título: ${course.title}
    Módulos: ${course.modules.map(m => m.title).join(', ')}
    
    Tu tarea es diseñar la arquitectura de un Ebook definitivo y enciclopédico sobre este tema.
    REGLAS DE ESTRUCTURA (OBLIGATORIAS):
    1. El índice debe tener EXACTAMENTE 10 CAPÍTULOS.
    2. Cada capítulo debe tener MÍNIMO 3 TEMAS detallados.
    3. El orden debe ser: Introducción, Fundamentos Teóricos, Herramientas, Metodologías, Implementación Práctica, Casos de Estudio, Errores Comunes, Estrategias Avanzadas, Futuro del Tema y Conclusiones Maestras.
    
    Idioma: ${language}. Responde solo JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: context,
    config: {
      responseMimeType: 'application/json',
      responseSchema: ebookStructureSchema,
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateEbookTopicContent = async (topicTitle: string, chapterTitle: string, bookTitle: string, language: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    ESTÁS ESCRIBIENDO UN BEST-SELLER TÉCNICO.
    Libro: "${bookTitle}"
    Capítulo: "${chapterTitle}"
    Tema específico: "${topicTitle}"
    
    INSTRUCCIONES DE CALIDAD:
    1. EXTENSIÓN: Debes escribir al menos 1000 palabras para este tema. Sé extremadamente detallado.
    2. ESTRUCTURA: Usa Markdown estrictamente. Usa ## y ### para secciones. Usa **negritas** para conceptos clave. Usa listas numeradas y viñetas.
    3. PROFUNDIDAD: Explica el 'por qué', el 'cómo' y el 'cuándo'. Incluye pasos, filosofía y debates si aplica.
    
    Idioma: ${language}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 8000 }
    }
  });

  return response.text || '';
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Translate to ${targetLanguage}: "${text}"`;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text?.trim() || text;
};

export const generatePillars = async (topic: string, language: string, contextContent?: string): Promise<{ pillars: Pillar[], relatedTopics: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let basePrompt = `Actúa como un mentor experto en: "${topic}".`;
  if (contextContent) basePrompt += `\nUsa este contenido: ${contextContent.substring(0, 500000)}`;
  basePrompt += `\nGenera 10 temas pilar y 3 temas relacionados. JSON. Idioma: ${language}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: basePrompt,
    config: { responseMimeType: 'application/json', responseSchema: pillarsResponseSchema }
  });
  const data = JSON.parse(response.text || '{}');
  return { pillars: data.pillars || [], relatedTopics: data.relatedTopics || [] };
};

export const generateVariations = async (pillar: string, parentTopic: string, language: string): Promise<Variation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Genera 10 variaciones de curso para el pilar "${pillar}" del tema "${parentTopic}". JSON. Idioma: ${language}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: variationsSchema }
  });
  const data = JSON.parse(response.text || '{}');
  return data.variations || [];
};

export const generateCourse = async (variationTitle: string, variationDescription: string, parentTopic: string, depth: CourseDepth, language: string): Promise<Course> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let words = depth === 'express' ? "200" : depth === 'standard' ? "500" : "1000";
  const prompt = `
    Crea un curso pedagógico y experto: "${variationTitle}". 
    Contexto: ${variationDescription}. 
    Profundidad: ${words} palabras por módulo. 
    REQUISITO DE FORMATO CRÍTICO: 
    - Escribe el contenido en Markdown profesional. 
    - Usa ## para encabezados de sección y ### para subsecciones. 
    - Usa **negritas** para enfatizar conceptos vitales. 
    - Organiza la información en párrafos claros (doble salto de línea entre ellos). 
    - Utiliza listas de viñetas (-) o numeradas (1.) cuando sea apropiado.
    Idioma: ${language}.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      responseMimeType: 'application/json', 
      responseSchema: courseSchema,
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return JSON.parse(response.text || '{}') as Course;
};
