"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TrendData } from "@/lib/services/trendInsightsService";

interface TrendChartProps {
  data: TrendData[];
  title: string;
  subtitle?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
}

export function TrendChart({ 
  data, 
  title, 
  subtitle, 
  valuePrefix = "", 
  valueSuffix = "", 
  className = "" 
}: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`p-4 text-center text-muted-foreground ${className}`}>
        <p>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const getYPosition = (value: number) => {
    if (range === 0) return 50;
    return 100 - ((value - minValue) / range) * 80;
  };

  const getLatestChange = () => {
    const latest = data[data.length - 1];
    if (!latest || typeof latest.change === 'undefined' || typeof latest.changePercent === 'undefined') {
      return {
        value: 0,
        percent: 0,
        isPositive: true
      };
    }
    return {
      value: latest.change,
      percent: latest.changePercent,
      isPositive: latest.change >= 0
    };
  };

  const change = getLatestChange();

  return (
    <div className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border border-border/40 p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Current Value and Change */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">
            {valuePrefix}{data[data.length - 1]?.value?.toLocaleString() || '0'}{valueSuffix}
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            change.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : change.value === 0 ? (
              <Minus className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {change.isPositive ? '+' : ''}{change.value.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              ({change.isPositive ? '+' : ''}{change.percent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-32 w-full">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-border/30"
            />
          ))}

          {/* Chart line */}
          <motion.path
            d={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = getYPosition(point.value);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = getYPosition(point.value);
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="currentColor"
                className="text-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
          {data.map((point, index) => {
            if (index % 3 === 0 || index === data.length - 1) {
              return (
                <span key={index} className="text-center">
                  {point.period}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
