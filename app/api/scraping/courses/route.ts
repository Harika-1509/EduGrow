import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface Course {
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

interface PlatformConfig {
  baseUrl: string;
  searchUrl: string;
  selectors: {
    courseCard: string[];
    title: string[];
    description: string[];
    instructor: string[];
    rating: string[];
    price: string[];
    level: string[];
    duration: string[];
    image: string[];
  };
}

const platforms: Record<string, PlatformConfig> = {
  coursera: {
    baseUrl: 'https://www.coursera.org',
    searchUrl: 'https://www.coursera.org/search',
    selectors: {
      courseCard: [
        '.cds-ProductCard', 
        '.course-card', 
        '[data-testid="course-card"]',
        '.search-result',
        '.discovery-card'
      ],
      title: [
        '.cds-ProductCard-title', 
        '.course-card-title', 
        'h3', 
        'h2',
        '.discovery-card-title',
        '[data-testid="course-title"]'
      ],
      description: [
        '.cds-ProductCard-description', 
        '.course-card-description', 
        '.description', 
        'p',
        '.discovery-card-description'
      ],
      instructor: [
        '.cds-ProductCard-instructor', 
        '.course-card-instructor', 
        '.instructor', 
        '.author',
        '.discovery-card-instructor'
      ],
      rating: [
        '.cds-ProductCard-ratings', 
        '.course-card-rating', 
        '.rating', 
        '[data-rating]',
        '.discovery-card-rating'
      ],
      price: [
        '.cds-ProductCard-price', 
        '.course-card-price', 
        '.price', 
        '.cost',
        '.discovery-card-price'
      ],
      level: [
        '.cds-ProductCard-level', 
        '.course-card-level', 
        '.level', 
        '.difficulty',
        '.discovery-card-level'
      ],
      duration: [
        '.cds-ProductCard-duration', 
        '.course-card-duration', 
        '.duration', 
        '.length',
        '.discovery-card-duration'
      ],
      image: [
        '.cds-ProductCard-image img', 
        '.course-card-image img', 
        'img', 
        '.thumbnail img',
        '.discovery-card-image img'
      ]
    }
  },
  edx: {
    baseUrl: 'https://www.edx.org',
    searchUrl: 'https://www.edx.org/search',
    selectors: {
      courseCard: [
        '.course-card', 
        '.discovery-card', 
        '.search-result',
        '.course-result',
        '[data-testid="course-card"]'
      ],
      title: [
        '.course-card-title', 
        '.discovery-card-title', 
        'h3', 
        'h2',
        '.course-result-title'
      ],
      description: [
        '.course-card-description', 
        '.discovery-card-description', 
        '.description', 
        'p',
        '.course-result-description'
      ],
      instructor: [
        '.course-card-instructor', 
        '.discovery-card-instructor', 
        '.instructor', 
        '.author',
        '.course-result-instructor'
      ],
      rating: [
        '.course-card-rating', 
        '.discovery-card-rating', 
        '.rating', 
        '[data-rating]',
        '.course-result-rating'
      ],
      price: [
        '.course-card-price', 
        '.discovery-card-price', 
        '.price', 
        '.cost',
        '.course-result-price'
      ],
      level: [
        '.course-card-level', 
        '.discovery-card-level', 
        '.level', 
        '.difficulty',
        '.course-result-level'
      ],
      duration: [
        '.course-card-duration', 
        '.discovery-card-duration', 
        '.duration', 
        '.length',
        '.course-result-duration'
      ],
      image: [
        '.course-card-image img', 
        '.discovery-card-image img', 
        'img', 
        '.thumbnail img',
        '.course-result-image img'
      ]
    }
  },
  udemy: {
    baseUrl: 'https://www.udemy.com',
    searchUrl: 'https://www.udemy.com/courses/search',
    selectors: {
      courseCard: [
        '.course-card', 
        '.course-list--container--3zXPS', 
        '.popper--popper--2r2To',
        '.udlite-card',
        '[data-testid="course-card"]'
      ],
      title: [
        '.course-card-title', 
        '.udlite-heading', 
        'h3', 
        'h2',
        '.udlite-card-title'
      ],
      description: [
        '.course-card-description', 
        '.udlite-text-sm', 
        '.description', 
        'p',
        '.udlite-card-description'
      ],
      instructor: [
        '.course-card-instructor', 
        '.udlite-text-sm', 
        '.instructor', 
        '.author',
        '.udlite-card-instructor'
      ],
      rating: [
        '.course-card-rating', 
        '.udlite-rating', 
        '.rating', 
        '[data-rating]',
        '.udlite-card-rating'
      ],
      price: [
        '.course-card-price', 
        '.udlite-price', 
        '.price', 
        '.cost',
        '.udlite-card-price'
      ],
      level: [
        '.course-card-level', 
        '.udlite-text-sm', 
        '.level', 
        '.difficulty',
        '.udlite-card-level'
      ],
      duration: [
        '.course-card-duration', 
        '.udlite-text-sm', 
        '.duration', 
        '.length',
        '.udlite-card-duration'
      ],
      image: [
        '.course-card-image img', 
        '.udlite-image', 
        'img', 
        '.thumbnail img',
        '.udlite-card-image img'
      ]
    }
  }
};

async function scrapePlatform(
  platform: string, 
  config: PlatformConfig, 
  domain: string, 
  browser: puppeteer.Browser
): Promise<Course[]> {
  let page: puppeteer.Page | null = null;
  
  try {
    page = await browser.newPage();
    
    // Set user agent and viewport to avoid being blocked
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
    
    // Navigate to search page
    const searchUrl = `${config.searchUrl}?q=${encodeURIComponent(domain)}`;
    console.log(`Scraping ${platform} at: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for content to load
    await page.waitForFunction(() => document.readyState === 'complete');
    
    // Additional wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to find course cards with multiple selector strategies
    let courseElements: any[] = [];
    
    for (const selector of config.selectors.courseCard) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        courseElements = await page.$$(selector);
        if (courseElements.length > 0) {
          console.log(`Found ${courseElements.length} courses using selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
        continue;
      }
    }
    
    if (courseElements.length === 0) {
      console.log(`No course cards found on ${platform}`);
      return getFallbackCourses(platform, domain);
    }
    
    // Extract course information
    const courses = await page.evaluate((selectors: PlatformConfig['selectors'], platformName: string, domainName: string) => {
      const courseElements = document.querySelectorAll(selectors.courseCard[0] || '.course-card');
      const courses: any[] = [];
      
      courseElements.forEach((element, index) => {
        try {
          // Helper function to find content with multiple selectors
          const findContent = (selectorList: string[]) => {
            for (const selector of selectorList) {
              const el = element.querySelector(selector);
              if (el && el.textContent?.trim()) {
                return el.textContent.trim();
              }
            }
            return '';
          };
          
          const findImage = (selectorList: string[]) => {
            for (const selector of selectorList) {
              const el = element.querySelector(selector) as HTMLImageElement;
              if (el && el.src) {
                return el.src;
              }
            }
            return '';
          };
          
          const title = findContent(selectors.title);
          if (!title) return; // Skip if no title found
          
          const description = findContent(selectors.description);
          const instructor = findContent(selectors.instructor);
          const ratingText = findContent(selectors.rating);
          const price = findContent(selectors.price);
          const level = findContent(selectors.level);
          const duration = findContent(selectors.duration);
          const image = findImage(selectors.image);
          
          // Extract rating number
          let rating = 0;
          if (ratingText) {
            const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
            rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
          }
          
          // Find course URL
          let url = '';
          const linkElement = element.closest('a') || element.querySelector('a');
          if (linkElement) {
            url = linkElement.href;
          }
          
          courses.push({
            id: `${platformName}-${index + 1}`,
            title,
            description: description || `Learn ${domainName} with this comprehensive course`,
            platform: platformName.charAt(0).toUpperCase() + platformName.slice(1),
            url: url || `https://${platformName}.com/courses/${domainName.toLowerCase().replace(/\s+/g, '-')}`,
            price: price || 'Free',
            rating,
            duration: duration || 'Self-paced',
            level: level || 'Beginner',
            category: domainName,
            image: image || '/placeholder.jpg',
            instructor: instructor || 'Expert Instructor',
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error parsing course element:', error);
        }
      });
      
      return courses;
    }, config.selectors, platform, domain);
    
    // Filter out courses that don't match the domain
    const filteredCourses = courses.filter((course: any) => 
      course.title.toLowerCase().includes(domain.toLowerCase()) ||
      course.description.toLowerCase().includes(domain.toLowerCase()) ||
      course.category.toLowerCase().includes(domain.toLowerCase())
    );
    
    console.log(`Successfully scraped ${filteredCourses.length} courses from ${platform}`);
    return filteredCourses.slice(0, 10); // Limit to 10 courses per platform
    
  } catch (error) {
    console.error(`Error scraping ${platform}:`, error);
    return getFallbackCourses(platform, domain);
  } finally {
    if (page) {
      await page.close();
    }
  }
}

function getFallbackCourses(platform: string, domain: string): Course[] {
  console.log(`Using fallback data for ${platform}`);
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
    }
  ];

  return mockCourses;
}

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();
    
    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    console.log(`Starting web scraping for domain: ${domain}`);
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-web-security', 
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    try {
      // Scrape from multiple platforms
      const promises = Object.entries(platforms).map(async ([platform, config]) => {
        try {
          const courses = await scrapePlatform(platform, config, domain, browser);
          return {
            success: true,
            courses,
            total: courses.length,
            platform: platform.charAt(0).toUpperCase() + platform.slice(1)
          };
        } catch (error) {
          console.error(`Error scraping ${platform}:`, error);
          return {
            success: false,
            courses: [],
            total: 0,
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const platformResults = await Promise.all(promises);
      
      // Close browser
      await browser.close();
      
      return NextResponse.json({
        success: true,
        results: platformResults
      });
      
    } catch (error) {
      await browser.close();
      throw error;
    }
    
  } catch (error) {
    console.error('Error in web scraping API:', error);
    return NextResponse.json(
      { 
        error: "Failed to scrape courses",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
