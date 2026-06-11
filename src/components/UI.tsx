import React from 'react';
import { cn } from '../lib/utils';

export interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  extra?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  key?: React.Key;
}

export function Card({ title, subtitle, icon: Icon, extra, className, children, onClick }: CardProps) {
  return (
    <div 
      className={cn("bg-white border border-border-main rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow", className)} 
      onClick={onClick}
    >
      {(title || subtitle || Icon || extra) && (
        <div className="px-6 py-5 border-b border-border-main bg-[#F9FAFB]/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              {title && <h3 className="text-base font-bold text-text-main truncate leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-text-muted mt-1 truncate font-medium">{subtitle}</p>}
            </div>
            {Icon && (
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-border-main text-brand shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
            )}
          </div>
          {extra && (
            <div className="flex items-center gap-3 shrink-0 mr-auto">
              {extra}
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  key?: React.Key;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  onClick,
  disabled,
  type = 'button',
  title
}: ButtonProps) {
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    secondary: 'bg-background text-text-main hover:bg-border-main',
    outline: 'border border-border-main bg-transparent hover:bg-[#F9FAFB] text-text-main',
    danger: 'bg-[#DE350B] text-white hover:bg-[#BF2600]',
    ghost: 'bg-transparent hover:bg-background text-text-muted'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded',
    md: 'px-4 py-2 text-sm font-semibold rounded-md',
    lg: 'px-6 py-3 text-base font-semibold rounded-lg',
    icon: 'p-2'
  };

  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-2',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
