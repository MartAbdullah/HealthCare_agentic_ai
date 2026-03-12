import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ZapIcon, BrainIcon, DatabaseIcon, StethoscopeIcon, UserIcon } from '../icons';
import { API_ENDPOINTS } from '../config/api';
import logoImg from '../icons/logo2.png';

interface SidebarProps {
  specialistsCount?: number;
  onSpecialistsCountChange?: (count: number) => void;
}

export default function Sidebar({ specialistsCount = 3, onSpecialistsCountChange }: SidebarProps) {
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('online');

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
    },
    {
      name: 'Patient Intake',
      href: '/patient-intake',
      icon: ZapIcon,
    },
    {
      name: 'Specialist Consultation',
      href: '/specialist-consultation',
      icon: BrainIcon,
    },
    {
      name: 'Clinical Document',
      href: '/clinical-document',
      icon: DatabaseIcon,
    },
    {
      name: 'Specialist Portal',
      href: '/specialist',
      icon: StethoscopeIcon,
    },
    {
      name: 'Patient Portal',
      href: '/patient',
      icon: UserIcon,
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  // Check backend status on mount and periodically
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.health, {
          method: 'GET',
        });
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (err) {
        setBackendStatus('offline');
      }
    };

    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-screen overflow-y-auto">
      {/* Logo Section */}
      <div className="p-2 border-b border-slate-700">
        <Link to="/" className="flex flex-col items-center group">
          <div className="w-full bg-transparent rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all overflow-hidden px-1 py-0 mb-1">
            <img 
              src={logoImg}
              alt="Healthcare Logo"
              className="w-64 h-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Specialists to Consult - Only on Specialist Consultation Page */}
      {isActive('/specialist-consultation') && (
        <div className="mx-4 mb-4 bg-gradient-to-br from-purple-900/40 to-slate-800/50 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-sm shadow-xl hover:border-purple-500/60 transition-all">
          <div className="flex flex-col items-center space-y-3">
            {/* Number Display */}
            <div className="text-center w-full">
              <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">Specialists</p>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                {specialistsCount}
              </div>
            </div>

            {/* Slider */}
            <div className="w-full">
              <input
                type="range"
                min="1"
                max="20"
                value={specialistsCount}
                onChange={(e) => onSpecialistsCountChange?.(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700/40 rounded-full appearance-none cursor-pointer accent-purple-500 shadow-lg"
              />
              <p className="text-center text-gray-400 text-xs mt-2 leading-relaxed">
                Slide to adjust
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-2 w-full text-center text-xs">
              <div className="bg-slate-700/30 rounded-lg py-1 px-2">
                <p className="text-gray-400 text-xs">Min</p>
                <p className="font-bold text-purple-300">1</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg py-1 px-2">
                <p className="text-gray-400 text-xs">Max</p>
                <p className="font-bold text-purple-300">20</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className="p-6 border-t border-slate-700 space-y-3">
        <div className={`rounded-lg p-4 ${
          backendStatus === 'online'
            ? 'bg-green-500/10'
            : 'bg-red-500/10'
        }`}>
          <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Status</p>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              backendStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm ${
              backendStatus === 'online' ? 'text-green-400' : 'text-red-400'
            }`}>
              {backendStatus === 'online' ? 'All systems online' : 'All systems offline'}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center">
          © 2026 HealthCare. Medical AI Platform.
        </p>
      </div>
    </aside>
  );
}
