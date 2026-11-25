// Cliente para el backend de tareas de Programacion III.
// La direccion viene de EXPO_PUBLIC_API_URL (en .env para desarrollo y en eas.json para la APK).
const URL_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.montenegroariel.com.ar').replace(/\/$/, '');
const ESPERA_MAXIMA_MS = 12000;

export class ErrorServidor extends Error {
  codigo: number;
  constructor(mensaje: string, codigo = 0) {
    super(mensaje);
    this.name = 'ErrorServidor';
    this.codigo = codigo;
  }
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

function mensajeSegunCodigo(codigo: number): string {
  switch (codigo) {
    case 404:
      return 'Esa tarea ya no está en el servidor. Recargá la lista.';
    case 422:
      return 'El servidor rechazó los datos. Revisá el título.';
    default:
      return codigo >= 500 ? 'El servidor tuvo un problema. Probá de nuevo en un rato.' : `Error ${codigo} del servidor.`;
  }
}

export async function llamarApi<T>(ruta: string, metodo: Metodo = 'GET', datos?: unknown): Promise<T> {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), ESPERA_MAXIMA_MS);

  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      headers: datos === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: datos === undefined ? undefined : JSON.stringify(datos),
      signal: control.signal,
    });
  } catch {
    // fetch solo falla aca si no hubo respuesta: sin Internet o cancelado por tiempo
    throw new ErrorServidor(
      control.signal.aborted ? 'El servidor no respondió a tiempo.' : 'Sin conexión. Revisá el Wi-Fi o los datos.',
    );
  } finally {
    clearTimeout(reloj);
  }

  if (!respuesta.ok) {
    throw new ErrorServidor(mensajeSegunCodigo(respuesta.status), respuesta.status);
  }
  // DELETE devuelve 204 sin cuerpo
  if (respuesta.status === 204) {
    return undefined as T;
  }
  return (await respuesta.json()) as T;
}
