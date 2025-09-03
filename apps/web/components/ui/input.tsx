import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, leftIcon, rightIcon, loading, ...props }, ref) => {
    const inputId = React.useId()
    
    if (label || error || leftIcon || rightIcon || loading) {
      return (
        <div className="space-y-2">
          {label && <Label htmlFor={inputId}>{label}</Label>}
          <div className="relative">
            {leftIcon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {leftIcon}
              </div>
            )}
            <input
              id={inputId}
              type={type}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                leftIcon && "pl-10",
                rightIcon && "pr-10",
                error && "border-destructive focus-visible:ring-destructive",
                className
              )}
              ref={ref}
              disabled={loading || props.disabled}
              {...props}
            />
            {rightIcon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {rightIcon}
              </div>
            )}
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }