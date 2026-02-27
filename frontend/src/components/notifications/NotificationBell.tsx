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

// 2. ✅ PROPS INTERFACE banaya - ab component PROPS leta hai
interface NotificationBellProps {
  notifications: Notification[]; // ➕ PARENT se aayega
  unreadCount: number; // ➕ PARENT se aayega
  markAsRead: (id: string) => void; // ➕ PARENT se aayega
  fetchNotifications: () => Promise<void>; // ➕ PARENT se aayega
  connectionStatus?: string; // ➕ PARENT se aayega
  isLoading?: boolean; // ➕ PARENT se aayega (optional)
}

// 3. ✅ Component AB PROPS leta hai, khud hook call nahi karta
export function NotificationBell({
  notifications,
  unreadCount,
  markAsRead,
  fetchNotifications,
  connectionStatus,
  isLoading = false, // default false
}: NotificationBellProps) {
  const router = useRouter();

  // 4. ✅ handleClick MEIN FEATURE REDIRECT LOGIC ADD KIYA
  const handleClick = (n: Notification) => {
    let url = n.actionUrl;
    if (url) {
      // 🔥 FIX: agar category 'feature' hai to correct page par bhejo
      if (n.category === 'feature') {
        url = '/dashboard/request-new-feature'; // CORRECT ROUTE
      }
      router.push(url.startsWith('/') ? url : `/dashboard/${url}`);
    }
    if (!n.isRead) markAsRead(n._id);
  };

  // 5. ✅ REMOVED: internal useState, useEffect, fetch calls
  //    Ab data parent se props mein aa raha hai

  // 6. ✅ UI SAME RAHA - bas data source change hua
  if (isLoading) {
    return (
      <Loader
        message="Loading Notifications..."
        fullHeight={true}
        imageClassName="w-6 h-6"
        textClassName="text-sm"
      />
    );
  }

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
        <div className="text-sm">{connectionStatus}</div>
        <RefreshCcw
          className="w-5 h-5 cursor-pointer"
          onClick={() => fetchNotifications()}
        />
      </div>

      <div className="space-y-3">
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
              <strong className="truncate">{n.title}</strong>
              <small className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </small>
            </div>
            <p className="text-sm mt-1 truncate">{n.message}</p>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center text-sm text-gray-500 p-4">
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}
