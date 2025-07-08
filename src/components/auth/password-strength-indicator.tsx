'use client'

import { useState, useEffect } from 'react'
import { validatePassword } from '@/lib/validations/auth'

interface PasswordStrengthIndicatorProps {
  password: string
  showIndicator?: boolean
}

export function PasswordStrengthIndicator({
  password,
  showIndicator = true,
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<{
    isValid: boolean
    errors: string[]
    strength: 'weak' | 'medium' | 'strong'
  }>({
    isValid: false,
    errors: [],
    strength: 'weak',
  })

  useEffect(() => {
    if (password) {
      const result = validatePassword(password)
      setStrength(result)
    } else {
      setStrength({
        isValid: false,
        errors: [],
        strength: 'weak',
      })
    }
  }, [password])

  if (!showIndicator || !password) {
    return null
  }

  const getStrengthColor = (strengthLevel: string) => {
    switch (strengthLevel) {
      case 'strong':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'weak':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStrengthText = (strengthLevel: string) => {
    switch (strengthLevel) {
      case 'strong':
        return 'Fuerte'
      case 'medium':
        return 'Media'
      case 'weak':
        return 'Débil'
      default:
        return ''
    }
  }

  const getStrengthTextColor = (strengthLevel: string) => {
    switch (strengthLevel) {
      case 'strong':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'weak':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className='space-y-2'>
      {/* Barra de progreso */}
      <div className='flex items-center gap-2'>
        <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor(
              strength.strength
            )}`}
            style={{
              width: `${
                strength.strength === 'weak'
                  ? 33
                  : strength.strength === 'medium'
                  ? 66
                  : 100
              }%`,
            }}
          />
        </div>
        <span
          className={`text-xs font-medium ${getStrengthTextColor(
            strength.strength
          )}`}
        >
          {getStrengthText(strength.strength)}
        </span>
      </div>

      {/* Lista de errores */}
      {strength.errors.length > 0 && (
        <div className='space-y-1'>
          {strength.errors.map((error, index) => (
            <p
              key={index}
              className='text-xs text-red-600 flex items-center gap-1'
            >
              <span className='w-1 h-1 bg-red-600 rounded-full' />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Mensaje de éxito */}
      {strength.isValid && (
        <p className='text-xs text-green-600 flex items-center gap-1'>
          <span className='w-1 h-1 bg-green-600 rounded-full' />
          Contraseña válida
        </p>
      )}
    </div>
  )
}
