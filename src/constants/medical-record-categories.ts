export const MEDICAL_RECORD_CATEGORY_LABELS = {
  CONSULTATION: 'Consulta',
  EMERGENCY: 'Emergencia',
  FOLLOW_UP: 'Seguimiento',
  ROUTINE_CHECKUP: 'Chequeo de Rutina',
  SURGERY: 'Cirugía',
  DIAGNOSTIC: 'Diagnóstico',
  EXAMINATION: 'Examen',
} as const

// Función helper para obtener la etiqueta en español
export function getMedicalRecordCategoryLabel(category: string): string {
  return (
    MEDICAL_RECORD_CATEGORY_LABELS[
      category as keyof typeof MEDICAL_RECORD_CATEGORY_LABELS
    ] || category
  )
}

// Mapeo de prioridades
export const MEDICAL_RECORD_PRIORITY_LABELS = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
} as const

// Función helper para obtener la etiqueta de prioridad en español
export function getMedicalRecordPriorityLabel(priority: string): string {
  return (
    MEDICAL_RECORD_PRIORITY_LABELS[
      priority as keyof typeof MEDICAL_RECORD_PRIORITY_LABELS
    ] || priority
  )
}
