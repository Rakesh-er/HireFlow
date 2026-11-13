import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Organization, OrgStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Building2, Search, CheckCircle, Ban } from 'lucide-react';

export const AdminOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchOrgs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await api.get('/admin/organizations', { params });
      setOrganizations(response.data.data || []);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrgs();
  };

  const handleToggleStatus = async (orgId: string, currentStatus: OrgStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/admin/organizations/${orgId}/status`, { status: nextStatus });
      fetchOrgs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update organization status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Organizations Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage all enterprise tenants, subscriptions, and active access states.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:w-auto">
          <Input
            placeholder="Search organization by name, slug, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>

        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Suspended', value: 'SUSPENDED' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations found"
          description="We couldn't find any organizations matching your filter criteria."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Organization</th>
                <th className="py-3.5 px-4">Industry</th>
                <th className="py-3.5 px-4">Members</th>
                <th className="py-3.5 px-4">Jobs</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    <div>
                      <p>{org.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{org.slug}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-500">{org.industry || 'Not specified'}</td>
                  <td className="py-4 px-4 font-medium text-slate-700">{org._count?.members || 1}</td>
                  <td className="py-4 px-4 font-medium text-slate-700">{org._count?.jobs || 0}</td>
                  <td className="py-4 px-4">
                    <Badge variant={org.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                      {org.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(org.id, org.status)}
                      className={org.status === 'ACTIVE' ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}
                    >
                      {org.status === 'ACTIVE' ? (
                        <>
                          <Ban className="w-3.5 h-3.5 mr-1" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
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

