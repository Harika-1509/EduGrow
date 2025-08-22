export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  source: string;
  url: string;
  image: string;
  content?: string;
  author?: string;
  tags?: string[];
}

export interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface NewsFilters {
  domain?: string;
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

class NewsService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // Configure for NewsAPI - you can change this to any news API you prefer
    this.baseUrl = 'https://newsapi.org/v2/everything';
    this.apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
  }

  // Fetch news from NewsAPI
  async fetchExternalNews(filters: NewsFilters): Promise<NewsResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('No API key provided. Please add NEXT_PUBLIC_NEWS_API_KEY to your environment variables.');
      }

      const queryParams = new URLSearchParams();
      
      // Build search query - use domain as the main query
      let searchQuery = '';
      if (filters.search) {
        searchQuery = filters.search;
      } else if (filters.domain) {
        searchQuery = filters.domain;
      }
      
      if (searchQuery) {
        queryParams.append('q', searchQuery);
      }
      
      // Set date from 10 days ago
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const fromDate = tenDaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      queryParams.append('from', fromDate);
      
      // Add other parameters
      queryParams.append('sortBy', 'publishedAt');
      queryParams.append('pageSize', '10'); // Maximum 10 articles
      queryParams.append('language', 'en');

      // Add API key as URL parameter
      queryParams.append('apiKey', this.apiKey);

      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`NewsAPI request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformExternalNewsData(data, filters.domain);
    } catch (error) {
      console.error('Error fetching external news:', error);
      throw error; // Re-throw error - no fallback to mock data
    }
  }

  // Transform NewsAPI data to our format
  private transformExternalNewsData(externalData: any, domain: string): NewsResponse {
    const articles = externalData.articles || [];
    const transformedData: NewsItem[] = articles.map((article: any, index: number) => ({
      id: article.url || `news-${index + 1}`, // Use URL as unique ID
      title: article.title || `Latest News in ${domain}`,
      description: article.description || `Stay updated with ${domain} news`,
      category: this.categorizeArticle(article.title, article.description, domain),
      date: article.publishedAt || new Date().toISOString(),
      readTime: this.calculateReadTime(article.content || article.description || ''),
      source: article.source?.name || 'News Source',
      url: article.url || '#',
      image: article.urlToImage || '/placeholder.jpg',
      content: article.content,
      author: article.author,
      tags: this.extractTags(article.title, article.description, domain),
    }));

    return {
      success: true,
      data: transformedData,
      total: externalData.totalResults || transformedData.length,
      page: 1, // Since we're limiting to 10 articles, always page 1
      limit: 10, // Maximum 10 articles
    };
  }

  // Categorize articles based on content
  private categorizeArticle(title: string, description: string, domain: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('job') || text.includes('career') || text.includes('employment')) {
      return 'Career Insights';
    } else if (text.includes('trend') || text.includes('market') || text.includes('industry')) {
      return 'Industry Trends';
    } else if (text.includes('learn') || text.includes('course') || text.includes('education')) {
      return 'Education';
    } else if (text.includes('event') || text.includes('conference') || text.includes('meetup')) {
      return 'Community';
    } else if (text.includes('success') || text.includes('story') || text.includes('journey')) {
      return 'Inspiration';
    } else if (text.includes('technology') || text.includes('tech') || text.includes('innovation')) {
      return 'Technology';
    } else {
      return 'General';
    }
  }

  // Extract relevant tags from content
  private extractTags(title: string, description: string, domain: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const tags = [domain];
    
    // Add common tech tags
    const techKeywords = ['ai', 'machine learning', 'web development', 'data science', 'cybersecurity', 'cloud', 'devops'];
    techKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return tags;
  }

  // Calculate read time based on content length
  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }

  // Search news by keyword
  async searchNews(query: string, domain?: string): Promise<NewsResponse> {
    return this.fetchExternalNews({ search: query, domain });
  }

  // Get news by category
  async getNewsByCategory(category: string, domain?: string): Promise<NewsResponse> {
    return this.fetchExternalNews({ category, domain });
  }

  // Get trending news
  async getTrendingNews(domain?: string): Promise<NewsResponse> {
    return this.fetchExternalNews({ domain, category: 'trending' });
  }
}

export const newsService = new NewsService();
