# 📝 Changelog - CursoAPP

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2026-02-06

### 🎉 Lanzamiento Inicial

Primera versión estable de CursoAPP, lista para producción.

### ✨ Características

#### Generación de Contenido con IA
- **Análisis de Temas**: Descomposición automática en 10 pilares fundamentales
- **Variaciones Inteligentes**: 10 propuestas de cursos por pilar
- **Cursos Completos**: Generación de lecciones detalladas con contenido markdown
- **Imágenes AI**: Generación automática de ilustraciones para cada módulo
- **Glosario Técnico**: Términos clave con definiciones contextuales

#### Funcionalidades Interactivas
- **Quizzes Dinámicos**: 3 preguntas por módulo con barajado aleatorio
- **Resaltado de Texto**: Marca y guarda fragmentos importantes
- **Enlaces Contextuales**: Navegación entre texto y glosario
- **Progreso Persistente**: Guardado automático en localStorage
- **Exportación PDF**: Descarga cursos en formato profesional

#### Interfaz de Usuario
- **Diseño Moderno**: Interfaz oscura con Tailwind CSS
- **Navegación Intuitiva**: 4 pasos claros (Input → Pillars → Variations → Course)
- **Sidebar Dinámico**: Explorador de contenido con estado visual
- **Búsqueda Global**: Filtrado en tiempo real
- **Modo Fullscreen**: Experiencia inmersiva

#### Gestión de Datos
- **Guardado Automático**: Cada cambio se guarda localmente
- **Historial de Cursos**: Hasta 50 estrategias guardadas
- **Exportar/Importar**: Backup en formato JSON
- **Múltiples Sesiones**: Trabaja en varios cursos simultáneamente

#### Configuración
- **Profundidad Ajustable**: Express, Estándar o Profundo
- **Contexto PDF**: Sube documentos como base para cursos
- **Configuración de API**: Gestión de claves desde la UI

### 🛠️ Tecnologías

- React 19.2.3
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS (CDN)
- Gemini AI (3-flash-preview, 3-pro-preview, 2.5-flash-image)
- jsPDF 2.5.1
- PDF.js 4.0.379
- Lucide React 0.562.0

### 📚 Documentación

- ✅ README.md completo
- ✅ Guía de inicio rápido (EMPIEZA-AQUI.md)
- ✅ Instrucciones detalladas (INSTRUCCIONES.md)
- ✅ Guía de despliegue (deploy.md)
- ✅ Mejores prácticas de seguridad (SEGURIDAD.md)
- ✅ Troubleshooting completo (SOLUCION-PROBLEMAS.md)
- ✅ FAQ exhaustivo (FAQ.md)
- ✅ Guía de contribución (CONTRIBUIR.md)
- ✅ Diagramas de flujo (FLUJO-APLICACION.md)
- ✅ Checklist de despliegue (CHECKLIST-DESPLIEGUE.md)
- ✅ Resumen técnico (RESUMEN-PROYECTO.md)
- ✅ Índice de documentación (INDEX.md)

### 🚀 Scripts de Utilidad

- ✅ INICIO-RAPIDO.bat (Windows)
- ✅ CONSTRUIR.bat (Windows)

### ⚙️ Configuración

- ✅ vercel.json para Vercel
- ✅ netlify.toml para Netlify
- ✅ GitHub Actions workflow
- ✅ TypeScript configurado
- ✅ Vite optimizado
- ✅ Variables de entorno

### 🔐 Seguridad

- ✅ Variables de entorno para API keys
- ✅ .gitignore configurado
- ✅ Headers de seguridad
- ✅ Documentación de mejores prácticas

### 🐛 Correcciones

- ✅ Eliminado prop `onGenerateEbook` no utilizado en CourseView
- ✅ Agregado archivo global.d.ts para tipos de Window
- ✅ Corregidos estilos CSS para scrollbars personalizados
- ✅ Optimizado barajado de quizzes (preguntas y opciones)
- ✅ Mejorado manejo de errores en generación de imágenes

### 📦 Dependencias

```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "lucide-react": "^0.562.0",
  "@google/genai": "^1.34.0",
  "jspdf": "2.5.1",
  "pdfjs-dist": "4.0.379"
}
```

### 🎯 Características Destacadas

#### 1. Generación Inteligente
- Usa Gemini 3 Flash Preview para análisis rápido
- Usa Gemini 3 Pro Preview para contenido profundo
- Genera imágenes con Gemini 2.5 Flash Image

#### 2. Experiencia de Usuario
- Guardado automático cada segundo
- Sin pérdida de progreso
- Navegación fluida entre secciones
- Feedback visual inmediato

#### 3. Flexibilidad
- 3 niveles de profundidad
- Soporte para PDFs como contexto
- Exportación a múltiples formatos
- Personalización de contenido

#### 4. Educación Efectiva
- Quizzes con feedback instantáneo
- Glosario integrado
- Resaltado de conceptos clave
- Seguimiento de progreso

### 🌐 Despliegue

- ✅ Compatible con Vercel
- ✅ Compatible con Netlify
- ✅ Compatible con GitHub Pages
- ✅ Servidor de desarrollo local

### 📊 Métricas

- **Componentes**: 7 componentes React
- **Servicios**: 1 servicio de IA
- **Tipos**: 15+ interfaces TypeScript
- **Documentación**: 12 archivos markdown
- **Líneas de código**: ~2,500 líneas

### 🎓 Casos de Uso

1. **Educación**: Crear cursos para estudiantes
2. **Capacitación**: Entrenar equipos en nuevas tecnologías
3. **Documentación**: Generar guías técnicas
4. **Aprendizaje**: Estudiar nuevos temas de forma estructurada

### 🔮 Próximas Versiones

Ver [RESUMEN-PROYECTO.md](RESUMEN-PROYECTO.md) para el roadmap completo.

#### v1.1.0 (Planeado)
- [ ] Backend proxy para API key
- [ ] Rate limiting por usuario
- [ ] Más idiomas (inglés, francés, etc.)
- [ ] Temas personalizables

#### v1.2.0 (Planeado)
- [ ] Autenticación de usuarios
- [ ] Base de datos para guardar cursos
- [ ] Compartir cursos entre usuarios
- [ ] Editor de contenido integrado

#### v2.0.0 (Futuro)
- [ ] Colaboración en tiempo real
- [ ] Marketplace de cursos
- [ ] Integración con LMS
- [ ] App móvil

### 🙏 Agradecimientos

- **Google Gemini AI**: Por la potente API de generación
- **Vercel**: Por el hosting gratuito
- **Netlify**: Por la plataforma de despliegue
- **Comunidad Open Source**: Por las increíbles herramientas

### 📄 Licencia

Este proyecto fue generado con AI Studio.

---

## Formato de Versiones

Este proyecto usa [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.X.0): Nueva funcionalidad compatible
- **PATCH** (0.0.X): Correcciones de bugs

## Tipos de Cambios

- **Added**: Nueva funcionalidad
- **Changed**: Cambios en funcionalidad existente
- **Deprecated**: Funcionalidad que será removida
- **Removed**: Funcionalidad removida
- **Fixed**: Corrección de bugs
- **Security**: Correcciones de seguridad

---

<div align="center">

**[Volver al README](README.md)** | **[Ver Documentación](INDEX.md)**

</div>
