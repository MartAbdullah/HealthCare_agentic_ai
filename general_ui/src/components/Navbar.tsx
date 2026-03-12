import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogOut, User } from 'lucide-react';

interface NavbarProps {
  userEmail?: string;
  onLogout?: () => void;
  profileData?: any;
}

export default function Navbar({ userEmail = '', onLogout, profileData }: NavbarProps) {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const firstName = profileData?.firstName || 'User';
  const lastName = profileData?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  const getUserInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  // Close dropdown when clicking outside
  const handleBackgroundClick = () => {
    if (profileMenuOpen) setProfileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="w-full px-3 sm:px-4 md:px-6 flex justify-between items-center h-14 sm:h-16">
          {/* Left - Empty space for alignment */}
          <div className="hidden sm:block w-16 md:w-32"></div>

          {/* Right - Profile Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-1 sm:space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all border border-slate-600 text-sm"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {getUserInitials(firstName, lastName)}
                </div>
                <span className="hidden sm:inline text-xs sm:text-sm font-medium">{firstName}</span>
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                  {/* User Info */}
                  <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-slate-700">
                    <p className="text-white font-semibold text-xs sm:text-sm">{fullName}</p>
                    <p className="text-gray-400 text-xs">{userEmail}</p>
                  </div>

                  {/* Menu Items */}
                  <button 
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors text-xs sm:text-sm">
                    <User size={16} className="sm:block hidden" />
                    <User size={14} className="sm:hidden" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors border-t border-slate-700 text-xs sm:text-sm"
                  >
                    <LogOut size={16} className="sm:block hidden" />
                    <LogOut size={14} className="sm:hidden" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Background overlay for dropdown */}
      {profileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleBackgroundClick}
        ></div>
      )}
    </>
  );
}
