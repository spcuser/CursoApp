
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
    primaryColor: { type: Type.STRING, enum: ["indigo", "emerald", "rose", "amber", "cyan", "violet", "orange"] },
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
    El índice debe tener 10 capítulos profundos.
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
    Escribe un tema exhaustivo para un libro de alta gama: "${topicTitle}".
    Usa un tono magistral, profesional y envolvente.
    Estructura con Markdown (## y ###). Usa negritas (**) para enfatizar conceptos clave.
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
  let basePrompt = `Actúa como un mentor de clase mundial experto en: "${topic}".`;
  if (contextContent) basePrompt += `\nUsa este material como base técnica: ${contextContent.substring(0, 500000)}`;
  
  basePrompt += `
    TAREA:
    1. Identifica los 10 pilares fundamentales para entender este tema a fondo.
    2. Sugiere 6 temas relacionados que sean innovadores, específicos y de gran interés para alguien que busca aprender sobre "${topic}".
    
    IDIOMA: ${language}.
    FORMATO: Responde estrictamente en JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: basePrompt,
    config: { responseMimeType: 'application/json', responseSchema: pillarsResponseSchema }
  });
  
  const data = JSON.parse(response.text || '{}');
  return { 
    pillars: data.pillars || [], 
    relatedTopics: data.relatedTopics || [] 
  };
};

export const generateVariations = async (pillar: string, parentTopic: string, language: string): Promise<Variation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Genera 10 propuestas de cursos innovadores para el pilar "${pillar}" del ecosistema "${parentTopic}". JSON. Idioma: ${language}.`;
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
  const prompt = `
    Desarrolla un curso de nivel experto sobre: "${variationTitle}". 
    Instrucciones de formato:
    - Usa Markdown rico para contentMarkdown.
    - Utiliza negritas (**) para destacar términos fundamentales.
    - IMPORTANTE: No utilices listas numeradas (1., 2., 3.). Sustitúyelas SIEMPRE por listas de viñetas elegantes (•) para una lectura ágil y fluida.
    - Divide el contenido en secciones lógicas con subtítulos (##).
    - Asegura una profundidad de contenido de tipo "${depth}".
    - PARA EL QUIZ: Genera exactamente 3 preguntas de opción múltiple por cada módulo para evaluar el aprendizaje.
    Idioma: ${language}. Genera JSON detallado.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { 
      responseMimeType: 'application/json', 
      responseSchema: courseSchema,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
  return JSON.parse(response.text || '{}') as Course;
};
