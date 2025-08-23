import React from 'react';
import { ResponsiveContainer, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  height?: number;
  color?: string;
  backgroundColor?: string;
  unit?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ 
  value, 
  max, 
  label, 
  height = 250,
  backgroundColor = '#e5e7eb',
  unit = '%'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage / 100) * 180; // Half circle

  const getGaugeColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#f59e0b'; // Yellow  
    if (percentage >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const gaugeColor = getGaugeColor(percentage);

  const renderNeedle = () => {
    const needleAngle = (angle - 90) * (Math.PI / 180);
    const needleLength = 70;
    const cx = 150;
    const cy = 150;
    
    const x1 = cx;
    const y1 = cy;
    const x2 = cx + needleLength * Math.cos(needleAngle);
    const y2 = cy + needleLength * Math.sin(needleAngle);

    return (
      <motion.g
        initial={{ rotate: -90 }}
        animate={{ rotate: angle - 90 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#374151"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r="6"
          fill="#374151"
        />
      </motion.g>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      style={{ height }}
      className="relative flex flex-col items-center"
    >
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={[{ value: 50 }]}
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={0}
            innerRadius={50}
            outerRadius={90}
            fill={backgroundColor}
            dataKey="value"
            strokeWidth={0}
          />
          <Pie
            data={[{ value: percentage / 2 }]}
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={180 - (percentage * 1.8)}
            innerRadius={50}
            outerRadius={90}
            fill={gaugeColor}
            dataKey="value"
            strokeWidth={0}
            animationDuration={2000}
            animationBegin={500}
          />
          {renderNeedle()}
        </PieChart>
      </ResponsiveContainer>
      
      <div className="text-center mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-3xl font-bold" style={{ color: gaugeColor }}>
            {value.toFixed(1)}{unit}
          </p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
          <p className="text-xs text-gray-500">of {max}{unit} target</p>
        </motion.div>
      </div>

      {/* Scale markers */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-between px-8">
        {[0, 25, 50, 75, 100].map((mark) => (
          <motion.div
            key={mark}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + mark * 0.02, duration: 0.3 }}
            className="text-xs text-gray-400"
          >
            {mark}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
