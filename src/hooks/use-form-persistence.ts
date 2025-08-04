import { useEffect } from 'react'
import { UseFormWatch, UseFormReset } from 'react-hook-form'

interface UseFormPersistenceOptions {
  formKey: string
  watch: UseFormWatch<any>
  reset: UseFormReset<any>
  isDirty: boolean
  enabled?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Hook para persistir el estado de formularios en localStorage
 *
 * @param options - Opciones de configuración
 * @param options.formKey - Clave única para el formulario
 * @param options.watch - Función watch de react-hook-form
 * @param options.reset - Función reset de react-hook-form
 * @param options.isDirty - Estado isDirty del formulario
 * @param options.enabled - Si la persistencia está habilitada (default: true)
 * @param options.onSuccess - Callback cuando el formulario se envía exitosamente
 * @param options.onCancel - Callback cuando se cancela el formulario
 */
export function useFormPersistence({
  formKey,
  watch,
  reset,
  isDirty,
  enabled = true,
  onSuccess,
  onCancel,
}: UseFormPersistenceOptions) {
  // Cargar datos guardados al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined' && enabled) {
      const savedData = localStorage.getItem(formKey)
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          reset(parsedData)
        } catch (error) {
          console.warn('Error loading saved form data:', error)
        }
      }
    }
  }, [formKey, reset, enabled])

  // Guardar datos del formulario cuando cambien
  useEffect(() => {
    if (typeof window !== 'undefined' && enabled) {
      const subscription = watch((data) => {
        // Solo guardar si el formulario está sucio (ha sido modificado)
        if (isDirty) {
          localStorage.setItem(formKey, JSON.stringify(data))
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [watch, isDirty, formKey, enabled])

  // Función para limpiar datos guardados
  const clearSavedData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(formKey)
    }
  }

  // Función para manejar éxito
  const handleSuccess = () => {
    clearSavedData()
    onSuccess?.()
  }

  // Función para manejar cancelación
  const handleCancel = () => {
    clearSavedData()
    onCancel?.()
  }

  return {
    clearSavedData,
    handleSuccess,
    handleCancel,
  }
}
