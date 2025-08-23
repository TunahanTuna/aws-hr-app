import React from 'react';
import type { ReactNode } from 'react';
import { PlusCircle } from 'lucide-react';

interface ManagementSectionProps {
  title: string;
  buttonText: string;
  onAdd: () => void;
  children: ReactNode;
}

export const ManagementSection: React.FC<ManagementSectionProps> = ({ 
  title, 
  buttonText, 
  onAdd, 
  children 
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <button 
        onClick={onAdd} 
        className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
      >
        <PlusCircle className="h-4 w-4" />
        <span>{buttonText}</span>
      </button>
    </div>
    <div className="overflow-x-auto">
      {children}
    </div>
  </div>
);
