# 🔐 Guía de Seguridad - CursoAPP

## ⚠️ Importante: Protección de API Key

### Riesgos de Exponer tu API Key

Si tu API key se hace pública:
- ❌ Cualquiera puede usarla y consumir tu cuota
- ❌ Podrías recibir cargos inesperados
- ❌ Google puede suspender tu clave

### ✅ Mejores Prácticas

#### 1. Nunca Subas tu API Key a GitHub

```bash
# Verifica que .env.local esté en .gitignore
cat .gitignore | grep .env.local
```

#### 2. Usa Variables de Entorno en Producción

**Vercel:**
```bash
vercel env add GEMINI_API_KEY
```

**Netlify:**
- Ve a: Site settings > Environment variables
- Agrega: `GEMINI_API_KEY`

#### 3. Limita el Uso de tu API Key

En Google AI Studio:
1. Ve a https://ai.google.dev/
2. Selecciona tu API key
3. Configura restricciones:
   - Restricción de aplicación (HTTP referrers)
   - Restricción de API (solo Gemini API)

## 🛡️ Arquitectura Segura para Producción

### Opción 1: Backend Proxy (Recomendado)

Crea un backend simple que maneje las llamadas a Gemini:

```javascript
// backend/server.js (Node.js + Express)
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate', async (req, res) => {
  try {
    // Rate limiting
    // Autenticación de usuario
    // Validación de entrada
    
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: req.body.prompt
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error generando contenido' });
  }
});

app.listen(3001);
```

Luego modifica `geminiService.ts` para llamar a tu backend:

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt })
});
```

### Opción 2: Autenticación de Usuarios

Implementa autenticación para controlar quién usa tu app:

- **Firebase Auth**: https://firebase.google.com/docs/auth
- **Auth0**: https://auth0.com/
- **Clerk**: https://clerk.com/

### Opción 3: Rate Limiting

Limita las solicitudes por usuario:

```typescript
// Ejemplo simple con localStorage
const checkRateLimit = () => {
  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem('usage') || '{}');
  
  if (usage.date !== today) {
    usage.date = today;
    usage.count = 0;
  }
  
  if (usage.count >= 10) {
    throw new Error('Límite diario alcanzado');
  }
  
  usage.count++;
  localStorage.setItem('usage', JSON.stringify(usage));
};
```

## 📊 Monitoreo de Uso

### Google AI Studio Dashboard

1. Ve a https://ai.google.dev/
2. Revisa tu uso diario/mensual
3. Configura alertas de cuota

### Implementa Logging

```typescript
// services/geminiService.ts
const logUsage = (model: string, tokens: number) => {
  console.log(`[${new Date().toISOString()}] ${model}: ${tokens} tokens`);
  // Envía a tu sistema de analytics
};
```

## 🚨 Qué Hacer si tu API Key se Compromete

1. **Revoca inmediatamente** la clave en https://ai.google.dev/
2. **Genera una nueva** API key
3. **Actualiza** todas tus variables de entorno
4. **Revisa** el uso reciente para detectar actividad sospechosa
5. **Contacta** a Google si hay cargos no autorizados

## 📝 Checklist de Seguridad

Antes de desplegar en producción:

- [ ] `.env.local` está en `.gitignore`
- [ ] API key configurada como variable de entorno en Vercel/Netlify
- [ ] Restricciones de API key configuradas en Google AI Studio
- [ ] Rate limiting implementado
- [ ] Autenticación de usuarios (opcional pero recomendado)
- [ ] Backend proxy para proteger la API key (recomendado)
- [ ] Monitoreo de uso configurado
- [ ] Plan de respuesta ante compromiso de clave

## 🔗 Recursos Adicionales

- [Gemini API Security Best Practices](https://ai.google.dev/docs/security)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

**Recuerda**: La seguridad es un proceso continuo, no un evento único. Revisa y actualiza tus prácticas regularmente.
