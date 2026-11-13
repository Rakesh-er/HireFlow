import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Users, Search, CheckCircle, Ban } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (role) params.role = role;

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.data || []);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentActive });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Users Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all platform accounts, roles, verification states, and access privileges.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:w-auto">
          <Input
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>

        <div className="w-full sm:w-48">
          <Select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Roles', value: '' },
              { label: 'Candidate', value: 'CANDIDATE' },
              { label: 'Recruiter', value: 'RECRUITER' },
              { label: 'Hiring Manager', value: 'HIRING_MANAGER' },
              { label: 'Super Admin', value: 'SUPER_ADMIN' },
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
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="We couldn't find any users matching your query."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    <div>
                      <p>{u.name}</p>
                      <span className="text-[11px] text-slate-400 font-normal">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="primary" size="sm">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {u.organizationMembers?.[0]?.organization?.name || 'Individual'}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {u.role !== 'SUPER_ADMIN' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        className={u.isActive ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}
                      >
                        {u.isActive ? (
                          <>
                            <Ban className="w-3.5 h-3.5 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    )}
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

