
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Pillar, Variation, Course, CourseDepth, EbookStructure } from "../types";
import * as pdfjsLib from 'pdfjs-dist';

// Configurar PDF.js worker - usar archivo local desde public
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ No hay API key configurada');
    return '';
  }
  const ai = new GoogleGenAI({ apiKey });
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
  } catch (e: any) {
    // Silently handle quota errors to prevent UI breaking
    const errorMsg = e?.message || "";
    const status = e?.status || e?.code;
    
    if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || status === 429 || status === 'RESOURCE_EXHAUSTED') {
      console.warn("Generation quota exceeded. Image will not be displayed.");
    } else {
      console.error("Image gen error", e);
    }
  }
  return '';
};

export const extractTextFromPDF = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    console.log('📄 Iniciando extracción de PDF:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    console.log('✅ ArrayBuffer obtenido, tamaño:', arrayBuffer.byteLength);
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('✅ PDF cargado, páginas:', pdf.numPages);
    
    let fullText = '';
    const totalPages = pdf.numPages;
    
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
      
      // Reportar progreso
      if (onProgress) {
        const progress = Math.round((i / totalPages) * 100);
        onProgress(progress);
      }
      console.log(`✅ Página ${i}/${totalPages} procesada`);
    }
    
    console.log('✅ Extracción completa, caracteres:', fullText.length);
    return fullText.trim();
  } catch (error: any) {
    console.error('❌ Error extracting PDF text:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw new Error(`No se pudo extraer el texto del PDF: ${error.message || 'Error desconocido'}`);
  }
};

export const generatePillars = async (topic: string, language: string, contextContent?: string): Promise<{ pillars: Pillar[], relatedTopics: string[] }> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No se ha configurado la API key. Contacta al administrador.');
  }
  const ai = new GoogleGenAI({ apiKey });
  
  let basePrompt = '';
  
  if (contextContent) {
    // Si hay contenido de PDF, usar SOLO ese contenido
    basePrompt = `Analiza EXCLUSIVAMENTE el siguiente documento PDF. NO busques información externa ni uses conocimiento general.

CONTENIDO DEL DOCUMENTO:
${contextContent.substring(0, 400000)}

INSTRUCCIONES:
- Identifica 10 pilares fundamentales basados ÚNICAMENTE en el contenido del documento
- Sugiere 6 temas relacionados que aparezcan en el documento
- Responde en ${language}
- Formato JSON requerido`;
  } else {
    // Comportamiento normal sin PDF
    basePrompt = `Actúa como un mentor experto en: "${topic}".
Identifica 10 pilares fundamentales y 6 temas relacionados. JSON. Idioma: ${language}.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: basePrompt,
    config: { responseMimeType: 'application/json', responseSchema: pillarsResponseSchema }
  });
  
  return JSON.parse(response.text || '{"pillars":[], "relatedTopics":[]}');
};

export const generateVariations = async (pillar: string, parentTopic: string, language: string, contextContent?: string): Promise<Variation[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No se ha configurado la API key. Contacta al administrador.');
  }
  const ai = new GoogleGenAI({ apiKey });
  
  let prompt = '';
  
  if (contextContent) {
    // Si hay contenido de PDF, usar SOLO ese contenido
    prompt = `Basándote EXCLUSIVAMENTE en el siguiente documento PDF, genera 10 propuestas de cursos para el pilar "${pillar}".

CONTENIDO DEL DOCUMENTO:
${contextContent.substring(0, 400000)}

INSTRUCCIONES:
- Usa ÚNICAMENTE la información del documento
- NO agregues conocimiento externo
- Genera variaciones basadas en diferentes aspectos del documento
- Responde en ${language}
- Formato JSON requerido`;
  } else {
    // Comportamiento normal sin PDF
    prompt = `Genera 10 propuestas de cursos para "${pillar}" sobre "${parentTopic}". JSON. Idioma: ${language}.`;
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: variationsSchema }
  });
  const data = JSON.parse(response.text || '{"variations":[]}');
  return data.variations || [];
};

export const generateCourse = async (variationTitle: string, variationDescription: string, parentTopic: string, depth: CourseDepth, language: string, contextContent?: string, questionsPerQuiz: number = 3): Promise<Course> => {
  console.log('📚 generateCourse llamado con questionsPerQuiz:', questionsPerQuiz);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No se ha configurado la API key. Contacta al administrador.');
  }
  const ai = new GoogleGenAI({ apiKey });
  
  let prompt = '';
  
  if (contextContent) {
    // Si hay contenido de PDF, usar SOLO ese contenido
    prompt = `Crea un curso experto sobre: "${variationTitle}" basándote EXCLUSIVAMENTE en el siguiente documento PDF.

CONTENIDO DEL DOCUMENTO:
${contextContent.substring(0, 400000)}

INSTRUCCIONES ESTRICTAS:
- Usa ÚNICAMENTE la información del documento PDF
- NO agregues conocimiento externo ni información de internet
- Profundidad: "${depth}"
- Markdown para contentMarkdown
- NO USES listas numeradas (1., 2.). USA SIEMPRE viñetas (•)
- ${questionsPerQuiz} preguntas de quiz por módulo basadas en el documento
- Proporciona imageDescription detallada para cada módulo
- Responde en ${language}
- Formato JSON requerido`;
  } else {
    // Comportamiento normal sin PDF
    prompt = `
    Crea un curso experto sobre: "${variationTitle}". 
    Reglas:
    - Markdown para contentMarkdown.
    - NO USES listas numeradas (1., 2.). USA SIEMPRE viñetas (•).
    - Profundidad: "${depth}".
    - ${questionsPerQuiz} preguntas de quiz por módulo.
    - Proporciona imageDescription detallada para cada módulo.
    Idioma: ${language}. JSON.
  `;
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { 
      //thinkingConfig: { thinkingBudget: 4000 }, // Thinking is not supported for gemini-3-pro-preview
      responseMimeType: 'application/json', 
      responseSchema: courseSchema,
    }
  });
  
  const result = JSON.parse(response.text || '{}');
  if (!result.modules) result.modules = [];
  return result as Course;
};
