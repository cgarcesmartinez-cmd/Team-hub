// Código de color real de Ebro Factory por vehículo/proyecto.
// Una sola fuente de verdad: cualquier pestaña que necesite un color de proyecto
// importa esto, así nunca se desincroniza entre Tareas / Gantt / KPIs / Propuestas.

export const VEHICLE_COLORS = {
  's400-hev': { label: 'S400 HEV', hex: '#e5484d', tw: 'bg-vehicle-s400-hev' },
  's400-turbo': { label: 'S400 1.5 Turbo / Plus', hex: '#f5d90a', tw: 'bg-vehicle-s400-turbo' },
  's700-phev': { label: 'S700 PHEV', hex: '#30a46c', tw: 'bg-vehicle-s700-phev' },
  'jaecoo5': { label: 'Jaecoo 5', hex: '#8b949e', tw: 'bg-vehicle-jaecoo5' },
  'omoda5': { label: 'Omoda 5', hex: '#9a5b3c', tw: 'bg-vehicle-omoda5' },
  'general': { label: 'General / Otros', hex: '#5b6472', tw: 'bg-vehicle-general' },
}

// Palabras clave para inferir el vehículo a partir del texto de un correo/tarea
// (usado tanto por la clasificación automática como por el filtro manual en la UI)
const KEYWORDS = [
  [/\bs400\b.*\bhev\b|\bhev\b.*\bs400\b/i, 's400-hev'],
  [/\bs400\b.*(1\.5|turbo|plus)|\b(1\.5|turbo|plus)\b.*s400/i, 's400-turbo'],
  [/\bs700\b|\bphev\b/i, 's700-phev'],
  [/jaecoo\s?5|\bj5\b/i, 'jaecoo5'],
  [/omoda\s?5/i, 'omoda5'],
]

export function inferVehicleColor(text) {
  if (!text) return VEHICLE_COLORS.general
  for (const [re, key] of KEYWORDS) {
    if (re.test(text)) return VEHICLE_COLORS[key]
  }
  return VEHICLE_COLORS.general
}

export const PRIORITY_COLORS = {
  alta: '#e5484d',
  media: '#f5a623',
  baja: '#5b6472',
}
