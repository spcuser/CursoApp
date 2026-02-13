# 🤝 Guía de Contribución - CursoAPP

¡Gracias por tu interés en contribuir a CursoAPP! Esta guía te ayudará a empezar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)
- [Pull Requests](#pull-requests)
- [Estilo de Código](#estilo-de-código)
- [Estructura del Proyecto](#estructura-del-proyecto)

## 📜 Código de Conducta

Este proyecto sigue un código de conducta simple:

- 🤝 Sé respetuoso y profesional
- 💬 Comunica claramente
- 🎯 Mantén el foco en mejorar el proyecto
- 🌟 Celebra las contribuciones de otros

## 🚀 Cómo Contribuir

Hay muchas formas de contribuir:

### 1. Reportar Bugs 🐛
Encontraste un error? [Reporta un bug](#reportar-bugs)

### 2. Sugerir Mejoras 💡
Tienes una idea? [Sugiere una mejora](#sugerir-mejoras)

### 3. Mejorar Documentación 📚
La documentación siempre puede mejorar

### 4. Escribir Código 💻
Implementa nuevas funcionalidades o arregla bugs

### 5. Diseño UI/UX 🎨
Mejora la interfaz y experiencia de usuario

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca** en los issues existentes
2. **Verifica** que estés usando la última versión
3. **Reproduce** el bug en un entorno limpio

### Cómo Reportar

Crea un issue con:

```markdown
## Descripción del Bug
[Descripción clara y concisa]

## Pasos para Reproducir
1. Ve a '...'
2. Haz clic en '...'
3. Scroll hasta '...'
4. Ver error

## Comportamiento Esperado
[Qué debería pasar]

## Comportamiento Actual
[Qué pasa realmente]

## Capturas de Pantalla
[Si aplica]

## Entorno
- OS: [ej. Windows 11]
- Navegador: [ej. Chrome 120]
- Versión de Node: [ej. 18.17.0]

## Logs de Error
```
[Pega aquí los logs]
```

## Información Adicional
[Cualquier otro contexto]
```

## 💡 Sugerir Mejoras

### Antes de Sugerir

1. **Busca** sugerencias similares
2. **Considera** si encaja con la visión del proyecto
3. **Piensa** en la implementación

### Cómo Sugerir

Crea un issue con:

```markdown
## Resumen de la Mejora
[Descripción breve]

## Problema que Resuelve
[Qué problema soluciona]

## Solución Propuesta
[Cómo lo implementarías]

## Alternativas Consideradas
[Otras opciones que pensaste]

## Beneficios
- Beneficio 1
- Beneficio 2

## Posibles Desventajas
- Desventaja 1
- Desventaja 2

## Mockups/Ejemplos
[Si aplica]
```

## 🔀 Pull Requests

### Proceso

1. **Fork** el repositorio
2. **Crea** una rama desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
3. **Haz** tus cambios
4. **Prueba** que todo funcione
5. **Commit** con mensajes claros:
   ```bash
   git commit -m "feat: agregar funcionalidad X"
   ```
6. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```
7. **Abre** un Pull Request

### Checklist del PR

Antes de enviar tu PR, verifica:

- [ ] El código compila sin errores (`npm run build`)
- [ ] No hay errores de TypeScript
- [ ] La funcionalidad está probada
- [ ] La documentación está actualizada
- [ ] Los commits tienen mensajes descriptivos
- [ ] El código sigue el estilo del proyecto

### Template del PR

```markdown
## Descripción
[Qué hace este PR]

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Relacionado con
Closes #[número de issue]

## Cómo Probar
1. Paso 1
2. Paso 2
3. Paso 3

## Capturas de Pantalla
[Si aplica]

## Checklist
- [ ] Código compila
- [ ] Funcionalidad probada
- [ ] Documentación actualizada
- [ ] Sin errores de TypeScript
```

## 🎨 Estilo de Código

### TypeScript

```typescript
// ✅ Bueno
interface User {
  id: string;
  name: string;
  email: string;
}

const getUserById = async (id: string): Promise<User> => {
  // ...
};

// ❌ Malo
const getUserById = async (id) => {
  // Sin tipos
};
```

### React Components

```typescript
// ✅ Bueno
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {label}
    </button>
  );
};

// ❌ Malo
export const Button = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### Naming Conventions

```typescript
// Variables y funciones: camelCase
const userName = "John";
const getUserData = () => {};

// Componentes: PascalCase
const UserProfile = () => {};

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.example.com";

// Tipos e Interfaces: PascalCase
interface UserData {}
type UserId = string;
```

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: agregar funcionalidad de exportación a Word
fix: corregir error en generación de quizzes
docs: actualizar README con nuevas instrucciones
style: mejorar estilos del sidebar
refactor: reorganizar componentes
test: agregar tests para geminiService
chore: actualizar dependencias
```

## 📁 Estructura del Proyecto

```
cursoapp/
├── components/          # Componentes React
│   ├── CourseView.tsx   # Vista del curso
│   ├── ...
│   └── README.md        # Documentación de componentes
│
├── services/            # Servicios y lógica de negocio
│   ├── geminiService.ts # Integración con Gemini
│   └── README.md        # Documentación de servicios
│
├── types.ts             # Tipos TypeScript globales
├── App.tsx              # Componente raíz
└── index.tsx            # Punto de entrada
```

### Agregar un Nuevo Componente

1. Crea el archivo en `components/`:
   ```typescript
   // components/MiComponente.tsx
   import React from 'react';
   
   interface MiComponenteProps {
     // Props aquí
   }
   
   export const MiComponente: React.FC<MiComponenteProps> = (props) => {
     return (
       <div>
         {/* JSX aquí */}
       </div>
     );
   };
   ```

2. Exporta desde el componente padre si es necesario

3. Documenta el componente:
   ```typescript
   /**
    * MiComponente - Descripción breve
    * 
    * @param props - Descripción de props
    * @returns Elemento React
    * 
    * @example
    * <MiComponente prop1="valor" />
    */
   ```

### Agregar un Nuevo Servicio

1. Crea el archivo en `services/`:
   ```typescript
   // services/miServicio.ts
   
   /**
    * Descripción del servicio
    */
   export const miFuncion = async (param: string): Promise<Result> => {
     // Implementación
   };
   ```

2. Agrega tipos en `types.ts` si es necesario

3. Documenta con JSDoc

## 🧪 Testing (Futuro)

Actualmente no hay tests, pero son bienvenidos!

### Framework Sugerido
- **Vitest** para unit tests
- **React Testing Library** para componentes
- **Playwright** para E2E

### Ejemplo de Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## 📚 Documentación

### Actualizar Documentación

Si tu cambio afecta la documentación:

1. Actualiza el README.md
2. Actualiza archivos relevantes en `/docs`
3. Agrega ejemplos si es necesario
4. Verifica que los enlaces funcionen

### Escribir Buena Documentación

```markdown
# Título Claro

## Descripción
[Qué hace esta funcionalidad]

## Uso
```typescript
// Ejemplo de código
```

## Parámetros
- `param1` (string): Descripción
- `param2` (number, opcional): Descripción

## Retorna
`Promise<Result>`: Descripción del resultado

## Ejemplo Completo
```typescript
const result = await miFuncion("valor");
console.log(result);
```

## Notas
- Nota importante 1
- Nota importante 2
```

## 🎯 Áreas que Necesitan Ayuda

### Alta Prioridad
- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] Backend proxy para API key
- [ ] Rate limiting
- [ ] Autenticación

### Media Prioridad
- [ ] Más idiomas
- [ ] Temas personalizables
- [ ] Editor de contenido
- [ ] Exportación a Word
- [ ] Modo offline

### Baja Prioridad
- [ ] App móvil
- [ ] Integración con LMS
- [ ] Marketplace de cursos
- [ ] Colaboración en tiempo real

## 🏆 Reconocimientos

Todos los contribuidores serán reconocidos en:
- README.md
- CONTRIBUTORS.md (cuando exista)
- Release notes

## 📞 Contacto

¿Preguntas sobre cómo contribuir?

- Abre un issue con la etiqueta `question`
- Revisa la [FAQ](FAQ.md)
- Consulta la documentación

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo la misma licencia del proyecto.

---

## 🎉 ¡Gracias por Contribuir!

Cada contribución, grande o pequeña, hace que CursoAPP sea mejor para todos.

**Happy coding! 🚀**
