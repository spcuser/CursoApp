
export type AppStep = 'INPUT' | 'PILLARS' | 'VARIATIONS' | 'COURSE';

export type CourseDepth = 'express' | 'standard' | 'deep';

export interface Pillar {
  id: string;
  title: string;
  description: string;
  iconHint?: string;
}

export interface Variation {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface CourseModule {
  id: string;
  title: string;
  contentMarkdown: string;
  keyTakeaway: string;
  quiz: QuizQuestion[];
  imageDescription?: string;
  imageUrl?: string;
}

export interface Course {
  title: string;
  subtitle: string;
  description: string;
  modules: CourseModule[];
  glossary: GlossaryTerm[];
  primaryColor: string;
}

export interface EbookTopic {
  title: string;
  content?: string;
}

export interface EbookChapter {
  title: string;
  topics: EbookTopic[];
}

export interface EbookStructure {
  title: string;
  chapters: EbookChapter[];
}

export interface SavedCourse {
  id: string;
  createdAt: number;
  lastUpdated: number;
  step: AppStep;
  topic: string;
  relatedTopics?: string[];
  pillars?: Pillar[];
  selectedPillar?: Pillar;
  variations?: Variation[];
  selectedVariation?: Variation;
  course?: Course;
  depth?: CourseDepth;
  completedModuleIds?: string[];
  userHighlights?: Record<string, string[]>; // Key: moduleId, Value: array of highlighted strings
}

export interface TranslationDictionary {
  input: {
    title: string;
    subtitle: string;
    placeholder: string;
    button: string;
    suggestions: string;
  };
  steps: {
    step1: string;
    step2: string;
    step3: string;
    input: string;
    pillars: string;
    variations: string;
    course: string;
  };
  pillars: {
    title: string;
    subtitle: string;
    relatedTitle: string;
    relatedSubtitle: string;
    downloadPartial: string;
    downloadComplete: string;
    generating: string;
  };
  variations: {
    title: string;
    subtitle: string;
    back: string;
    depth: {
      express: string;
      standard: string;
      deep: string;
      expressDesc: string;
      standardDesc: string;
      deepDesc: string;
    };
  };
  course: {
    back: string;
    download: string;
    tableOfContents: string;
    keyTakeaway: string;
    quizTitle: string;
    quizQuestion: string;
    checkAnswer: string;
    correct: string;
    incorrect: string;
    nextQuestion: string;
    viewResults: string;
    moduleCompleted: string;
    retry: string;
    score: string;
    glossary: string;
    glossaryTitle: string;
    glossaryEmpty: string;
    markAsCompleted: string;
    completed: string;
  };
  ebook: {
    generate: string;
    generatingIndex: string;
    generatingContent: string;
    preparingFile: string;
    success: string;
    warning: string;
  };
  sidebar: {
    explorer: string;
    newStrategy: string;
    loading: string;
    courseContent: string;
    myStrategies: string;
    history: string;
    emptyHistory: string;
  };
  settings: {
    title: string;
    secureData: string;
    secureDesc: string;
    backup: string;
    backupBtn: string;
    backupDesc: string;
  };
  loading: {
    analyzing: string;
    designing: string;
    building: string;
    translating: string;
  };
}
