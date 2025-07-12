
import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import NotificationDropdown from './NotificationDropdown';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-[#865A7B]">StackIt</div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888888] w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search questions..." 
                  className="w-full pl-10 pr-4 py-2 border border-[#888888] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865A7B] focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-[#888888] hover:text-[#865A7B] transition-colors"
                    >
                      <Bell className="w-6 h-6" />
                      <span className="absolute -top-1 -right-1 bg-[#865A7B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        3
                      </span>
                    </button>
                    {showNotifications && (
                      <NotificationDropdown onClose={() => setShowNotifications(false)} />
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <User className="w-6 h-6 text-[#888888]" />
                    <span className="text-sm font-medium">{user.username}</span>
                    <button 
                      onClick={logout}
                      className="p-2 text-[#888888] hover:text-[#865A7B] transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleAuthClick('login')}
                    className="flex items-center space-x-1 px-3 py-2 text-[#888888] hover:text-[#865A7B] transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </button>
                  <button 
                    onClick={() => handleAuthClick('register')}
                    className="flex items-center space-x-1 px-4 py-2 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Sign Up</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          mode={authMode} 
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      )}
    </div>
  );
};

export default Layout;
