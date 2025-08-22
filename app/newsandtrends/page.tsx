"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Globe, TrendingUp, BookOpen, Users, Briefcase, Target, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useTheme } from "next-themes";
import { newsService, NewsItem, NewsResponse } from "@/lib/services/newsService";

export default function NewsAndTrendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalNews, setTotalNews] = useState<number>(0);
  
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
      
      // Fetch news data for the user's domain
      if (userDomain) {
        fetchNewsData(userDomain);
      }
    }
  }, [session, status, router]);

  const fetchNewsData = async (domain: string, page: number = 1, category?: string, search?: string) => {
    setIsLoadingNews(true);
    try {
      // Use the news service to fetch data from external NewsAPI
      const response: NewsResponse = await newsService.fetchExternalNews({
        domain,
        category,
        page,
        limit: 10, // Maximum 10 articles from NewsAPI
        search
      });

      if (response.success) {
        setNewsData(response.data);
        // Since we're limited to 10 articles, always show page 1
        setTotalPages(1);
        setTotalNews(response.total);
        setCurrentPage(1);
      } else {
        console.error('Failed to fetch news data');
        setNewsData([]);
      }
    } catch (error) {
      console.error("Error fetching news data:", error);
      // No fallback to mock data - only show real API data
      setNewsData([]);
      setTotalPages(1);
      setTotalNews(0);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const handleDomainChange = (newDomain: string) => {
    setSelectedDomain(newDomain);
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedCategory("");
    fetchNewsData(newDomain, 1);
  };

  const handleSearch = () => {
    if (selectedDomain) {
      setCurrentPage(1);
      fetchNewsData(selectedDomain, 1, selectedCategory || undefined, searchQuery || undefined);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (selectedDomain) {
      setCurrentPage(newPage);
      fetchNewsData(selectedDomain, newPage, selectedCategory || undefined, searchQuery || undefined);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to- mt-10 br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 lg:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
         

                     {/* Page Title */}
           <div className="text-center space-y-4">
             <h1 className="text-4xl font-bold tracking-tight">
               News & Trends
             </h1>
             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
               Stay updated with the latest news, trends, and insights in{" "}
               <span className="font-semibold text-primary">{selectedDomain || "your selected domain"}</span>
             </p>
           </div>

                                {/* Domain Info Card */}
            <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Select Career Domain
                </CardTitle>
                <CardDescription>
                  Choose a domain to view personalized news and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-1/2">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Current Selection
                      </label>
                      <select
                        value={selectedDomain}
                        onChange={(e) => handleDomainChange(e.target.value)}
                        disabled={isLoadingNews}
                        className="w-full p-3 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {DOMAIN_OPTIONS.map((domain) => (
                          <option key={domain} value={domain}>
                            {domain}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Search and Filter Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Search News
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search for news..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Category Filter
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        <option value="Industry Trends">Industry Trends</option>
                        <option value="Career Insights">Career Insights</option>
                        <option value="Technology">Technology</option>
                        <option value="Education">Education</option>
                        <option value="Community">Community</option>
                        <option value="Inspiration">Inspiration</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        onClick={handleSearch}
                        disabled={isLoadingNews}
                        className="w-full"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                  
                  {selectedDomain && (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-sm">
                        {selectedDomain}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Showing {totalNews} news articles
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* News Grid */}
            {isLoadingNews ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading latest news for {selectedDomain}...</p>
                </div>
              </div>
            ) : newsData.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {newsData.map((news, index) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {news.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(news.date).toLocaleDateString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {news.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {news.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            {news.source}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {news.readTime}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
                    <Globe className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No News Available</h3>
                  <p className="text-muted-foreground">
                    {selectedDomain ? 
                      `No recent news found for ${selectedDomain}. Try selecting a different domain or check back later.` :
                      'Select a career domain to view the latest news and trends.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* News Summary */}
            <div className="text-center text-sm text-muted-foreground mt-6">
              Showing {newsData.length} latest articles from the past 10 days • {totalNews} total articles available
            </div>
          
         </motion.div>
       </div>
     </div>
   );
 }
