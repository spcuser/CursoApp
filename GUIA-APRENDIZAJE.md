# 📚 Guía de Aprendizaje - CursoAPP

Esta guía te ayudará a entender cómo funciona tu aplicación y aprender las tecnologías que usa.

---

## 🎯 Ruta de Aprendizaje Recomendada

### Nivel 1: Fundamentos (1-2 semanas)
### Nivel 2: React Básico (2-3 semanas)
### Nivel 3: TypeScript (1-2 semanas)
### Nivel 4: React Avanzado (2-3 semanas)
### Nivel 5: Firebase y Backend (1-2 semanas)

---

## 📖 NIVEL 1: Fundamentos de JavaScript

### ¿Qué necesitas saber?

JavaScript es el lenguaje base de todo. Sin esto, el resto no tiene sentido.

### Conceptos clave en tu proyecto:

#### 1. Variables y Constantes

```javascript
// En tu código verás:
const [topic, setTopic] = useState('');  // const = no cambia la referencia
let results = [];                         // let = puede cambiar
```

#### 2. Funciones

```javascript
// Función tradicional
function handleRestart() {
  setStep('INPUT');
  setTopic('');
}

// Función flecha (arrow function) - más común en React
const handleLogin = async (email, password) => {
  await loginUser(email, password);
};
```

#### 3. Objetos y Arrays

```javascript
// Objeto
const user = {
  name: 'Juan',
  email: 'juan@email.com'
};

// Array
const pillars = [
  { id: '1', title: 'Pilar 1' },
  { id: '2', title: 'Pilar 2' }
];

// Acceder a propiedades
console.log(user.name);        // 'Juan'
console.log(pillars[0].title); // 'Pilar 1'
```

#### 4. Async/Await (Promesas)

```javascript
// Tu código hace muchas llamadas asíncronas a APIs
const handleTopicSubmit = async (inputTopic) => {
  setLoading(true);
  
  try {
    // await = espera a que termine antes de continuar
    const data = await generatePillars(inputTopic, language);
    setPillars(data.pillars);
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### 📚 Recursos para aprender JavaScript:

1. **MDN Web Docs** (GRATIS): https://developer.mozilla.org/es/docs/Web/JavaScript
2. **JavaScript.info** (GRATIS): https://javascript.info/
3. **FreeCodeCamp** (GRATIS): https://www.freecodecamp.org/

### ✅ Ejercicio práctico:

Abre la consola del navegador (F12) y prueba:

```javascript
// Crear un array de cursos
const cursos = [
  { titulo: 'React', duracion: 10 },
  { titulo: 'TypeScript', duracion: 8 }
];

// Filtrar cursos de más de 8 horas
const cursosLargos = cursos.filter(curso => curso.duracion > 8);
console.log(cursosLargos);

// Mapear para obtener solo títulos
const titulos = cursos.map(curso => curso.titulo);
console.log(titulos);
```

---

## ⚛️ NIVEL 2: React Básico

### ¿Qué es React?

React es una librería para construir interfaces de usuario con componentes reutilizables.

### Conceptos clave en tu proyecto:

#### 1. Componentes

Un componente es una pieza de UI reutilizable:

```typescript
// Componente simple
export const LoadingScreen = ({ message }) => {
  return (
    <div className="loading">
      <p>{message}</p>
    </div>
  );
};

// Uso del componente
<LoadingScreen message="Cargando..." />
```

#### 2. Props (Propiedades)

Props son datos que pasas de un componente padre a un hijo:

```typescript
// Componente padre (App.tsx)
<TopicInput 
  onSubmit={handleTopicSubmit}  // Pasando función
  t={t}                          // Pasando objeto
/>

// Componente hijo (TopicInput.tsx)
export const TopicInput = ({ onSubmit, t }) => {
  // Usa las props aquí
  return <button onClick={onSubmit}>{t.button}</button>;
};
```

#### 3. State (Estado)

El estado son datos que pueden cambiar y causan que el componente se re-renderice:

```typescript
// Declarar estado
const [topic, setTopic] = useState('');
const [loading, setLoading] = useState(false);

// Cambiar estado
setTopic('Marketing Digital');  // topic ahora es 'Marketing Digital'
setLoading(true);                // loading ahora es true
```

#### 4. useEffect (Efectos secundarios)

useEffect ejecuta código cuando algo cambia:

```typescript
// Se ejecuta cuando 'user' cambia
useEffect(() => {
  if (user) {
    console.log('Usuario autenticado:', user.email);
    loadUserCourses();
  }
}, [user]); // <- Dependencia: se ejecuta cuando user cambia
```

#### 5. Eventos

```typescript
// onClick
<button onClick={handleRestart}>
  Reiniciar
</button>

// onChange
<input 
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

### 📚 Recursos para aprender React:

1. **Documentación oficial** (GRATIS): https://react.dev/learn
2. **React para principiantes** (YouTube): Busca "React tutorial español"
3. **Curso interactivo**: https://scrimba.com/learn/learnreact

### ✅ Ejercicio práctico:

Crea un componente simple en tu proyecto:

```typescript
// components/HelloWorld.tsx
import React, { useState } from 'react';

export const HelloWorld = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Contador: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Incrementar
      </button>
    </div>
  );
};
```

Luego úsalo en App.tsx:
```typescript
import { HelloWorld } from './components/HelloWorld';

// Dentro del return
<HelloWorld />
```

---

## 🔷 NIVEL 3: TypeScript

### ¿Qué es TypeScript?

TypeScript es JavaScript con tipos. Te ayuda a evitar errores.

### Conceptos clave en tu proyecto:

#### 1. Tipos básicos

```typescript
// Tipos primitivos
const name: string = 'Juan';
const age: number = 30;
const isActive: boolean = true;

// Arrays
const numbers: number[] = [1, 2, 3];
const names: string[] = ['Ana', 'Luis'];
```

#### 2. Interfaces (Tipos personalizados)

```typescript
// Definir la forma de un objeto
interface User {
  uid: string;
  email: string;
  displayName: string;
  geminiApiKey?: string;  // ? = opcional
}

// Usar la interface
const user: User = {
  uid: '123',
  email: 'juan@email.com',
  displayName: 'Juan'
  // geminiApiKey es opcional, no es necesario
};
```

#### 3. Tipos en funciones

```typescript
// Especificar tipos de parámetros y retorno
const suma = (a: number, b: number): number => {
  return a + b;
};

// Función async que retorna Promise
const loadUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};
```

#### 4. Tipos en React

```typescript
// Props con tipos
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};
```

### 📚 Recursos para aprender TypeScript:

1. **Documentación oficial**: https://www.typescriptlang.org/docs/
2. **TypeScript para React**: https://react-typescript-cheatsheet.netlify.app/

### ✅ Ejercicio práctico:

Mira el archivo `types.ts` en tu proyecto. Ahí están todas las interfaces:

```typescript
// types.ts
export interface Pillar {
  id: string;
  title: string;
  description: string;
  iconHint: string;
}

export interface Course {
  title: string;
  subtitle: string;
  description: string;
  modules: Module[];
  glossary: GlossaryTerm[];
  primaryColor: string;
}
```

Intenta crear tu propia interface:

```typescript
// types.ts
export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  completedModules: number;
}
```

---

## 🔥 NIVEL 4: Firebase

### ¿Qué es Firebase?

Firebase es una plataforma de Google que te da backend sin programar servidor.

### Servicios que usas:

#### 1. Authentication (Autenticación)

```typescript
// Registrar usuario
const user = await createUserWithEmailAndPassword(auth, email, password);

// Iniciar sesión
const user = await signInWithEmailAndPassword(auth, email, password);

// Cerrar sesión
await signOut(auth);

// Observar cambios
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Usuario autenticado');
  } else {
    console.log('Usuario no autenticado');
  }
});
```

#### 2. Firestore (Base de datos)

```typescript
// Guardar documento
await setDoc(doc(db, 'courses', courseId), {
  title: 'Mi Curso',
  userId: user.uid,
  createdAt: Date.now()
});

// Leer documento
const docSnap = await getDoc(doc(db, 'courses', courseId));
if (docSnap.exists()) {
  const data = docSnap.data();
}

// Consultar colección
const q = query(
  collection(db, 'courses'),
  where('userId', '==', user.uid),
  orderBy('createdAt', 'desc')
);
const querySnapshot = await getDocs(q);
```

### 📚 Recursos para aprender Firebase:

1. **Documentación oficial**: https://firebase.google.com/docs
2. **Firebase para React**: https://firebase.google.com/docs/web/setup

---

## 🎨 NIVEL 5: Tailwind CSS

### ¿Qué es Tailwind?

Un framework de CSS que usa clases utilitarias en lugar de escribir CSS.

### Ejemplos de tu proyecto:

```typescript
// En lugar de CSS:
// .button { background-color: orange; padding: 12px; border-radius: 8px; }

// Usas clases de Tailwind:
<button className="bg-orange-600 px-4 py-3 rounded-xl hover:bg-orange-700">
  Botón
</button>
```

### Clases comunes:

```
Colores:
- bg-slate-900    (fondo gris oscuro)
- text-white      (texto blanco)
- text-orange-500 (texto naranja)

Espaciado:
- p-4    (padding: 1rem)
- m-2    (margin: 0.5rem)
- px-6   (padding horizontal)
- py-3   (padding vertical)

Tamaño:
- w-full   (width: 100%)
- h-screen (height: 100vh)

Bordes:
- rounded-xl    (border-radius grande)
- border-2      (borde de 2px)

Flexbox:
- flex          (display: flex)
- items-center  (align-items: center)
- justify-between

Hover/Estados:
- hover:bg-orange-700
- focus:border-orange-500
```

### 📚 Recursos:

1. **Documentación**: https://tailwindcss.com/docs
2. **Cheat Sheet**: https://nerdcave.com/tailwind-cheat-sheet

---

## 🚀 Plan de Estudio Sugerido

### Semana 1-2: JavaScript
- [ ] Variables, funciones, objetos, arrays
- [ ] Async/await y promesas
- [ ] Array methods (map, filter, reduce)

### Semana 3-4: React Básico
- [ ] Componentes y JSX
- [ ] Props y State
- [ ] Eventos
- [ ] useEffect básico

### Semana 5-6: TypeScript
- [ ] Tipos básicos
- [ ] Interfaces
- [ ] Tipos en funciones
- [ ] Tipos en React

### Semana 7-8: React Avanzado
- [ ] Custom hooks
- [ ] Context API
- [ ] Optimización (useMemo, useCallback)

### Semana 9-10: Firebase
- [ ] Authentication
- [ ] Firestore
- [ ] Reglas de seguridad

---

## 💡 Consejos para Aprender

1. **Aprende haciendo**: Modifica tu proyecto, experimenta
2. **Lee el código**: Abre los archivos y trata de entender qué hace cada línea
3. **Usa console.log()**: Imprime valores para ver qué está pasando
4. **Pregunta**: Si algo no tiene sentido, pregunta
5. **Documenta**: Agrega comentarios explicando lo que entiendes

---

## 🔍 Ejercicios Prácticos con tu Proyecto

### Ejercicio 1: Agregar un contador de cursos
```typescript
// En App.tsx, agrega:
const totalCourses = savedCourses.length;

// En el header, muestra:
<span>Total de cursos: {totalCourses}</span>
```

### Ejercicio 2: Cambiar colores
```typescript
// Cambia el color del botón principal de naranja a azul
// Busca: bg-orange-600
// Reemplaza por: bg-blue-600
```

### Ejercicio 3: Agregar un nuevo campo al perfil
```typescript
// En firebaseAuth.ts, modifica UserProfile:
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  geminiApiKey?: string;
  bio?: string;  // NUEVO CAMPO
}
```

---

## 📖 Recursos Generales

### Documentación Oficial:
- JavaScript: https://developer.mozilla.org/es/
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Firebase: https://firebase.google.com/docs
- Tailwind: https://tailwindcss.com/

### Cursos Gratuitos:
- FreeCodeCamp: https://www.freecodecamp.org/
- Codecademy: https://www.codecademy.com/
- Scrimba: https://scrimba.com/

### Comunidades:
- Stack Overflow (español): https://es.stackoverflow.com/
- Reddit r/learnprogramming
- Discord de programación en español

---

## 🎯 Tu Próximo Paso

1. **Empieza con JavaScript básico** (1-2 semanas)
2. **Mientras aprendes, lee el código de tu proyecto**
3. **Haz pequeños cambios y observa qué pasa**
4. **Pregunta cuando algo no tenga sentido**

¡El mejor momento para empezar es ahora! 🚀
