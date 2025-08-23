import React from 'react';
import type { ReactNode } from 'react';

interface ReportCardProps {
  title: string;
  children: ReactNode;
}

export const ReportCard: React.FC<ReportCardProps> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h3 className="text-lg font-semibold text-slate-800 mb-4">
      {title}
    </h3>
    {children}
  </div>
);
