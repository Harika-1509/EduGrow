# Web Scraping Implementation for Opportunity Hub

## Overview

The Opportunity Hub now uses **real web scraping** instead of mock data to fetch actual course information from major learning platforms. This implementation uses Puppeteer (headless Chrome) running on the server-side via API routes to visit course websites and extract real course data.

## Architecture

### **Client-Server Separation**
- **Client Side**: React components make API calls to fetch course data
- **Server Side**: API routes run Puppeteer to perform actual web scraping
- **Benefits**: Avoids browser compatibility issues, better performance, secure execution

### **API Route Structure**
```
/api/scraping/courses → Runs Puppeteer on server
    ↓
Returns scraped course data or fallback data
    ↓
Client-side service processes and displays results
```

### **Smart Caching System**
- **Session-Based Caching**: Courses are cached in memory for 30 minutes
- **Performance Optimization**: Eliminates repeated web scraping for the same domain
- **Automatic Cleanup**: Expired cache entries are automatically removed
- **Manual Management**: Users can view cache status, refresh, or clear cache

## How It Works

### 1. **API-Based Web Scraping Process**
- **Client Request**: Opportunity Hub requests courses for a specific domain
- **Cache Check**: Service first checks if data exists in cache
- **Cache Hit**: If valid cache exists, returns cached data instantly
- **Cache Miss**: If no cache, calls API route for web scraping
- **Data Storage**: Scraped results are cached with timestamp and expiration
- **Response**: Returns structured course data to the client

### 2. **Caching Strategy**
- **Cache Duration**: 30 minutes (configurable)
- **Cache Key**: Domain name (e.g., "Data Science", "Web Development")
- **Cache Storage**: In-memory Map for fast access
- **Auto-Cleanup**: Expired entries removed every 5 minutes
- **Fallback**: If scraping fails, fallback data is also cached

### 3. **Supported Platforms**
- **Coursera** (`coursera.org`)
- **edX** (`edx.org`) 
- **Udemy** (`udemy.com`)

### 4. **Data Extraction**
For each platform, the scraper extracts:
- Course title
- Description
- Instructor name
- Rating (if available)
- Price
- Difficulty level
- Duration
- Course image
- Direct course URL

## Technical Implementation

### Core Components

```typescript
// API Route (Server-side)
app/api/scraping/courses/route.ts
├── Launches Puppeteer browser
├── Scrapes multiple platforms in parallel
├── Handles errors and fallbacks
└── Returns structured results

// Client Service with Caching
lib/services/courseScraperService.ts
├── In-memory cache management
├── Cache validation and expiration
├── API calls to scraping endpoint
├── Client-side fallbacks
└── Integrates with Gemini AI ranking

// Cache Interface
interface CachedCourses {
  domain: string;
  results: ScrapingResult[];
  timestamp: number;
  expiresAt: number;
}
```

### Cache Management Methods

```typescript
class CourseScraperService {
  // Check and retrieve cached courses
  private getCachedCourses(domain: string): ScrapingResult[] | null
  
  // Store scraped results in cache
  private cacheCourses(domain: string, results: ScrapingResult[]): void
  
  // Force refresh cache for specific domain
  async refreshCacheForDomain(domain: string): Promise<ScrapingResult[]>
  
  // Clear all cached data
  clearAllCache(): void
  
  // Get cache statistics and details
  getCacheInfo(): CacheInfo
  
  // Automatic cleanup of expired entries
  private cleanupExpiredCache(): void
}
```

### Selector Strategy

Each platform has multiple CSS selectors for each element:

```typescript
coursera: {
  courseCard: [
    '.cds-ProductCard',           // Primary selector
    '.course-card',               // Fallback 1
    '[data-testid="course-card"]', // Fallback 2
    '.search-result',             // Fallback 3
    '.discovery-card'             // Fallback 4
  ]
}
```

### Error Handling & Fallbacks

1. **Primary Scraping**: API route attempts to scrape real data from websites
2. **API Fallback**: If scraping fails, API returns fallback mock data
3. **Client Fallback**: Client service provides additional fallback if API fails
4. **Cache Persistence**: Both real and fallback data are cached for performance
5. **Debug Information**: Server logs detailed information about scraping attempts

## What You'll See

### When Scraping Works
- **Real Course Data**: Actual titles, descriptions, and prices from websites
- **Live URLs**: Clickable links to real course pages
- **Current Information**: Up-to-date course details
- **Platform Diversity**: Courses from multiple learning platforms
- **Fast Loading**: Subsequent requests use cached data

### When Scraping Fails (Fallback)
- **Mock Data**: Realistic course information for demonstration
- **Consistent Experience**: UI remains functional and informative
- **Debug Information**: Server console logs show what went wrong
- **Cached Fallbacks**: Fallback data is also cached for performance

### Cache Management UI
- **Cache Info Button**: View current cache status and details
- **Refresh Cache Button**: Force refresh data for current domain
- **Clear Cache Button**: Remove all cached data
- **Cache Status Display**: Shows number of cached domains
- **Performance Indicators**: Visual feedback on cache usage

## Performance & Reliability

### Speed
- **Instant Cache Hits**: Cached data loads immediately
- **Parallel Scraping**: Scrapes multiple platforms simultaneously on server
- **Efficient Browser**: Reuses browser instance across requests
- **API Caching**: Next.js can cache API responses for better performance
- **Timeout Handling**: 30-second timeout per platform

### Reliability
- **Multiple Selectors**: Handles website structure changes
- **User Agent Spoofing**: Avoids basic bot detection
- **Error Recovery**: Graceful fallback to mock data at multiple levels
- **Cache Persistence**: Survives component re-renders and navigation
- **Debug Logging**: Detailed information for troubleshooting

### Cache Performance
- **Memory Efficient**: In-memory storage for fastest access
- **Automatic Cleanup**: Prevents memory leaks from expired entries
- **Smart Expiration**: Configurable cache duration (default: 30 minutes)
- **Cache Statistics**: Real-time monitoring of cache usage
- **Manual Control**: Users can manage cache as needed

## Troubleshooting

### Common Issues

1. **No Courses Found**
   - Check server console logs for selector failures
   - Verify API route is working correctly
   - Check if websites are blocking server requests
   - Clear cache and retry scraping

2. **Slow Performance**
   - Monitor server resource usage
   - Check Puppeteer browser launch time
   - Verify network connectivity from server
   - Check cache status and refresh if needed

3. **Scraping Blocked**
   - Check if websites are blocking server IP
   - Verify user agent and headers are set correctly
   - Consider implementing proxy rotation on server
   - Use cached data while resolving issues

4. **Cache Issues**
   - Check cache info to see what's stored
   - Clear cache if data seems stale
   - Refresh cache for specific domains
   - Monitor cache expiration times

### Debug Information

The scraper provides extensive logging on the server:
```
Starting web scraping for domain: Data Science
Scraping coursera at: https://www.coursera.org/search?q=Data%20Science
Found 15 courses using selector: .cds-ProductCard
Successfully scraped 10 courses from coursera
Cached courses for domain: Data Science, expires in 30 minutes
Cache stats: 1 domains cached [Data Science]
```

Cache-related logs:
```
Using cached courses for domain: Data Science
Using fresh cached courses for domain: Data Science (age: 45s)
Cache expired for domain: Web Development
Cleaned up 2 expired cache entries
```

## Testing the Implementation

### Manual Testing
1. Navigate to Opportunity Hub
2. Select a career domain (e.g., "Data Science")
3. Check browser console for API call logs
4. Check server console for scraping logs
5. Verify course data appears (real or fallback)
6. Test cache functionality:
   - Switch domains and return to previous domain
   - Use cache info button to view status
   - Refresh cache to force new scraping
   - Clear cache to remove all stored data

### API Testing
```bash
# Test the scraping API directly
curl -X POST http://localhost:3000/api/scraping/courses \
  -H "Content-Type: application/json" \
  -d '{"domain": "Data Science"}'
```

### Cache Testing
```typescript
// In browser console, test cache functions
const service = window.courseScraperService;

// Get cache information
service.getCacheInfo();

// Refresh cache for specific domain
service.refreshCacheForDomain('Data Science');

// Clear all cache
service.clearAllCache();
```

## Security & Deployment

### Production Considerations
- **Rate Limiting**: Implement API rate limiting to prevent abuse
- **Environment Variables**: Configure Puppeteer options for production
- **Monitoring**: Add logging and monitoring for scraping performance
- **Error Handling**: Implement proper error logging and alerting
- **Cache Limits**: Monitor memory usage and set cache size limits

### Deployment Notes
- **Server Requirements**: Ensure server has enough memory for Puppeteer
- **Chrome Installation**: Verify Chrome/Chromium is available on server
- **Resource Limits**: Monitor memory usage during scraping operations
- **Cache Persistence**: Consider Redis for persistent caching in production
- **Load Balancing**: Cache sharing across multiple server instances

## Future Enhancements

### Planned Improvements
1. **More Platforms**: Add LinkedIn Learning, Skillshare, Pluralsight
2. **Advanced Anti-Detection**: Rotating proxies, session management
3. **Persistent Caching**: Redis/database storage for cache persistence
4. **Real-time Updates**: WebSocket-based live course updates
5. **User Feedback**: Allow users to report scraping issues
6. **Cache Analytics**: Detailed performance metrics and optimization

### Scalability
- **Queue System**: Handle multiple scraping requests
- **Rate Limiting**: Respect website terms of service
- **Distributed Scraping**: Multiple server instances
- **Data Validation**: Verify scraped data quality
- **Cache Distribution**: Shared cache across multiple servers

## Legal & Ethical Considerations

### Best Practices
- **Respectful Scraping**: Reasonable request rates
- **Terms of Service**: Follow website usage policies
- **Data Usage**: Only collect publicly available information
- **Attribution**: Credit course platforms appropriately
- **Cache Management**: Respect data freshness requirements

### Compliance
- **Robots.txt**: Respect website crawling policies
- **Rate Limiting**: Avoid overwhelming servers
- **User Agent**: Identify the scraper clearly
- **Error Handling**: Graceful failure without retry loops
- **Data Retention**: Clear cache when appropriate

## Conclusion

This API-based web scraping implementation with smart caching provides a robust, real-time course discovery system that:
- **Runs on Server**: Puppeteer executes safely on the server-side
- **Fetches Real Data**: Actual course information from learning platforms
- **Smart Caching**: Eliminates repeated scraping for better performance
- **Handles Failures Gracefully**: Multiple fallback levels ensure reliability
- **Provides Debug Information**: Detailed logging for troubleshooting
- **Scales Efficiently**: API-based architecture supports multiple clients
- **User Control**: Transparent cache management for optimal experience

The system automatically adapts to website changes, provides seamless user experience whether scraping succeeds or falls back to mock data, and maintains the security and performance benefits of server-side execution while dramatically improving response times through intelligent caching.
