import React from 'react'
import { cn } from '@/lib/utils'

// Add buttonVariants function for compatibility with shadcn components
export const buttonVariants = ({ 
  variant = "default", 
  size = "default",
  className = ""
}: { 
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link",
  size?: "default" | "sm" | "lg" | "icon",
  className?: string 
} = {}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    link: "text-primary underline-offset-4 hover:underline"
  }
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10"
  }
  
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className)
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ text, className, onClick, children, variant = "default", size = "default", ...props }, ref) => {
    // If it's your custom styled button (has text prop or default variant)
    if (text || (!children && variant === "default")) {
      return (
        <button 
          ref={ref}
          className={cn(
            "flex px-5 py-[9px] justify-center items-center rounded-full cursor-pointer",
            "text-white text-sm font-[560] leading-[18px] whitespace-nowrap",
            "transition-all duration-200 active:scale-95",
            className
          )}
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
            boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
            textShadow: '0 0.8px 0.7px #D96F1D'
          }}
          onClick={onClick}
          {...props}
        >
          {text || children}
        </button>
      )
    }
    
    // For other variants (used by shadcn components like calendar)
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
export default Button