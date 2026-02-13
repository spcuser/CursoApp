# 🚀 EMPIEZA AQUÍ - Guía de 5 Minutos

## ⚡ Inicio Ultra Rápido

### Para Windows (Más Fácil)

1. **Haz doble clic** en `INICIO-RAPIDO.bat`
2. **Espera** a que se instalen las dependencias
3. **Configura tu API key** (ver abajo)
4. **¡Listo!** La app se abrirá automáticamente

### Para Línea de Comandos

```bash
npm install
npm run dev
```

## 🔑 Configurar API Key (IMPORTANTE)

### Paso 1: Obtener tu clave
1. Ve a: https://ai.google.dev/
2. Haz clic en "Get API Key"
3. Copia tu clave (empieza con `AIzaSy...`)

### Paso 2: Configurar en tu proyecto
1. Abre el archivo `.env.local`
2. Reemplaza `tu_clave_api_aqui` con tu clave:
   ```
   GEMINI_API_KEY=AIzaSy...tu_clave_real
   ```
3. Guarda el archivo

## 🎯 Usar la Aplicación

1. **Escribe un tema** (ej: "Marketing Digital")
2. **Selecciona un pilar** de los 10 generados
3. **Elige una variación** y profundidad
4. **Explora tu curso** completo con lecciones y quizzes

## 🌐 Compartir con Compañeros

### Opción 1: Vercel (Gratis y Fácil)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Desplegar
vercel

# 3. Configurar API key
vercel env add GEMINI_API_KEY

# 4. Producción
vercel --prod
```

Recibirás un enlace como: `https://tu-app.vercel.app`

### Opción 2: Netlify

1. Construye: `npm run build`
2. Arrastra la carpeta `dist` a: https://app.netlify.com/drop
3. Configura `GEMINI_API_KEY` en las variables de entorno

## 📚 Documentación Completa

- **Instalación detallada**: [INSTRUCCIONES.md](INSTRUCCIONES.md)
- **Despliegue**: [deploy.md](deploy.md)
- **Seguridad**: [SEGURIDAD.md](SEGURIDAD.md)
- **Problemas**: [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)

## ❓ Problemas Comunes

### "npm no se reconoce"
→ Instala Node.js desde https://nodejs.org/

### "API Key inválida"
→ Verifica que tu clave en `.env.local` sea correcta

### La app no carga
→ Asegúrate de que el servidor esté corriendo en http://localhost:3000

## 🎉 ¡Eso es Todo!

Ya estás listo para crear cursos increíbles con IA.

**Siguiente paso**: Abre http://localhost:3000 y empieza a crear.

---

**¿Necesitas ayuda?** Lee [SOLUCION-PROBLEMAS.md](SOLUCION-PROBLEMAS.md)
