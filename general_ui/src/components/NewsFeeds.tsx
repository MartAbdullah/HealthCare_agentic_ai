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

const RSS_FEEDS = [
  {
    url: 'https://feeds.bbci.co.uk/news/health/rss.xml',
    name: 'BBC Health'
  }
];

// Kullanarak birden fazla CORS proxy'i deneyelim
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://api.codetabs.com/v1/proxy?quest='
];

let currentProxyIndex = 0;

// Görsel URL'lerini işle - direkt HTTP'yi HTTPS'ye çevir
const wrapImageUrlWithProxy = (imageUrl: string): string => {
  if (!imageUrl) return imageUrl;
  // HTTP'yi HTTPS'ye çevir, proxy kullanma
  return imageUrl.replace(/^http:\/\//, 'https://');
};

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
        const allNews: NewsItem[] = [];

        for (const feed of RSS_FEEDS) {
          try {
            console.log('📰 Fetching feed:', feed.url);
            
            let xmlContent = '';
            let parseSuccess = false;
            
            // CORS proxy'leri sırayla dene
            for (let i = 0; i < CORS_PROXIES.length && !parseSuccess; i++) {
              try {
                const corsProxy = CORS_PROXIES[i];
                const proxyUrl = corsProxy.includes('quest=') 
                  ? `${corsProxy}${encodeURIComponent(feed.url)}`
                  : `${corsProxy}${encodeURIComponent(feed.url)}`;
                
                console.log('🔗 Using proxy:', proxyUrl.substring(0, 50) + '...');
                
                const response = await fetch(proxyUrl);
                
                if (!response.ok) {
                  console.warn(`Proxy ${i} failed with status ${response.status}`);
                  continue;
                }
                
                const data = await response.json();
                
                // allorigins format: {contents: "..."}
                xmlContent = data.contents || data || '';
                
                if (xmlContent && xmlContent.includes('<') && xmlContent.includes('item')) {
                  parseSuccess = true;
                  console.log('✅ Successfully fetched feed');
                } else {
                  console.warn('Proxy response invalid XML format');
                  continue;
                }
              } catch (proxyErr) {
                console.error(`Proxy ${i} error:`, proxyErr);
                continue;
              }
            }
            
            if (!parseSuccess) {
              console.error(`❌ All proxies failed for ${feed.name}`);
              currentProxyIndex++;
              continue;
            }
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
            
            // XML parse error kontrolü
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
              console.error('XML parsing error:', xmlDoc);
              continue;
            }
            
            console.log('✅ XML parsed successfully');

            const items = xmlDoc.querySelectorAll('item');
            console.log(`Found ${items.length} items`);
            
            items.forEach((item, index) => {
              if (index < 15) {
                const title = item.querySelector('title')?.textContent || 'No Title';
                const description = item.querySelector('description')?.textContent || '';
                const link = item.querySelector('link')?.textContent || '';
                const pubDate = item.querySelector('pubDate')?.textContent || '';

                // Görsel almaya çalış
                let image: string | undefined;
                
                // 1. BBC'de resimler media:thumbnail'da gelir
                const thumbnail = item.querySelector('media\\:thumbnail') || 
                                 Array.from(item.querySelectorAll('*')).find(el => el.nodeName.includes('thumbnail'));
                if (thumbnail) {
                  const url = thumbnail.getAttribute('url');
                  if (url) {
                    image = url;
                    console.log('✓ Found image via media:thumbnail');
                  }
                }
                
                // 2. Fallback: Description içinde HTML img tag'ı ara
                if (!image && description) {
                  const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
                  if (imgMatch?.[1]) {
                    image = imgMatch[1];
                    console.log('✓ Found image in description HTML');
                  }
                }
                
                // 3. Fallback: Enclosure ara
                if (!image) {
                  const enclosure = item.querySelector('enclosure');
                  const encType = enclosure?.getAttribute('type') || '';
                  if (enclosure && encType.startsWith('image')) {
                    const url = enclosure.getAttribute('url');
                    if (url) {
                      image = url;
                      console.log('✓ Found image via enclosure');
                    }
                  }
                }

                // Görsel URL'sini işle
                if (image) {
                  image = wrapImageUrlWithProxy(image);
                }

                // HTML tag'lerini temizle
                let cleanDescription = description;
                if (cleanDescription.includes('<')) {
                  cleanDescription = cleanDescription
                    .replace(/<img[^>]*>/g, '')
                    .replace(/<[^>]*>/g, '')
                    .substring(0, 150)
                    .trim() + '...';
                } else {
                  cleanDescription = cleanDescription.substring(0, 150).trim() + '...';
                }

                allNews.push({
                  title: title.substring(0, 80),
                  description: cleanDescription,
                  image,
                  link,
                  source: feed.name,
                  pubDate
                });
              }
            });
          } catch (err) {
            console.error(`❌ Error processing ${feed.name}:`, err);
          }
        }

        console.log('📊 All news items:', allNews);
        const newsWithImages = allNews.filter(n => n.image);
        const newsWithoutImages = allNews.filter(n => !n.image);
        console.log(`📸 Items WITH images: ${newsWithImages.length}, WITHOUT images: ${newsWithoutImages.length}`);
        
        // Tarih sırasına göre düzenle ve ilk 3'ünü al
        allNews.sort((a, b) => {
          if (!a.pubDate || !b.pubDate) return 0;
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });

        const finalNews = allNews.slice(0, 15);
        console.log('✨ Final news items:', finalNews);
        setNewsItems(finalNews);
      } catch (err) {
        console.error('🚨 Main error:', err);
        setError('Haberler yüklenirken hata oluştu');
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
