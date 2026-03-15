import { useState, useEffect } from 'react';
import { NewspaperIcon, AlertCircleIcon, LoaderIcon } from '../icons';

interface NewsItem {
  title: string;
  description: string;
  image?: string;
  link: string;
  source: string;
  pubDate?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RSS_FEEDS: any[] = [
  {
    url: 'https://feeds.bbci.co.uk/news/health/rss.xml',
    name: 'BBC Health'
  }
];

export default function NewsFeeds() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add animation styles to document head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll-carousel {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      .carousel-scroll {
        animation: scroll-carousel 60s linear infinite;
      }
      .carousel-scroll:hover {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(style);

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch from backend endpoint
        // Use runtime config if available, otherwise fall back to environment variable
        const API_BASE_URL = (window as any).API_CONFIG?.API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8001';
        const response = await fetch(`${API_BASE_URL}/health-news`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`);
        }
        
        const data = await response.json();
        setNewsItems(data.items || []);
      } catch (err) {
        console.error('Error fetching health news:', err);
        setError('Failed to load health news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      document.head.removeChild(style);
    };
  }, []);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 text-red-300">
          <AlertCircleIcon size={20} />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <NewspaperIcon size={24} className="text-orange-400" />
        <h2 className="text-xl font-bold text-white">Health News</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoaderIcon size={24} className="animate-spin text-orange-400" />
          <span className="ml-2 text-gray-400">Loading news...</span>
        </div>
      ) : newsItems.length > 0 ? (
        <div className="relative w-full overflow-hidden rounded-lg">
          <div 
            className="carousel-scroll flex gap-4"
            style={{ width: `${newsItems.length * 2 * 400}px` }}
          >
            {/* Original items */}
            {newsItems.map((news, index) => (
              <a
                key={index}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-shrink-0 w-96 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-orange-400 transition-all duration-300 flex flex-col"
              >
                {/* News Image */}
                {news.image && news.image.length > 0 ? (
                  <div className="relative h-40 overflow-hidden bg-slate-700">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
                    <NewspaperIcon size={48} className="text-orange-400/50" />
                  </div>
                )}

                {/* News Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2 flex-grow">
                    {news.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                      {news.source}
                    </span>
                    {news.pubDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(news.pubDate).toLocaleDateString('en-US')}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
            
            {/* Clone items for infinite loop */}
            {newsItems.map((news, index) => (
              <a
                key={`clone-${index}`}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-shrink-0 w-96 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-orange-400 transition-all duration-300 flex flex-col"
              >
                {/* News Image */}
                {news.image && news.image.length > 0 ? (
                  <div className="relative h-40 overflow-hidden bg-slate-700">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
                    <NewspaperIcon size={48} className="text-orange-400/50" />
                  </div>
                )}

                {/* News Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2 flex-grow">
                    {news.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                      {news.source}
                    </span>
                    {news.pubDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(news.pubDate).toLocaleDateString('en-US')}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <NewspaperIcon size={32} className="text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">Failed to load news</p>
        </div>
      )}
    </div>
  );
}
