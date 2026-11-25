import { borrarTarea, crearTarea, fetchTasks, guardarTarea } from '../src/services/taskService';

// En vez de llamar al servidor de verdad, reemplazo fetch por uno de mentira
const servidorFalso = jest.fn();
globalThis.fetch = servidorFalso as unknown as typeof fetch;

const responder = (status: number, cuerpo?: unknown) =>
  Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });

describe('conexion con el backend de tareas', () => {
  beforeEach(() => servidorFalso.mockReset());

  test('trae la lista y la adapta a la app', async () => {
    servidorFalso.mockReturnValueOnce(responder(200, [{ id: 4, title: 'Estudiar', description: null, completed: true }]));
    const lista = await fetchTasks();
    expect(servidorFalso.mock.calls[0][0]).toMatch(/\/tasks\/\?skip=0&limit=100$/);
    expect(lista).toEqual([{ id: '4', title: 'Estudiar', description: '', priority: 'media', completed: true }]);
  });

  test('crear manda POST con completed en false', async () => {
    servidorFalso.mockReturnValueOnce(responder(201, { id: 9, title: 'Hola', description: 'x', completed: false }));
    await crearTarea(' Hola ', 'x');
    const opciones = servidorFalso.mock.calls[0][1];
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual({ title: 'Hola', description: 'x', completed: false });
  });

  test('editar el titulo manda PUT con los tres campos', async () => {
    servidorFalso.mockReturnValueOnce(responder(200, { id: 2, title: 'Nuevo titulo', description: 'd', completed: false }));
    const editada = await guardarTarea({ id: '2', title: 'Nuevo titulo ', description: 'd', priority: 'media', completed: false });
    const [url, opciones] = servidorFalso.mock.calls[0];
    expect(url).toMatch(/\/tasks\/2$/);
    expect(opciones.method).toBe('PUT');
    expect(JSON.parse(opciones.body)).toEqual({ title: 'Nuevo titulo', description: 'd', completed: false });
    expect(editada.title).toBe('Nuevo titulo');
  });

  test('borrar acepta el 204 sin cuerpo', async () => {
    servidorFalso.mockReturnValueOnce(responder(204));
    await expect(borrarTarea('5')).resolves.toBeUndefined();
  });

  test('si la tarea no existe (404) avisa que se recargue', async () => {
    servidorFalso.mockReturnValueOnce(responder(404, { detail: 'Not found' }));
    await expect(borrarTarea('999')).rejects.toThrow('Recargá la lista');
  });

  test('sin Internet muestra un mensaje de conexion', async () => {
    servidorFalso.mockReturnValueOnce(Promise.reject(new TypeError('Network request failed')));
    await expect(fetchTasks()).rejects.toThrow('Sin conexión');
  });
});
