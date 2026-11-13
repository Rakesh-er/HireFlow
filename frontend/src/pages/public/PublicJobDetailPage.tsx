import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  MapPin,
  Building2,
  DollarSign,
  Briefcase,
  Calendar,
  CheckCircle2,
  Upload,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export const PublicJobDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [applyError, setApplyError] = useState<string>('');

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/public/jobs/${slug}`);
        setJob(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchJob();
    }
  }, [slug]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/jobs/${slug}` } });
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSubmitting(true);
    setApplyError('');

    try {
      let resumeUrl = user?.candidateProfile?.resumeUrl || '';

      // Upload resume if a new file was selected
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const uploadRes = await api.post('/candidates/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        resumeUrl = uploadRes.data.data.resumeUrl;
      }

      if (!resumeUrl) {
        setApplyError('Please upload a resume (PDF, DOC, DOCX) to apply.');
        setIsSubmitting(false);
        return;
      }

      // Submit application
      await api.post('/applications', {
        jobId: job.id,
        resumeUrl,
        coverLetter,
      });

      setSubmitSuccess(true);
    } catch (err: any) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Job Opening Not Available</h2>
        <p className="text-sm text-slate-500">{error || 'This job opening could not be found or has been closed.'}</p>
        <Link to="/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl space-y-8">
      {/* Back button */}
      <div>
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all jobs
        </Link>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">{job.department}</Badge>
              <Badge variant="outline" size="sm">{job.workplaceType.replace('_', ' ')}</Badge>
              <Badge variant="default" size="sm">{job.employmentType.replace('_', ' ')}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>
            <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{job.organization?.name}</span>
              {job.organization?.location && (
                <span className="text-slate-400 font-normal">• {job.organization.location}</span>
              )}
            </p>
          </div>

          <div>
            <Button size="lg" onClick={handleApplyClick} className="w-full md:w-auto shadow-sm">
              Apply for this Position
            </Button>
          </div>
        </div>

        {/* Quick specs grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Location
            </span>
            <p className="font-semibold text-slate-800">{job.location}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Salary Range
            </span>
            <p className="font-semibold text-slate-800">
              {job.salaryMin && job.salaryMax
                ? `$${Math.round(job.salaryMin / 1000)}k - $${Math.round(job.salaryMax / 1000)}k`
                : 'Competitive'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Experience
            </span>
            <p className="font-semibold text-slate-800">{job.experienceMin}+ years</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Openings
            </span>
            <p className="font-semibold text-slate-800">{job.openings} positions</p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">About the Role</h3>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Key Requirements</h3>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Responsibilities</h3>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.responsibilities}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">About {job.organization?.name}</h4>
            {job.organization?.description && (
              <p className="text-xs text-slate-500 leading-relaxed">
                {job.organization.description}
              </p>
            )}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              {job.organization?.industry && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Industry:</span>
                  <span className="font-semibold text-slate-700">{job.organization.industry}</span>
                </div>
              )}
              {job.organization?.companySize && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Company Size:</span>
                  <span className="font-semibold text-slate-700">{job.organization.companySize} employees</span>
                </div>
              )}
              {job.organization?.website && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Website:</span>
                  <a
                    href={job.organization.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary-600 hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <h4 className="font-bold text-indigo-900 text-sm">Application Checklist</h4>
            <ul className="text-xs text-indigo-800/80 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Up-to-date resume in PDF, DOC, or DOCX format</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Brief cover letter stating why you are a great fit</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Direct notification updates as your application progresses</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
        description={`Submit your application to ${job.organization?.name}`}
      >
        {submitSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Your application has been delivered to the hiring team. You can monitor stage updates in your Candidate Dashboard.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Button onClick={() => setIsApplyModalOpen(false)} variant="outline">
                Close
              </Button>
              <Link to="/candidate/applications">
                <Button>Go to My Applications</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            {applyError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                {applyError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Resume / CV (PDF, DOC, DOCX)
              </label>
              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="resume-file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                />
                <label htmlFor="resume-file" className="cursor-pointer space-y-1 block">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    {resumeFile ? resumeFile.name : 'Click to select or replace resume file'}
                  </p>
                  <p className="text-[11px] text-slate-400">PDF, DOC, or DOCX (Max 10MB)</p>
                </label>
              </div>
              {user?.candidateProfile?.resumeUrl && !resumeFile && (
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                  ✓ Profile resume on file will be used unless you upload a new one.
                </p>
              )}
            </div>

            <Textarea
              label="Cover Letter / Note to Recruiter"
              placeholder="Highlight your key achievements and why you're excited about this role..."
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

