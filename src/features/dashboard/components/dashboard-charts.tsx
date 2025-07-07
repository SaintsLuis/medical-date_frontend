'use client'

import { ChartAreaInteractive } from './chart-area-interactive'

export function DashboardCharts() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
      <div className='col-span-4'>
        <ChartAreaInteractive />
      </div>
      <div className='col-span-3'>
        {/* Aquí puedes agregar más widgets como calendario, notificaciones, etc. */}
      </div>
    </div>
  )
}
