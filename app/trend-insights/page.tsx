"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, RefreshCw, Calendar, Target, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendChart } from "@/components/ui/trend-chart";
import { SkillChart } from "@/components/ui/skill-chart";
import { MarketInsights } from "@/components/ui/market-insights";
import { TrendInsightsService, DomainTrends } from "@/lib/services/trendInsightsService";

export default function TrendInsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trendData, setTrendData] = useState<DomainTrends | null>(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  
  const DOMAIN_OPTIONS = [
    "AI & Machine Learning",
    "Web Development",
    "Data Science",
    "Mobile Development",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "UI/UX Design",
    "Digital Marketing",
    "Business Analytics",
    "Product Management",
    "Sales & Business Development",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (!session.user.onboarding) {
        router.push("/onboarding");
        return;
      }
      
      const userDomain = session.user.domain || "";
      setUserProfile({
        onboarding: session.user.onboarding,
        domain: userDomain,
        onboardingData: session.user.onboardingData
      });
      setSelectedDomain(userDomain);
      setIsLoading(false);
      
      // Fetch trend data for the user's domain
      if (userDomain) {
        fetchTrendData(userDomain);
      }
    }
  }, [session, status, router]);

  const fetchTrendData = async (domain: string) => {
    setIsLoadingTrends(true);
    try {
      const trends = await TrendInsightsService.getDomainTrends(domain);
      setTrendData(trends);
      setLastUpdated(trends.lastUpdated);
    } catch (error) {
      console.error("Error fetching trend data:", error);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const handleDomainChange = (newDomain: string) => {
    setSelectedDomain(newDomain);
    fetchTrendData(newDomain);
  };

  const refreshTrends = async () => {
    if (selectedDomain) {
      await fetchTrendData(selectedDomain);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading trend insights...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 lg:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4 py-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                Trend Insights
              </h1>
              <p className="text-muted-foreground">
                Market trends, skill demands, and career insights for {selectedDomain || "your domain"}
              </p>
            </div>
          </div>

          {/* Domain Selection */}
          <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Select Career Domain
              </CardTitle>
              <CardDescription>
                Choose a domain to view detailed trend analysis and market insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <select
                  value={selectedDomain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  disabled={isLoadingTrends}
                  className="flex-1 p-3 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {DOMAIN_OPTIONS.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={refreshTrends}
                  disabled={isLoadingTrends}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingTrends ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {lastUpdated && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoadingTrends ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Analyzing market trends for {selectedDomain}...</p>
              </div>
            </div>
          ) : trendData ? (
            <>
              {/* Market Overview */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <TrendChart
                    data={trendData.jobDemand}
                    title="Job Demand Trends"
                    subtitle="12-month job posting trends"
                    valueSuffix=" jobs"
                    className="h-full"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TrendChart
                    data={trendData.salaryTrends}
                    title="Salary Trends"
                    subtitle="12-month salary progression"
                    valuePrefix="$"
                    className="h-full"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="md:col-span-2 lg:col-span-1"
                >
                  <MarketInsights
                    insights={trendData.marketInsights}
                    title="Market Overview"
                    subtitle="Key metrics and changes"
                    className="h-full"
                  />
                </motion.div>
              </div>

              {/* Skill Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <SkillChart
                  skills={trendData.skillDemand}
                  title="Skill Demand Analysis"
                  subtitle="Top skills ranked by market demand and growth potential"
                  className="h-full"
                />
              </motion.div>

              {/* Insights Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-border/40 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Key Insights</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          What the trends mean for your career
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">Market Health</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {(trendData.jobDemand.length > 0 && trendData.jobDemand[trendData.jobDemand.length - 1]?.change > 0)
                            ? `Job demand is ${(trendData.jobDemand[trendData.jobDemand.length - 1]?.change || 0) > 5 ? 'strongly' : 'moderately'} growing, indicating a healthy market.`
                            : 'Job demand shows some decline, suggesting a more competitive market.'
                          }
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">Salary Outlook</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {(trendData.salaryTrends.length > 0 && trendData.salaryTrends[trendData.salaryTrends.length - 1]?.change > 0)
                            ? `Salaries are trending upward by ${(trendData.salaryTrends[trendData.salaryTrends.length - 1]?.changePercent || 0).toFixed(1)}%, showing strong compensation growth.`
                            : 'Salary growth is moderate, focus on skill development for better compensation.'
                          }
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">Skill Strategy</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {trendData.skillDemand.length > 0 
                            ? `Focus on ${trendData.skillDemand.slice(0, 3).map(s => s.skill).join(', ')} as these show the highest demand and growth potential.`
                            : 'Skill data is being analyzed to provide personalized recommendations.'
                          }
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">Career Action</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {(trendData.jobDemand.length > 0 && trendData.jobDemand[trendData.jobDemand.length - 1]?.change > 0)
                            ? 'This is a great time to explore new opportunities and negotiate better compensation.'
                            : 'Focus on upskilling and building a strong portfolio to stand out in the competitive market.'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
                <BarChart3 className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Trend Data Available</h3>
              <p className="text-muted-foreground">
                Select a career domain to view market trends and insights.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
