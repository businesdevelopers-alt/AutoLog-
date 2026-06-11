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
      className={cn("bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.02)] transition-all duration-300", className)} 
      onClick={onClick}
    >
      {(title || subtitle || Icon || extra) && (
        <div className="px-6 py-4.5 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {Icon && (
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-100 text-blue-600 shadow-[0_2px_8px_-3px_rgba(37,99,235,0.12)]">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {title && <h3 className="text-sm font-black text-slate-800 tracking-tight leading-tight">{title}</h3>}
              {subtitle && <p className="text-[10px] text-slate-400 mt-1 truncate font-bold">{subtitle}</p>}
            </div>
          </div>
          {extra && (
            <div className="flex items-center gap-2 shrink-0 mr-auto">
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
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-[0_2px_10px_-3px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_16px_-4px_rgba(37,99,235,0.35)]',
    secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800',
    outline: 'border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:shadow-sm',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.25)]',
    ghost: 'bg-transparent hover:bg-slate-50 hover:text-slate-900 text-slate-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] font-black rounded-lg',
    md: 'px-4.5 py-2.5 text-xs font-black rounded-xl',
    lg: 'px-6 py-3.5 text-sm font-black rounded-xl',
    icon: 'p-2.5 rounded-lg'
  };

  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center font-bold tracking-wide transition-all active:scale-[0.98] outline-none disabled:opacity-50 disabled:pointer-events-none disabled:scale-100 cursor-pointer gap-2',
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] transition-all" 
        onClick={onClose} 
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 select-none">
        <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h3 className="text-base font-black text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
