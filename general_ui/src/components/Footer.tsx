import NewsFeeds from './NewsFeeds';

interface FooterProps {
  showNews?: boolean;
}

export default function Footer({ showNews = false }: FooterProps) {
  return (
    <footer className="border-t border-slate-700 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* News Feed - Only on HomePage */}
        {showNews && <NewsFeeds />}

        {/* Footer Content */}
        <div className={`${showNews ? 'mt-8 pt-6' : ''} border-t border-slate-700 text-center text-gray-400 text-sm`}>
          <p>werhereItAcademy © 2026. Agentic AI Healthy Project</p>
        </div>
      </div>
    </footer>
  );
}
