import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Application, ApplicationStage, Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
  User,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const STAGES: { key: ApplicationStage; label: string; color: string }[] = [
  { key: 'APPLIED', label: 'Applied', color: 'border-slate-300 text-slate-700 bg-slate-50' },
  { key: 'SCREENING', label: 'Screening', color: 'border-amber-300 text-amber-700 bg-amber-50/50' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'border-blue-300 text-blue-700 bg-blue-50/50' },
  { key: 'INTERVIEW', label: 'Interview', color: 'border-indigo-300 text-indigo-700 bg-indigo-50/50' },
  { key: 'ASSESSMENT', label: 'Assessment', color: 'border-purple-300 text-purple-700 bg-purple-50/50' },
  { key: 'OFFERED', label: 'Offered', color: 'border-teal-300 text-teal-700 bg-teal-50/50' },
  { key: 'HIRED', label: 'Hired', color: 'border-emerald-300 text-emerald-700 bg-emerald-50/50' },
  { key: 'REJECTED', label: 'Rejected', color: 'border-rose-300 text-rose-700 bg-rose-50/50' },
];

export const KanbanPage: React.FC = () => {
  const [board, setBoard] = useState<Record<ApplicationStage, Application[]>>({
    APPLIED: [],
    SCREENING: [],
    SHORTLISTED: [],
    INTERVIEW: [],
    ASSESSMENT: [],
    OFFERED: [],
    HIRED: [],
    REJECTED: [],
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Notes Modal state
  const [activeAppForNotes, setActiveAppForNotes] = useState<Application | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);

  // Application Detail Modal
  const [activeAppDetail, setActiveAppDetail] = useState<Application | null>(null);

  const fetchKanban = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedJobId) params.jobId = selectedJobId;

      const [boardRes, jobsRes] = await Promise.all([
        api.get('/applications/kanban', { params }),
        api.get('/jobs'),
      ]);

      setBoard(boardRes.data.data);
      setJobs(jobsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load ATS Kanban board:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, [selectedJobId]);

  const handleMoveStage = async (app: Application, targetStage: ApplicationStage) => {
    if (app.status === targetStage) return;

    const sourceStage = app.status;

    // Optimistic update
    setBoard((prev) => {
      const sourceList = prev[sourceStage].filter((item) => item.id !== app.id);
      const targetList = [{ ...app, status: targetStage }, ...prev[targetStage]];
      return {
        ...prev,
        [sourceStage]: sourceList,
        [targetStage]: targetList,
      };
    });

    try {
      await api.patch(`/applications/${app.id}/status`, {
        status: targetStage,
        notes: `Moved candidate from ${sourceStage} to ${targetStage}`,
      });
    } catch (err) {
      console.error('Failed to persist stage change:', err);
      // Rollback on failure
      fetchKanban();
    }
  };

  const handleAddNotesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppForNotes || !noteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      await api.post(`/applications/${activeAppForNotes.id}/notes`, {
        notes: noteContent,
      });
      setNoteContent('');
      setActiveAppForNotes(null);
    } catch (err) {
      console.error('Failed to save recruiter note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">ATS Recruitment Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Drag, track, and progress candidates across all hiring stages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              options={[
                { label: 'All Job Openings', value: '' },
                ...jobs.map((j) => ({ label: j.title, value: j.id })),
              ]}
            />
          </div>

          <div className="w-56">
            <Input
              placeholder="Filter candidate name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
          {STAGES.map((col, idx) => {
            const rawCards = board[col.key] || [];
            const cards = searchQuery
              ? rawCards.filter((c) =>
                  c.candidate?.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : rawCards;

            const prevStage = idx > 0 ? STAGES[idx - 1].key : null;
            const nextStage = idx < STAGES.length - 1 ? STAGES[idx + 1].key : null;

            return (
              <div
                key={col.key}
                className="w-72 shrink-0 flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 p-3 max-h-[calc(100vh-220px)]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {col.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-white text-slate-700 font-bold text-[11px] flex items-center justify-center border border-slate-200 shadow-2xs">
                      {cards.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {cards.length === 0 ? (
                    <div className="h-28 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                      No candidates in {col.label}
                    </div>
                  ) : (
                    cards.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* Candidate Info */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4
                              onClick={() => setActiveAppDetail(app)}
                              className="text-xs font-bold text-slate-900 hover:text-primary-600 cursor-pointer"
                            >
                              {app.candidate?.user?.name || 'Applicant'}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{app.job?.title}</p>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {app.candidate?.user?.name?.charAt(0) || 'C'}
                          </div>
                        </div>

                        {/* Details snippet */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(app.appliedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>

                          <div className="flex items-center gap-1">
                            {app.resumeUrl && (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-slate-400 hover:text-primary-600"
                                title="View Resume"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setActiveAppForNotes(app)}
                              className="p-1 text-slate-400 hover:text-primary-600"
                              title="Add Note"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Stage Transition Quick Buttons */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          {prevStage ? (
                            <button
                              onClick={() => handleMoveStage(app, prevStage)}
                              className="text-[10px] font-semibold text-slate-400 hover:text-slate-800 flex items-center gap-0.5"
                              title={`Move to ${prevStage}`}
                            >
                              <ChevronLeft className="w-3 h-3" />
                              <span>Back</span>
                            </button>
                          ) : <div />}

                          {nextStage && (
                            <button
                              onClick={() => handleMoveStage(app, nextStage)}
                              className="text-[10px] font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-0.5"
                              title={`Advance to ${nextStage}`}
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recruiter Note Modal */}
      <Modal
        isOpen={!!activeAppForNotes}
        onClose={() => setActiveAppForNotes(null)}
        title={`Add Recruiter Note: ${activeAppForNotes?.candidate?.user?.name}`}
        description={`Record internal remarks for this application`}
      >
        <form onSubmit={handleAddNotesSubmit} className="space-y-4">
          <Textarea
            label="Internal Evaluation Note"
            placeholder="Document screening notes, assessment feedback, or candidate highlights..."
            rows={4}
            required
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveAppForNotes(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingNote}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Full Application Detail Modal */}
      <Modal
        isOpen={!!activeAppDetail}
        onClose={() => setActiveAppDetail(null)}
        title={`Candidate: ${activeAppDetail?.candidate?.user?.name}`}
        size="lg"
      >
        {activeAppDetail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-400">Position Applied:</p>
                <h4 className="text-sm font-bold text-slate-900">{activeAppDetail.job?.title}</h4>
              </div>
              <Badge variant="primary">{activeAppDetail.status}</Badge>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cover Letter</h5>
              <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-line">
                {activeAppDetail.coverLetter || 'No cover letter provided with this application.'}
              </div>
            </div>

            {activeAppDetail.resumeUrl && (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Candidate Resume</p>
                    <p className="text-[11px] text-slate-500">Document on file</p>
                  </div>
                </div>
                <a href={activeAppDetail.resumeUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    View Document
                  </Button>
                </a>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={() => setActiveAppDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

