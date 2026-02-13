# 🔄 Flujo de la Aplicación - CursoAPP

## 📊 Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────────┐
│                         INICIO                                   │
│                    Usuario abre la app                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PASO 1: INPUT                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Usuario ingresa un tema                                │  │
│  │  • O sube un PDF como contexto                           │  │
│  │  • Ejemplos: "Marketing Digital", "Python", etc.         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    [Llamada a Gemini AI]
                    gemini-3-flash-preview
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PASO 2: PILLARS                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • IA genera 10 pilares fundamentales                    │  │
│  │  • Cada pilar con título, descripción e icono           │  │
│  │  • También genera 6 temas relacionados                   │  │
│  │  • Usuario selecciona 1 pilar                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    [Llamada a Gemini AI]
                    gemini-3-flash-preview
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                PASO 3: VARIATIONS                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • IA genera 10 variaciones del pilar                    │  │
│  │  • Cada variación con nivel (Principiante/Inter/Avanz)  │  │
│  │  • Usuario elige profundidad:                            │  │
│  │    - Express (rápido)                                    │  │
│  │    - Estándar (equilibrado)                              │  │
│  │    - Profundo (detallado)                                │  │
│  │  • Usuario selecciona 1 variación                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    [Llamada a Gemini AI]
                    gemini-3-pro-preview
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PASO 4: COURSE                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CURSO COMPLETO GENERADO:                                │  │
│  │                                                           │  │
│  │  📚 Módulos (lecciones)                                  │  │
│  │     • Título                                             │  │
│  │     • Contenido en Markdown                              │  │
│  │     • Key Takeaway (lo más importante)                   │  │
│  │     • Imagen AI (opcional)                               │  │
│  │     • Quiz (3 preguntas)                                 │  │
│  │                                                           │  │
│  │  📖 Glosario técnico                                     │  │
│  │     • Términos clave                                     │  │
│  │     • Definiciones                                       │  │
│  │     • Enlaces contextuales en el texto                   │  │
│  │                                                           │  │
│  │  🎯 Funcionalidades:                                     │  │
│  │     • Resaltar texto                                     │  │
│  │     • Marcar módulos como completados                    │  │
│  │     • Hacer quizzes                                      │  │
│  │     • Ver glosario                                       │  │
│  │     • Exportar a PDF                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    [Guardado Automático]
                      localStorage
                             │
                             ▼
                         ¡LISTO! 🎉
```

## 🔄 Flujo de Datos

```
Usuario Input
     │
     ▼
┌─────────────┐
│   App.tsx   │ ◄──── Estado principal de la aplicación
└──────┬──────┘
       │
       ├──► TopicInput.tsx ──────► geminiService.generatePillars()
       │                                    │
       │                                    ▼
       │                            [Gemini API]
       │                                    │
       │                                    ▼
       ├──► PillarSelection.tsx ◄──── { pillars, relatedTopics }
       │         │
       │         ▼
       │    Usuario selecciona pilar
       │         │
       │         ▼
       ├──► geminiService.generateVariations()
       │                                    │
       │                                    ▼
       │                            [Gemini API]
       │                                    │
       │                                    ▼
       ├──► VariationSelection.tsx ◄─── { variations }
       │         │
       │         ▼
       │    Usuario selecciona variación + profundidad
       │         │
       │         ▼
       ├──► geminiService.generateCourse()
       │                                    │
       │                                    ▼
       │                            [Gemini API]
       │                                    │
       │                                    ▼
       └──► CourseView.tsx ◄────────── { course }
                 │
                 ├──► Módulos
                 ├──► Quizzes
                 ├──► Glosario
                 └──► Exportar PDF
```

## 💾 Flujo de Guardado

```
Cambio en el Estado
     │
     ▼
useEffect (App.tsx)
     │
     ▼
Debounce (1 segundo)
     │
     ▼
saveCurrentSession()
     │
     ▼
Crear SavedCourse object
     │
     ├─ id
     ├─ createdAt
     ├─ lastUpdated
     ├─ step
     ├─ topic
     ├─ pillars
     ├─ selectedPillar
     ├─ variations
     ├─ selectedVariation
     ├─ course
     ├─ depth
     ├─ completedModuleIds
     ├─ userHighlights
     └─ quizResults
     │
     ▼
localStorage.setItem('cursoapp_history', JSON.stringify(savedCourses))
     │
     ▼
¡Guardado! ✅
```

## 🎯 Flujo de Quiz

```
Usuario entra a Quiz
     │
     ▼
randomizeQuiz()
     │
     ├─ Barajar preguntas
     └─ Barajar opciones de cada pregunta
     │
     ▼
Mostrar pregunta actual
     │
     ▼
Usuario selecciona respuesta
     │
     ▼
handleQuizAnswer()
     │
     ├─ Verificar si es correcta
     ├─ Actualizar score
     └─ Mostrar feedback
     │
     ▼
handleNextQuestion()
     │
     ├─ Si hay más preguntas → Siguiente
     └─ Si no → Mostrar resultados finales
     │
     ▼
onQuizComplete(score, total)
     │
     ▼
Guardar en variationScores
     │
     ▼
¡Quiz completado! 🏆
```

## 🔗 Flujo de Glosario

```
Texto del módulo
     │
     ▼
renderContentWithAllInteractions()
     │
     ├─ Detectar términos del glosario
     ├─ Detectar resaltados del usuario
     └─ Crear enlaces interactivos
     │
     ▼
Usuario hace clic en término
     │
     ▼
goToGlossaryTerm()
     │
     ├─ Guardar posición actual (anchor)
     ├─ Cambiar a vista de glosario
     └─ Scroll al término
     │
     ▼
Término resaltado temporalmente
     │
     ▼
Usuario hace clic en "Volver"
     │
     ▼
returnToText()
     │
     ├─ Volver a vista de módulo
     └─ Scroll a posición guardada
     │
     ▼
¡Navegación contextual! 🎯
```

## 📄 Flujo de Exportación PDF

```
Usuario hace clic en "Descargar PDF"
     │
     ▼
Crear documento jsPDF
     │
     ├─ Configurar formato
     ├─ Agregar portada
     ├─ Agregar índice
     │
     ▼
Para cada módulo:
     │
     ├─ Agregar título
     ├─ Agregar contenido
     ├─ Agregar key takeaway
     ├─ Agregar quiz
     └─ Nueva página
     │
     ▼
Agregar glosario
     │
     ▼
pdf.save('curso.pdf')
     │
     ▼
¡PDF descargado! 📥
```

## 🖼️ Flujo de Generación de Imágenes

```
Módulo cargado
     │
     ▼
¿Tiene imageDescription?
     │
     ├─ NO → Sin imagen
     │
     └─ SÍ
         │
         ▼
    generateModuleImage(description)
         │
         ▼
    [Gemini Image API]
    gemini-2.5-flash-image
         │
         ├─ Éxito → Retorna base64
         │           │
         │           ▼
         │      Mostrar imagen
         │
         └─ Error (429/cuota) → Sin imagen
                                 (app sigue funcionando)
```

## 🔐 Flujo de Seguridad

```
Desarrollo Local:
    .env.local → process.env.API_KEY → Gemini API

Producción (Recomendado):
    Usuario → Frontend → Backend Proxy → Gemini API
                            │
                            ├─ Autenticación
                            ├─ Rate Limiting
                            └─ Validación
```

## 🚀 Flujo de Despliegue

```
Código Local
     │
     ▼
git push origin main
     │
     ▼
GitHub Repository
     │
     ├──► Vercel
     │      │
     │      ├─ Detecta cambios
     │      ├─ npm install
     │      ├─ npm run build
     │      ├─ Deploy a CDN
     │      └─ URL pública
     │
     └──► Netlify
            │
            ├─ Detecta cambios
            ├─ npm install
            ├─ npm run build
            ├─ Deploy a CDN
            └─ URL pública
```

## 📊 Flujo de Estado (React)

```
App.tsx (Estado Global)
     │
     ├─ step: AppStep
     ├─ loading: boolean
     ├─ topic: string
     ├─ pillars: Pillar[]
     ├─ selectedPillar: Pillar | null
     ├─ variations: Variation[]
     ├─ selectedVariation: Variation | null
     ├─ course: Course | null
     ├─ activeModuleId: string | null
     ├─ currentDepth: CourseDepth
     ├─ completedModuleIds: string[]
     ├─ userHighlights: Record<string, string[]>
     ├─ variationScores: Record<string, {score, total}>
     └─ savedCourses: SavedCourse[]
     │
     ▼
Props a Componentes Hijos
     │
     ├─ TopicInput
     ├─ PillarSelection
     ├─ VariationSelection
     ├─ CourseView
     └─ Sidebar
```

---

## 🎯 Resumen de Interacciones

1. **Usuario → Input**: Ingresa tema o sube PDF
2. **IA → Pillars**: Genera 10 pilares fundamentales
3. **Usuario → Pillar**: Selecciona 1 pilar
4. **IA → Variations**: Genera 10 variaciones
5. **Usuario → Variation**: Selecciona variación + profundidad
6. **IA → Course**: Genera curso completo
7. **Usuario → Explora**: Lee, hace quizzes, resalta, exporta
8. **Sistema → Guarda**: Automáticamente en localStorage

---

**Tiempo total**: ~2-3 minutos desde tema hasta curso completo 🚀
