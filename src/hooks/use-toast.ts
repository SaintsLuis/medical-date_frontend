import { toast as sonnerToast } from 'sonner'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    if (variant === 'destructive') {
      return sonnerToast.error(title || description || 'Error')
    }
    return sonnerToast.success(title || description || 'Éxito')
  }

  // Añadir métodos de conveniencia
  toast.success = (message: string) => sonnerToast.success(message)
  toast.error = (message: string) => sonnerToast.error(message)

  return { toast }
}
