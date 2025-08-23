import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 ${className}`}>
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
