
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, ThumbsUp, AtSign, Clock, CheckCircle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationsService, Notification } from '@/lib/services/notifications';
import { socketService } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications({ limit: 20 }),
    enabled: !!user,
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    },
  });

  const notifications = notificationsData?.data || [];
  const totalUnread = unreadCountData || 0;

  // Update unread count when data changes
  useEffect(() => {
    setUnreadCount(totalUnread);
  }, [totalUnread]);

  // Socket.IO notification handling
  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (data: any) => {
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast({
        title: 'New Notification',
        description: data.message,
      });

      // Refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    };

    // Listen for new notifications
    socketService.on('new_notification', handleNewNotification);

    return () => {
      socketService.off('new_notification', handleNewNotification);
    };
  }, [user, queryClient, toast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'vote':
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case 'accept':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'vote':
        return 'border-l-4 border-l-green-500';
      case 'answer':
        return 'border-l-4 border-l-blue-500';
      case 'accept':
        return 'border-l-4 border-l-green-600';
      case 'mention':
        return 'border-l-4 border-l-purple-500';
      default:
        return '';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    
    // Navigate to the question
    if (notification.questionId?._id) {
      window.location.href = `/question/${notification.questionId._id}`;
    }
    
    onClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
      >
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="p-4 text-center text-gray-500">
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-[#865A7B] hover:text-[#764a6b] transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !notification.isRead ? 'bg-blue-50' : ''
              } ${getNotificationStyle(notification.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {notification.content}
                  </p>
                  <p className="text-xs text-[#888888] mt-1">
                    {notification.senderId?.username && `by ${notification.senderId.username} • `}
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-[#865A7B] rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
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
