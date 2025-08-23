import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import type { ChartData } from '../../types';
import { useLanguage } from '../../i18n/useLanguage';

interface PieChartProps {
  data: ChartData[];
  height?: number;
  showLegend?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ data, height = 300, showLegend = true }) => {
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

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (parseFloat(percentage) < 5) return null; // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={showLegend ? 80 : 100}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="middle" 
              align="right" 
              layout="vertical"
              iconType="square"
              wrapperStyle={{ paddingLeft: '20px', fontSize: '12px' }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
