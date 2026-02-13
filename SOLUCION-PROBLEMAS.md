# 🔧 Solución de Problemas - CursoAPP

## 🚫 Problemas Comunes y Soluciones

### 1. "npm no se reconoce como comando"

**Causa**: Node.js no está instalado o no está en el PATH.

**Solución**:
```bash
# 1. Descarga Node.js desde https://nodejs.org/
# 2. Instala la versión LTS (recomendada)
# 3. Reinicia tu terminal
# 4. Verifica la instalación:
node --version
npm --version
```

### 2. Error: "Cannot find module"

**Causa**: Dependencias no instaladas o corruptas.

**Solución**:
```bash
# Opción 1: Reinstalar dependencias
npm install

# Opción 2: Limpieza completa
rmdir /s /q node_modules
del package-lock.json
npm install

# Opción 3: Usar npm cache clean
npm cache clean --force
npm install
```

### 3. "API Key inválida" o "401 Unauthorized"

**Causa**: API key incorrecta o no configurada.

**Solución**:
1. Verifica que `.env.local` existe
2. Abre `.env.local` y verifica que la clave sea correcta:
   ```
   GEMINI_API_KEY=AIzaSy...tu_clave_completa
   ```
3. Obtén una nueva clave en https://ai.google.dev/
4. Reinicia el servidor de desarrollo

### 4. "RESOURCE_EXHAUSTED" o Error 429

**Causa**: Has excedido tu cuota de API.

**Solución**:
- Espera unos minutos (límite por minuto)
- Revisa tu cuota en https://ai.google.dev/
- Considera actualizar tu plan
- Implementa rate limiting en tu app

### 5. La aplicación no carga en el navegador

**Causa**: Puerto ocupado o servidor no iniciado.

**Solución**:
```bash
# 1. Verifica que el servidor esté corriendo
# Deberías ver: "Local: http://localhost:3000"

# 2. Si el puerto 3000 está ocupado, usa otro:
# Edita vite.config.ts y cambia el puerto

# 3. Limpia el caché del navegador
# Ctrl + Shift + Delete

# 4. Prueba en modo incógnito
```

### 6. Errores de TypeScript

**Causa**: Tipos incorrectos o archivos de definición faltantes.

**Solución**:
```bash
# 1. Verifica que global.d.ts existe
# 2. Reinstala tipos:
npm install --save-dev @types/node

# 3. Limpia y reconstruye:
npm run build
```

### 7. "Failed to fetch" en producción

**Causa**: Variables de entorno no configuradas en Vercel/Netlify.

**Solución Vercel**:
```bash
# Opción 1: CLI
vercel env add GEMINI_API_KEY

# Opción 2: Dashboard
# 1. Ve a tu proyecto en vercel.com
# 2. Settings > Environment Variables
# 3. Agrega GEMINI_API_KEY
# 4. Redeploy
```

**Solución Netlify**:
```bash
# Dashboard:
# 1. Site settings > Environment variables
# 2. Add variable: GEMINI_API_KEY
# 3. Trigger deploy
```

### 8. Imágenes no se generan

**Causa**: Cuota de generación de imágenes agotada o modelo no disponible.

**Solución**:
- Esto es normal, la app funciona sin imágenes
- Las imágenes son opcionales y se generan cuando hay cuota disponible
- Revisa tu uso en https://ai.google.dev/

### 9. El PDF no se descarga

**Causa**: Bloqueador de pop-ups o error en jsPDF.

**Solución**:
```bash
# 1. Permite pop-ups en tu navegador
# 2. Verifica la consola del navegador (F12)
# 3. Reinstala jsPDF:
npm install jspdf@2.5.1 --save
```

### 10. Estilos no se aplican correctamente

**Causa**: Tailwind CSS no carga desde CDN.

**Solución**:
1. Verifica tu conexión a internet
2. Revisa que `index.html` tenga:
   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   ```
3. Limpia el caché del navegador

## 🐛 Debugging Avanzado

### Ver logs detallados

```bash
# Modo verbose
npm run dev -- --debug

# Ver logs de red en el navegador
# F12 > Network tab
```

### Verificar configuración

```bash
# Ver variables de entorno
echo %GEMINI_API_KEY%

# Ver versión de Node
node --version

# Ver dependencias instaladas
npm list
```

### Probar la API directamente

```javascript
// Abre la consola del navegador (F12) y ejecuta:
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=TU_API_KEY')
  .then(r => r.json())
  .then(console.log)
```

## 📱 Problemas Específicos de Plataforma

### Windows

```bash
# Si hay problemas con permisos:
# Ejecuta PowerShell como Administrador

# Si npm install falla:
npm install --legacy-peer-deps
```

### macOS/Linux

```bash
# Si hay problemas con permisos:
sudo npm install -g npm

# Cambiar permisos de node_modules:
sudo chown -R $USER node_modules
```

## 🔍 Herramientas de Diagnóstico

### Verificar instalación completa

```bash
# Ejecuta este script para verificar todo:
node --version && npm --version && echo "Node OK" || echo "Node FALTA"
```

### Verificar build

```bash
# Construir y ver errores:
npm run build 2>&1 | tee build.log
```

## 📞 Obtener Ayuda

Si ninguna solución funciona:

1. **Revisa los logs**: Busca mensajes de error específicos
2. **Busca en GitHub Issues**: Puede que alguien ya haya tenido el mismo problema
3. **Documentación oficial**:
   - [Gemini API Docs](https://ai.google.dev/docs)
   - [Vite Docs](https://vitejs.dev/)
   - [React Docs](https://react.dev/)

## 🔄 Reseteo Completo

Si todo falla, resetea completamente:

```bash
# 1. Elimina todo
rmdir /s /q node_modules
rmdir /s /q dist
del package-lock.json

# 2. Reinstala
npm install

# 3. Reconstruye
npm run build

# 4. Prueba
npm run dev
```

## ✅ Checklist de Verificación

Antes de pedir ayuda, verifica:

- [ ] Node.js instalado (v18+)
- [ ] Dependencias instaladas (`node_modules` existe)
- [ ] `.env.local` configurado correctamente
- [ ] API key válida y con cuota disponible
- [ ] Puerto 3000 disponible
- [ ] Conexión a internet activa
- [ ] Navegador actualizado
- [ ] Caché del navegador limpio

---

**Tip**: La mayoría de problemas se resuelven con `npm install` y reiniciar el servidor.
