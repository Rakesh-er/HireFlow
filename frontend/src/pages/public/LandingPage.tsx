import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowRight,
  KanbanSquare,
  Users,
  Calendar,
  ShieldCheck,
  Zap,
  BarChart2,
  Sparkles,
  MapPin,
  Building2,
  DollarSign,
  Briefcase,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);

  useEffect(() => {
    api.get('/public/jobs', { params: { limit: 3, sort: 'newest' } })
      .then((res) => {
        setFeaturedJobs(res.data.data || []);
      })
      .catch((err) => {
        console.warn('Could not load featured jobs:', err);
      })
      .finally(() => {
        setIsLoadingJobs(false);
      });
  }, []);

  return (
    <div className="space-y-20 py-12 md:py-16 overflow-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200/60 text-primary-700 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Applicant Tracking & Recruitment OS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          Hire top talent faster with an intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">recruitment pipeline</span>.
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From posting job openings to candidate scoring and seamless interview scheduling. HireFlow provides enterprise organizations with total recruitment clarity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/register?role=RECRUITER">
            <Button size="lg" className="w-full sm:w-auto shadow-md shadow-primary-500/20">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Open Positions
            </Button>
          </Link>
        </div>

        {/* ATS Pipeline Visual Preview */}
        <div className="pt-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xl shadow-indigo-500/10 max-w-5xl mx-auto">
            <div className="rounded-xl bg-slate-900 p-6 text-left text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-400 ml-2 font-mono">hireflow-ats-pipeline.view</span>
                </div>
                <div className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-md">
                  Active Organization: Acme Corp
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Applied (12)</span>
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 text-xs space-y-1">
                    <p className="font-semibold text-white">Alex Rivera</p>
                    <p className="text-slate-400">Senior Full Stack Engineer</p>
                    <span className="inline-block text-[10px] text-indigo-400 font-mono">Score: 94%</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase">Screening (6)</span>
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 text-xs space-y-1">
                    <p className="font-semibold text-white">Elena Rostova</p>
                    <p className="text-slate-400">Lead Product Designer</p>
                    <span className="inline-block text-[10px] text-amber-400 font-mono">Portfolio Approved</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-xs font-semibold text-indigo-400 uppercase">Interview (4)</span>
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 text-xs space-y-1">
                    <p className="font-semibold text-white">Marcus Chen</p>
                    <p className="text-slate-400">DevOps & Cloud Architect</p>
                    <span className="inline-block text-[10px] text-emerald-400 font-mono">Tomorrow, 2:00 PM</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase">Offered (2)</span>
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700 text-xs space-y-1">
                    <p className="font-semibold text-white">Sophia Zhang</p>
                    <p className="text-slate-400">Staff Backend Engineer</p>
                    <span className="inline-block text-[10px] text-emerald-400 font-mono">Offer Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Live Positions Section (Connected Directly to Database) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Live Opportunities</h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Open Positions</p>
          </div>
          <Link to="/jobs">
            <Button variant="ghost" size="sm" className="text-primary-600 font-semibold hover:bg-primary-50">
              View All Openings ({featuredJobs.length > 0 ? `${featuredJobs.length}+` : 'Browse'})
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {isLoadingJobs ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No jobs currently published</p>
            <p className="text-xs text-slate-500 mt-1">Check back soon or sign in to publish openings.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-primary-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                      {job.department}
                    </span>
                    <Badge variant="primary" size="sm">
                      {job.workplaceType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.organization?.name || 'HireFlow Partner'}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location}
                    </span>
                    {job.salaryMin && (
                      <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
                        <DollarSign className="w-3 h-3" />
                        ${job.salaryMin.toLocaleString()} - ${job.salaryMax ? job.salaryMax.toLocaleString() : '+'}
                      </span>
                    )}
                  </div>
                </div>

                <Link to={`/jobs/${job.slug}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details & Apply
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Engineered for Modern Teams</h2>
          <p className="text-3xl font-bold text-slate-900">Everything you need to hire the best candidates</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <KanbanSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Interactive ATS Kanban</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Organize your recruitment pipeline across 8 standardized stages with stage transitions and candidate velocity tracking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Smart Interview Scheduling</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Coordinate between hiring managers and applicants with meeting links, time slots, and structured evaluation scorecards.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Multi-Tenant Data Isolation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Organization-level isolation and role-based access control guarantee complete data privacy for every employer.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Full Recruitment Analytics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Live funnel conversion metrics, time-to-hire graphs, source distribution, and job performance visualizations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Live Socket.IO Alerts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant in-app alerts when applicants apply, stage changes occur, or interview feedback is submitted by team members.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Candidate Self-Service</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Applicants get an interactive candidate portal to upload resumes, manage profiles, track application statuses, and view interviews.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-600 p-10 text-center text-white space-y-5 shadow-xl shadow-primary-500/20">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to transform your hiring workflow?
          </h2>
          <p className="text-primary-100 text-sm max-w-xl mx-auto">
            Join forward-thinking companies building high-performing teams with HireFlow.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-slate-100 font-semibold shadow-md">
                Get Started Today
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
