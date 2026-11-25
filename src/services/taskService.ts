import type { Task } from '../types/task';
import { llamarApi } from './cliente';

// Forma en la que el backend manda cada tarea (ver /docs del servidor)
type TareaServidor = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
};

// Paso de la forma del servidor a la forma que usa la app
export function aTarea(dato: TareaServidor): Task {
  return {
    id: String(dato.id),
    title: dato.title,
    description: dato.description ?? '',
    priority: 'media', // el backend no guarda prioridad
    completed: dato.completed,
  };
}

// GET /tasks/  (sin limit el servidor manda solo 10)
export async function fetchTasks(simulateFailure = false): Promise<Task[]> {
  if (simulateFailure) {
    throw new Error('HTTP 503: servidor temporalmente indisponible (simulado)');
  }
  const datos = await llamarApi<TareaServidor[]>('/tasks/?skip=0&limit=100');
  return datos.map(aTarea);
}

// POST /tasks/
export async function crearTarea(titulo: string, descripcion: string): Promise<Task> {
  const creada = await llamarApi<TareaServidor>('/tasks/', 'POST', {
    title: titulo.trim(),
    description: descripcion.trim(),
    completed: false,
  });
  return aTarea(creada);
}

// PUT /tasks/{id}  -> lo uso para completar y para editar.
// El backend no tiene PATCH, entonces siempre mando los tres campos.
export async function guardarTarea(tarea: Task): Promise<Task> {
  const guardada = await llamarApi<TareaServidor>(`/tasks/${tarea.id}`, 'PUT', {
    title: tarea.title.trim(),
    description: tarea.description,
    completed: tarea.completed,
  });
  return aTarea(guardada);
}

// DELETE /tasks/{id}
export async function borrarTarea(id: string): Promise<void> {
  await llamarApi<void>(`/tasks/${id}`, 'DELETE');
}
