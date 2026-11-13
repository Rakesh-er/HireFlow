import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Job } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  MapPin,
  Building2,
  DollarSign,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

export const PublicJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<string>('');
  const [workplaceType, setWorkplaceType] = useState<string>('');
  const [sort, setSort] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 9, sort };
      if (keyword) params.keyword = keyword;
      if (location) params.location = location;
      if (department) params.department = department;
      if (employmentType) params.employmentType = employmentType;
      if (workplaceType) params.workplaceType = workplaceType;

      const response = await api.get('/public/jobs', { params });
      setJobs(response.data.data || []);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, sort, employmentType, workplaceType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setDepartment('');
    setEmploymentType('');
    setWorkplaceType('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Your Next Career Move
        </h1>
        <p className="text-sm text-slate-500">
          Discover vetted engineering, design, and product roles at industry-leading companies.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="grid sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by job title or keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Input
            placeholder="Location (e.g. San Francisco, Remote)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Search
            </Button>
            <Button type="button" variant="outline" onClick={handleClearFilters}>
              Reset
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <Select
            value={employmentType}
            onChange={(e) => {
              setEmploymentType(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Employment Types', value: '' },
              { label: 'Full Time', value: 'FULL_TIME' },
              { label: 'Part Time', value: 'PART_TIME' },
              { label: 'Contract', value: 'CONTRACT' },
              { label: 'Internship', value: 'INTERNSHIP' },
            ]}
          />

          <Select
            value={workplaceType}
            onChange={(e) => {
              setWorkplaceType(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Workplaces', value: '' },
              { label: 'On-Site', value: 'ON_SITE' },
              { label: 'Hybrid', value: 'HYBRID' },
              { label: 'Remote', value: 'REMOTE' },
            ]}
          />

          <Input
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'Newest First', value: 'newest' },
              { label: 'Highest Salary', value: 'salary_high' },
              { label: 'Lowest Salary', value: 'salary_low' },
            ]}
          />
        </div>
      </div>

      {/* Job Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n}>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No job openings found"
          description="We couldn't find any job postings matching your filters. Try adjusting your search query or clear the filters."
          actionText="Clear All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col justify-between hover:border-primary-300">
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {job.department}
                    </span>
                    <Badge variant="primary" size="sm">
                      {job.workplaceType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                  <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.organization?.name || 'Enterprise Employer'}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>
                        ${Math.round(job.salaryMin / 1000)}k - ${Math.round(job.salaryMax / 1000)}k
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
                <span className="text-[11px] text-slate-400">
                  {job.publishedAt
                    ? `Posted ${new Date(job.publishedAt).toLocaleDateString()}`
                    : 'Recently posted'}
                </span>
                <Link to={`/jobs/${job.slug}`}>
                  <Button size="sm" variant="outline" className="text-xs font-medium">
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs font-medium text-slate-600 px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

