import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

interface LineChartProps {
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  height?: number;
  variant?: 'line' | 'area';
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  height = 300, 
  variant = 'line',
  color = '#3b82f6',
  gradientFrom = '#3b82f6',
  gradientTo = '#dbeafe'
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">
            <span className="font-medium">{payload[0].value.toFixed(1)}h</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  if (variant === 'area') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={gradientTo} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              animationDuration={1500}
              animationBegin={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            animationDuration={1500}
            animationBegin={300}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
