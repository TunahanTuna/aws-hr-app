import React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const ToastRoot = Toast.Root;
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof Toast.Viewport>,
  React.ComponentPropsWithoutRef<typeof Toast.Viewport>
>(({ className, ...props }, ref) => (
  <Toast.Viewport
    ref={ref}
    className={clsx(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));

export const ToastContent = React.forwardRef<
  React.ElementRef<typeof Toast.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof Toast.Root>, 'type'> & {
    type: ToastType;
    title?: string;
    description: string;
    onClose?: () => void;
  }
>(({ className, type, title, description, onClose, ...props }, ref) => {
  const Icon = toastIcons[type];
  
  return (
    <Toast.Root
      ref={ref}
      className={clsx(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
        toastStyles[type],
        className
      )}
      {...props}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="grid gap-1">
          {title && (
            <Toast.Title className="text-sm font-semibold">
              {title}
            </Toast.Title>
          )}
          <Toast.Description className="text-sm opacity-90">
            {description}
          </Toast.Description>
        </div>
      </div>
      <Toast.Close
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Toast.Close>
    </Toast.Root>
  );
});

ToastViewport.displayName = 'ToastViewport';
ToastContent.displayName = 'ToastContent';
