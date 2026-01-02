"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title?: string;
  data: any[];
  dataKeys: {
    name: string; // The key for the label (X-axis or Pie segment name)
    value: string; // The key for the value (Y-axis or Pie segment value)
    color?: string;
  }[];
}

interface ChartRendererProps {
  config: ChartData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ChartRenderer({ config }: ChartRendererProps) {
  const { type, title, data, dataKeys } = config;

  if (!data || data.length === 0) {
    return <div className="p-4 text-gray-500">No data available for chart</div>;
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey={dataKeys[0].name} />
              <YAxis />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: 'transparent' }}
              />
              <Legend />
              {dataKeys.map((key, index) => (
                <Bar 
                  key={key.value} 
                  dataKey={key.value} 
                  fill={key.color || COLORS[index % COLORS.length]} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey={dataKeys[0].name} />
              <YAxis />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              {dataKeys.map((key, index) => (
                <Line 
                  key={key.value} 
                  type="monotone" 
                  dataKey={key.value} 
                  stroke={key.color || COLORS[index % COLORS.length]} 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKeys[0].value}
                nameKey={dataKeys[0].name}
                animationDuration={1500}
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 my-2 shadow-sm">
      {title && <h4 className="text-sm font-semibold mb-4 text-center">{title}</h4>}
      {renderChart()}
    </div>
  );
}
