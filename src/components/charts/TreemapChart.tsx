import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import type { ChartData } from '../../types';
import { useLanguage } from '../../i18n/useLanguage';

interface TreemapChartProps {
  data: ChartData[];
  height?: number;
}

export const TreemapChart: React.FC<TreemapChartProps> = ({ data, height = 300 }) => {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-slate-500">
        {t('noDataAvailable')}
      </div>
    );
  }

  const treemapData = data.map((item, index) => ({
    name: item?.label || `Item ${index + 1}`,
    size: item?.value || 0,
    color: item?.color || '#8884d8',
    index
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name || 'Unknown'}</p>
          <p className="text-blue-600">
            <span className="font-medium">{data.size ? data.size.toFixed(1) : '0'}h</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomizedContent = ({ depth, x, y, width, height, payload, name }: any) => {
    if (depth > 1 || !payload) return null;

    const textColor = '#ffffff';
    const fontSize = Math.min(width, height) > 60 ? 12 : 10;
    const fallbackColor = '#8884d8'; // Default color if payload.color is undefined
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: payload.color || fallbackColor,
            stroke: '#fff',
            strokeWidth: 2,
            fillOpacity: 0.85,
          }}
          className="hover:opacity-80 transition-opacity duration-200"
        />
        {width > 40 && height > 20 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill={textColor}
            fontSize={fontSize}
            fontWeight="bold"
          >
            <tspan x={x + width / 2} dy="-0.2em">
              {name && name.length > 10 ? name.substring(0, 10) + '...' : (name || 'N/A')}
            </tspan>
            <tspan x={x + width / 2} dy="1.2em">
              {payload.size ? `${payload.size.toFixed(1)}h` : '0h'}
            </tspan>
          </text>
        )}
      </g>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
          animationDuration={1000}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </motion.div>
  );
};
