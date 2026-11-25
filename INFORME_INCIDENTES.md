# Informe de incidencias · Gestor de tareas

**Estudiante:** Marianella Miers  
**Fecha:** 25/11/2026  
**Proyecto / rama Git:** gestor-tareas-marianella / main  
**Entorno (Expo SDK, Android, dispositivo):** Expo SDK 57 · React Native 0.86 · Android (Expo Go SDK 57 y APK preview)

## Resumen ejecutivo
Trabajé sobre el proyecto Gestor de tareas que dejó el profe en la clase 11. Lo primero fue guardar el proyecto original en un commit y correr `npm test`: 3 de las 9 pruebas fallaban. Usando la app en el celular encontré 6 comportamientos raros. Los fui corrigiendo uno por uno, cada uno con su commit. Después conecté la app con el backend de tareas que armamos en Programación III (`https://api.montenegroariel.com.ar`) y le agregué la opción de **editar el título** de una tarea. Al final quedan 16 pruebas y pasan todas.

## Incidencia 1
- **Título de incidencia:** Se aceptan tareas con un nombre que son solo espacios
- **Pasos para reproducir:** escribir tres espacios en "Nueva tarea" y tocar Agregar.
- **Esperado / observado:** debería mostrar "Ingresá un nombre válido" / se agregaba una tarea en blanco.
- **Herramienta usada (DevTools / consola / test):** test `taskValidation.test.ts` (fallaba "rechaza un título compuesto solo de espacios").
- **Hipótesis y evidencia:** la validación solo mide el largo del texto, y "   " tiene largo 3.
- **Archivo y función involucrada:** `src/utils/taskValidation.ts` → `isValidTaskTitle`
- **Causa raíz:** no se sacaban los espacios antes de validar.
- **Corrección aplicada:** `title.trim()` y después controlo que el largo sea mayor a 0.
- **Prueba de regresión:** `taskValidation.test.ts`, pasan los 3 casos.
- **Estado:** Corregido

## Incidencia 2
- **Título de incidencia:** El check de completar no cambia nada en pantalla
- **Pasos para reproducir:** tocar el cuadrado de una tarea pendiente.
- **Esperado / observado:** que se tache y cambien los contadores / quedaba igual.
- **Herramienta usada:** `console.log(tasks)` dentro de `toggleTask` y React DevTools.
- **Hipótesis y evidencia:** en el log la tarea sí tenía `completed: true`, o sea el dato cambiaba pero la pantalla no se actualizaba.
- **Archivo y función involucrada:** `app/index.tsx` → `toggleTask`
- **Causa raíz:** se modificaba el objeto que está dentro del estado y se llamaba `setTasks(tasks)` con la misma lista. React ve la misma referencia y no vuelve a renderizar.
- **Corrección aplicada:** armo una lista nueva con `map` y para la tarea tocada devuelvo una copia `{ ...task, completed: !task.completed }`. Con el backend, después mando el PUT y si falla vuelvo a la lista anterior.
- **Prueba de regresión:** `TaskCard.test.tsx` y prueba manual en el celular.
- **Estado:** Corregido

## Incidencia 3
- **Título de incidencia:** "Simular error API" deja el cargando para siempre
- **Pasos para reproducir:** tocar "⚠ Simular error API".
- **Esperado / observado:** mensaje de error y que desaparezca el cargando / aparecía el error pero el indicador seguía girando.
- **Herramienta usada:** consola (se veía el `console.error` del `catch`).
- **Hipótesis y evidencia:** si entra al `catch`, la línea que apaga el cargando nunca se ejecuta.
- **Archivo y función involucrada:** `app/index.tsx` → `loadTasks`
- **Causa raíz:** `setLoading(false)` estaba únicamente dentro del `try`.
- **Corrección aplicada:** lo pasé a un bloque `finally`, que corre siempre, salga bien o mal.
- **Prueba de regresión:** prueba manual con el botón y con el celular en modo avión.
- **Estado:** Corregido

## Incidencia 4
- **Título de incidencia:** El buscador no encuentra tareas si cambian las mayúsculas o hay espacios
- **Pasos para reproducir:** buscar "VALIDAR" o "  login  ".
- **Esperado / observado:** que aparezca "Validar login" / la lista quedaba vacía.
- **Herramienta usada:** test `taskFilters.test.ts` (2 casos fallando).
- **Hipótesis y evidencia:** la comparación es exacta, letra por letra.
- **Archivo y función involucrada:** `src/utils/taskFilters.ts` → `filterTasks`
- **Causa raíz:** `includes()` distingue mayúsculas de minúsculas y la búsqueda se usaba con los espacios.
- **Corrección aplicada:** hice una función `normalizar` (trim + toLowerCase) y la aplico al título y a lo que se busca.
- **Prueba de regresión:** `taskFilters.test.ts`, pasan los 4 casos.
- **Estado:** Corregido

## Otras incidencias (opcional)
**Incidencia 5 – La lista no se filtra mientras escribo.** Recién cambiaba al tocar una pestaña. En `app/index.tsx` el `useMemo` de `visibleTasks` tenía `[tasks, status]` y le faltaba `query`, entonces no se volvía a calcular al escribir. Quedó `[tasks, query, status]`. Prueba manual.

**Incidencia 6 – Al cambiar de filtro aparece abierta otra tarjeta.** El `keyExtractor` del `FlatList` usaba el índice. Al filtrar, el índice 0 pasa a ser otra tarea y React le deja el estado `expanded` de la anterior. Ahora la key es `tarea-${item.id}`. Prueba manual.

**Integración con el backend.** Creé `src/services/cliente.ts` con la función `llamarApi` (URL desde `EXPO_PUBLIC_API_URL`, corta a los 12 segundos y da mensajes distintos para 404, 422, errores 500 y falta de conexión). En `taskService.ts` están `fetchTasks` (GET `/tasks/?skip=0&limit=100`, porque sin limit trae solo 10), `crearTarea` (POST), `guardarTarea` (PUT, la uso para completar y para editar, porque el backend no tiene PATCH y pide los tres campos) y `borrarTarea` (DELETE, responde 204).

**Mejora: editar tarea.** En el detalle de cada tarjeta agregué el botón "Editar". Al tocarlo, el campo de arriba pasa a "EDITAR TAREA" con el título cargado, el botón dice "Guardar" y aparece "Cancelar edición". Se guarda con PUT. Reutilicé la misma validación de títulos.

## Pruebas
| Prueba | Antes | Después | Evidencia |
|---|---|---|---|
| Búsqueda | 2 fallaban | pasan | `taskFilters.test.ts` |
| Validación | 1 fallaba | pasa | `taskValidation.test.ts` |
| Actualización de estado | no se veía | se tacha y se guarda con PUT | `TaskCard.test.tsx` + manual |
| Error de servicio | cargando infinito | mensaje + se puede reintentar | manual + `cliente.test.ts` |
| Backend (GET/POST/PUT/DELETE, 404, sin conexión) | — | 6 tests | `cliente.test.ts` |
| Editar tarea | — | 1 test de pantalla | `editarTarea.test.tsx` |

`npm test` final: **5 suites, 16 tests, todos pasan.**

## Conclusión y control de cambios
- **Commit final (hash):** (ver `git log`)
- **Mensaje del commit:** "Completo el informe de incidencias, README y declaro el uso de IA"
- **Qué aprendí y cómo lo aplicaría a mi app final:** que conviene reproducir el error y escribir una hipótesis antes de tocar el código. Me quedó claro lo de no mutar el estado en React y para qué sirve el `finally`. En mi app final voy a tener todas las llamadas al servidor en un solo archivo y probarlas con un fetch de mentira.

## Uso de asistentes de IA
Usé Claude (asistente de IA) como apoyo para: entender la consigna, encontrar dónde estaban algunos errores, revisar las correcciones, armar el cliente del backend, la función de editar y los tests. Consultas del tipo: "por qué no se actualiza la pantalla si el dato cambió", "cómo hacer un PUT con fetch", "cómo simular fetch en jest". Lo revisé, lo probé en el celular y lo puedo explicar.
