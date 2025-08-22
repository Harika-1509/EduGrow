"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, Star, Clock, User, ExternalLink, BookOpen, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { courseScraperService, Course, ScrapingResult } from "@/lib/services/courseScraperService";

export default function OpportunityHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [platformResults, setPlatformResults] = useState<ScrapingResult[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [showCacheInfo, setShowCacheInfo] = useState(false);

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
      setIsLoading(false);
      
      // Fetch courses for the user's domain
      if (userDomain) {
        fetchCourses(userDomain);
      }
    }
  }, [session, status, router]);

  const fetchCourses = async (domain: string) => {
    setIsLoadingCourses(true);
    try {
      // Get platform results for summary display
      const results = await courseScraperService.scrapeCoursesByDomain(domain);
      setPlatformResults(results);
      
      // Get top 10 ranked courses using Gemini AI
      const topCourses = await courseScraperService.getTopRankedCourses(domain);
      setCourses(topCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Fallback to regular course fetching
      const results = await courseScraperService.scrapeCoursesByDomain(domain);
      setPlatformResults(results);
      
      const allCourses: Course[] = [];
      results.forEach(result => {
        if (result.success) {
          allCourses.push(...result.courses);
        }
      });
      
      setCourses(allCourses);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleSearch = async () => {
    if (!userProfile?.domain) return;
    
    setIsLoadingCourses(true);
    try {
      const searchResults = await courseScraperService.searchCourses(searchQuery, userProfile.domain);
      setCourses(searchResults);
    } catch (error) {
      console.error("Error searching courses:", error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Cache management functions
  const refreshCache = async () => {
    if (!userProfile?.domain) return;
    
    setIsLoadingCourses(true);
    try {
      console.log("Refreshing cache for domain:", userProfile.domain);
      await courseScraperService.refreshCacheForDomain(userProfile.domain);
      await fetchCourses(userProfile.domain);
    } catch (error) {
      console.error("Error refreshing cache:", error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const getCacheInfo = () => {
    const info = courseScraperService.getCacheInfo();
    setCacheInfo(info);
    setShowCacheInfo(true);
  };

  const clearAllCache = () => {
    courseScraperService.clearAllCache();
    setCacheInfo(null);
    setShowCacheInfo(false);
    // Refresh courses to trigger new scraping
    if (userProfile?.domain) {
      fetchCourses(userProfile.domain);
    }
  };

  const handleLevelFilter = async (level: string) => {
    if (!userProfile?.domain) return;
    
    setIsLoadingCourses(true);
    try {
      const levelResults = await courseScraperService.getCoursesByLevel(level, userProfile.domain);
      setCourses(levelResults);
    } catch (error) {
      console.error("Error filtering courses by level:", error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handlePlatformFilter = (platform: string) => {
    if (platform === "") {
      // Show all courses
      const allCourses: Course[] = [];
      platformResults.forEach(result => {
        if (result.success) {
          allCourses.push(...result.courses);
        }
      });
      setCourses(allCourses);
    } else {
      // Filter by platform
      const platformCourses = platformResults.find(result => 
        result.platform.toLowerCase() === platform.toLowerCase()
      );
      setCourses(platformCourses?.courses || []);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Opportunity Hub...</p>
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
              <h1 className="text-3xl font-bold tracking-tight">Opportunity Hub</h1>
              <p className="text-muted-foreground">
                Discover courses, internships, and projects in {userProfile?.domain || "your field"}
              </p>
            </div>
          </div>

                     {/* AI Ranking Info */}
           <Card className="border-border/40 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                   <Target className="h-5 w-5 text-white" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-blue-900 dark:text-blue-100">AI-Powered Course Ranking</h3>
                   <p className="text-sm text-blue-700 dark:text-blue-200">
                     Our Gemini AI analyzes all available courses and ranks them based on relevance, quality, learning outcomes, and value for your career in {userProfile?.domain || "your field"}.
                   </p>
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* Cache Management */}
           <Card className="border-border/40 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
             <CardContent className="p-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                     <BookOpen className="h-5 w-5 text-white" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-green-900 dark:text-green-100">Smart Caching System</h3>
                     <p className="text-sm text-green-700 dark:text-green-200">
                       Courses are cached for 30 minutes to improve performance. No need to re-scrape the same data.
                     </p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={getCacheInfo}
                     className="text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-950/20"
                   >
                     Cache Info
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={refreshCache}
                     disabled={isLoadingCourses}
                     className="text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-950/20"
                   >
                     Refresh Cache
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={clearAllCache}
                     className="text-red-700 border-red-200 hover:bg-red-50 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-950/20"
                   >
                     Clear Cache
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* Cache Information Modal */}
           {showCacheInfo && cacheInfo && (
             <Card className="border-border/40 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
               <CardContent className="p-4">
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="font-semibold text-amber-900 dark:text-amber-100">Cache Information</h3>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setShowCacheInfo(false)}
                     className="text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-950/20"
                   >
                     ×
                   </Button>
                 </div>
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="text-amber-800 dark:text-amber-200">Total Cached Domains:</span>
                     <span className="font-medium text-amber-900 dark:text-amber-100">{cacheInfo.size}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-amber-800 dark:text-amber-200">Cached Domains:</span>
                     <span className="font-medium text-amber-900 dark:text-amber-100">
                       {cacheInfo.domains.length > 0 ? cacheInfo.domains.join(', ') : 'None'}
                     </span>
                   </div>
                   {cacheInfo.details.length > 0 && (
                     <div className="mt-3">
                       <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Cache Details:</h4>
                       <div className="space-y-1">
                         {cacheInfo.details.map((detail: any, index: number) => (
                           <div key={index} className="flex justify-between text-xs">
                             <span className="text-amber-700 dark:text-amber-300">{detail.domain}:</span>
                             <span className="text-amber-600 dark:text-amber-400">
                               Age: {detail.age}, Expires in: {detail.expiresIn}
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>
           )}

          {/* Search and Filters */}
          <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Opportunities
              </CardTitle>
              <CardDescription>
                Search and filter courses from top learning platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Search Courses
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for courses, skills, or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Skill Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      if (e.target.value) {
                        handleLevelFilter(e.target.value);
                      }
                    }}
                    className="w-full p-3 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Platform
                  </label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => {
                      setSelectedPlatform(e.target.value);
                      handlePlatformFilter(e.target.value);
                    }}
                    className="w-full p-3 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Platforms</option>
                    {platformResults.map((result) => (
                      <option key={result.platform} value={result.platform}>
                        {result.platform}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={handleSearch} disabled={isLoadingCourses}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLevel("");
                    setSelectedPlatform("");
                    if (userProfile?.domain) {
                      fetchCourses(userProfile.domain);
                    }
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platformResults.map((result) => (
              <Card key={result.platform} className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{result.platform}</h3>
                      <p className="text-sm text-muted-foreground">
                        {result.success ? `${result.total} courses found` : 'Failed to load'}
                      </p>
                    </div>
                    <div className="text-right">
                      {result.success ? (
                        <Badge variant="default" className="text-xs">
                          {result.total}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Error
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Courses Grid */}
          {isLoadingCourses ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching for courses...</p>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {course.platform}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {course.rating}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {course.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {course.instructor}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Target className="h-3 w-3" />
                          {course.category}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${getLevelColor(course.level || '')}`}>
                          {course.level}
                        </Badge>
                        <div className="text-sm font-semibold text-primary">
                          {course.price}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => window.open(course.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Course
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
                  <BookOpen className="w-full h-full" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
              </div>
            </div>
          )}

                     {/* Summary */}
           <div className="text-center text-sm text-muted-foreground mt-6">
             Showing top {courses.length} AI-ranked courses from {platformResults.filter(r => r.success).length} platforms
             {cacheInfo && cacheInfo.size > 0 && (
               <span className="block mt-1 text-xs text-green-600 dark:text-green-400">
                 💾 {cacheInfo.size} domain(s) cached for faster loading
               </span>
             )}
           </div>
        </motion.div>
      </div>
    </div>
  );
}
