import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Briefcase,
  Users,
  Calendar,
  UserCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export const RecruiterDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/analytics/recruiter/overview');
        setData(response.data.data);
      } catch (err) {
        console.error('Failed to load recruiter analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiredCandidates: 0,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recruitment Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time applicant flow, stage conversion, and interview scheduling analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/recruiter/kanban">
            <Button variant="outline" size="sm">
              View ATS Pipeline
            </Button>
          </Link>
          <Link to="/recruiter/jobs/create">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Create Job Opening
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Openings"
          value={metrics.activeJobs}
          change="+2"
          icon={Briefcase}
          iconColor="bg-primary-50 text-primary-600"
        />
        <StatCard
          title="Total Applications"
          value={metrics.totalApplications}
          change="+14%"
          icon={Users}
          iconColor="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Scheduled Interviews"
          value={metrics.interviewsScheduled}
          icon={Calendar}
          iconColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Hired Candidates"
          value={metrics.hiredCandidates}
          change="+1"
          icon={UserCheck}
          iconColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Recruitment Stage Funnel</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.funnel || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" fill="#635BFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Inflow Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.applicationTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Line type="monotone" dataKey="applications" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Link to="/recruiter/applications" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {(!data?.recentApplications || data.recentApplications.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400">No applications received yet.</div>
            ) : (
              data.recentApplications.map((app: any) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                      {app.candidate?.user?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{app.candidate?.user?.name}</p>
                      <p className="text-[11px] text-slate-400">{app.job?.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </Badge>
                    <Link to={`/recruiter/applications?id=${app.id}`}>
                      <Button variant="ghost" size="sm" className="p-1 text-slate-400 hover:text-slate-800">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming Interviews</CardTitle>
            <Link to="/recruiter/interviews" className="text-xs font-semibold text-primary-600 hover:underline">
              View calendar
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {(!data?.upcomingInterviews || data.upcomingInterviews.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400">No interviews scheduled.</div>
            ) : (
              data.upcomingInterviews.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      {item.application?.candidate?.user?.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.application?.job?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-primary-700">
                      {new Date(item.scheduledAt).toLocaleDateString()} at{' '}
                      {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-slate-400">Interviewer: {item.interviewer?.name}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

