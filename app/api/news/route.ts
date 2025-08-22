import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Mock news data - replace with your actual news source
const mockNewsData = {
  "AI & Machine Learning": [
    {
      id: "ai-1",
      title: "Latest Breakthroughs in AI & Machine Learning",
      description: "Discover the newest developments in artificial intelligence and machine learning that are reshaping industries worldwide.",
      category: "Industry Trends",
      date: "2024-01-15T10:00:00Z",
      readTime: "5 min read",
      source: "AI Insights Weekly",
      url: "https://example.com/ai-breakthroughs",
      image: "/placeholder.jpg",
      content: "The field of artificial intelligence continues to evolve at an unprecedented pace...",
      author: "Dr. Sarah Chen",
      tags: ["AI", "Machine Learning", "Innovation"]
    },
    {
      id: "ai-2",
      title: "AI Job Market: Skills in High Demand",
      description: "Analysis of the most sought-after AI skills and career opportunities in 2024.",
      category: "Career Insights",
      date: "2024-01-14T14:30:00Z",
      readTime: "4 min read",
      source: "Tech Careers",
      url: "https://example.com/ai-jobs",
      image: "/placeholder.jpg",
      content: "As AI becomes more integrated into business operations...",
      author: "Mark Johnson",
      tags: ["AI", "Career", "Job Market"]
    }
  ],
  "Web Development": [
    {
      id: "web-1",
      title: "Modern Web Development Trends 2024",
      description: "Explore the latest frameworks, tools, and practices shaping the future of web development.",
      category: "Technology",
      date: "2024-01-15T09:15:00Z",
      readTime: "6 min read",
      source: "Web Dev Today",
      url: "https://example.com/web-trends",
      image: "/placeholder.jpg",
      content: "The web development landscape is constantly evolving...",
      author: "Alex Rodriguez",
      tags: ["Web Development", "Frontend", "Trends"]
    },
    {
      id: "web-2",
      title: "Full-Stack Development: A Complete Guide",
      description: "Comprehensive overview of full-stack development skills and learning paths.",
      category: "Education",
      date: "2024-01-13T16:45:00Z",
      readTime: "8 min read",
      source: "Code Academy",
      url: "https://example.com/fullstack-guide",
      image: "/placeholder.jpg",
      content: "Full-stack development requires a diverse skill set...",
      author: "Emily Chen",
      tags: ["Web Development", "Full-Stack", "Learning"]
    }
  ],
  "Data Science": [
    {
      id: "ds-1",
      title: "Data Science in the Age of Big Data",
      description: "How data scientists are leveraging big data to drive business decisions and innovation.",
      category: "Industry Trends",
      date: "2024-01-15T11:20:00Z",
      readTime: "7 min read",
      source: "Data Insights",
      url: "https://example.com/big-data-science",
      image: "/placeholder.jpg",
      content: "The explosion of data in recent years has created unprecedented opportunities...",
      author: "Dr. Michael Brown",
      tags: ["Data Science", "Big Data", "Analytics"]
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    let newsData: any[] = [];

    // If domain is specified, get domain-specific news
    if (domain && mockNewsData[domain as keyof typeof mockNewsData]) {
      newsData = mockNewsData[domain as keyof typeof mockNewsData];
    } else {
      // Get all news from all domains
      Object.values(mockNewsData).forEach(domainNews => {
        newsData.push(...domainNews);
      });
    }

    // Apply category filter
    if (category) {
      newsData = newsData.filter(news => 
        news.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      newsData = newsData.filter(news =>
        news.title.toLowerCase().includes(searchLower) ||
        news.description.toLowerCase().includes(searchLower) ||
        news.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const total = newsData.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = newsData.slice(startIndex, endIndex);

    // Sort by date (newest first)
    paginatedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      data: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, domain, category, search } = body;

    let newsData: any[] = [];

    switch (action) {
      case 'search':
        // Implement search functionality
        if (search) {
          Object.values(mockNewsData).forEach(domainNews => {
            newsData.push(...domainNews);
          });
          
          const searchLower = search.toLowerCase();
          newsData = newsData.filter(news =>
            news.title.toLowerCase().includes(searchLower) ||
            news.description.toLowerCase().includes(searchLower)
          );
        }
        break;

      case 'trending':
        // Get trending news (most recent)
        Object.values(mockNewsData).forEach(domainNews => {
          newsData.push(...domainNews);
        });
        newsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        newsData = newsData.slice(0, 10); // Top 10 trending
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: newsData,
      total: newsData.length
    });

  } catch (error) {
    console.error('Error in news API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
