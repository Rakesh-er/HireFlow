import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Job } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Briefcase, Search, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;

      const response = await api.get('/admin/jobs', { params });
      setJobs(response.data.data || []);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load platform jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Job Monitoring</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all published and draft job requisitions across all registered organizations.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="max-w-md">
          <Input
            placeholder="Search job title or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="We couldn't find any job postings on the platform matching your query."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Job Title</th>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Applications</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-6 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">{job.title}</td>
                  <td className="py-4 px-4 text-slate-600 font-medium">{job.organization?.name}</td>
                  <td className="py-4 px-4 font-bold text-primary-600">{job._count?.applications || 0}</td>
                  <td className="py-4 px-4">
                    <Badge variant={job.status === 'PUBLISHED' ? 'success' : 'default'} size="sm">
                      {job.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <a href={`/jobs/${job.slug}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                    </a>
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

