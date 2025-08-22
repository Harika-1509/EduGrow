# News API Integration Guide

This guide explains how to integrate the News and Trends page with real news APIs to fetch dynamic content.

## 🚀 Features Implemented

- **Dynamic News Fetching**: Real-time news from external APIs
- **Domain-Specific Content**: News filtered by career domains
- **Search & Filtering**: Search by keywords and filter by categories
- **Pagination**: Navigate through multiple pages of news
- **Fallback System**: Mock data when APIs are unavailable
- **Responsive Design**: Works on all device sizes

## 🔧 API Integration Options

### Option 1: External News APIs (Recommended)

#### NewsAPI (https://newsapi.org/)
```bash
# Add to .env.local
NEXT_PUBLIC_NEWS_API_URL=https://newsapi.org/v2/everything
NEXT_PUBLIC_NEWS_API_KEY=your_api_key_here
```

**Features:**
- Free tier: 1,000 requests/day
- Comprehensive news coverage
- Easy integration
- Good documentation

#### GNews (https://gnews.io/)
```bash
# Add to .env.local
NEXT_PUBLIC_NEWS_API_URL=https://gnews.io/api/v4/search
NEXT_PUBLIC_NEWS_API_KEY=your_api_key_here
```

**Features:**
- Free tier: 100 requests/day
- Fast and reliable
- Good for tech news
- Simple API structure

#### Bing News Search
```bash
# Add to .env.local
NEXT_PUBLIC_NEWS_API_URL=https://api.bing.microsoft.com/v7.0/news/search
NEXT_PUBLIC_NEWS_API_KEY=your_bing_api_key_here
```

**Features:**
- High-quality news sources
- Good for enterprise use
- Requires Azure subscription

### Option 2: Your Own Backend API

Create your own news aggregation service that:
- Scrapes news from various sources
- Stores news in your database
- Provides a REST API endpoint
- Handles authentication and rate limiting

## 📁 Files Created/Modified

### 1. News Service (`lib/services/newsService.ts`)
- Handles API calls to external news sources
- Transforms external API data to our format
- Provides fallback to mock data
- Includes search, filtering, and pagination

### 2. Backend API Route (`app/api/news/route.ts`)
- RESTful API endpoint for news data
- Authentication using NextAuth
- Mock data for development
- Search and filtering capabilities

### 3. Updated News Page (`app/newsandtrends/page.tsx`)
- Integrated with news service
- Search and filter functionality
- Pagination controls
- Dynamic content loading

## 🛠️ Setup Instructions

### Step 1: Get API Keys
1. Sign up for a news API service (NewsAPI recommended for beginners)
2. Get your API key
3. Create `.env.local` file in your project root

### Step 2: Configure Environment Variables
```bash
# .env.local
NEXT_PUBLIC_NEWS_API_URL=https://newsapi.org/v2/everything
NEXT_PUBLIC_NEWS_API_KEY=your_actual_api_key_here
```

### Step 3: Test the Integration
1. Start your development server
2. Navigate to `/newsandtrends`
3. Select a domain and see real news load
4. Test search and filtering

## 🔍 API Response Format

The news service expects this format from external APIs:

```json
{
  "articles": [
    {
      "title": "Article Title",
      "description": "Article description",
      "url": "https://article-url.com",
      "urlToImage": "https://image-url.com",
      "publishedAt": "2024-01-15T10:00:00Z",
      "author": "Author Name",
      "content": "Article content...",
      "source": {
        "name": "Source Name"
      }
    }
  ],
  "totalResults": 100,
  "page": 1,
  "pageSize": 20
}
```

## 🎯 Customization Options

### Add More News Sources
1. Modify `newsService.ts`
2. Add new API endpoints
3. Update data transformation logic
4. Add source-specific error handling

### Custom Categories
1. Update the category filter in the UI
2. Modify the backend API to handle new categories
3. Add category-specific styling

### Enhanced Search
1. Implement full-text search
2. Add search suggestions
3. Include tag-based search
4. Add search history

## 🚨 Error Handling

The system includes comprehensive error handling:
- API failures fall back to mock data
- Network errors are logged and handled gracefully
- User-friendly error messages
- Loading states for better UX

## 📊 Performance Considerations

- **Caching**: Implement Redis or similar for API responses
- **Rate Limiting**: Respect API rate limits
- **Pagination**: Load only necessary data
- **Image Optimization**: Use Next.js Image component
- **CDN**: Serve static assets from CDN

## 🔐 Security Best Practices

- Keep API keys in environment variables
- Never expose API keys in client-side code
- Implement proper authentication
- Validate and sanitize user inputs
- Use HTTPS for all API calls

## 🧪 Testing

Test the integration with:
- Different domains
- Search queries
- Category filters
- Pagination
- Error scenarios
- Network failures

## 📈 Monitoring

Monitor your news API usage:
- Request counts
- Response times
- Error rates
- API quota usage
- User engagement metrics

## 🆘 Troubleshooting

### Common Issues:
1. **API Key Invalid**: Check your API key and permissions
2. **Rate Limit Exceeded**: Implement proper rate limiting
3. **CORS Issues**: Ensure your API supports CORS
4. **Data Format Mismatch**: Update transformation logic

### Debug Steps:
1. Check browser console for errors
2. Verify API key in environment variables
3. Test API endpoints directly
4. Check network tab for failed requests

## 🎉 Next Steps

After successful integration:
1. Add more news sources
2. Implement news recommendations
3. Add user preferences
4. Create news alerts
5. Build news analytics dashboard

## 📚 Additional Resources

- [NewsAPI Documentation](https://newsapi.org/docs)
- [GNews API Guide](https://gnews.io/docs/v4)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)

---

**Need Help?** Check the console logs and network tab for detailed error information.
