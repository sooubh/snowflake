"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { name: 'Mon', value: 180, predicted: 180 },
  { name: 'Tue', value: 160, predicted: 160 },
  { name: 'Wed', value: 140, predicted: 140 },
  { name: 'Thu', value: 130, predicted: 130 },
  { name: 'Fri', value: 110, predicted: 110 },
  { name: 'Sat', value: null, predicted: 90 }, // Future
  { name: 'Sun', value: null, predicted: 70 }, // Future
];

export function StockChartVisual() {
  return (
    <div className="relative flex-1 w-full min-h-[300px] bg-background-light dark:bg-[#23220f] rounded-xl p-4 md:p-8 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f9f506" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f9f506" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <ReferenceLine y={40} label={{ position: 'right', value: 'Safety Stock', fill: 'red', fontSize: 10 }} stroke="red" strokeDasharray="3 3" />
          
          <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} name="Historical" />
          <Area type="monotone" dataKey="predicted" stroke="#f9f506" fillOpacity={1} fill="url(#colorPredicted)" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
