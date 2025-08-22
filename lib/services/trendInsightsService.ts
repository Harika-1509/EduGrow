export interface TrendData {
  period: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface SkillTrend {
  skill: string;
  demand: number;
  growth: number;
  salary: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface MarketInsight {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DomainTrends {
  domain: string;
  jobDemand: TrendData[];
  salaryTrends: TrendData[];
  skillDemand: SkillTrend[];
  marketInsights: MarketInsight[];
  lastUpdated: string;
}

export class TrendInsightsService {
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private static cache = new Map<string, { data: DomainTrends; timestamp: number }>();

  static async getDomainTrends(domain: string): Promise<DomainTrends> {
    // Check cache first
    const cached = this.cache.get(domain);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Generate realistic trend data based on domain
      const trends = this.generateTrendData(domain);
      
      // Cache the results
      this.cache.set(domain, {
        data: trends,
        timestamp: Date.now()
      });

      return trends;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      return this.getFallbackTrends(domain);
    }
  }

  private static generateTrendData(domain: string): DomainTrends {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }).reverse();

    // Generate job demand trends (simulating real market data)
    const baseDemand = this.getBaseDemand(domain);
    const jobDemand: TrendData[] = [];
    
    months.forEach((month, index) => {
      const baseValue = baseDemand + (Math.random() - 0.5) * 20;
      const value = Math.max(0, Math.round(baseValue + index * 2));
      const previousValue = index > 0 ? jobDemand[index - 1]?.value || baseValue : baseValue;
      const change = value - previousValue;
      const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
      
      jobDemand.push({ period: month, value, change, changePercent });
    });

    // Generate salary trends
    const baseSalary = this.getBaseSalary(domain);
    const salaryTrends: TrendData[] = [];
    
    months.forEach((month, index) => {
      const baseValue = baseSalary + (Math.random() - 0.5) * 5000;
      const value = Math.max(30000, Math.round(baseValue + index * 200));
      const previousValue = index > 0 ? salaryTrends[index - 1]?.value || baseValue : baseValue;
      const change = value - previousValue;
      const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
      
      salaryTrends.push({ period: month, value, change, changePercent });
    });

    // Generate skill demand data
    const skills = this.getDomainSkills(domain);
    const skillDemand = skills.map(skill => ({
      skill,
      demand: Math.floor(Math.random() * 100) + 20,
      growth: (Math.random() - 0.5) * 40,
      salary: Math.floor(Math.random() * 50000) + 50000,
      trend: Math.random() > 0.6 ? 'rising' : Math.random() > 0.3 ? 'stable' : 'declining'
    }));

    // Generate market insights
    const marketInsights = [
      {
        metric: 'Job Postings',
        currentValue: jobDemand[jobDemand.length - 1].value,
        previousValue: jobDemand[jobDemand.length - 2]?.value || baseDemand,
        change: jobDemand[jobDemand.length - 1].change,
        changePercent: jobDemand[jobDemand.length - 1].changePercent,
        trend: jobDemand[jobDemand.length - 1].change > 0 ? 'up' : 'down'
      },
      {
        metric: 'Average Salary',
        currentValue: salaryTrends[salaryTrends.length - 1].value,
        previousValue: salaryTrends[salaryTrends.length - 2]?.value || baseSalary,
        change: salaryTrends[salaryTrends.length - 1].change,
        changePercent: salaryTrends[salaryTrends.length - 1].changePercent,
        trend: salaryTrends[salaryTrends.length - 1].change > 0 ? 'up' : 'down'
      },
      {
        metric: 'Skill Demand',
        currentValue: Math.round(skillDemand.reduce((sum, skill) => sum + skill.demand, 0) / skillDemand.length),
        previousValue: Math.round(skillDemand.reduce((sum, skill) => sum + skill.demand, 0) / skillDemand.length) - 5,
        change: 5,
        changePercent: 8.5,
        trend: 'up'
      }
    ];

    return {
      domain,
      jobDemand,
      salaryTrends,
      skillDemand,
      marketInsights,
      lastUpdated: now.toISOString()
    };
  }

  private static getBaseDemand(domain: string): number {
    const demandMap: Record<string, number> = {
      'AI & Machine Learning': 85,
      'Web Development': 95,
      'Data Science': 90,
      'Mobile Development': 80,
      'Cybersecurity': 88,
      'Cloud Computing': 92,
      'DevOps': 87,
      'UI/UX Design': 75,
      'Digital Marketing': 82,
      'Business Analytics': 78,
      'Product Management': 70,
      'Sales & Business Development': 85
    };
    return demandMap[domain] || 80;
  }

  private static getBaseSalary(domain: string): number {
    const salaryMap: Record<string, number> = {
      'AI & Machine Learning': 120000,
      'Web Development': 85000,
      'Data Science': 110000,
      'Mobile Development': 95000,
      'Cybersecurity': 105000,
      'Cloud Computing': 115000,
      'DevOps': 100000,
      'UI/UX Design': 80000,
      'Digital Marketing': 70000,
      'Business Analytics': 85000,
      'Product Management': 95000,
      'Sales & Business Development': 75000
    };
    return salaryMap[domain] || 85000;
  }

  private static getDomainSkills(domain: string): string[] {
    const skillsMap: Record<string, string[]> = {
      'AI & Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
      'Web Development': ['JavaScript', 'React', 'Node.js', 'Python', 'HTML/CSS', 'TypeScript', 'Next.js'],
      'Data Science': ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'Tableau'],
      'Mobile Development': ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Java', 'iOS', 'Android'],
      'Cybersecurity': ['Network Security', 'Penetration Testing', 'Cryptography', 'Incident Response', 'Security Tools', 'Compliance'],
      'Cloud Computing': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Serverless'],
      'DevOps': ['Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD', 'Monitoring', 'Infrastructure as Code'],
      'UI/UX Design': ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping', 'Visual Design', 'Interaction Design'],
      'Digital Marketing': ['SEO', 'SEM', 'Social Media', 'Content Marketing', 'Analytics', 'Email Marketing', 'PPC'],
      'Business Analytics': ['SQL', 'Excel', 'Tableau', 'Power BI', 'Statistical Analysis', 'Business Intelligence'],
      'Product Management': ['Product Strategy', 'User Research', 'Agile', 'Data Analysis', 'Stakeholder Management', 'Roadmapping'],
      'Sales & Business Development': ['Sales Strategy', 'Lead Generation', 'Relationship Building', 'Negotiation', 'Market Analysis', 'CRM']
    };
    return skillsMap[domain] || ['General Skills'];
  }

  private static getFallbackTrends(domain: string): DomainTrends {
    return {
      domain,
      jobDemand: [],
      salaryTrends: [],
      skillDemand: [],
      marketInsights: [],
      lastUpdated: new Date().toISOString()
    };
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheInfo(): { size: number; domains: string[] } {
    return {
      size: this.cache.size,
      domains: Array.from(this.cache.keys())
    };
  }
}
