import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Application, ApplicationStage, Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  FolderGit2,
  Search,
  Filter,
  FileText,
  Calendar,
  MessageSquare,
  History,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

const ALL_STAGES: ApplicationStage[] = [
  'APPLIED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW',
  'ASSESSMENT',
  'OFFERED',
  'HIRED',
  'REJECTED',
];

export const ApplicationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Status Change Modal
  const [activeAppForStatus, setActiveAppForStatus] = useState<Application | null>(null);
  const [targetStatus, setTargetStatus] = useState<ApplicationStage>('SCREENING');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // History Modal
  const [activeAppForHistory, setActiveAppForHistory] = useState<Application | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (selectedJobId) params.jobId = selectedJobId;
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;

      const [appsRes, jobsRes] = await Promise.all([
        api.get('/applications', { params }),
        api.get('/jobs'),
      ]);

      setApplications(appsRes.data.data || []);
      setJobs(jobsRes.data.data || []);
      if (appsRes.data.meta) {
        setTotalPages(appsRes.data.meta.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, selectedJobId, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppForStatus) return;

    setIsUpdatingStatus(true);
    try {
      await api.patch(`/applications/${activeAppForStatus.id}/status`, {
        status: targetStatus,
        notes: statusNotes,
      });
      setActiveAppForStatus(null);
      setStatusNotes('');
      fetchApplications();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenHistory = async (app: Application) => {
    setActiveAppForHistory(app);
    try {
      const res = await api.get(`/applications/${app.id}`);
      setHistoryList(res.data.data.stageHistory || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Applications Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and manage all candidate submissions across every recruitment stage.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:w-auto">
          <Input
            placeholder="Search candidate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>

        <div className="w-full sm:w-60">
          <Select
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Jobs', value: '' },
              ...jobs.map((j) => ({ label: j.title, value: j.id })),
            ]}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Stages', value: '' },
              ...ALL_STAGES.map((s) => ({ label: s, value: s })),
            ]}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No applications found"
          description="We couldn't find any candidate applications matching your current filters."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedJobId('');
            setSelectedStatus('');
            setSearch('');
            setPage(1);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-4">Applied Job</th>
                  <th className="py-3.5 px-4">Current Stage</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Resume</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {app.candidate?.user?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{app.candidate?.user?.name}</p>
                          <p className="text-[11px] text-slate-400">{app.candidate?.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {app.job?.title}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          app.status === 'HIRED'
                            ? 'success'
                            : app.status === 'REJECTED'
                            ? 'danger'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveAppForStatus(app);
                            setTargetStatus(app.status);
                          }}
                        >
                          Update Stage
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenHistory(app)}
                          title="Stage Timeline"
                        >
                          <History className="w-3.5 h-3.5 text-slate-400" />
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

      {/* Update Stage Modal */}
      <Modal
        isOpen={!!activeAppForStatus}
        onClose={() => setActiveAppForStatus(null)}
        title={`Update Stage: ${activeAppForStatus?.candidate?.user?.name}`}
        description={`Move application to the next recruitment stage`}
      >
        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
          <Select
            label="Target Recruitment Stage"
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as ApplicationStage)}
            options={ALL_STAGES.map((s) => ({ label: s, value: s }))}
          />

          <Textarea
            label="Transition Notes (Recorded in audit history)"
            placeholder="Reason for advancing or rejecting candidate..."
            rows={3}
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveAppForStatus(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isUpdatingStatus}>
              Save Transition
            </Button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={!!activeAppForHistory}
        onClose={() => setActiveAppForHistory(null)}
        title={`Stage Timeline: ${activeAppForHistory?.candidate?.user?.name}`}
      >
        <div className="space-y-4 py-2">
          {historyList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center">No stage history recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {historyList.map((entry, idx) => (
                <div key={entry.id || idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5 border border-primary-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      {entry.previousStage ? `${entry.previousStage} → ` : 'Initial: '}
                      <span className="text-primary-600">{entry.newStage}</span>
                    </p>
                    {entry.notes && <p className="text-xs text-slate-600">{entry.notes}</p>}
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(entry.createdAt).toLocaleString()} by {entry.changer?.name || 'System'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

