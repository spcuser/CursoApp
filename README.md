<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎓 CursoAPP - Generador de Cursos con IA

Transforma cualquier tema en un curso completo y profesional usando Gemini AI.

## ✨ Características

- 🧠 **Análisis Inteligente**: Descompone cualquier tema en pilares fundamentales
- 📚 **Cursos Completos**: Genera lecciones detalladas con contenido markdown
- 🎯 **Quizzes Interactivos**: Evaluaciones automáticas con feedback instantáneo
- 📖 **Glosario Técnico**: Términos clave con definiciones contextuales
- 🎨 **Imágenes AI**: Ilustraciones generadas automáticamente para cada módulo
- 💾 **Guardado Automático**: Tu progreso se guarda localmente
- 📄 **Exportación PDF**: Descarga tus cursos en formato profesional
- 🌙 **Modo Oscuro**: Interfaz moderna y cómoda para la vista

## 🚀 Inicio Rápido (Windows)

### Opción 1: Doble clic (Más Fácil)
1. Haz doble clic en `INICIO-RAPIDO.bat`
2. Espera a que se instalen las dependencias
3. Configura tu API key en `.env.local`
4. ¡Listo! La app se abrirá en tu navegador

### Opción 2: Línea de comandos
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar API Key
# Edita .env.local y agrega tu clave de Gemini

# 3. Iniciar servidor de desarrollo
npm run dev
```

## 🔑 Obtener API Key de Gemini

1. Ve a https://ai.google.dev/
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Get API Key"
4. Copia tu clave y pégala en `.env.local`

```env
GEMINI_API_KEY=AIzaSy...tu_clave_aqui
```

## 📦 Construir para Producción

```bash
# Opción 1: Doble clic
CONSTRUIR.bat

# Opción 2: Comando
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`

## 🌐 Desplegar y Compartir

### Vercel (Recomendado)
1. Sube tu código a GitHub
2. Ve a https://vercel.com/new
3. Importa tu repositorio
4. Agrega la variable `GEMINI_API_KEY`
5. Deploy automático ✨

### Netlify
1. Arrastra la carpeta `dist` a https://app.netlify.com/drop
2. O conecta tu repositorio de GitHub
3. Configura `GEMINI_API_KEY` en las variables de entorno

**Ver guía completa**: [INSTRUCCIONES.md](INSTRUCCIONES.md) y [deploy.md](deploy.md)

## 📖 Cómo Usar

1. **Ingresa un tema** o sube un PDF como contexto
2. **Selecciona un pilar** de los 10 generados por la IA
3. **Elige una variación** y nivel de profundidad (Express/Estándar/Profundo)
4. **Explora tu curso** con lecciones, quizzes y glosario interactivo
5. **Guarda y exporta** tu progreso

## 🛠️ Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Estilos (vía CDN)
- **Gemini AI** - Generación de contenido
- **jsPDF** - Exportación a PDF
- **PDF.js** - Lectura de PDFs

## 📁 Estructura del Proyecto

```
cursoapp/
├── components/          # Componentes React
│   ├── CourseView.tsx   # Vista del curso
│   ├── PillarSelection.tsx
│   ├── VariationSelection.tsx
│   └── ...
├── services/
│   └── geminiService.ts # Integración con Gemini AI
├── types.ts             # Definiciones TypeScript
├── App.tsx              # Componente principal
├── index.html           # HTML base
├── vite.config.ts       # Configuración Vite
└── .env.local           # Variables de entorno

```

## 🐛 Solución de Problemas

### "npm no se reconoce"
- Instala Node.js desde https://nodejs.org/

### "API Key inválida"
- Verifica tu clave en `.env.local`
- Asegúrate de que la API de Gemini esté habilitada

### Error al construir
```bash
# Limpia e reinstala
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 📄 Licencia

Este proyecto fue generado con AI Studio.

## 📚 Documentación Completa

Este proyecto incluye documentación exhaustiva para todos los niveles:

- 📖 **[INDEX.md](INDEX.md)** - Índice completo de toda la documentación
- 🚀 **[EMPIEZA-AQUI.md](EMPIEZA-AQUI.md)** - Guía de 5 minutos
- 📋 **[INSTRUCCIONES.md](INSTRUCCIONES.md)** - Guía completa de instalación
- 🌐 **[deploy.md](deploy.md)** - Guía de despliegue
- 🔐 **[SEGURIDAD.md](SEGURIDAD.md)** - Mejores prácticas de seguridad
- 🐛 **[SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)** - Troubleshooting
- ❓ **[FAQ.md](FAQ.md)** - Preguntas frecuentes
- 🤝 **[CONTRIBUIR.md](CONTRIBUIR.md)** - Guía de contribución
- 🔄 **[FLUJO-APLICACION.md](FLUJO-APLICACION.md)** - Diagramas de flujo
- ✅ **[CHECKLIST-DESPLIEGUE.md](CHECKLIST-DESPLIEGUE.md)** - Checklist
- 📊 **[RESUMEN-PROYECTO.md](RESUMEN-PROYECTO.md)** - Resumen técnico

## 🔗 Enlaces Útiles

- [Documentación Gemini](https://ai.google.dev/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

---

<div align="center">

**¿Primera vez?** → [EMPIEZA-AQUI.md](EMPIEZA-AQUI.md)

**¿Problemas?** → [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)

**¿Preguntas?** → [FAQ.md](FAQ.md)

Hecho con ❤️ y 🤖 Gemini AI

</div>
