
import { useEffect, useRef } from 'react';
import { MessageSquare, ThumbsUp, AtSign, Clock } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const notifications = [
    {
      id: '1',
      type: 'answer',
      message: 'New answer to your question "How to join 2 columns in SQL?"',
      author: 'sql_expert',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'vote',
      message: 'Your answer received an upvote',
      author: 'developer123',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'mention',
      message: 'You were mentioned in a comment',
      author: 'coder_jane',
      time: '2 hours ago',
      read: true
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'vote':
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {notification.message}
                </p>
                <p className="text-xs text-[#888888] mt-1">
                  by {notification.author} • {notification.time}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-[#865A7B] rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <button className="text-sm text-[#865A7B] hover:text-[#764a6b] transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
