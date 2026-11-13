import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const CandidateInterviewsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get('/candidates/me/applications');
        const apps = response.data.data || [];
        setApplications(apps);
      } catch (err) {
        console.error('Failed to load interviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // Extract all scheduled interviews across applications
  const allInterviews: any[] = [];
  applications.forEach((app) => {
    if (app.interviews && Array.isArray(app.interviews)) {
      app.interviews.forEach((interview: any) => {
        allInterviews.push({
          ...interview,
          jobTitle: app.job?.title,
          companyName: app.job?.organization?.name,
        });
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Interview Schedule</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review upcoming technical assessments, team discussions, and access virtual meeting links.
        </p>
      </div>

      {allInterviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled yet"
          description="When recruiters schedule an interview with you, meeting invites and links will appear here."
        />
      ) : (
        <div className="space-y-4">
          {allInterviews.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {item.interviewType}
                  </Badge>
                  <Badge
                    variant={item.status === 'COMPLETED' ? 'success' : 'default'}
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.jobTitle}</h3>

                <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.companyName}</span>
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.scheduledAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({item.duration}m)
                  </span>
                </div>
              </div>

              <div>
                {item.meetingLink ? (
                  <a href={item.meetingLink} target="_blank" rel="noreferrer">
                    <Button size="sm">
                      <Video className="w-3.5 h-3.5" />
                      Join Video Meeting
                    </Button>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Meeting link will be provided prior to interview
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

