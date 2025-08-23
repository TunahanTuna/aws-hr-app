import React from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ icon: Icon, label, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      {children}
    </div>
  </div>
);
