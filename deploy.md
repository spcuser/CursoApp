# 🚀 Guía de Despliegue - CursoAPP

Esta guía te ayudará a desplegar CursoAPP en la nube para que tus amigos puedan acceder desde cualquier lugar.

## 🎯 Opciones de Despliegue

Recomendamos **Vercel** por su facilidad de uso y excelente integración con Vite/React.

### Opción 1: Vercel (Recomendado) ⭐

### Opción 2: Netlify

### Opción 3: Firebase Hosting

---

## 🚀 Opción 1: Despliegue en Vercel (Recomendado)

### Ventajas
- ✅ Completamente GRATIS
- ✅ Despliegue automático desde GitHub
- ✅ HTTPS incluido
- ✅ CDN global (rápido en todo el mundo)
- ✅ Configuración de variables de entorno fácil

### Paso 1: Preparar el Repositorio

1. Sube tu código a GitHub (si no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/cursoapp.git
   git push -u origin main
   ```

2. **IMPORTANTE**: Asegúrate de que `.env.local` esté en `.gitignore` (ya debería estarlo)

### Paso 2: Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel para acceder a tus repositorios

### Paso 3: Importar Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Busca tu repositorio `cursoapp`
3. Haz clic en **"Import"**

### Paso 4: Configurar Variables de Entorno

1. En la sección **"Environment Variables"**, agrega TODAS las variables de tu `.env.local`:

```
VITE_FIREBASE_API_KEY = tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN = tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET = tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = tu_sender_id
VITE_FIREBASE_APP_ID = tu_app_id
```

**Nota**: NO incluyas `VITE_GEMINI_API_KEY` aquí. Cada usuario configurará la suya.

2. Asegúrate de que estén disponibles para **Production**, **Preview** y **Development**

### Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel construye tu aplicación
3. ¡Listo! Vercel te dará una URL como: `https://cursoapp-xxxxx.vercel.app`

### Paso 6: Configurar Dominio Personalizado (Opcional)

1. En el dashboard del proyecto, ve a **"Settings"** → **"Domains"**
2. Agrega tu dominio personalizado (si tienes uno)
3. Sigue las instrucciones para configurar los DNS

### Actualizaciones Automáticas

Cada vez que hagas `git push` a tu repositorio, Vercel desplegará automáticamente los cambios. 🎉

---

## 🌐 Opción 2: Despliegue en Netlify

### Ventajas
- ✅ Completamente GRATIS
- ✅ Interfaz muy amigable
- ✅ Despliegue desde GitHub
- ✅ HTTPS incluido

### Paso 1: Preparar el Repositorio

(Igual que Vercel - sube tu código a GitHub)

### Paso 2: Crear Cuenta en Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Haz clic en **"Sign up"**
3. Selecciona **"GitHub"**

### Paso 3: Importar Proyecto

1. Haz clic en **"Add new site"** → **"Import an existing project"**
2. Selecciona **"GitHub"**
3. Busca y selecciona tu repositorio `cursoapp`

### Paso 4: Configurar Build

1. **Build command**: `npm run build`
2. **Publish directory**: `dist`
3. Haz clic en **"Show advanced"**

### Paso 5: Variables de Entorno

Agrega las mismas variables que en Vercel:

```
VITE_FIREBASE_API_KEY = tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN = tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET = tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = tu_sender_id
VITE_FIREBASE_APP_ID = tu_app_id
```

### Paso 6: Desplegar

1. Haz clic en **"Deploy site"**
2. Espera 1-2 minutos
3. ¡Listo! URL: `https://tu-app.netlify.app`

---

## 🔥 Opción 3: Firebase Hosting

### Ventajas
- ✅ Integrado con Firebase
- ✅ GRATIS (10 GB/mes)
- ✅ CDN global

### Paso 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### Paso 2: Login en Firebase

```bash
firebase login
```

### Paso 3: Inicializar Firebase Hosting

```bash
firebase init hosting
```

Responde:
- **Project**: Selecciona tu proyecto de Firebase
- **Public directory**: `dist`
- **Single-page app**: `Yes`
- **GitHub deploys**: `No` (por ahora)

### Paso 4: Build y Deploy

```bash
npm run build
firebase deploy --only hosting
```

Tu app estará en: `https://tu-proyecto.web.app`

---

## 🔒 Configuración de Firebase para Producción

Después de desplegar, actualiza Firebase:

### 1. Dominios Autorizados

1. Ve a Firebase Console → **Authentication** → **Settings**
2. En **"Authorized domains"**, agrega:
   - Tu dominio de Vercel: `cursoapp-xxxxx.vercel.app`
   - O tu dominio de Netlify: `tu-app.netlify.app`
   - O tu dominio personalizado

### 2. Verificar Reglas de Firestore

Asegúrate de que las reglas de seguridad estén activas (ver `FIREBASE-SETUP.md`)

---

## 📱 Compartir con Amigos

Una vez desplegado, simplemente comparte la URL:

```
https://tu-app.vercel.app
```

Tus amigos deberán:
1. Crear una cuenta (email + contraseña)
2. Configurar su propia API key de Gemini
3. ¡Empezar a crear cursos!

### Instrucciones para Usuarios

Puedes compartir este mensaje:

```
🎓 ¡Bienvenido a CursoAPP!

1. Regístrate con tu email
2. Ve a Ajustes (⚙️) y haz clic en "Configurar Mi API Key"
3. Sigue las instrucciones para obtener tu API key GRATIS de Google
4. ¡Empieza a generar cursos!

Cada uno paga solo por su propio uso (hay cuota gratuita generosa).
Tus cursos son privados y solo tú puedes verlos.

URL: https://tu-app.vercel.app
```

---

## 💰 Costos Estimados

### Hosting (Vercel/Netlify)
- **Costo**: $0 (GRATIS)
- **Límites**: 100 GB ancho de banda/mes (más que suficiente)

### Firebase
- **Costo**: $0 (plan Spark)
- **Límites**: 50,000 lecturas/día (suficiente para ~100 usuarios activos)

### Gemini API
- **Costo**: $0 por ti (cada usuario usa su propia key)
- **Cuota gratuita por usuario**: 1,500 peticiones/día

**Total para ti**: $0 al mes 🎉

---

## 🔧 Mantenimiento

### Actualizar la Aplicación

1. Haz cambios en tu código local
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push
   ```
3. Vercel/Netlify desplegará automáticamente

### Monitorear Uso

- **Firebase**: Console → Usage
- **Vercel**: Dashboard → Analytics
- **Netlify**: Site → Analytics

---

## ❓ Problemas Comunes

### Error: "Failed to load resource"

- Verifica que las variables de entorno estén configuradas en Vercel/Netlify
- Asegúrate de que empiecen con `VITE_`

### Error: "Firebase: Error (auth/unauthorized-domain)"

- Agrega tu dominio de producción a los dominios autorizados en Firebase

### La aplicación carga pero no funciona

- Revisa la consola del navegador (F12)
- Verifica que Firebase esté configurado correctamente

---

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Netlify](https://docs.netlify.com)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

¡Listo para compartir tu aplicación con el mundo! 🌍✨
