'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tiempo que los datos se consideran frescos (5 minutos)
            staleTime: 5 * 60 * 1000,
            // Tiempo que los datos se mantienen en cache (10 minutos)
            gcTime: 10 * 60 * 1000,
            // Reintentos en caso de error
            retry: (failureCount, error) => {
              // No reintentar en errores 4xx (excepto 408, 429)
              if (error instanceof Error && 'status' in error) {
                const status = (error as { status: number }).status
                if (
                  status >= 400 &&
                  status < 500 &&
                  status !== 408 &&
                  status !== 429
                ) {
                  return false
                }
              }
              // Máximo 3 reintentos
              return failureCount < 3
            },
            // Refetch cuando la ventana recupera el foco
            refetchOnWindowFocus: true,
            // Refetch cuando se reconecta la red
            refetchOnReconnect: true,
          },
          mutations: {
            // Reintentos para mutaciones
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
