# 🚀 Configuración Simplificada - Solo para Ti

## 📋 Resumen

- ✅ **Tú**: Configuras Firebase y tu API key de Gemini
- ✅ **Tus amigos**: Solo crean cuenta (email + contraseña)
- ✅ **Tú pagas**: Todo el uso de Gemini (pero es barato)
- ✅ **Privacidad**: Cada uno ve solo sus cursos

---

## 🔧 PASO 1: Configurar Firebase (15 minutos)

### 1.1 Crear Proyecto

1. Ve a https://console.firebase.google.com/
2. Clic en **"Agregar proyecto"**
3. Nombre: `cursoapp` (o el que quieras)
4. Desactiva Google Analytics (no lo necesitas)
5. Clic en **"Crear proyecto"**

### 1.2 Registrar App Web

1. En la página del proyecto, clic en el ícono **Web** (`</>`)
2. Nombre: `CursoAPP Web`
3. Clic en **"Registrar app"**
4. **COPIA las credenciales** que aparecen (las necesitarás después)

### 1.3 Activar Authentication

1. Menú lateral → **"Authentication"**
2. Clic en **"Comenzar"**
3. Selecciona **"Correo electrónico/contraseña"**
4. **Activa** la primera opción
5. Clic en **"Guardar"**

### 1.4 Crear Firestore Database

1. Menú lateral → **"Firestore Database"**
2. Clic en **"Crear base de datos"**
3. Selecciona **"Modo de producción"**
4. Ubicación: `europe-west1` (Bélgica - cerca de España)
5. Clic en **"Habilitar"**

### 1.5 Configurar Reglas de Seguridad

1. En Firestore, ve a la pestaña **"Reglas"**
2. Reemplaza todo con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden leer/escribir su propio perfil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Usuarios solo pueden ver/modificar sus propios cursos
    match /courses/{courseId} {
      allow read, write, delete: if request.auth != null && 
                                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Clic en **"Publicar"**

---

## 🔑 PASO 2: Obtener tu API Key de Gemini (5 minutos)

1. Ve a https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Clic en **"Create API key"**
4. Selecciona un proyecto o crea uno nuevo
5. **COPIA la clave** (empieza con "AIza...")

---

## ⚙️ PASO 3: Configurar Variables de Entorno (2 minutos)

1. En la carpeta del proyecto, **copia** el archivo `.env.example`
2. **Renómbralo** a `.env.local`
3. Abre `.env.local` y reemplaza los valores:

```env
# Tu API key de Gemini
VITE_GEMINI_API_KEY=AIzaSy...tu_clave_real

# Credenciales de Firebase (del paso 1.2)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

4. **Guarda el archivo**

---

## 🧪 PASO 4: Probar Localmente (2 minutos)

1. Abre la terminal en la carpeta del proyecto
2. Ejecuta:

```bash
npm run dev
```

3. Abre el navegador en: http://localhost:5173
4. Deberías ver la pantalla de login
5. **Regístrate** con tu email
6. **Genera un curso** de prueba
7. Si funciona, ¡listo! ✅

---

## 🌐 PASO 5: Desplegar en Vercel (10 minutos)

### 5.1 Subir a GitHub

1. Si no tienes el código en GitHub:

```bash
git remote add origin https://github.com/tu-usuario/cursoapp.git
git push -u origin main
```

### 5.2 Desplegar en Vercel

1. Ve a https://vercel.com
2. Clic en **"Sign Up"** → **"Continue with GitHub"**
3. Clic en **"Add New..."** → **"Project"**
4. Busca tu repositorio `cursoapp`
5. Clic en **"Import"**

### 5.3 Configurar Variables de Entorno en Vercel

1. En la sección **"Environment Variables"**, agrega TODAS las variables de tu `.env.local`:

```
VITE_GEMINI_API_KEY = tu_clave_gemini
VITE_FIREBASE_API_KEY = tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN = tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET = tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = tu_sender_id
VITE_FIREBASE_APP_ID = tu_app_id
```

2. Asegúrate de marcar **Production**, **Preview** y **Development**
3. Clic en **"Deploy"**
4. Espera 1-2 minutos
5. ¡Listo! Vercel te dará una URL como: `https://cursoapp-xxxxx.vercel.app`

### 5.4 Autorizar Dominio en Firebase

1. Ve a Firebase Console → **Authentication** → **Settings**
2. En **"Authorized domains"**, clic en **"Add domain"**
3. Agrega tu dominio de Vercel: `cursoapp-xxxxx.vercel.app`
4. Clic en **"Add"**

---

## 👥 PASO 6: Compartir con Amigos

Comparte la URL de Vercel con tus amigos:

```
https://cursoapp-xxxxx.vercel.app
```

**Instrucciones para tus amigos:**

```
🎓 Bienvenido a CursoAPP

1. Abre: https://cursoapp-xxxxx.vercel.app
2. Haz clic en "Regístrate"
3. Ingresa tu email y contraseña
4. ¡Empieza a generar cursos!

Nota: No necesitas configurar nada más. 
Todo está listo para usar.
```

---

## 💰 Costos Estimados

### Para Ti:

**Hosting (Vercel):**
- Costo: $0 (GRATIS)
- Límite: 100 GB ancho de banda/mes

**Firebase:**
- Costo: $0 (plan Spark)
- Límite: 50,000 lecturas/día

**Gemini API:**
- Cuota gratuita: 1,500 peticiones/día
- Si excedes: ~$0.001 por petición
- **Estimado con 5 amigos**: $0-10/mes

**Total: $0-10/mes** (dependiendo del uso)

---

## 🔒 Seguridad

- ✅ Cada usuario solo ve sus cursos
- ✅ Las contraseñas están encriptadas
- ✅ Tu API key está segura en el servidor
- ✅ Firebase maneja toda la seguridad

---

## ❓ Problemas Comunes

### "Error: No se ha configurado la API key"

- Verifica que `.env.local` tenga `VITE_GEMINI_API_KEY`
- Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

### "Firebase: Error (auth/configuration-not-found)"

- Verifica que hayas activado Email/Password en Firebase Authentication

### "Missing or insufficient permissions"

- Verifica las reglas de Firestore (Paso 1.5)

### La app no carga en producción

- Verifica que todas las variables de entorno estén en Vercel
- Verifica que el dominio esté autorizado en Firebase

---

## 🎉 ¡Listo!

Tu aplicación está configurada y lista para compartir. Tus amigos solo necesitan:
1. Abrir la URL
2. Registrarse
3. Usar la app

Tú pagas por todo, pero con la cuota gratuita de Gemini (1,500 peticiones/día), probablemente no gastes nada.

---

## 📞 Siguiente Paso

Si todo funciona, puedes:
- Compartir la URL con tus amigos
- Monitorear el uso en Firebase Console
- Ver los costos en Google Cloud Console

¿Alguna pregunta? ¡Pregunta sin miedo!
