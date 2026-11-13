import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/common/StatCard';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Briefcase,
  Users,
  Calendar,
  UserCheck,
  TrendingUp,
  BarChart2,
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
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [overviewData, setOverviewData] = useState<any>(null);
  const [jobPerformance, setJobPerformance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, perfRes] = await Promise.all([
          api.get('/analytics/recruiter/overview'),
          api.get('/analytics/recruiter/jobs'),
        ]);

        setOverviewData(overviewRes.data.data);
        setJobPerformance(perfRes.data.data || []);
      } catch (err) {
        console.error('Failed to load recruitment metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const metrics = overviewData?.metrics || {
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiredCandidates: 0,
  };

  const funnelColors = [
    '#635BFF',
    '#818CF8',
    '#A5B4FC',
    '#C7D2FE',
    '#E0E7FF',
    '#10B981',
    '#059669',
    '#F43F5E',
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recruitment Analytics & Insights</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics covering candidate throughput, conversion rates, and requisition performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Positions"
          value={metrics.activeJobs}
          icon={Briefcase}
          iconColor="bg-primary-50 text-primary-600"
        />
        <StatCard
          title="Total Candidate Inflow"
          value={metrics.totalApplications}
          change="+18%"
          icon={Users}
          iconColor="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Interviews Conducted"
          value={metrics.interviewsScheduled}
          icon={Calendar}
          iconColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Successful Hires"
          value={metrics.hiredCandidates}
          change="+100%"
          icon={UserCheck}
          iconColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Recruitment Stage Conversion</span>
              <BarChart2 className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData?.funnel || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-25} textAnchor="end" />
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
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(overviewData?.funnel || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={funnelColors[index % funnelColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Inflow Velocity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Application Inflow (Daily Trend)</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overviewData?.applicationTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line type="monotone" dataKey="applications" stroke="#635BFF" strokeWidth={3} dot={{ r: 4, fill: '#635BFF' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Requisition Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Opening Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Job Opening</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Target Openings</th>
                <th className="py-3 px-4">Applications Received</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {jobPerformance.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{item.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.department}</td>
                  <td className="py-3.5 px-4 font-medium">{item.openings}</td>
                  <td className="py-3.5 px-4 font-bold text-primary-600">{item.applicationsCount}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

