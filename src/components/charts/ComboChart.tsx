import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface ComboChartData {
  name: string;
  bar1: number;
  bar2?: number;
  line1: number;
  line2?: number;
}

interface ComboChartProps {
  data: ComboChartData[];
  height?: number;
  bar1Color?: string;
  bar2Color?: string;
  line1Color?: string;
  line2Color?: string;
  bar1Label?: string;
  bar2Label?: string;
  line1Label?: string;
  line2Label?: string;
}

export const ComboChart: React.FC<ComboChartProps> = ({ 
  data, 
  height = 300,
  bar1Color = '#3b82f6',
  bar2Color = '#10b981',
  line1Color = '#ef4444',
  line2Color = '#f59e0b',
  bar1Label = 'Bar 1',
  bar2Label = 'Bar 2',
  line1Label = 'Line 1',
  line2Label = 'Line 2'
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              <span className="font-medium">{entry.dataKey}:</span> {entry.value.toFixed(1)}
              {entry.dataKey.includes('bar') ? 'h' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'Percentage', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Bar 
            yAxisId="left"
            dataKey="bar1" 
            fill={bar1Color}
            name={bar1Label}
            animationDuration={1000}
            animationBegin={200}
          />
          
          {data.some(d => d.bar2 !== undefined) && (
            <Bar 
              yAxisId="left"
              dataKey="bar2" 
              fill={bar2Color}
              name={bar2Label}
              animationDuration={1000}
              animationBegin={400}
            />
          )}
          
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="line1" 
            stroke={line1Color}
            strokeWidth={3}
            name={line1Label}
            animationDuration={1500}
            animationBegin={600}
          />
          
          {data.some(d => d.line2 !== undefined) && (
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="line2" 
              stroke={line2Color}
              strokeWidth={3}
              name={line2Label}
              animationDuration={1500}
              animationBegin={800}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
