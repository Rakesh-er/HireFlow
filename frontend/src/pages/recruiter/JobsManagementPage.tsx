import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  ExternalLink,
  Users,
} from 'lucide-react';

export const JobsManagementPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const response = await api.get('/jobs', { params });
      setJobs(response.data.data || []);
    } catch (err) {
      console.error('Failed to load organization jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handlePublish = async (jobId: string) => {
    try {
      await api.patch(`/jobs/${jobId}/publish`);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async (jobId: string) => {
    try {
      await api.patch(`/jobs/${jobId}/close`);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job opening?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Openings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, publish, and manage all requisitions across your company.
          </p>
        </div>

        <Link to="/recruiter/jobs/create">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Create Opening
          </Button>
        </Link>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80">
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Published', value: 'PUBLISHED' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Closed', value: 'CLOSED' },
            ]}
          />
        </div>
      </div>

      {/* Jobs Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job openings found"
          description="You haven't posted any jobs matching this criteria yet. Create your first opening to start receiving candidates."
          actionText="Create New Job"
          onAction={() => window.location.href = '/recruiter/jobs/create'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Job Title</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Openings</th>
                  <th className="py-3.5 px-4">Applications</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>
                        <p className="hover:text-primary-600 transition-colors">{job.title}</p>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Created {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{job.department}</td>
                    <td className="py-4 px-4 text-slate-500">{job.location}</td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{job.openings}</td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/recruiter/applications?jobId=${job.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:underline"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job._count?.applications || 0}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          job.status === 'PUBLISHED'
                            ? 'success'
                            : job.status === 'DRAFT'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePublish(job.id)}
                            className="text-emerald-600 hover:text-emerald-700"
                            title="Publish Job"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {job.status === 'PUBLISHED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClose(job.id)}
                            className="text-amber-600 hover:text-amber-700"
                            title="Close Opening"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Link to={`/jobs/${job.slug}`} target="_blank">
                          <Button size="sm" variant="ghost" title="View Public Post">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(job.id)}
                          className="text-slate-400 hover:text-rose-600"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

