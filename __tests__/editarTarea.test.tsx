import { fireEvent, render, waitFor } from '@testing-library/react-native';
import TaskManagerScreen from '../app/index';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

// Servidor de mentira con una sola tarea
const servidorFalso = jest.fn((_url: string, opciones?: { method?: string; body?: string }) => {
  if (opciones?.method === 'PUT') {
    return Promise.resolve({ ok: true, status: 200, json: async () => ({ id: 1, ...JSON.parse(opciones.body ?? '{}') }) });
  }
  return Promise.resolve({ ok: true, status: 200, json: async () => [{ id: 1, title: 'Titulo viejo', description: '', completed: false }] });
});
globalThis.fetch = servidorFalso as unknown as typeof fetch;

test('se puede editar el titulo de una tarea desde la pantalla', async () => {
  const pantalla = render(<TaskManagerScreen />);
  await waitFor(() => expect(pantalla.getByText('Titulo viejo')).toBeTruthy());

  fireEvent.press(pantalla.getByTestId('expand-1'));
  fireEvent.press(pantalla.getByTestId('edit-1'));
  fireEvent.changeText(pantalla.getByTestId('new-task-input'), 'Titulo nuevo');
  fireEvent.press(pantalla.getByTestId('add-task-button'));

  await waitFor(() => expect(pantalla.getByText('Titulo nuevo')).toBeTruthy());
  expect(servidorFalso.mock.calls.some((llamada) => llamada[1]?.method === 'PUT')).toBe(true);
}, 20000); // en Windows la primera vez tarda mas de 5 s en dibujar la pantalla
