import type { Task, TaskStatus } from '../types/task';

// Paso a minuscula y saco espacios de los costados para comparar
function normalizar(texto: string): string {
  return texto.trim().toLowerCase();
}

export function filterTasks(tasks: Task[], query: string, status: TaskStatus): Task[] {
  const byStatus = tasks.filter((task) => {
    if (status === 'pendientes') return !task.completed;
    if (status === 'completadas') return task.completed;
    return true;
  });

  // Corregido: includes() distingue mayusculas, por eso "VALIDAR" no encontraba "Validar login"
  const buscado = normalizar(query);
  return byStatus.filter((task) => normalizar(task.title).includes(buscado));
}
