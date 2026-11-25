# Tareas Marianella · EDI

**Alumna:** Marianella Miers · 3.er año · Desarrollo de Software

App móvil hecha con React Native + Expo Router + TypeScript (Expo SDK 57). Parte del Gestor de tareas de la clase 11 del profe y está conectada al backend de tareas de Programación III:

- API: `https://api.montenegroariel.com.ar` (Swagger en `/docs`)
- Errores encontrados y corregidos: ver `INFORME_INCIDENTES.md`

## Funciones
| Función | Cómo se usa | Backend |
|---|---|---|
| Ver tareas | se cargan al abrir o con "Actualizar lista" | `GET /tasks/` |
| Agregar | escribir en "Nueva tarea" y tocar Agregar | `POST /tasks/` |
| Completar | tocar el cuadrado de la tarea | `PUT /tasks/{id}` |
| Editar título | abrir la tarjeta (+) → Editar → Guardar | `PUT /tasks/{id}` |
| Eliminar | abrir la tarjeta (+) → Eliminar tarea | `DELETE /tasks/{id}` |
| Buscar / filtrar | buscador y pestañas Todas / Pendientes / Completadas | — |
| Probar error | botón "Simular error API" | — |

## Carpetas
- `app/` → pantallas: `index.tsx` (lista), `guia.tsx` (consigna)
- `src/services/cliente.ts` → función `llamarApi` (URL, tiempo máximo, errores)
- `src/services/taskService.ts` → operaciones con las tareas
- `src/components/` → `TaskCard` (tarjeta con Editar y Eliminar) y `StatusTabs`
- `src/utils/` → filtro de búsqueda y validación del título
- `__tests__/` → pruebas con Jest
- `eas.json` → perfil `preview` para la APK

## Cómo correrla
```
npm install
copy .env.example .env
npx expo start --go
```
y escanear el QR con Expo Go (SDK 57).

## Pruebas
```
npm test
npm run typecheck
```

## APK
```
npx eas-cli login
npx eas-cli build -p android --profile preview
```
