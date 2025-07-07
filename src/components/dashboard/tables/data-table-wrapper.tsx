import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface DataTableWrapperProps {
  title: string
  description?: string
  children: ReactNode
  onAddNew?: () => void
  addButtonText?: string
  className?: string
}

export function DataTableWrapper({
  title,
  description,
  children,
  onAddNew,
  addButtonText = 'Agregar Nuevo',
  className,
}: DataTableWrapperProps) {
  return (
    <Card className={className}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div>
          <CardTitle className='text-lg font-semibold'>{title}</CardTitle>
          {description && (
            <p className='text-sm text-muted-foreground'>{description}</p>
          )}
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} size='sm'>
            <Plus className='h-4 w-4 mr-2' />
            {addButtonText}
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
