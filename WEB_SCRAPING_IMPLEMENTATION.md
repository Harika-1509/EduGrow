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

## How It Works

### 1. **API-Based Web Scraping Process**
- **Client Request**: Opportunity Hub requests courses for a specific domain
- **API Route**: `/api/scraping/courses` receives the request
- **Puppeteer Execution**: Server launches headless Chrome browser
- **Website Navigation**: Visits actual course websites (Coursera, edX, Udemy)
- **Data Extraction**: Scrapes real course information using multiple selectors
- **Response**: Returns structured course data to the client

### 2. **Supported Platforms**
- **Coursera** (`coursera.org`)
- **edX** (`edx.org`) 
- **Udemy** (`udemy.com`)

### 3. **Data Extraction**
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

// Client Service
lib/services/courseScraperService.ts
├── Makes API calls to scraping endpoint
├── Processes responses
├── Handles client-side fallbacks
└── Integrates with Gemini AI ranking
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
4. **Debug Information**: Server logs detailed information about scraping attempts

## What You'll See

### When Scraping Works
- **Real Course Data**: Actual titles, descriptions, and prices from websites
- **Live URLs**: Clickable links to real course pages
- **Current Information**: Up-to-date course details
- **Platform Diversity**: Courses from multiple learning platforms

### When Scraping Fails (Fallback)
- **Mock Data**: Realistic course information for demonstration
- **Consistent Experience**: UI remains functional and informative
- **Debug Information**: Server console logs show what went wrong

## Performance & Reliability

### Speed
- **Parallel Scraping**: Scrapes multiple platforms simultaneously on server
- **Efficient Browser**: Reuses browser instance across requests
- **API Caching**: Next.js can cache API responses for better performance
- **Timeout Handling**: 30-second timeout per platform

### Reliability
- **Multiple Selectors**: Handles website structure changes
- **User Agent Spoofing**: Avoids basic bot detection
- **Error Recovery**: Graceful fallback to mock data at multiple levels
- **Debug Logging**: Detailed information for troubleshooting

## Troubleshooting

### Common Issues

1. **No Courses Found**
   - Check server console logs for selector failures
   - Verify API route is working correctly
   - Check if websites are blocking server requests

2. **Slow Performance**
   - Monitor server resource usage
   - Check Puppeteer browser launch time
   - Verify network connectivity from server

3. **Scraping Blocked**
   - Check if websites are blocking server IP
   - Verify user agent and headers are set correctly
   - Consider implementing proxy rotation on server

### Debug Information

The scraper provides extensive logging on the server:
```
Starting web scraping for domain: Data Science
Scraping coursera at: https://www.coursera.org/search?q=Data%20Science
Found 15 courses using selector: .cds-ProductCard
Successfully scraped 10 courses from coursera
```

## Testing the Implementation

### Manual Testing
1. Navigate to Opportunity Hub
2. Select a career domain (e.g., "Data Science")
3. Check browser console for API call logs
4. Check server console for scraping logs
5. Verify course data appears (real or fallback)

### API Testing
```bash
# Test the scraping API directly
curl -X POST http://localhost:3000/api/scraping/courses \
  -H "Content-Type: application/json" \
  -d '{"domain": "Data Science"}'
```

## Security & Deployment

### Production Considerations
- **Rate Limiting**: Implement API rate limiting to prevent abuse
- **Environment Variables**: Configure Puppeteer options for production
- **Monitoring**: Add logging and monitoring for scraping performance
- **Error Handling**: Implement proper error logging and alerting

### Deployment Notes
- **Server Requirements**: Ensure server has enough memory for Puppeteer
- **Chrome Installation**: Verify Chrome/Chromium is available on server
- **Resource Limits**: Monitor memory usage during scraping operations

## Future Enhancements

### Planned Improvements
1. **More Platforms**: Add LinkedIn Learning, Skillshare, Pluralsight
2. **Advanced Anti-Detection**: Rotating proxies, session management
3. **Caching**: Store scraped data to reduce repeated requests
4. **Real-time Updates**: WebSocket-based live course updates
5. **User Feedback**: Allow users to report scraping issues

### Scalability
- **Queue System**: Handle multiple scraping requests
- **Rate Limiting**: Respect website terms of service
- **Distributed Scraping**: Multiple server instances
- **Data Validation**: Verify scraped data quality

## Legal & Ethical Considerations

### Best Practices
- **Respectful Scraping**: Reasonable request rates
- **Terms of Service**: Follow website usage policies
- **Data Usage**: Only collect publicly available information
- **Attribution**: Credit course platforms appropriately

### Compliance
- **Robots.txt**: Respect website crawling policies
- **Rate Limiting**: Avoid overwhelming servers
- **User Agent**: Identify the scraper clearly
- **Error Handling**: Graceful failure without retry loops

## Conclusion

This API-based web scraping implementation provides a robust, real-time course discovery system that:
- **Runs on Server**: Puppeteer executes safely on the server-side
- **Fetches Real Data**: Actual course information from learning platforms
- **Handles Failures Gracefully**: Multiple fallback levels ensure reliability
- **Provides Debug Information**: Detailed logging for troubleshooting
- **Scales Efficiently**: API-based architecture supports multiple clients

The system automatically adapts to website changes and provides a seamless user experience whether scraping succeeds or falls back to mock data, all while maintaining the security and performance benefits of server-side execution.
