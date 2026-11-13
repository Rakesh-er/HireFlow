import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Building2,
  Users,
  Briefcase,
  FileText,
  ShieldCheck,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await api.get('/analytics/admin/overview');
        setData(response.data.data);
      } catch (err) {
        console.error('Failed to load super admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalOrganizations: 0,
    totalUsers: 0,
    totalCandidates: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Control Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Super Administrator overview of all multi-tenant organizations, users, and system resources.
          </p>
        </div>

        <Link to="/admin/health">
          <Button size="sm" variant="outline">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Check System Health
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Registered Organizations"
          value={metrics.totalOrganizations}
          icon={Building2}
          iconColor="bg-primary-50 text-primary-600"
        />
        <StatCard
          title="Total Registered Users"
          value={metrics.totalUsers}
          icon={Users}
          iconColor="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Candidate Accounts"
          value={metrics.totalCandidates}
          icon={Users}
          iconColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Recruiters & Managers"
          value={metrics.totalRecruiters}
          icon={Users}
          iconColor="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Live Published Jobs"
          value={metrics.totalJobs}
          icon={Briefcase}
          iconColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Total Applications Filed"
          value={metrics.totalApplications}
          icon={FileText}
          iconColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Two Columns: Recent Orgs and Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Organizations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Organizations</CardTitle>
            <Link to="/admin/organizations" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {(!data?.recentOrganizations || data.recentOrganizations.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400">No organizations registered yet.</div>
            ) : (
              data.recentOrganizations.map((org: any) => (
                <div key={org.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{org.name}</p>
                    <span className="text-[10px] text-slate-400">
                      {org._count?.members || 1} members • {org._count?.jobs || 0} jobs
                    </span>
                  </div>
                  <Badge variant={org.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                    {org.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recently Registered Users</CardTitle>
            <Link to="/admin/users" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {(!data?.recentUsers || data.recentUsers.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400">No users registered yet.</div>
            ) : (
              data.recentUsers.map((u: any) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                  <Badge variant="primary" size="sm">
                    {u.role}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

