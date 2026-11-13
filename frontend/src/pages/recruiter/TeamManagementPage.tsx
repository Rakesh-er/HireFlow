import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OrganizationMember, OrgRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Users,
  Plus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';

export const TeamManagementPage: React.FC = () => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('MEMBER');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string>('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/organizations/members');
      setMembers(response.data.data || []);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInvite(true);
    setInviteError('');

    try {
      const response = await api.post('/organizations/invitations', {
        email: inviteEmail,
        role: inviteRole,
      });

      if (response.data.data?.devInviteToken) {
        setGeneratedToken(response.data.data.devInviteToken);
      } else {
        setIsInviteOpen(false);
        setInviteEmail('');
      }
      fetchMembers();
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRemoveMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the organization?`)) return;

    try {
      await api.delete(`/organizations/members/${id}`);
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hiring Team & Permissions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Invite recruiters, hiring managers, and interviewers to collaborate on job openings.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsInviteOpen(true)}>
          <Plus className="w-4 h-4" />
          Invite Team Member
        </Button>
      </div>

      {/* Members Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Organization Role</th>
                  <th className="py-3.5 px-4">Joined At</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                        {m.user?.name.charAt(0)}
                      </div>
                      <span>{m.user?.name}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-500">{m.user?.email}</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={m.organizationRole === 'OWNER' ? 'purple' : m.organizationRole === 'ADMIN' ? 'primary' : 'default'}
                        size="sm"
                      >
                        {m.organizationRole}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {m.organizationRole !== 'OWNER' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(m.id, m.user.name)}
                          className="text-slate-400 hover:text-rose-600"
                          title="Remove Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => {
          setIsInviteOpen(false);
          setGeneratedToken(null);
          setInviteEmail('');
        }}
        title="Invite New Teammate"
        description="Grant access to review candidates, coordinate interviews, and score applicants"
      >
        {generatedToken ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">Invitation Link Generated</h4>
              <p className="text-xs text-emerald-700">
                Share this token or link with your teammate to join your organization:
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-300 font-mono text-xs text-slate-800 break-all select-all">
                {generatedToken}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => {
                  setIsInviteOpen(false);
                  setGeneratedToken(null);
                  setInviteEmail('');
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            {inviteError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {inviteError}
              </div>
            )}

            <Input
              label="Teammate Email Address"
              type="email"
              placeholder="colleague@company.com"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Select
              label="Permission Level"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as OrgRole)}
              options={[
                { label: 'Member (Hiring Manager / Interviewer)', value: 'MEMBER' },
                { label: 'Admin (Full Job & Team Permissions)', value: 'ADMIN' },
              ]}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmittingInvite}>
                Send Invitation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

