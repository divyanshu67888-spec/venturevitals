import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Network } from 'lucide-react';

interface PertChartSectionProps {
  chart: string;
}

export default function PertChartSection({ chart }: PertChartSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
      },
    });

    const renderChart = async () => {
      if (containerRef.current && chart) {
        try {
          // Clean up the string just in case the AI wraps it in markdown blocks
          const cleanChart = chart.replace(/```mermaid\n?/g, '').replace(/```/g, '').trim();
          
          const { svg } = await mermaid.render(`mermaid-svg-${Math.random().toString(36).substring(7)}`, cleanChart);
          setSvgContent(svg);
        } catch (error) {
          console.error("Failed to render mermaid chart:", error);
          setSvgContent('<div class="text-sm text-muted-foreground p-4 text-center">Failed to render execution timeline.</div>');
        }
      }
    };

    renderChart();
  }, [chart]);

  if (!chart) return null;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden mt-8">
      <div className="border-b border-border bg-secondary/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Network className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Execution Flow (PERT Chart)</h3>
            <p className="text-sm text-muted-foreground">AI-generated project task dependencies</p>
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8 overflow-x-auto overflow-y-hidden" ref={containerRef}>
        {svgContent ? (
          <div 
            className="flex justify-center min-w-[600px] w-full"
            dangerouslySetInnerHTML={{ __html: svgContent }} 
          />
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
            Rendering timeline...
          </div>
        )}
      </div>
    </div>
  );
}
