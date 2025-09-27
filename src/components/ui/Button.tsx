import { motion, type HTMLMotionProps } from 'framer-motion'
import { type ReactNode, forwardRef, useMemo } from 'react'

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  disabled?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  disabled = false,
  loading = false,
  className = '',
  ...props
}, ref) => {
  // Memoize the delay to prevent infinite re-renders from Math.random()
  const shimmerDelay = useMemo(() => Math.random() * 2, []);

  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-300 transform-gpu focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 overflow-hidden"

  const sizeStyles = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl",
    xl: "px-10 py-5 text-xl rounded-xl"
  }

  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500",
    secondary: "bg-gradient-to-r from-purple-500 to-pink-600 text-white border-transparent hover:from-purple-600 hover:to-pink-700 focus:ring-purple-500",
    ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/10 focus:ring-white/20",
    outline: "bg-transparent border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500 focus:ring-blue-500"
  }

  const glowStyles = glow ? "shadow-2xl" : ""
  const disabledStyles = disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${glowStyles} ${disabledStyles} ${className}`

  return (
    <motion.button
      ref={ref}
      className={combinedClassName}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? {
        scale: 1.02,
        boxShadow: glow ? [
          "0 0 20px rgba(59, 130, 246, 0.3)",
          "0 0 40px rgba(168, 85, 247, 0.4)",
          "0 0 20px rgba(59, 130, 246, 0.3)"
        ] : undefined
      } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        boxShadow: { duration: 1, repeat: Infinity, ease: "easeInOut" }
      }}
      {...props}
    >
      {/* Background shimmer effect */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: shimmerDelay }}
          style={{ transform: 'skewX(-15deg)' }}
        />
      )}

      {/* Glow effect */}
      {glow && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-30"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Particle effects on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        whileHover={!disabled && !loading ? {
          background: [
            'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          ]
        } : undefined}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
        ) : null}
        <span>{children}</span>
      </span>

      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/10 rounded-full"
        initial={{ scale: 0, opacity: 1 }}
        whileTap={!disabled && !loading ? {
          scale: 2,
          opacity: 0
        } : undefined}
        transition={{ duration: 0.4 }}
      />

      {/* Border animation for outline variant */}
      {variant === 'outline' && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-blue-500"
          animate={{
            borderColor: [
              'rgba(59, 130, 246, 0.5)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(59, 130, 246, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button