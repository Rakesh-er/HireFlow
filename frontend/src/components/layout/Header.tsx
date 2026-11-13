import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { api } from '../../services/api';
import { Bell, LogOut, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, setNotifications } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load initial notifications from database
  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then((res) => {
          setNotifications(res.data.data || []);
        })
        .catch((err) => console.warn('Could not load notifications:', err));
    }
  }, [user]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      markAllAllReadState();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAllReadState = () => {
    markAllAsRead();
  };

  const handleMarkSingle = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-base font-semibold text-slate-800">
          {user?.organization ? user.organization.name : 'HireFlow Platform'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Icon & Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                  {unreadCount > 0 && <Badge variant="primary" size="sm">{unreadCount} new</Badge>}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 ${
                        !n.isRead ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkSingle(n.id)}
                            className="p-1 text-slate-400 hover:text-primary-600"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Public Careers portal button for recruiters */}
        {user?.organization && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/jobs', '_blank')}
            className="hidden sm:inline-flex"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Careers Portal
          </Button>
        )}

        {/* Logout button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="text-slate-600 hover:text-rose-600"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

