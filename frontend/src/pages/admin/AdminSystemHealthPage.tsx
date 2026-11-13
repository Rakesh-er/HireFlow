import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ShieldCheck,
  Database,
  Cpu,
  Clock,
  RefreshCw,
  Server,
} from 'lucide-react';

export const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/system-health');
      setHealth(response.data.data);
    } catch (err) {
      console.error('Failed to load system health:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-2 gap-6">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Health & Telemetry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time backend infrastructure diagnostics and database connection state.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchHealth}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Diagnostics
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Core Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Platform Service State</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500">Overall Status:</span>
              <Badge variant={health?.status === 'HEALTHY' ? 'success' : 'warning'}>
                {health?.status || 'ONLINE'}
              </Badge>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-400" /> PostgreSQL Database:
              </span>
              <Badge variant={health?.database === 'CONNECTED' ? 'success' : 'danger'}>
                {health?.database || 'DISCONNECTED'}
              </Badge>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Server Uptime:
              </span>
              <span className="font-mono text-xs text-slate-800 font-semibold">
                {health?.uptimeSeconds ? formatUptime(health.uptimeSeconds) : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" /> Runtime Environment:
              </span>
              <span className="font-mono text-xs text-slate-800 font-semibold">
                Node {health?.nodeVersion}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Process Memory */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Memory Utilization</span>
              <Cpu className="w-5 h-5 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500">Heap Used:</span>
              <span className="font-mono text-xs text-slate-900 font-semibold">
                {health?.memory?.heapUsedMb} MB
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500">Heap Total:</span>
              <span className="font-mono text-xs text-slate-900 font-semibold">
                {health?.memory?.heapTotalMb} MB
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Resident Set Size (RSS):</span>
              <span className="font-mono text-xs text-slate-900 font-semibold">
                {health?.memory?.rssMb} MB
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

