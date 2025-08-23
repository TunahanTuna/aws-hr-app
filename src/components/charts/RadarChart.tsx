import React from 'react';
import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface RadarChartProps {
  data: Array<{
    subject: string;
    value: number;
    fullMark: number;
  }>;
  height?: number;
  color?: string;
  fillOpacity?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  height = 300, 
  color = '#8b5cf6',
  fillOpacity = 0.3
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.subject}</p>
          <p className="text-purple-600">
            <span className="font-medium">{data.value.toFixed(1)}h</span>
            <span className="text-gray-500 ml-2">/ {data.fullMark}h</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'dataMax']}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Radar
            name="Hours"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={fillOpacity}
            strokeWidth={2}
            animationDuration={1200}
            animationBegin={400}
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
