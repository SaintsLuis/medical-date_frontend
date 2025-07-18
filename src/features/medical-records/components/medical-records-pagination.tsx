import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface MedicalRecordsPaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function MedicalRecordsPagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  total,
  limit,
  onPageChange,
}: MedicalRecordsPaginationProps) {
  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, total)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Show current page and adjacent pages
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t pt-6'>
      {/* Results info */}
      <div className='text-sm text-muted-foreground'>
        Mostrando {startItem} - {endItem} de {total} registros
      </div>

      {/* Pagination controls */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                if (hasPrevPage) {
                  onPageChange(currentPage - 1)
                }
              }}
              className={
                !hasPrevPage
                  ? 'pointer-events-none opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-accent'
              }
            />
          </PaginationItem>

          {pageNumbers.map((pageNum, index) => (
            <PaginationItem key={index}>
              {pageNum === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault()
                    onPageChange(pageNum)
                  }}
                  isActive={currentPage === pageNum}
                  className='cursor-pointer'
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                if (hasNextPage) {
                  onPageChange(currentPage + 1)
                }
              }}
              className={
                !hasNextPage
                  ? 'pointer-events-none opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-accent'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
