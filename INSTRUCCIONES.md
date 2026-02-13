# 🚀 Instrucciones de Instalación y Despliegue - CursoAPP

## 📋 Requisitos Previos

1. **Node.js** (versión 18 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica la instalación: `node --version` y `npm --version`

## 🔧 Instalación Local

### Paso 1: Instalar Dependencias
```bash
npm install
```

### Paso 2: Configurar API Key de Gemini
1. Obtén tu clave API gratuita en: https://ai.google.dev/
2. Abre el archivo `.env.local`
3. Reemplaza `tu_clave_api_aqui` con tu clave real:
```
GEMINI_API_KEY=AIzaSy...tu_clave_real
```

### Paso 3: Ejecutar en Local
```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 🌐 Despliegue para Compartir con Compañeros

### Opción 1: Vercel (Recomendado - Gratis)

1. **Crear cuenta en Vercel**
   - Ve a: https://vercel.com/signup
   - Regístrate con GitHub, GitLab o email

2. **Subir tu proyecto a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   git push -u origin main
   ```

3. **Importar en Vercel**
   - En Vercel, haz clic en "New Project"
   - Importa tu repositorio de GitHub
   - Configura las variables de entorno:
     - Nombre: `GEMINI_API_KEY`
     - Valor: Tu clave API de Gemini
   - Haz clic en "Deploy"

4. **Compartir el enlace**
   - Vercel te dará un enlace como: `https://tu-app.vercel.app`
   - Comparte este enlace con tus compañeros

### Opción 2: Netlify (Alternativa Gratis)

1. **Crear cuenta en Netlify**
   - Ve a: https://www.netlify.com/
   - Regístrate con GitHub o email

2. **Desplegar**
   - Arrastra la carpeta del proyecto a Netlify
   - O conecta tu repositorio de GitHub
   - Configura la variable de entorno `GEMINI_API_KEY`
   - Netlify construirá y desplegará automáticamente

3. **Compartir**
   - Netlify te dará un enlace como: `https://tu-app.netlify.app`

### Opción 3: GitHub Pages (Requiere configuración adicional)

1. **Modificar vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/nombre-de-tu-repo/',
     // ... resto de la configuración
   })
   ```

2. **Construir y desplegar**
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

## 🔐 Seguridad de la API Key

**IMPORTANTE:** 
- Nunca compartas tu API key públicamente
- Cada usuario debería usar su propia clave
- Para producción, considera implementar un backend que maneje las llamadas a la API

### Alternativa: Backend Proxy (Recomendado para producción)

Si quieres que tus compañeros usen la app sin necesitar su propia API key:

1. Crea un backend simple (Node.js/Express)
2. El backend hace las llamadas a Gemini con tu API key
3. Tu frontend llama a tu backend en lugar de directamente a Gemini
4. Implementa rate limiting para controlar el uso

## 📱 Uso de la Aplicación

1. **Ingresa un tema** o sube un PDF como base
2. **Selecciona un pilar** de los 10 generados
3. **Elige una variación** y el nivel de profundidad
4. **Explora el curso** generado con lecciones, quizzes y glosario
5. **Descarga en PDF** si lo necesitas

## 🐛 Solución de Problemas

### Error: "npm no se reconoce"
- Instala Node.js desde https://nodejs.org/

### Error: "API Key inválida"
- Verifica que tu clave en `.env.local` sea correcta
- Asegúrate de que la API de Gemini esté habilitada

### Error: "Cannot find module"
- Ejecuta `npm install` nuevamente
- Borra `node_modules` y ejecuta `npm install` de nuevo

### La app no carga en producción
- Verifica que las variables de entorno estén configuradas en tu plataforma
- Revisa los logs de construcción en Vercel/Netlify

## 📞 Soporte

Si tienes problemas, revisa:
- Documentación de Gemini: https://ai.google.dev/docs
- Documentación de Vite: https://vitejs.dev/
- Documentación de React: https://react.dev/

## 🎉 ¡Listo!

Tu aplicación está lista para usar y compartir. Disfruta creando cursos con IA.
