import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CandidateProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  ExternalLink,
  Github,
  Linkedin,
} from 'lucide-react';

export const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCandidate = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/candidates/${id}`);
        setCandidate(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load candidate details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCandidate();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Candidate Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This candidate record is not available.'}</p>
        <Link to="/recruiter/candidates">
          <Button size="sm" variant="outline">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Pool
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/recruiter/candidates" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Candidate Pool
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-primary-500/10 shrink-0">
            {candidate.user?.name.charAt(0) || 'C'}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">{candidate.user?.name}</h1>
            <p className="text-sm font-medium text-slate-600">{candidate.headline || 'Candidate'}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {candidate.user?.email}
              </span>
              {candidate.user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.user.phone}
                </span>
              )}
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2">
          {candidate.resumeUrl && (
            <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
              <Button size="sm">
                <FileText className="w-3.5 h-3.5" />
                View Full Resume
              </Button>
            </a>
          )}
          <div className="flex gap-2">
            {candidate.linkedinUrl && (
              <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-primary-600">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {candidate.githubUrl && (
              <a href={candidate.githubUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900">
                <Github className="w-4 h-4" />
              </a>
            )}
            {candidate.portfolioUrl && (
              <a href={candidate.portfolioUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Summary */}
          {candidate.summary && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Candidate Bio & Summary</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {candidate.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Verified Skills Taxonomy</h3>
            {(!candidate.skills || candidate.skills.length === 0) ? (
              <p className="text-xs text-slate-400">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((item: any) => (
                  <Badge key={item.id} variant="primary" size="md">
                    {item.skill.name} {item.proficiency && `(${item.proficiency})`}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Applications history in this organization */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Applications History</h3>
            {(!candidate.applications || candidate.applications.length === 0) ? (
              <p className="text-xs text-slate-400">No applications on record.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {candidate.applications.map((app: any) => (
                  <div key={app.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{app.job?.title}</p>
                      <span className="text-[10px] text-slate-400">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="primary" size="sm">{app.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar specs */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Career Snapshot</h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Experience:</span>
                <span className="font-semibold text-slate-800">{candidate.experienceYears || 0} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Role:</span>
                <span className="font-semibold text-slate-800">{candidate.currentPosition || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Employer:</span>
                <span className="font-semibold text-slate-800">{candidate.currentCompany || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Notice Period:</span>
                <span className="font-semibold text-slate-800">{candidate.noticePeriod || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Compensation:</span>
                <span className="font-semibold text-slate-800">
                  {candidate.expectedSalary ? `$${Number(candidate.expectedSalary).toLocaleString()}/yr` : 'Flexible'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

