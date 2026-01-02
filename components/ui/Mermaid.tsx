"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render flow chart');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return <div className="text-red-500 text-sm p-2 border border-red-200 rounded">{error}</div>;
  }

  return (
    <div 
      ref={ref} 
      className="mermaid w-full overflow-x-auto p-4 flex justify-center bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 my-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
