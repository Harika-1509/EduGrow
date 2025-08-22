"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { SkillTrend } from "@/lib/services/trendInsightsService";

interface SkillChartProps {
  skills: SkillTrend[];
  title: string;
  subtitle?: string;
  className?: string;
}

export function SkillChart({ skills, title, subtitle, className = "" }: SkillChartProps) {
  if (!skills || skills.length === 0) {
    return (
      <div className={`p-4 text-center text-muted-foreground ${className}`}>
        <p>No skill data available</p>
      </div>
    );
  }

  const sortedSkills = [...skills].sort((a, b) => b.demand - a.demand);

  const getTrendIcon = (trend: 'rising' | 'stable' | 'declining') => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTrendColor = (trend: 'rising' | 'stable' | 'declining') => {
    switch (trend) {
      case 'rising':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getDemandColor = (demand: number) => {
    if (demand >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (demand >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    if (demand >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <div className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border border-border/40 p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="space-y-3">
        {sortedSkills.slice(0, 8).map((skill, index) => (
          <motion.div
            key={skill.skill}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-background/50"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                {getTrendIcon(skill.trend)}
                <span className="font-medium text-foreground">{skill.skill}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Demand Score */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Demand:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(skill.demand)}`}>
                  {skill.demand}
                </span>
              </div>

              {/* Growth */}
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${getTrendColor(skill.trend)}`}>
                  {skill.growth > 0 ? '+' : ''}{skill.growth.toFixed(1)}%
                </span>
              </div>

              {/* Salary */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span className="text-sm">
                  {skill.salary.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {skills.length > 8 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Showing top 8 skills of {skills.length} total skills
          </p>
        </div>
      )}
    </div>
  );
}
