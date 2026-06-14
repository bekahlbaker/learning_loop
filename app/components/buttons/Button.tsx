'use client'

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'default' | 'small'
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

export const BASE_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed'

export const BUTTON_SIZE: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'py-2.5 px-5 text-sm',
  small: 'py-1.5 px-3 text-xs',
}

export const BUTTON_VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-gray-800 text-white shadow-sm hover:bg-gray-700',
  secondary: 'bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-500 hover:text-gray-700',
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'default',
  disabled = false,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        BASE_BUTTON_CLASS,
        BUTTON_SIZE[size],
        BUTTON_VARIANTS[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  )
}
