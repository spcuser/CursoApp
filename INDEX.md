# 📚 Índice de Documentación - CursoAPP

Bienvenido a la documentación completa de CursoAPP. Esta página te ayudará a encontrar rápidamente la información que necesitas.

## 🚀 Inicio Rápido

¿Primera vez aquí? Empieza por estos documentos:

1. **[EMPIEZA-AQUI.md](EMPIEZA-AQUI.md)** ⭐
   - Guía de 5 minutos para empezar
   - Instalación rápida
   - Configuración básica

2. **[README.md](README.md)**
   - Visión general del proyecto
   - Características principales
   - Comandos básicos

3. **[INSTRUCCIONES.md](INSTRUCCIONES.md)**
   - Instalación detallada paso a paso
   - Configuración completa
   - Guía de despliegue

## 📖 Documentación por Categoría

### 🎯 Para Usuarios

| Documento | Descripción | Cuándo Leerlo |
|-----------|-------------|---------------|
| [EMPIEZA-AQUI.md](EMPIEZA-AQUI.md) | Inicio ultra rápido | Primera vez usando la app |
| [FAQ.md](FAQ.md) | Preguntas frecuentes | Tienes dudas generales |
| [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md) | Troubleshooting | Algo no funciona |

### 🚀 Para Despliegue

| Documento | Descripción | Cuándo Leerlo |
|-----------|-------------|---------------|
| [deploy.md](deploy.md) | Guía rápida de despliegue | Quieres compartir la app |
| [INSTRUCCIONES.md](INSTRUCCIONES.md) | Despliegue detallado | Primera vez desplegando |
| [CHECKLIST-DESPLIEGUE.md](CHECKLIST-DESPLIEGUE.md) | Checklist pre-despliegue | Antes de ir a producción |
| [vercel.json](vercel.json) | Configuración Vercel | Desplegando en Vercel |
| [netlify.toml](netlify.toml) | Configuración Netlify | Desplegando en Netlify |

### 🔐 Para Seguridad

| Documento | Descripción | Cuándo Leerlo |
|-----------|-------------|---------------|
| [SEGURIDAD.md](SEGURIDAD.md) | Mejores prácticas | Antes de compartir públicamente |
| [.env.example](.env.example) | Ejemplo de variables | Configurando API key |

### 💻 Para Desarrolladores

| Documento | Descripción | Cuándo Leerlo |
|-----------|-------------|---------------|
| [CONTRIBUIR.md](CONTRIBUIR.md) | Guía de contribución | Quieres contribuir al proyecto |
| [FLUJO-APLICACION.md](FLUJO-APLICACION.md) | Diagramas de flujo | Entendiendo la arquitectura |
| [RESUMEN-PROYECTO.md](RESUMEN-PROYECTO.md) | Resumen técnico completo | Visión general técnica |
| [types.ts](types.ts) | Definiciones TypeScript | Trabajando con tipos |
| [global.d.ts](global.d.ts) | Tipos globales | Extendiendo tipos |

### 📊 Documentación Técnica

| Documento | Descripción | Cuándo Leerlo |
|-----------|-------------|---------------|
| [package.json](package.json) | Dependencias y scripts | Instalando o actualizando |
| [tsconfig.json](tsconfig.json) | Configuración TypeScript | Configurando el proyecto |
| [vite.config.ts](vite.config.ts) | Configuración Vite | Modificando el build |
| [.gitignore](.gitignore) | Archivos ignorados | Configurando Git |

## 🗂️ Documentación por Flujo de Trabajo

### Flujo 1: Primer Uso (Local)

```
1. EMPIEZA-AQUI.md          → Inicio rápido
2. .env.example             → Configurar API key
3. INICIO-RAPIDO.bat        → Ejecutar (Windows)
4. FAQ.md                   → Si tienes dudas
5. SOLUCION-PROBLEMAS.md    → Si algo falla
```

### Flujo 2: Desplegar para Compartir

```
1. INSTRUCCIONES.md         → Entender opciones
2. deploy.md                → Guía rápida
3. SEGURIDAD.md             → Proteger API key
4. CHECKLIST-DESPLIEGUE.md  → Verificar todo
5. vercel.json/netlify.toml → Configurar plataforma
```

### Flujo 3: Contribuir al Proyecto

```
1. README.md                → Entender el proyecto
2. RESUMEN-PROYECTO.md      → Visión técnica
3. FLUJO-APLICACION.md      → Arquitectura
4. CONTRIBUIR.md            → Guía de contribución
5. types.ts                 → Tipos del proyecto
```

### Flujo 4: Solucionar Problemas

```
1. SOLUCION-PROBLEMAS.md    → Problemas comunes
2. FAQ.md                   → Preguntas frecuentes
3. README.md                → Verificar requisitos
4. .env.example             → Verificar configuración
```

## 📁 Estructura de Archivos

### 📄 Archivos de Código

```
App.tsx                     → Componente principal
index.tsx                   → Punto de entrada
types.ts                    → Tipos TypeScript
global.d.ts                 → Tipos globales
index.html                  → HTML base

components/                 → Componentes React
├── CourseView.tsx          → Vista del curso
├── PillarSelection.tsx     → Selección de pilares
├── VariationSelection.tsx  → Selección de variaciones
├── TopicInput.tsx          → Entrada de tema
├── LoadingScreen.tsx       → Pantalla de carga
├── SettingsModal.tsx       → Modal de configuración
└── Sidebar.tsx             → Barra lateral

services/
└── geminiService.ts        → Integración Gemini AI
```

### ⚙️ Archivos de Configuración

```
package.json                → Dependencias
tsconfig.json               → Config TypeScript
vite.config.ts              → Config Vite
vercel.json                 → Config Vercel
netlify.toml                → Config Netlify
.gitignore                  → Git ignore
.env.local                  → Variables de entorno (local)
.env.example                → Ejemplo de .env
```

### 📚 Archivos de Documentación

```
README.md                   → Documentación principal
EMPIEZA-AQUI.md             → Inicio rápido
INSTRUCCIONES.md            → Guía completa
deploy.md                   → Despliegue rápido
SEGURIDAD.md                → Seguridad
SOLUCION-PROBLEMAS.md       → Troubleshooting
FAQ.md                      → Preguntas frecuentes
CONTRIBUIR.md               → Guía de contribución
FLUJO-APLICACION.md         → Diagramas de flujo
RESUMEN-PROYECTO.md         → Resumen técnico
CHECKLIST-DESPLIEGUE.md     → Checklist
INDEX.md                    → Este archivo
```

### 🚀 Scripts de Utilidad

```
INICIO-RAPIDO.bat           → Inicio rápido (Windows)
CONSTRUIR.bat               → Build (Windows)
```

### 🔧 Archivos de CI/CD

```
.github/workflows/deploy.yml → GitHub Actions
```

## 🎯 Casos de Uso Comunes

### "Quiero usar la app localmente"
→ [EMPIEZA-AQUI.md](EMPIEZA-AQUI.md)

### "Quiero compartir la app con mi equipo"
→ [deploy.md](deploy.md) + [SEGURIDAD.md](SEGURIDAD.md)

### "Algo no funciona"
→ [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)

### "Tengo una pregunta"
→ [FAQ.md](FAQ.md)

### "Quiero contribuir"
→ [CONTRIBUIR.md](CONTRIBUIR.md)

### "Quiero entender cómo funciona"
→ [FLUJO-APLICACION.md](FLUJO-APLICACION.md) + [RESUMEN-PROYECTO.md](RESUMEN-PROYECTO.md)

### "Necesito configurar mi API key"
→ [.env.example](.env.example) + [INSTRUCCIONES.md](INSTRUCCIONES.md)

### "Quiero desplegar en Vercel"
→ [deploy.md](deploy.md) + [vercel.json](vercel.json)

### "Quiero desplegar en Netlify"
→ [deploy.md](deploy.md) + [netlify.toml](netlify.toml)

### "Necesito proteger mi API key"
→ [SEGURIDAD.md](SEGURIDAD.md)

## 📊 Nivel de Detalle

| Nivel | Documentos | Para Quién |
|-------|-----------|------------|
| 🟢 Básico | EMPIEZA-AQUI.md, README.md | Usuarios nuevos |
| 🟡 Intermedio | INSTRUCCIONES.md, deploy.md, FAQ.md | Usuarios regulares |
| 🔴 Avanzado | SEGURIDAD.md, CONTRIBUIR.md, FLUJO-APLICACION.md | Desarrolladores |
| ⚫ Experto | RESUMEN-PROYECTO.md, types.ts, vite.config.ts | Contribuidores |

## 🔍 Búsqueda Rápida

### Por Tema

**Instalación**: EMPIEZA-AQUI.md, INSTRUCCIONES.md, README.md
**Despliegue**: deploy.md, CHECKLIST-DESPLIEGUE.md, vercel.json, netlify.toml
**Seguridad**: SEGURIDAD.md, .env.example
**Problemas**: SOLUCION-PROBLEMAS.md, FAQ.md
**Desarrollo**: CONTRIBUIR.md, FLUJO-APLICACION.md, RESUMEN-PROYECTO.md
**Configuración**: vite.config.ts, tsconfig.json, package.json

### Por Palabra Clave

**API Key**: SEGURIDAD.md, .env.example, INSTRUCCIONES.md
**Vercel**: deploy.md, vercel.json, INSTRUCCIONES.md
**Netlify**: deploy.md, netlify.toml, INSTRUCCIONES.md
**TypeScript**: types.ts, global.d.ts, tsconfig.json
**Gemini**: services/geminiService.ts, SEGURIDAD.md
**Quiz**: components/CourseView.tsx, FLUJO-APLICACION.md
**PDF**: components/CourseView.tsx, FAQ.md

## 📞 Soporte

Si no encuentras lo que buscas:

1. **Busca** en este índice
2. **Revisa** la [FAQ](FAQ.md)
3. **Consulta** [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)
4. **Lee** la documentación oficial de las tecnologías usadas
5. **Abre** un issue en GitHub

## 🎉 Empezar Ahora

**¿Listo para empezar?**

→ [EMPIEZA-AQUI.md](EMPIEZA-AQUI.md) (5 minutos)

**¿Quieres más detalles?**

→ [INSTRUCCIONES.md](INSTRUCCIONES.md) (15 minutos)

**¿Necesitas ayuda?**

→ [FAQ.md](FAQ.md) + [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)

---

## 📈 Actualizaciones

Este índice se actualiza con cada nueva versión de la documentación.

**Última actualización**: Febrero 2026

---

<div align="center">

**¿Perdido?** Empieza por [EMPIEZA-AQUI.md](EMPIEZA-AQUI.md)

**¿Problemas?** Lee [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)

**¿Preguntas?** Consulta [FAQ.md](FAQ.md)

</div>
