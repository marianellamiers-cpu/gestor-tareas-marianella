export function isValidTaskTitle(title: string): boolean {
  // Corregido: le saco los espacios antes de medir el largo.
  // Antes "   " tenia length 3 y pasaba como valido.
  const limpio = title.trim();
  return limpio.length > 0;
}
