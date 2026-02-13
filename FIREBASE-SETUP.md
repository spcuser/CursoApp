# 🔥 Configuración de Firebase para CursoAPP

Esta guía te ayudará a configurar Firebase para permitir que múltiples usuarios usen la aplicación de forma segura y privada.

## 📋 Requisitos Previos

- Una cuenta de Google
- Acceso a [Firebase Console](https://console.firebase.google.com/)

## 🚀 Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"** o **"Add project"**
3. Nombre del proyecto: `cursoapp` (o el que prefieras)
4. Acepta los términos y haz clic en **"Continuar"**
5. **Google Analytics**: Puedes desactivarlo para este proyecto (opcional)
6. Haz clic en **"Crear proyecto"**
7. Espera a que se cree (toma unos segundos)

## 🌐 Paso 2: Registrar tu Aplicación Web

1. En la página principal de tu proyecto, haz clic en el ícono **Web** (`</>`)
2. Nombre de la app: `CursoAPP Web`
3. **NO** marques "Firebase Hosting" por ahora
4. Haz clic en **"Registrar app"**
5. **IMPORTANTE**: Copia las credenciales que aparecen. Las necesitarás para el archivo `.env.local`

Verás algo como esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## 🔐 Paso 3: Activar Authentication

1. En el menú lateral, ve a **"Authentication"** (Autenticación)
2. Haz clic en **"Get started"** o **"Comenzar"**
3. En la pestaña **"Sign-in method"**, haz clic en **"Email/Password"**
4. **Activa** la primera opción: "Email/Password"
5. **NO actives** "Email link (passwordless sign-in)" por ahora
6. Haz clic en **"Guardar"**

## 💾 Paso 4: Configurar Firestore Database

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"** o **"Create database"**
3. Selecciona **"Producción"** o **"Production mode"**
4. Elige la ubicación más cercana a tus usuarios:
   - Para España/Europa: `europe-west1` (Bélgica) o `europe-west3` (Frankfurt)
   - Para Francia: `europe-west1` (Bélgica)
5. Haz clic en **"Habilitar"**

### Configurar Reglas de Seguridad

1. Ve a la pestaña **"Reglas"** o **"Rules"**
2. Reemplaza el contenido con estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regla para colección de usuarios
    match /users/{userId} {
      // Solo el usuario puede leer y escribir su propio perfil
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regla para colección de cursos
    match /courses/{courseId} {
      // Solo el dueño del curso puede leer, escribir y eliminar
      allow read, write, delete: if request.auth != null && 
                                     request.resource.data.userId == request.auth.uid;
      // Permitir lectura si el userId del documento coincide con el usuario autenticado
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Haz clic en **"Publicar"**

## 📝 Paso 5: Configurar Variables de Entorno

1. En la raíz del proyecto, copia el archivo `.env.example`:
   ```bash
   copy .env.example .env.local
   ```

2. Abre `.env.local` y reemplaza los valores con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

3. **IMPORTANTE**: Nunca subas `.env.local` a GitHub. Ya está en `.gitignore`.

## 🎯 Paso 6: Probar la Aplicación

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre la aplicación en tu navegador

3. Deberías ver la pantalla de login/registro

4. Crea una cuenta de prueba

5. Configura tu API key de Gemini en Ajustes

6. ¡Empieza a crear cursos!

## 💰 Costos y Límites

### Firebase (Spark Plan - GRATIS)

- **Autenticación**: Ilimitada y gratuita
- **Firestore**:
  - 1 GB de almacenamiento
  - 50,000 lecturas/día
  - 20,000 escrituras/día
  - 20,000 eliminaciones/día

**Estimación**: Con estos límites, puedes tener cientos de usuarios activos sin costo.

### Gemini API (Cada usuario usa su propia key)

- **Cuota gratuita**: 1,500 peticiones/día por usuario
- **Costo si excedes**: ~$0.001 por petición (muy bajo)

## 🔒 Seguridad

Las reglas de Firestore garantizan que:

✅ Cada usuario solo puede ver sus propios cursos
✅ Cada usuario solo puede modificar sus propios datos
✅ Las API keys están protegidas por usuario
✅ No hay acceso cruzado entre usuarios

## 🚀 Despliegue

Una vez configurado Firebase, puedes desplegar en:

- **Vercel** (recomendado): Gratis, fácil, rápido
- **Netlify**: Gratis, buena alternativa
- **Firebase Hosting**: Integrado con Firebase

Ver `deploy.md` para instrucciones de despliegue.

## ❓ Problemas Comunes

### Error: "Firebase: Error (auth/configuration-not-found)"

- Verifica que hayas activado Email/Password en Authentication
- Asegúrate de que las credenciales en `.env.local` sean correctas

### Error: "Missing or insufficient permissions"

- Revisa las reglas de Firestore
- Asegúrate de que el usuario esté autenticado

### La aplicación no carga

- Verifica que todas las variables de entorno estén configuradas
- Revisa la consola del navegador para errores específicos

## 📚 Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Precios de Firebase](https://firebase.google.com/pricing)
- [Reglas de Seguridad de Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Gemini API Pricing](https://ai.google.dev/pricing)

## 🆘 Soporte

Si tienes problemas, revisa:
1. La consola de Firebase para errores
2. La consola del navegador (F12)
3. Los logs del servidor de desarrollo

---

¡Listo! Ahora tu aplicación está configurada para múltiples usuarios de forma segura. 🎉
