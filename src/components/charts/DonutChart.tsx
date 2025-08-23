import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import type { ChartData } from '../../types';
import { useLanguage } from '../../i18n/useLanguage';

interface DonutChartProps {
  data: ChartData[];
  height?: number;
  centerText?: string;
  centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  height = 300, 
  centerText = 'Total',
  centerValue 
}) => {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-slate-500">
        {t('noDataAvailable')}
      </div>
    );
  }

  const total = data.reduce((acc, item) => acc + (item?.value || 0), 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-slate-500">
        {t('noDataAvailable')}
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item?.label || 'Unknown',
    value: item?.value || 0,
    color: item?.color || '#8884d8',
    percentage: ((item?.value || 0) / total * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-blue-600">
            <span className="font-medium">{data.value.toFixed(1)}h</span>
            <span className="text-gray-500 ml-2">({data.percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCenterText = () => (
    <text textAnchor="middle" dominantBaseline="middle" className="fill-gray-700">
      <tspan x="50%" y="45%" className="text-sm font-medium">
        {centerText}
      </tspan>
      <tspan x="50%" y="55%" className="text-xl font-bold">
        {centerValue || `${total.toFixed(1)}h`}
      </tspan>
    </text>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, rotate: -10 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.8 }}
      style={{ height }}
      className="relative"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationBegin={200}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {renderCenterText()}
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 text-xs">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};