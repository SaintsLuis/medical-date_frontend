'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { MobileNav } from './mobile-nav'

export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='sm' className='lg:hidden -ml-1'>
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='pl-1 pr-0 w-80'>
        <MobileNav setOpen={setOpen} />
      </SheetContent>
    </Sheet>
  )
}
