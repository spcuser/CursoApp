
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Pillar, Variation, Course, CourseDepth, EbookStructure } from "../types";
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;

// --- SCHEMAS ---

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
    primaryColor: { type: Type.STRING },
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
          imageDescription: { type: Type.STRING },
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
        required: ["id", "title", "contentMarkdown", "keyTakeaway", "quiz", "imageDescription"]
      }
    }
  },
  required: ["title", "subtitle", "description", "modules", "glossary", "primaryColor"]
};

// --- API CALLS ---

export const generateModuleImage = async (description: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A high quality, clean software screenshot or minimalist UI illustrative technical diagram of: ${description}. Aesthetic: Modern software, dark mode where appropriate, professional design, 4k.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (e) {
    console.error("Image gen error", e);
  }
  return '';
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

export const generatePillars = async (topic: string, language: string, contextContent?: string): Promise<{ pillars: Pillar[], relatedTopics: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let basePrompt = `Actúa como un mentor experto en: "${topic}".`;
  if (contextContent) basePrompt += `\nUsa este contexto técnico: ${contextContent.substring(0, 400000)}`;
  
  basePrompt += `\nIdentifica 10 pilares y 6 temas relacionados. JSON. Idioma: ${language}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: basePrompt,
    config: { responseMimeType: 'application/json', responseSchema: pillarsResponseSchema }
  });
  
  return JSON.parse(response.text || '{"pillars":[], "relatedTopics":[]}');
};

export const generateVariations = async (pillar: string, parentTopic: string, language: string): Promise<Variation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Genera 10 propuestas de cursos para "${pillar}" sobre "${parentTopic}". JSON. Idioma: ${language}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: variationsSchema }
  });
  const data = JSON.parse(response.text || '{"variations":[]}');
  return data.variations || [];
};

export const generateCourse = async (variationTitle: string, variationDescription: string, parentTopic: string, depth: CourseDepth, language: string): Promise<Course> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Crea un curso experto sobre: "${variationTitle}". 
    Reglas:
    - Markdown para contentMarkdown.
    - NO USES listas numeradas (1., 2.). USA SIEMPRE viñetas (•).
    - Profundidad: "${depth}".
    - 3 preguntas de quiz por módulo.
    - Proporciona imageDescription detallada para cada módulo.
    Idioma: ${language}. JSON.
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
  
  const result = JSON.parse(response.text || '{}');
  if (!result.modules) result.modules = [];
  return result as Course;
};
