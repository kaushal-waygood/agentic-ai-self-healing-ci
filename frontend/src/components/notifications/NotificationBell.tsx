import React from 'react';
import { Bell as BellIcon, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Loader } from '../Loader';

type Notification = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  category?: string;
};

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  fetchNotifications: () => Promise<void>;
  connectionStatus?: string;
  isLoading?: boolean;
}

export function NotificationBell({
  notifications,
  unreadCount,
  markAsRead,
  fetchNotifications,
  connectionStatus,
  isLoading = false, // default false
}: NotificationBellProps) {
  const router = useRouter();

  const handleClick = (n: Notification) => {
    let url = n.actionUrl;
    if (url) {
      if (n.category === 'feature') {
        url = '/dashboard/request-new-feature'; // CORRECT ROUTE
      }
      router.push(url.startsWith('/') ? url : `/dashboard/${url}`);
    }
    if (!n.isRead) markAsRead(n._id);
  };

  return (
    <div className="p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          <BellIcon className="w-6 h-6 cursor-pointer" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {/* <div className="text-sm">{connectionStatus}</div> */}
        <div className=" border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
        </div>

        <RefreshCcw
          className={`w-5 h-5 cursor-pointer transition-all ${
            isLoading ? 'animate-spin text-blue-500' : 'text-slate-600'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            fetchNotifications();
          }}
        />
      </div>

      <div className="space-y-3 min-h-[200px] relative">
        {isLoading ? (
          <div className="py-10">
            <Loader
              message="Refreshing..."
              fullHeight={false}
              imageClassName="w-6 h-6"
              textClassName="text-sm"
            />
          </div>
        ) : (
          <>
            {notifications.slice(0, 5).map((n) => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  n.isRead
                    ? 'bg-white border-gray-100'
                    : 'bg-blue-50 border-blue-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <strong className="truncate text-sm">{n.title}</strong>
                  <small className="text-[10px] text-gray-400">
                    {new Date(n.createdAt).toLocaleTimeString()}
                  </small>
                </div>
                <p className="text-xs mt-1 text-slate-600 truncate">
                  {n.message}
                </p>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center text-sm text-gray-500 p-4">
                No notifications
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
