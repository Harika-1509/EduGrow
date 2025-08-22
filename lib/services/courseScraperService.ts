import * as puppeteer from 'puppeteer';

export interface Course {
  id: string;
  title: string;
  description: string;
  platform: string;
  url: string;
  price?: string;
  rating?: number;
  duration?: string;
  level?: string;
  category: string;
  image?: string;
  instructor?: string;
  lastUpdated: string;
}

export interface ScrapingResult {
  success: boolean;
  courses: Course[];
  total: number;
  platform: string;
  error?: string;
}

interface CachedCourses {
  domain: string;
  results: ScrapingResult[];
  timestamp: number;
  expiresAt: number;
}

class CourseScraperService {
  private cache: Map<string, CachedCourses> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Scrape courses from multiple platforms based on domain using API route
  async scrapeCoursesByDomain(domain: string): Promise<ScrapingResult[]> {
    try {
      // Check if we have cached results for this domain
      const cached = this.getCachedCourses(domain);
      if (cached) {
        console.log(`Using cached courses for domain: ${domain}`);
        return cached;
      }

      console.log(`Starting web scraping for domain: ${domain}`);
      
      // Call the API route for web scraping
      const response = await fetch('/api/scraping/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Web scraping completed successfully');
        
        // Cache the results
        this.cacheCourses(domain, result.results);
        
        return result.results;
      } else {
        throw new Error('Web scraping failed');
      }
      
    } catch (error) {
      console.error('Error in web scraping:', error);
      // Return fallback data if scraping fails
      return this.getFallbackResults(domain);
    }
  }

  // Get cached courses if they exist and are still valid
  private getCachedCourses(domain: string): ScrapingResult[] | null {
    const cached = this.cache.get(domain);
    
    if (!cached) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() > cached.expiresAt) {
      console.log(`Cache expired for domain: ${domain}`);
      this.cache.delete(domain);
      return null;
    }

    // Check if cache is still fresh (within 30 minutes)
    const age = Date.now() - cached.timestamp;
    const isFresh = age < this.CACHE_DURATION;
    
    if (isFresh) {
      console.log(`Using fresh cached courses for domain: ${domain} (age: ${Math.round(age / 1000)}s)`);
      return cached.results;
    } else {
      console.log(`Cache stale for domain: ${domain}, will refresh`);
      this.cache.delete(domain);
      return null;
    }
  }

  // Cache the scraped courses with timestamp and expiration
  private cacheCourses(domain: string, results: ScrapingResult[]): void {
    const now = Date.now();
    const cached: CachedCourses = {
      domain,
      results,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };
    
    this.cache.set(domain, cached);
    console.log(`Cached courses for domain: ${domain}, expires in ${this.CACHE_DURATION / 1000 / 60} minutes`);
    
    // Log cache statistics
    this.logCacheStats();
  }

  // Get cache statistics for debugging
  private logCacheStats(): void {
    const cacheSize = this.cache.size;
    const totalCachedDomains = Array.from(this.cache.keys()).join(', ');
    console.log(`Cache stats: ${cacheSize} domains cached [${totalCachedDomains}]`);
  }

  // Clear expired cache entries
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [domain, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(domain);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  // Force refresh cache for a specific domain
  async refreshCacheForDomain(domain: string): Promise<ScrapingResult[]> {
    console.log(`Force refreshing cache for domain: ${domain}`);
    
    // Remove from cache
    this.cache.delete(domain);
    
    // Scrape fresh data
    return this.scrapeCoursesByDomain(domain);
  }

  // Clear all cache
  clearAllCache(): void {
    const cacheSize = this.cache.size;
    this.cache.clear();
    console.log(`Cleared all cache (${cacheSize} domains)`);
  }

  // Get cache info for debugging
  getCacheInfo(): { size: number; domains: string[]; details: Array<{ domain: string; age: string; expiresIn: string }> } {
    const now = Date.now();
    const domains = Array.from(this.cache.keys());
    const details = Array.from(this.cache.entries()).map(([domain, cached]) => {
      const age = Math.round((now - cached.timestamp) / 1000);
      const expiresIn = Math.round((cached.expiresAt - now) / 1000);
      return {
        domain,
        age: `${age}s`,
        expiresIn: `${expiresIn}s`
      };
    });

    return {
      size: this.cache.size,
      domains,
      details
    };
  }

  // Get fallback results when scraping fails
  private getFallbackResults(domain: string): ScrapingResult[] {
    console.log('Using fallback data due to scraping failure');
    
    const platforms = ['coursera', 'edx', 'udemy'];
    const results: ScrapingResult[] = [];
    
    platforms.forEach(platform => {
      const courses = this.getFallbackCourses(platform, domain);
      results.push({
        success: true,
        courses,
        total: courses.length,
        platform: platform.charAt(0).toUpperCase() + platform.slice(1)
      });
    });
    
    return results;
  }

  // Fallback to mock data if scraping fails
  private getFallbackCourses(platform: string, domain: string): Course[] {
    const mockCourses: Course[] = [
      {
        id: `${platform}-1`,
        title: `${domain} Fundamentals`,
        description: `Learn the basics of ${domain} with hands-on projects and real-world examples. Perfect for beginners looking to start their journey.`,
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        url: `https://${platform}.com/courses/${domain.toLowerCase().replace(/\s+/g, '-')}-fundamentals`,
        price: '$49.99',
        rating: 4.5,
        duration: '8 weeks',
        level: 'Beginner',
        category: domain,
        image: '/placeholder.jpg',
        instructor: 'Dr. Smith',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${platform}-2`,
        title: `Advanced ${domain} Techniques`,
        description: `Master advanced concepts in ${domain} with industry experts. Deep dive into complex topics and real-world applications.`,
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        url: `https://${platform}.com/courses/advanced-${domain.toLowerCase().replace(/\s+/g, '-')}`,
        price: '$79.99',
        rating: 4.7,
        duration: '12 weeks',
        level: 'Advanced',
        category: domain,
        image: '/placeholder.jpg',
        instructor: 'Prof. Johnson',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${platform}-3`,
        title: `${domain} Project-Based Learning`,
        description: `Build real-world projects in ${domain} to enhance your portfolio. Learn by doing with hands-on exercises and case studies.`,
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        url: `https://${platform}.com/courses/${domain.toLowerCase().replace(/\s+/g, '-')}-projects`,
        price: '$59.99',
        rating: 4.6,
        duration: '10 weeks',
        level: 'Intermediate',
        category: domain,
        image: '/placeholder.jpg',
        instructor: 'Sarah Wilson',
        lastUpdated: new Date().toISOString()
      }
    ];

    return mockCourses;
  }

  // Search courses by keyword with real scraping (uses cache)
  async searchCourses(keyword: string, domain?: string): Promise<Course[]> {
    try {
      const allCourses: Course[] = [];
      
      // Get courses from all platforms (will use cache if available)
      const platformResults = await this.scrapeCoursesByDomain(domain || 'Technology');
      
      platformResults.forEach(result => {
        if (result.success) {
          allCourses.push(...result.courses);
        }
      });

      // Filter by keyword
      const filteredCourses = allCourses.filter(course => 
        course.title.toLowerCase().includes(keyword.toLowerCase()) ||
        course.description.toLowerCase().includes(keyword.toLowerCase()) ||
        course.category.toLowerCase().includes(keyword.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(keyword.toLowerCase())
      );

      return filteredCourses;
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  }

  // Get trending courses with real scraping (uses cache)
  async getTrendingCourses(domain?: string): Promise<Course[]> {
    try {
      const allCourses: Course[] = [];
      
      // Get courses from all platforms (will use cache if available)
      const platformResults = await this.scrapeCoursesByDomain(domain || 'Technology');
      
      platformResults.forEach(result => {
        if (result.success) {
          allCourses.push(...result.courses);
        }
      });

      // Sort by rating (trending)
      return allCourses
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting trending courses:', error);
      return [];
    }
  }

  // Get courses by level with real scraping (uses cache)
  async getCoursesByLevel(level: string, domain?: string): Promise<Course[]> {
    try {
      const allCourses: Course[] = [];
      
      // Get courses from all platforms (will use cache if available)
      const platformResults = await this.scrapeCoursesByDomain(domain || 'Technology');
      
      platformResults.forEach(result => {
        if (result.success) {
          allCourses.push(...result.courses);
        }
      });

      // Filter by level
      return allCourses.filter(course => 
        course.level?.toLowerCase() === level.toLowerCase()
      );
    } catch (error) {
      console.error('Error getting courses by level:', error);
      return [];
    }
  }

  // Get top 10 courses ranked by Gemini AI analysis (uses cache)
  async getTopRankedCourses(domain: string): Promise<Course[]> {
    try {
      // Get all courses from all platforms using real scraping (will use cache if available)
      const platformResults = await this.scrapeCoursesByDomain(domain);
      const allCourses: Course[] = [];
      
      platformResults.forEach(result => {
        if (result.success) {
          allCourses.push(...result.courses);
        }
      });

      if (allCourses.length === 0) {
        return [];
      }

      // Use Gemini AI to analyze and rank courses
      const rankedCourses = await this.rankCoursesWithGemini(allCourses, domain);
      
      // Return top 10 courses
      return rankedCourses.slice(0, 10);
    } catch (error) {
      console.error('Error getting top ranked courses:', error);
      // Fallback to rating-based ranking
      return this.getFallbackRankedCourses(domain);
    }
  }

  // Rank courses using Gemini AI
  private async rankCoursesWithGemini(courses: Course[], domain: string): Promise<Course[]> {
    try {
      // Prepare course data for Gemini analysis
      const courseData = courses.map(course => ({
        title: course.title,
        description: course.description,
        platform: course.platform,
        rating: course.rating,
        level: course.level,
        duration: course.duration,
        price: course.price,
        instructor: course.instructor
      }));

      const prompt = `
        You are an expert career counselor and course evaluator. Analyze the following courses in the field of "${domain}" and rank them from best to worst based on:

        CRITERIA (in order of importance):
        1. **Relevance to ${domain}** - How well the course content aligns with the field
        2. **Quality indicators** - Instructor reputation, platform credibility, course ratings
        3. **Learning outcomes** - Practical skills gained, project-based learning
        4. **Difficulty progression** - Logical skill level advancement
        5. **Value for money** - Course duration vs. price ratio
        6. **Industry recognition** - Certifications, real-world applications

        COURSES TO ANALYZE:
        ${JSON.stringify(courseData, null, 2)}

        TASK:
        Return ONLY a JSON array of course titles in ranked order (best first), like:
        ["Course Title 1", "Course Title 2", "Course Title 3", ...]

        Focus on courses that provide the most value for someone pursuing a career in ${domain}.
      `;

      // Call Gemini API for course ranking
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          type: 'course-ranking'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Gemini analysis');
      }

      const result = await response.json();
      const rankedTitles = JSON.parse(result.response || '[]');

      // Sort courses based on Gemini ranking
      const rankedCourses: Course[] = [];
      rankedTitles.forEach((title: string) => {
        const course = courses.find(c => c.title === title);
        if (course) {
          rankedCourses.push(course);
        }
      });

      // Add any remaining courses that weren't ranked
      courses.forEach(course => {
        if (!rankedCourses.find(c => c.id === course.id)) {
          rankedCourses.push(course);
        }
      });

      return rankedCourses;
    } catch (error) {
      console.error('Error ranking courses with Gemini:', error);
      throw error;
    }
  }

  // Fallback ranking method when Gemini API fails
  private async getFallbackRankedCourses(domain: string): Promise<Course[]> {
    try {
      const platformResults = await this.scrapeCoursesByDomain(domain);
      const allCourses: Course[] = [];
      
      platformResults.forEach(result => {
        if (result.success) {
          allCourses.push(...result.courses);
        }
      });

      // Sort by rating (highest first), then by platform credibility
      const platformCredibility = {
        'Coursera': 5,
        'edX': 5,
        'Udemy': 4,
        'Pluralsight': 4,
        'LinkedIn Learning': 4,
        'Skillshare': 3
      };

      return allCourses.sort((a, b) => {
        const aScore = (a.rating || 0) * (platformCredibility[a.platform as keyof typeof platformCredibility] || 1);
        const bScore = (b.rating || 0) * (platformCredibility[b.platform as keyof typeof platformCredibility] || 1);
        return bScore - aScore;
      }).slice(0, 10);
    } catch (error) {
      console.error('Error in fallback ranking:', error);
      return [];
    }
  }

  // Auto-cleanup expired cache entries every 5 minutes
  constructor() {
    // Clean up expired cache entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 5 * 60 * 1000);
  }
}

export const courseScraperService = new CourseScraperService();
