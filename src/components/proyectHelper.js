/**
 * Utilidades para manejar proyectos
 */

// Genera un ID corto aleatorio para los proyectos
export function generateShortId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Formatea la fecha en formato legible
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Crea un resumen del código
export function getCodeSummary(code) {
  // Elimina espacios en blanco al inicio y final
  const trimmedCode = code.trim();
  
  // Busca la primera línea no vacía que no sea un comentario o using
  const lines = trimmedCode.split('\n');
  let firstMeaningfulLine = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      trimmedLine && 
      !trimmedLine.startsWith('//') && 
      !trimmedLine.startsWith('/*') && 
      !trimmedLine.startsWith('using ') &&
      !trimmedLine.startsWith('namespace ') &&
      !trimmedLine.startsWith('{') &&
      !trimmedLine.startsWith('}')
    ) {
      firstMeaningfulLine = trimmedLine;
      break;
    }
  }
  
  // Si encontramos una línea significativa, la devolvemos truncada
  if (firstMeaningfulLine) {
    return firstMeaningfulLine.length > 40 
      ? firstMeaningfulLine.substring(0, 40) + '...' 
      : firstMeaningfulLine;
  }
  
  // Si no hay líneas significativas, devolver las primeras 40 chars
  return trimmedCode.length > 40 
    ? trimmedCode.substring(0, 40) + '...' 
    : trimmedCode;
}

// Combina nombre y código para mostrar (sin incluir la fecha en el nombre)
export function getCombinedDisplay(project) {
  const codeSummary = getCodeSummary(project.code);
  const date = formatDate(project.created_at);
  
  return {
    ...project,
    shortId: project.short_id || generateShortId(),
    displayName: project.name, // Ya no incluimos la fecha aquí
    formattedDate: date, // La fecha ahora es un campo separado
    codePreview: codeSummary
  };
}
