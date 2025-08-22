"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { MarketInsight } from "@/lib/services/trendInsightsService";

interface MarketInsightsProps {
  insights: MarketInsight[];
  title: string;
  subtitle?: string;
  className?: string;
}

export function MarketInsights({ insights, title, subtitle, className = "" }: MarketInsightsProps) {
  if (!insights || insights.length === 0) {
    return (
      <div className={`p-4 text-center text-muted-foreground ${className}`}>
        <p>No market insights available</p>
      </div>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getMetricIcon = (metric: string) => {
    if (metric.toLowerCase().includes('job')) return '💼';
    if (metric.toLowerCase().includes('salary')) return '💰';
    if (metric.toLowerCase().includes('skill')) return '🎯';
    return '📊';
  };

  return (
    <div className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border border-border/40 p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="p-4 rounded-lg border border-border/20 bg-background/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMetricIcon(insight.metric)}</span>
                <div>
                  <h4 className="font-medium text-foreground">{insight.metric}</h4>
                  <p className="text-sm text-muted-foreground">Current vs Previous Period</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(insight.trend)}
                <span className={`text-sm font-medium ${getTrendColor(insight.trend)}`}>
                  {insight.trend === 'up' ? 'Growing' : insight.trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Current</p>
                <p className="text-2xl font-bold text-foreground">
                  {insight.currentValue.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Previous</p>
                <p className="text-lg text-muted-foreground">
                  {insight.previousValue.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Change</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getTrendColor(insight.trend)}`}>
                    {insight.change > 0 ? '+' : ''}{insight.change.toLocaleString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTrendColor(insight.trend)} bg-opacity-10`}>
                    {insight.changePercent > 0 ? '+' : ''}{insight.changePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
