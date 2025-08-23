import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import type { ChartData } from '../../types';
import { useLanguage } from '../../i18n/useLanguage';

interface BarChartProps {
  data: ChartData[];
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 300 }) => {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-slate-500">
        {t('noDataAvailable')}
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: (item?.label || 'Unknown').length > 15 ? (item?.label || 'Unknown').substring(0, 15) + '...' : (item?.label || 'Unknown'),
    fullName: item?.label || 'Unknown',
    value: item?.value || 0,
    color: item?.color || '#8884d8'
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.fullName}</p>
          <p className="text-blue-600">
            <span className="font-medium">{data.value.toFixed(1)}h</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
            animationBegin={200}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
