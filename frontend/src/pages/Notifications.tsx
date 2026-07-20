import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bell, 
  Check, 
  CheckSquare, 
  Trash2,
  Calendar,
  AlertTriangle,
  Info,
  BadgeAlert
} from 'lucide-react';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('All');  
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.NotificationID === id ? { ...n, Status: 'Read' } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, Status: 'Read' })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'Unread') return n.Status === 'Unread';
    if (filter === 'Read') return n.Status === 'Read';
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'Deadline':
        return <BadgeAlert className="h-5 w-5 text-warning" />;
      case 'Alert':
        return <AlertTriangle className="h-5 w-5 text-danger" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Notifications</h1>
          <div className="w-12 h-1 bg-primary mt-2 rounded"></div>
        </div>
        
        {notifications.some(n => n.Status === 'Unread') && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-border bg-white text-primary rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm"
          >
            <CheckSquare className="h-4 w-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 border border-border shadow-sm rounded-xl flex gap-2">
        {['All', 'Unread', 'Read'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === tab
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-8 border border-border rounded-xl text-center text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
            <span>Loading notifications...</span>
          </div>
        ) : filteredNotifs.length > 0 ? (
          filteredNotifs.map(n => (
            <div 
              key={n.NotificationID}
              className={`bg-white border rounded-xl p-5 shadow-sm flex items-start justify-between gap-4 transition-all ${
                n.Status === 'Unread' 
                  ? 'border-primary/30 bg-primary/5 shadow-md shadow-primary/5' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg flex items-center justify-center ${
                  n.Status === 'Unread' ? 'bg-white border border-primary/20 shadow-sm' : 'bg-slate-50 border border-border'
                }`}>
                  {getNotifIcon(n.Type)}
                </div>
                
                <div className="space-y-1">
                  <p className={`text-sm ${n.Status === 'Unread' ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                    {n.Message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(n.SentDate).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {n.Status === 'Unread' && (
                <button
                  onClick={() => handleMarkAsRead(n.NotificationID)}
                  className="px-3 py-1.5 bg-white border border-border text-slate-600 hover:text-primary hover:border-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  title="Mark Read"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-12 border border-border rounded-xl text-center text-slate-400">
            <Bell className="h-10 w-10 text-slate-200 mx-auto mb-3 animate-pulse" />
            <p className="font-semibold text-sm">No notifications found.</p>
            <p className="text-xs text-slate-300 mt-1">You are all caught up!</p>
          </div>
        )}
      </div>

    </div>
  );
};
