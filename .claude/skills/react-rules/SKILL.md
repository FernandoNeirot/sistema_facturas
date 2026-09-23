---
name: react-rules
description: que Genere un proyecto con la estructura de React con TypeScript.
3. Location for skill folder, crealo dentro del directorio del proyecto ‘.claude/skills/react-rules/SKILL.md‘

Specific Instructions:
    - Usar react version 19.2.5 o superior disponible revisar en documentación de react en https://www.npmjs.com/package/react
    - Usa TypeScript en lugar de JavaScript para mejorar el tipado, la seguridad del código y la mantenibilidad en aplicaciones React.
    - Usa Zustand para estado global creando un store con create() donde defines estado y acciones.
    - Usa Zod para validar datos mediante esquemas (z.object, z.string) y valida con parse o safeParse.
    - En formularios React integra Zod con React Hook Form.
    - Mantén los componentes pequeños, simples y con una sola responsabilidad.
    - Evita mutar el estado directamente, siempre crea nuevas copias de objetos o arrays.
    - Usa useEffect solo para sincronizar con sistemas externos (API, DOM, librerías).
    - No uses useEffect para lógica derivada de props o estado, calcúlala en el render o en handlers.
    - Mantén los effects simples y con dependencias claras.
    - Extrae lógica reutilizable en custom hooks (useAuth, useFetch, etc.) para mantener los componentes más claros.
    - Comparte lógica entre eventos usando funciones reutilizables o hooks.
    - La lógica causada por interacción del usuario debe ir en event handlers, no en useEffect.
    - Para comunicar cambios al padre, usa callbacks por props y ejecútalos desde el componente hijo cuando cambie algo.
    - Usa useMemo para cachear cálculos costosos.
    - Para reiniciar o ajustar estado usa key, deriva estado desde props o actualízalo en eventos.
    - No llames hooks dentro de bucles, condicionales o funciones anidadas.
    - Evita side effects durante el render, los componentes y hooks deben ser puros.
    - Usa React Query o SWR cuando tu componente necesite obtener datos de una API y compartirlos o reutilizarlos entre varios componentes con cache y refetch automático.
    - Registrar en CLAUDE.md: Available skills y Skill trigger rules, si no existe lo creas
Activation Triggers: cuando el usuario pida crear una aplicación o componente React, o agregar/modificar componentes, hooks, estado, formularios o lógica de UI en React.