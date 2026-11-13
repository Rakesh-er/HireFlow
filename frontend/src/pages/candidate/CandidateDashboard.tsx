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
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Building2,
  FileText,
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/analytics/candidate/overview');
        setData(response.data.data);
      } catch (err) {
        console.error('Failed to load candidate analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalApplications: 0,
    underReview: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your job applications, interview schedules, and recruiter communications.
          </p>
        </div>

        <Link to="/candidate/jobs">
          <Button size="sm">
            <Briefcase className="w-4 h-4" />
            Explore More Jobs
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Applications Submitted"
          value={metrics.totalApplications}
          icon={Briefcase}
          iconColor="bg-primary-50 text-primary-600"
        />
        <StatCard
          title="Under Review"
          value={metrics.underReview}
          icon={Clock}
          iconColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Shortlisted"
          value={metrics.shortlisted}
          icon={CheckCircle2}
          iconColor="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Interviews Scheduled"
          value={metrics.interviewsScheduled}
          icon={Calendar}
          iconColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Recent Application Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Application Activity</CardTitle>
          <Link to="/candidate/applications" className="text-xs font-semibold text-primary-600 hover:underline">
            View all applications
          </Link>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {(!data?.recentActivity || data.recentActivity.length === 0) ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-xs text-slate-400">You haven't applied to any job openings yet.</p>
              <Link to="/candidate/jobs">
                <Button size="sm" variant="outline">Browse Open Positions</Button>
              </Link>
            </div>
          ) : (
            data.recentActivity.map((app: any) => (
              <div key={app.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{app.job?.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.job?.organization?.name}</span>
                    <span className="text-slate-300">•</span>
                    <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      app.status === 'HIRED'
                        ? 'success'
                        : app.status === 'REJECTED'
                        ? 'danger'
                        : 'primary'
                    }
                    size="md"
                  >
                    {app.status}
                  </Badge>
                  <Link to="/candidate/applications">
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

