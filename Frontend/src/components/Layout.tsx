
import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogIn, UserPlus, LogOut, Settings, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { notificationsService } from '@/lib/services/notifications';
import AuthModal from './AuthModal';
import NotificationDropdown from './NotificationDropdown';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch unread notification count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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



            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-[#888888] hover:text-[#865A7B] transition-colors"
                    >
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#865A7B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <NotificationDropdown onClose={() => setShowNotifications(false)} />
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={profileMenuRef}>
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center space-x-2 p-2 text-[#888888] hover:text-[#865A7B] transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <User className="w-6 h-6" />
                      <span className="text-sm font-medium">{user.username}</span>
                    </button>
                    
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                            <div className="font-medium">{user.username}</div>
                            <div className="text-gray-500">{user.email}</div>
                          </div>
                          <Link 
                            to="/profile" 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Link>
                          <Link 
                            to="/my-questions" 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            My Questions
                          </Link>
                          <button 
                            onClick={() => {
                              logout();
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
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
