import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Application } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  FolderGit2,
  Building2,
  Calendar,
  History,
  XCircle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeHistoryApp, setActiveHistoryApp] = useState<Application | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/candidates/me/applications');
      setApplications(response.data.data || []);
    } catch (err) {
      console.error('Failed to load my applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be reversed.')) {
      return;
    }

    try {
      await api.post(`/applications/${applicationId}/withdraw`);
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw application.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Job Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track the status of your submissions, interview invitations, and stage decisions.
          </p>
        </div>

        <Link to="/candidate/jobs">
          <Button size="sm">
            Browse More Jobs
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No applications submitted yet"
          description="You haven't applied to any job openings. Explore open positions to kickstart your next role."
          actionText="Browse Open Jobs"
          onAction={() => window.location.href = '/candidate/jobs'}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
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
                  <span className="text-xs text-slate-400">
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{app.job?.title}</h3>

                <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{app.job?.organization?.name}</span>
                  {app.job?.organization?.location && (
                    <span className="text-slate-400 font-normal">• {app.job.organization.location}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveHistoryApp(app)}
                >
                  <History className="w-3.5 h-3.5" />
                  Stage History
                </Button>

                {app.status !== 'HIRED' && app.status !== 'REJECTED' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleWithdraw(app.id)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    Withdraw
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stage History Timeline Modal */}
      <Modal
        isOpen={!!activeHistoryApp}
        onClose={() => setActiveHistoryApp(null)}
        title={`Application Timeline: ${activeHistoryApp?.job?.title}`}
        description={`Record of updates from ${activeHistoryApp?.job?.organization?.name}`}
      >
        <div className="space-y-4 py-2">
          {(!activeHistoryApp?.stageHistory || activeHistoryApp.stageHistory.length === 0) ? (
            <p className="text-xs text-slate-400 text-center">No stage changes recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {activeHistoryApp.stageHistory.map((item, idx) => (
                <div key={item.id || idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5 border border-primary-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {item.previousStage ? `${item.previousStage} → ` : 'Status: '}
                      <span className="text-primary-600">{item.newStage}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(item.createdAt).toLocaleString()}
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

