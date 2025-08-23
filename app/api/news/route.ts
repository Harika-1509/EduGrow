import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const pageParam = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    
    // Parse page number, but don't limit it here - let the frontend handle pagination limits
    const page = parseInt(pageParam).toString();

    if (!domain && !search) {
      return NextResponse.json({ error: 'Domain or search query is required' }, { status: 400 });
    }

    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'News API key not configured' }, { status: 500 });
    }

    const queryParams = new URLSearchParams();
    
    // Build search query
    let searchQuery = '';
    if (search) {
      searchQuery = search;
    } else if (domain) {
      searchQuery = domain;
    }
    
    if (searchQuery) {
      queryParams.append('q', searchQuery);
    }
    
    // Set date from 10 days ago
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const fromDate = tenDaysAgo.toISOString().split('T')[0];
    queryParams.append('from', fromDate);
    
    // Add other parameters
    queryParams.append('sortBy', 'publishedAt');
    queryParams.append('pageSize', limit);
    queryParams.append('page', page); // Add page parameter for pagination
    queryParams.append('language', 'en');
    queryParams.append('apiKey', apiKey);

    const newsApiUrl = `https://newsapi.org/v2/everything?${queryParams.toString()}`;
    
    const response = await fetch(newsApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our expected format
    const articles = data.articles || [];
    const transformedData = articles.map((article: any, index: number) => ({
      id: article.url || `news-${index + 1}`,
      title: article.title || `Latest News in ${domain || 'Technology'}`,
      description: article.description || `Stay updated with ${domain || 'Technology'} news`,
      category: categorizeArticle(article.title || '', article.description || '', domain || ''),
      date: article.publishedAt || new Date().toISOString(),
      readTime: calculateReadTime(article.content || article.description || ''),
      source: article.source?.name || 'News Source',
      url: article.url || '#',
      image: article.urlToImage || '/placeholder.jpg',
      content: article.content,
      author: article.author,
      tags: extractTags(article.title || '', article.description || '', domain || ''),
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      total: data.totalResults || transformedData.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });

  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch news data',
      details: error.message 
    }, { status: 500 });
  }
}

// Helper functions
function categorizeArticle(title: string, description: string, domain: string): string {
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

function extractTags(title: string, description: string, domain: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags = [domain];
  
  const techKeywords = ['ai', 'machine learning', 'web development', 'data science', 'cybersecurity', 'cloud', 'devops'];
  techKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  return tags;
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readTime} min read`;
}
