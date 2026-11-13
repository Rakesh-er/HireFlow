import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Activity, Clock } from 'lucide-react';

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/activity-logs', { params: { page, limit: 20 } });
      setLogs(response.data.data || []);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit & Activity Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit record of all significant mutations, auth events, and pipeline transitions.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity logs recorded"
          description="Activity events will populate here as recruiters and candidates perform actions."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-6">Organization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">{log.entityType}</td>
                  <td className="py-4 px-4 text-slate-800 font-medium">
                    {log.user?.name || log.user?.email || 'System'}
                  </td>
                  <td className="py-4 px-6 text-slate-500">
                    {log.organization?.name || 'Platform'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

