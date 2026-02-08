import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow active:bg-primary-800',
      secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm active:bg-gray-100',
      outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 active:bg-primary-100',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-sm active:bg-danger-800',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg font-semibold',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          variant === 'primary' ? 'focus:ring-primary-500' : 'focus:ring-gray-500',
          variant === 'danger' && 'focus:ring-danger-500',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
