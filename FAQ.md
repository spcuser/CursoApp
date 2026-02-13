# ❓ Preguntas Frecuentes (FAQ) - CursoAPP

## 🎯 General

### ¿Qué es CursoAPP?
CursoAPP es una aplicación web que usa Gemini AI para generar cursos completos sobre cualquier tema. Analiza tu tema, lo descompone en pilares fundamentales, y crea lecciones detalladas con quizzes y glosarios.

### ¿Es gratis?
La aplicación es gratuita, pero necesitas una API key de Gemini. Google ofrece una cuota gratuita generosa para empezar.

### ¿Necesito saber programar?
No para usar la app. Solo necesitas:
1. Instalar Node.js
2. Ejecutar `INICIO-RAPIDO.bat` (Windows)
3. Configurar tu API key

## 🔑 API Key y Costos

### ¿Cómo obtengo una API key?
1. Ve a https://ai.google.dev/
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Get API Key"
4. Copia tu clave

### ¿Cuánto cuesta usar Gemini?
Google ofrece:
- **Gratis**: 15 solicitudes por minuto, 1500 por día
- **Pago**: Planes desde $0.00025 por 1000 caracteres

Ver precios actualizados: https://ai.google.dev/pricing

### ¿Puedo compartir mi API key?
**NO.** Nunca compartas tu API key. Cada persona debería usar su propia clave. Si quieres compartir la app, despliégala en Vercel/Netlify.

### ¿Qué pasa si excedo mi cuota?
Recibirás un error 429. Opciones:
1. Espera a que se renueve tu cuota (diaria)
2. Actualiza a un plan de pago
3. Usa otra API key

## 💻 Instalación y Uso

### ¿Qué necesito instalar?
Solo Node.js (v18 o superior). Descárgalo de https://nodejs.org/

### ¿Funciona en Mac/Linux?
Sí, pero los archivos `.bat` son solo para Windows. En Mac/Linux usa:
```bash
npm install
npm run dev
```

### ¿Puedo usar la app sin internet?
No, necesitas internet para:
- Llamadas a la API de Gemini
- Cargar Tailwind CSS desde CDN
- Generar imágenes

### ¿Dónde se guardan mis cursos?
Localmente en tu navegador (localStorage). No se envían a ningún servidor. Para hacer backup, usa el botón "Exportar" en la app.

## 🌐 Despliegue

### ¿Cuál es la mejor plataforma para desplegar?
**Vercel** es la más fácil y rápida. Alternativas: Netlify, GitHub Pages.

### ¿Puedo usar un dominio personalizado?
Sí, tanto Vercel como Netlify permiten dominios personalizados (algunos planes requieren pago).

### ¿Cómo comparto la app con mi equipo?
1. Despliega en Vercel/Netlify
2. Comparte el URL público (ej: `https://tu-app.vercel.app`)
3. Cada usuario necesitará su propia API key (o implementa un backend)

### ¿Puedo desplegar sin exponer mi API key?
Sí, implementa un backend proxy. Ver [SEGURIDAD.md](SEGURIDAD.md) para detalles.

## 🎨 Funcionalidades

### ¿Puedo subir PDFs?
Sí, la app puede extraer texto de PDFs y usarlo como contexto para generar cursos más específicos.

### ¿Las imágenes siempre se generan?
No, depende de tu cuota de generación de imágenes. La app funciona perfectamente sin imágenes.

### ¿Puedo editar el contenido generado?
Actualmente no hay editor integrado, pero puedes:
1. Copiar el contenido
2. Editarlo externamente
3. O modificar el código para agregar un editor

### ¿Puedo exportar a otros formatos además de PDF?
Actualmente solo PDF. Puedes extender la funcionalidad para exportar a:
- Word (usando docx.js)
- Markdown
- HTML

### ¿Los quizzes se barajan?
Sí, cada vez que abres un quiz, las preguntas y opciones se barajan aleatoriamente.

## 🔧 Problemas Técnicos

### "npm no se reconoce"
Instala Node.js desde https://nodejs.org/ y reinicia tu terminal.

### "API Key inválida"
Verifica que:
1. Tu clave en `.env.local` sea correcta
2. No tenga espacios extra
3. Empiece con `AIzaSy`

### La app es muy lenta
Posibles causas:
1. Conexión a internet lenta
2. Cuota de API casi agotada
3. Modelo de IA sobrecargado (prueba más tarde)

### Los estilos no se ven bien
1. Verifica tu conexión a internet (Tailwind CSS se carga desde CDN)
2. Limpia el caché del navegador
3. Prueba en modo incógnito

## 🛡️ Seguridad

### ¿Es seguro usar mi API key en el frontend?
Para desarrollo local, sí. Para producción, se recomienda un backend proxy. Ver [SEGURIDAD.md](SEGURIDAD.md).

### ¿Mis datos se envían a algún servidor?
Solo a la API de Gemini para generar contenido. Todo lo demás se guarda localmente en tu navegador.

### ¿Puedo usar la app en modo privado/incógnito?
Sí, pero no se guardará tu historial (localStorage no persiste en modo incógnito).

## 🚀 Personalización

### ¿Puedo cambiar los colores?
Sí, edita los colores en `index.html` (configuración de Tailwind) y en los componentes.

### ¿Puedo agregar más idiomas?
Sí, edita el objeto `TRANSLATIONS` en `App.tsx` y agrega tu idioma.

### ¿Puedo usar otro modelo de IA?
Sí, pero requiere modificar `services/geminiService.ts`. Modelos compatibles:
- gemini-2.5-flash
- gemini-3-flash-preview
- gemini-3-pro-preview

### ¿Puedo agregar autenticación?
Sí, puedes integrar:
- Firebase Auth
- Auth0
- Clerk
- Tu propio sistema

## 📊 Límites y Restricciones

### ¿Cuántos cursos puedo generar?
Depende de tu cuota de API. Con el plan gratuito: ~50-100 cursos por día.

### ¿Cuánto texto puede generar?
Cada curso puede tener hasta ~10,000 palabras (depende del modelo y configuración).

### ¿Puedo generar cursos en otros idiomas?
Sí, la app soporta español por defecto. Puedes cambiar el idioma en el código.

## 🔄 Actualizaciones

### ¿Cómo actualizo la app?
```bash
git pull origin main
npm install
npm run build
```

### ¿Hay actualizaciones automáticas?
No, debes actualizar manualmente. Considera configurar GitHub Actions para CI/CD.

## 💡 Mejores Prácticas

### ¿Cómo obtengo mejores resultados?
1. Sé específico con tus temas
2. Usa PDFs como contexto adicional
3. Elige el nivel de profundidad adecuado
4. Revisa y ajusta el contenido generado

### ¿Cuándo usar cada nivel de profundidad?
- **Express**: Resúmenes rápidos, 5-10 min de lectura
- **Estándar**: Cursos completos, 20-30 min
- **Profundo**: Contenido exhaustivo, 45+ min

### ¿Debo revisar el contenido generado?
Sí, siempre. La IA es muy buena pero puede cometer errores. Revisa:
- Exactitud técnica
- Coherencia
- Gramática
- Relevancia

## 🤝 Contribuir

### ¿Puedo contribuir al proyecto?
Sí, el código es open source. Puedes:
1. Reportar bugs
2. Sugerir mejoras
3. Enviar pull requests
4. Mejorar la documentación

### ¿Dónde reporto bugs?
Crea un issue en GitHub con:
- Descripción del problema
- Pasos para reproducir
- Capturas de pantalla
- Logs de error

## 📞 Soporte

### ¿Dónde obtengo ayuda?
1. Lee [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)
2. Revisa esta FAQ
3. Busca en GitHub Issues
4. Consulta la documentación oficial de Gemini

### ¿Hay una comunidad?
Puedes crear una comunidad en:
- Discord
- Slack
- GitHub Discussions

---

## 🎓 Recursos Adicionales

- **Documentación Gemini**: https://ai.google.dev/docs
- **Guía de Inicio**: [EMPIEZA-AQUI.md](EMPIEZA-AQUI.md)
- **Seguridad**: [SEGURIDAD.md](SEGURIDAD.md)
- **Despliegue**: [deploy.md](deploy.md)

---

**¿Tu pregunta no está aquí?** Abre un issue en GitHub o consulta la documentación oficial.
