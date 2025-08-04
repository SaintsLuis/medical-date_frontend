import Image from 'next/image'

interface LogoProps {
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function Logo({
  width = 64,
  height = 64,
  className = '',
  priority = true,
}: LogoProps) {
  return (
    <Image
      src='/logo.svg'
      alt='Medical Date Logo'
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
