'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface ChartDataPoint {
  day: string;
  stock: number;
  predicted?: number;
}

interface StockChartProps {
  data: ChartDataPoint[];
  threshold?: number;
}

export function StockHistoryChart({ data, threshold = 100 }: StockChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stock Level History & Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? '#333333' : '#E2E8F0';
  const axisColor = isDark ? '#94a3b8' : '#64748B';
  const tooltipBg = isDark ? '#1f1e0b' : '#fff';
  const tooltipBorder = isDark ? '#333333' : '#E2E8F0';
  const tooltipText = isDark ? '#fff' : '#000';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stock Level History & Prediction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="day" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: tooltipText }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ color: tooltipText }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <ReferenceLine y={threshold} label="Reorder Point" stroke="red" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="stock"
                name="Historical Stock"
                stroke="#6366f1"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="AI Prediction"
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
