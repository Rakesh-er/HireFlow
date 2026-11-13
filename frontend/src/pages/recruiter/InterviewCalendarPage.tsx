import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Interview, Application, OrganizationMember } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Video,
  User,
  Plus,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const InterviewCalendarPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Schedule Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [duration, setDuration] = useState<number>(45);
  const [interviewType, setInterviewType] = useState<string>('TECHNICAL');
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState<boolean>(false);
  const [scheduleError, setScheduleError] = useState<string>('');

  // Feedback Modal State
  const [activeInterviewForFeedback, setActiveInterviewForFeedback] = useState<Interview | null>(null);
  const [rating, setRating] = useState<number>(4);
  const [technicalSkills, setTechnicalSkills] = useState<number>(4);
  const [communicationSkills, setCommunicationSkills] = useState<number>(4);
  const [strengths, setStrengths] = useState<string>('');
  const [weaknesses, setWeaknesses] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string>('HIRE');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [intRes, appsRes, membersRes] = await Promise.all([
        api.get('/interviews'),
        api.get('/applications'),
        api.get('/organizations/members'),
      ]);

      setInterviews(intRes.data.data || []);
      setApplications(appsRes.data.data || []);
      setMembers(membersRes.data.data || []);

      if (appsRes.data.data?.length > 0 && !selectedAppId) {
        setSelectedAppId(appsRes.data.data[0].id);
      }
      if (membersRes.data.data?.length > 0 && !selectedInterviewerId) {
        setSelectedInterviewerId(membersRes.data.data[0].user.id);
      }
    } catch (err) {
      console.error('Failed to load interview records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !selectedInterviewerId || !scheduledAt) {
      setScheduleError('Please fill in all required scheduling fields.');
      return;
    }

    setIsSubmittingSchedule(true);
    setScheduleError('');

    try {
      await api.post('/interviews', {
        applicationId: selectedAppId,
        interviewerId: selectedInterviewerId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration: Number(duration),
        interviewType,
        meetingLink: meetingLink || undefined,
        notes: notes || undefined,
      });

      setIsScheduleOpen(false);
      setMeetingLink('');
      setNotes('');
      fetchData();
    } catch (err: any) {
      setScheduleError(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleCancelInterview = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    try {
      await api.delete(`/interviews/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterviewForFeedback) return;

    setIsSubmittingFeedback(true);
    setFeedbackError('');

    try {
      await api.post(`/interviews/${activeInterviewForFeedback.id}/feedback`, {
        rating: Number(rating),
        technicalSkills: Number(technicalSkills),
        communicationSkills: Number(communicationSkills),
        strengths,
        weaknesses,
        comments,
        recommendation,
      });

      setActiveInterviewForFeedback(null);
      setComments('');
      setStrengths('');
      setWeaknesses('');
      fetchData();
    } catch (err: any) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Interview Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule candidate discussions, assign interviewers, and collect structured scorecards.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsScheduleOpen(true)}>
          <Plus className="w-4 h-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Interviews List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled"
          description="You don't have any interviews scheduled yet. Select a candidate and assign an interviewer to begin."
          actionText="Schedule New Interview"
          onAction={() => setIsScheduleOpen(true)}
        />
      ) : (
        <div className="grid gap-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {item.interviewType}
                  </Badge>
                  <Badge
                    variant={
                      item.status === 'COMPLETED'
                        ? 'success'
                        : item.status === 'CANCELLED'
                        ? 'danger'
                        : 'default'
                    }
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {item.application?.candidate?.user?.name}
                  </h3>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {item.application?.job?.title}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({item.duration}m)
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Interviewer: {item.interviewer?.name}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {item.meetingLink && (
                  <a href={item.meetingLink} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Video className="w-3.5 h-3.5 text-indigo-600" />
                      Join Call
                    </Button>
                  </a>
                )}

                {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setActiveInterviewForFeedback(item)}
                      className="text-xs"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Submit Feedback
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelInterview(item.id)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Cancel Interview"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {item.status === 'COMPLETED' && (
                  <Badge variant="success" size="sm">
                    Feedback Recorded
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Interview"
        description="Select candidate, assign interviewer, and specify meeting details"
        size="lg"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          {scheduleError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scheduleError}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Select Candidate Application"
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              options={applications.map((app) => ({
                label: `${app.candidate?.user?.name} (${app.job?.title})`,
                value: app.id,
              }))}
            />

            <Select
              label="Assign Interviewer"
              value={selectedInterviewerId}
              onChange={(e) => setSelectedInterviewerId(e.target.value)}
              options={members.map((m) => ({
                label: `${m.user.name} (${m.organizationRole})`,
                value: m.user.id,
              }))}
            />

            <Input
              label="Date & Time"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />

            <Select
              label="Duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              options={[
                { label: '30 Minutes', value: 30 },
                { label: '45 Minutes', value: 45 },
                { label: '60 Minutes', value: 60 },
                { label: '90 Minutes', value: 90 },
              ]}
            />

            <Select
              label="Interview Type"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              options={[
                { label: 'Technical Screening', value: 'TECHNICAL' },
                { label: 'Behavioral & Leadership', value: 'BEHAVIORAL' },
                { label: 'HR / Culture Fit', value: 'HR' },
                { label: 'Final Executive Round', value: 'FINAL' },
              ]}
            />

            <Input
              label="Meeting Link (Google Meet / Zoom URL)"
              placeholder="https://meet.google.com/xyz-abc"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>

          <Textarea
            label="Internal Notes / Focus Areas"
            placeholder="Focus on systems design, concurrency, or communication..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingSchedule}>
              Confirm Interview Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Feedback Scorecard Modal */}
      <Modal
        isOpen={!!activeInterviewForFeedback}
        onClose={() => setActiveInterviewForFeedback(null)}
        title={`Candidate Scorecard: ${activeInterviewForFeedback?.application?.candidate?.user?.name}`}
        description={`Submit structured evaluation and hiring recommendation`}
        size="lg"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          {feedbackError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {feedbackError}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              label="Overall Rating (1 - 5)"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              options={[
                { label: '5 - Exceptional', value: 5 },
                { label: '4 - Strong', value: 4 },
                { label: '3 - Meets Expectations', value: 3 },
                { label: '2 - Below Expectations', value: 2 },
                { label: '1 - Poor', value: 1 },
              ]}
            />

            <Select
              label="Technical Competency"
              value={technicalSkills}
              onChange={(e) => setTechnicalSkills(Number(e.target.value))}
              options={[
                { label: '5 - Expert', value: 5 },
                { label: '4 - Proficient', value: 4 },
                { label: '3 - Competent', value: 3 },
                { label: '2 - Needs Guidance', value: 2 },
                { label: '1 - Inadequate', value: 1 },
              ]}
            />

            <Select
              label="Recommendation"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              options={[
                { label: 'Strong Hire', value: 'STRONG_HIRE' },
                { label: 'Hire', value: 'HIRE' },
                { label: 'Neutral / Hold', value: 'NEUTRAL' },
                { label: 'No Hire', value: 'NO_HIRE' },
                { label: 'Strong No Hire', value: 'STRONG_NO_HIRE' },
              ]}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Textarea
              label="Key Strengths"
              placeholder="Deep domain knowledge, excellent architecture..."
              rows={3}
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
            />

            <Textarea
              label="Areas for Growth / Weaknesses"
              placeholder="Limited experience with cloud deployments..."
              rows={3}
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
            />
          </div>

          <Textarea
            label="Detailed Comments & Assessment Summary"
            placeholder="Comprehensive candidate evaluation notes..."
            rows={4}
            required
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setActiveInterviewForFeedback(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingFeedback}>
              Submit Scorecard
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

