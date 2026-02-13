# ✅ Checklist de Configuración

Marca cada paso cuando lo completes. Total: ~35 minutos.

---

## 🔥 FIREBASE (15 minutos)

### Crear Proyecto
- [ ] Ir a https://console.firebase.google.com/
- [ ] Crear proyecto "cursoapp"
- [ ] Desactivar Google Analytics
- [ ] Esperar a que se cree

### Registrar App Web
- [ ] Clic en ícono Web (`</>`)
- [ ] Nombre: "CursoAPP Web"
- [ ] Copiar credenciales (apiKey, authDomain, etc.)

### Activar Authentication
- [ ] Ir a Authentication
- [ ] Clic en "Comenzar"
- [ ] Activar "Correo electrónico/contraseña"
- [ ] Guardar

### Crear Firestore
- [ ] Ir a Firestore Database
- [ ] Crear base de datos
- [ ] Modo: Producción
- [ ] Ubicación: europe-west1
- [ ] Habilitar

### Configurar Reglas
- [ ] Ir a pestaña "Reglas"
- [ ] Copiar reglas de `SETUP-SIMPLIFICADO.md`
- [ ] Publicar

---

## 🔑 GEMINI API (5 minutos)

- [ ] Ir a https://aistudio.google.com/app/apikey
- [ ] Iniciar sesión
- [ ] Crear API key
- [ ] Copiar la clave (empieza con "AIza...")

---

## ⚙️ VARIABLES DE ENTORNO (2 minutos)

- [ ] Copiar `.env.example` → `.env.local`
- [ ] Pegar tu API key de Gemini
- [ ] Pegar credenciales de Firebase
- [ ] Guardar archivo

---

## 🧪 PRUEBA LOCAL (2 minutos)

- [ ] Abrir terminal
- [ ] Ejecutar: `npm run dev`
- [ ] Abrir: http://localhost:5173
- [ ] Registrarte con tu email
- [ ] Generar un curso de prueba
- [ ] ¿Funciona? ✅

---

## 🌐 DESPLEGAR EN VERCEL (10 minutos)

### Subir a GitHub
- [ ] Verificar que el código esté en GitHub
- [ ] Si no: `git push origin main`

### Crear Proyecto en Vercel
- [ ] Ir a https://vercel.com
- [ ] Sign up con GitHub
- [ ] Importar proyecto "cursoapp"

### Configurar Variables
- [ ] Agregar `VITE_GEMINI_API_KEY`
- [ ] Agregar `VITE_FIREBASE_API_KEY`
- [ ] Agregar `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] Agregar `VITE_FIREBASE_PROJECT_ID`
- [ ] Agregar `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] Agregar `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] Agregar `VITE_FIREBASE_APP_ID`
- [ ] Marcar: Production, Preview, Development

### Desplegar
- [ ] Clic en "Deploy"
- [ ] Esperar 1-2 minutos
- [ ] Copiar URL (ej: `cursoapp-xxxxx.vercel.app`)

### Autorizar Dominio
- [ ] Ir a Firebase → Authentication → Settings
- [ ] Agregar dominio de Vercel
- [ ] Guardar

---

## 👥 COMPARTIR (1 minuto)

- [ ] Copiar URL de Vercel
- [ ] Enviar a tus amigos con instrucciones:

```
🎓 Bienvenido a CursoAPP

1. Abre: https://tu-url.vercel.app
2. Regístrate con tu email
3. ¡Empieza a generar cursos!

No necesitas configurar nada más.
```

---

## 🎉 ¡COMPLETADO!

Si marcaste todo, ¡felicidades! Tu app está lista y funcionando.

### Verificación Final:
- [ ] La app funciona en local
- [ ] La app funciona en Vercel
- [ ] Puedes registrarte y generar cursos
- [ ] Tus amigos pueden registrarse

---

## 📊 Monitoreo

### Firebase Console
- Ver usuarios registrados: Authentication → Users
- Ver cursos guardados: Firestore Database → courses
- Ver uso: Usage

### Vercel Dashboard
- Ver despliegues: Deployments
- Ver analytics: Analytics
- Ver logs: Functions → Logs

### Google Cloud Console
- Ver uso de Gemini API: https://console.cloud.google.com/
- Ver costos: Billing

---

## 🆘 Si algo falla

1. **Revisa la consola del navegador** (F12)
2. **Revisa los logs de Vercel**
3. **Verifica las variables de entorno**
4. **Verifica las reglas de Firebase**
5. **Pregunta** - estoy aquí para ayudar

---

## 💡 Consejos

- **Guarda tus credenciales** en un lugar seguro
- **No compartas tu API key** con nadie
- **Monitorea el uso** cada semana
- **Haz backups** de vez en cuando

---

¿Todo listo? ¡Adelante! 🚀
