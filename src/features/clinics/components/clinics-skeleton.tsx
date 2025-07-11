import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ClinicsSkeletion() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className='animate-pulse'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='h-10 w-10 bg-muted rounded-full' />
                <div className='flex-1 space-y-2'>
                  <div className='h-5 w-32 bg-muted rounded' />
                  <div className='flex gap-2'>
                    <div className='h-4 w-16 bg-muted rounded' />
                    <div className='h-4 w-16 bg-muted rounded' />
                  </div>
                </div>
              </div>
              <div className='h-8 w-8 bg-muted rounded' />
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <div className='h-4 w-4 bg-muted rounded' />
              <div className='h-4 w-full bg-muted rounded' />
            </div>
            <div className='flex items-center space-x-2'>
              <div className='h-4 w-4 bg-muted rounded' />
              <div className='h-4 w-24 bg-muted rounded' />
            </div>
            <div className='flex items-center space-x-2'>
              <div className='h-4 w-4 bg-muted rounded' />
              <div className='h-4 w-32 bg-muted rounded' />
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-1'>
                <div className='h-4 w-4 bg-muted rounded' />
                <div className='h-4 w-16 bg-muted rounded' />
              </div>
              <div className='flex items-center space-x-1'>
                <div className='h-4 w-4 bg-muted rounded' />
                <div className='h-4 w-8 bg-muted rounded' />
              </div>
            </div>
            <div className='space-y-2'>
              <div className='h-4 w-16 bg-muted rounded' />
              <div className='flex gap-1'>
                <div className='h-5 w-20 bg-muted rounded' />
                <div className='h-5 w-24 bg-muted rounded' />
                <div className='h-5 w-16 bg-muted rounded' />
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='h-4 w-4 bg-muted rounded' />
              <div className='h-4 w-full bg-muted rounded' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
