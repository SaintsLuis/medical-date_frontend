'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, AlertCircle, DollarSign, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateInvoice, useUpdateInvoice } from '../hooks/use-billing'
import { useAppointments } from '@/features/appointments/hooks/use-appointments'
import {
  Invoice,
  InvoiceFormData,
  PaymentMethod,
  formatCurrency,
} from '../types'
import type { Invoice as BillingInvoice } from '../types'
import type { Appointment } from '@/features/appointments/types'

interface InvoiceFormProps {
  invoice?: Invoice | null
  onSuccess?: (invoice: Invoice) => void
  onCancel?: () => void
  title?: string
  description?: string
}

export function InvoiceForm({
  invoice,
  onSuccess,
  onCancel,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    appointmentId: '',
    amount: 0,
    dueDate: '',
    paymentMethod: undefined,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()

  // Get appointments for selection (only pending appointments without invoices)
  const { data: appointmentsData } = useAppointments({
    limit: 100,
    includePatient: true,
    includeDoctor: true,
  })

  useEffect(() => {
    if (invoice) {
      setFormData({
        appointmentId: invoice.appointmentId,
        amount: invoice.amount,
        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
        paymentMethod: invoice.paymentMethod,
      })
    } else {
      // Set default due date to 30 days from now
      const defaultDueDate = new Date()
      defaultDueDate.setDate(defaultDueDate.getDate() + 30)
      setFormData((prev) => ({
        ...prev,
        dueDate: defaultDueDate.toISOString().split('T')[0],
      }))
    }
  }, [invoice])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.appointmentId) {
      newErrors.appointmentId = 'Debe seleccionar una cita'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es requerida'
    } else {
      const dueDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        newErrors.dueDate =
          'La fecha de vencimiento no puede ser anterior a hoy'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (
    field: keyof InvoiceFormData,
    value: string | number | PaymentMethod
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleAppointmentChange = (appointmentId: string) => {
    const selectedAppointment = (
      appointmentsData?.data as Appointment[] | undefined
    )?.find((apt: Appointment) => apt.id === appointmentId)

    setFormData((prev) => ({
      ...prev,
      appointmentId,
      // Set default amount based on appointment price if available
      amount: selectedAppointment?.price || prev.amount,
    }))

    if (errors.appointmentId) {
      setErrors((prev) => ({
        ...prev,
        appointmentId: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (invoice) {
        // Update existing invoice
        const result = await updateInvoice.mutateAsync({
          id: invoice.id,
          data: {
            amount: formData.amount,
            dueDate: formData.dueDate,
            paymentMethod: formData.paymentMethod,
          },
        })

        if (result && onSuccess) {
          onSuccess(result as BillingInvoice)
        }
      } else {
        // Create new invoice
        const result = await createInvoice.mutateAsync(formData)

        if (result && onSuccess) {
          onSuccess(result as BillingInvoice)
        }
      }
    } catch (error) {
      console.error('Error al guardar factura:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      appointmentId: '',
      amount: 0,
      dueDate: '',
      paymentMethod: undefined,
    })
    setErrors({})
    onCancel?.()
  }

  const selectedAppointment = (
    appointmentsData?.data as Appointment[] | undefined
  )?.find((apt: Appointment) => apt.id === formData.appointmentId)

  const isLoading = createInvoice.isPending || updateInvoice.isPending

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Appointment Selection */}
      <div className='space-y-2'>
        <Label htmlFor='appointmentId'>
          Cita <span className='text-red-500'>*</span>
        </Label>
        <Select
          value={formData.appointmentId}
          onValueChange={handleAppointmentChange}
          disabled={!!invoice || isLoading} // Disable if editing existing invoice
        >
          <SelectTrigger
            className={cn(errors.appointmentId && 'border-red-500')}
          >
            <SelectValue placeholder='Seleccionar cita' />
          </SelectTrigger>
          <SelectContent>
            {(
              (appointmentsData?.data as Appointment[] | undefined)?.filter(
                (apt: Appointment) =>
                  apt.status === 'CONFIRMED' || apt.status === 'COMPLETED'
              ) || []
            ).map((appointment: Appointment) => (
              <SelectItem key={appointment.id} value={appointment.id}>
                <div className='flex flex-col'>
                  <div className='font-medium'>
                    {appointment.patient?.firstName}{' '}
                    {appointment.patient?.lastName}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {appointment.doctor?.firstName}{' '}
                    {appointment.doctor?.lastName} -{' '}
                    {new Date(appointment.date).toLocaleDateString('es-ES')}
                    {appointment.price &&
                      ` - ${formatCurrency(appointment.price)}`}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.appointmentId && (
          <p className='text-red-500 text-sm'>{errors.appointmentId}</p>
        )}
      </div>

      {/* Selected Appointment Details */}
      {selectedAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center'>
              <Receipt className='mr-2 h-4 w-4' />
              Detalles de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Paciente
                </Label>
                <div className='font-medium'>
                  {selectedAppointment.patient?.firstName}{' '}
                  {selectedAppointment.patient?.lastName}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {selectedAppointment.patient?.email}
                </div>
              </div>
              <div>
                <Label className='text-sm text-muted-foreground'>Doctor</Label>
                <div className='font-medium'>
                  {selectedAppointment.doctor?.firstName}{' '}
                  {selectedAppointment.doctor?.lastName}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {selectedAppointment.doctor?.email}
                </div>
              </div>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label className='text-sm text-muted-foreground'>Fecha</Label>
                <div>
                  {new Date(selectedAppointment.date).toLocaleDateString(
                    'es-ES'
                  )}
                </div>
              </div>
              <div>
                <Label className='text-sm text-muted-foreground'>
                  Duración
                </Label>
                <div>{selectedAppointment.duration} minutos</div>
              </div>
              <div>
                <Label className='text-sm text-muted-foreground'>Tipo</Label>
                <div>
                  {selectedAppointment.type === 'VIRTUAL'
                    ? 'Virtual'
                    : 'Presencial'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amount */}
      <div className='space-y-2'>
        <Label htmlFor='amount'>
          Monto <span className='text-red-500'>*</span>
        </Label>
        <div className='relative'>
          <DollarSign className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input
            id='amount'
            type='number'
            step='0.01'
            min='0'
            placeholder='0.00'
            value={formData.amount || ''}
            onChange={(e) =>
              handleInputChange('amount', parseFloat(e.target.value) || 0)
            }
            className={cn('pl-10', errors.amount && 'border-red-500')}
            disabled={isLoading}
          />
        </div>
        {errors.amount && (
          <p className='text-red-500 text-sm'>{errors.amount}</p>
        )}
      </div>

      {/* Payment Method */}
      <div className='space-y-2'>
        <Label htmlFor='paymentMethod'>Método de Pago Preferido</Label>
        <Select
          value={formData.paymentMethod || ''}
          onValueChange={(value) =>
            handleInputChange('paymentMethod', value as PaymentMethod)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Seleccionar método de pago' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='PAYPAL'>PayPal</SelectItem>
            <SelectItem value='CASH'>Efectivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date */}
      <div className='space-y-2'>
        <Label htmlFor='dueDate'>
          Fecha de Vencimiento <span className='text-red-500'>*</span>
        </Label>
        <div className='relative'>
          <Calendar className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input
            id='dueDate'
            type='date'
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className={cn('pl-10', errors.dueDate && 'border-red-500')}
            disabled={isLoading}
          />
        </div>
        {errors.dueDate && (
          <p className='text-red-500 text-sm'>{errors.dueDate}</p>
        )}
      </div>

      {/* Error Display */}
      {(createInvoice.error || updateInvoice.error) && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {createInvoice.error?.message ||
              updateInvoice.error?.message ||
              'Error al guardar la factura. Por favor, intenta de nuevo.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end space-x-2'>
        <Button
          type='button'
          variant='outline'
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Guardando...' : invoice ? 'Actualizar' : 'Crear'}{' '}
          Factura
        </Button>
      </div>
    </form>
  )
}
