import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CandidateProfile } from '../../types';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  User,
  Upload,
  FileText,
  Save,
  CheckCircle2,
  X,
  Plus,
  ExternalLink,
} from 'lucide-react';

export const CandidateProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [expectedSalary, setExpectedSalary] = useState<number | ''>('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  // Skills
  const [skills, setSkills] = useState<Array<{ name: string; proficiency: string }>>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');

  // Resume upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await api.get('/candidates/profile/me');
      const data = response.data.data;
      setProfile(data);
      setHeadline(data.headline || '');
      setSummary(data.summary || '');
      setLocation(data.location || '');
      setExperienceYears(data.experienceYears || 0);
      setCurrentCompany(data.currentCompany || '');
      setCurrentPosition(data.currentPosition || '');
      setExpectedSalary(data.expectedSalary || '');
      setNoticePeriod(data.noticePeriod || '');
      setPortfolioUrl(data.portfolioUrl || '');
      setLinkedinUrl(data.linkedinUrl || '');
      setGithubUrl(data.githubUrl || '');

      if (data.skills) {
        setSkills(
          data.skills.map((s: any) => ({
            name: s.skill.name,
            proficiency: s.proficiency || 'Intermediate',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load candidate profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await api.patch('/candidates/profile', {
        headline,
        summary,
        location,
        experienceYears: Number(experienceYears),
        currentCompany,
        currentPosition,
        expectedSalary: expectedSalary ? Number(expectedSalary) : null,
        noticePeriod,
        portfolioUrl,
        linkedinUrl,
        githubUrl,
      });

      // Update skills
      await api.put('/candidates/skills', {
        skills,
      });

      setMessage('Profile and skills updated successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setResumeFile(file);

    setIsUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/candidates/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile(res.data.data.profile);
      setMessage('Resume uploaded and verified successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Resume upload failed.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) return;

    setSkills([...skills, { name: newSkillName.trim(), proficiency: newSkillProficiency }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillNameToRemove: string) => {
    setSkills(skills.filter((s) => s.name !== skillNameToRemove));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Profile & Resume</h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep your professional details, resume document, and skills up to date for hiring managers.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Resume Upload Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          Resume Document
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-800">
              {profile?.resumeUrl ? 'Active Resume On File' : 'No resume uploaded yet'}
            </p>
            <p className="text-[11px] text-slate-400">
              Accepted formats: PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {profile?.resumeUrl && (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Preview Resume
                </Button>
              </a>
            )}

            <div>
              <input
                type="file"
                id="profile-resume-input"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
              />
              <label htmlFor="profile-resume-input" className="inline-block cursor-pointer">
                <span className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 px-3 py-1.5 text-xs gap-1.5 bg-primary-600 hover:bg-primary-700 text-white shadow-sm select-none">
                  <Upload className="w-3.5 h-3.5" />
                  {isUploadingResume ? 'Uploading...' : profile?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Skills & Competencies</h3>

        <div className="flex flex-wrap gap-2 min-h-12 items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
          {skills.length === 0 ? (
            <p className="text-xs text-slate-400">No skills added yet.</p>
          ) : (
            skills.map((skill) => (
              <Badge key={skill.name} variant="primary" size="md" className="gap-1.5 pr-1.5">
                <span>{skill.name} ({skill.proficiency})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.name)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        <form onSubmit={handleAddSkill} className="flex gap-2">
          <Input
            placeholder="Add a skill (e.g. React, PostgreSQL, Docker)..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
          />
          <Button type="submit" size="sm">
            <Plus className="w-3.5 h-3.5" />
            Add Skill
          </Button>
        </form>
      </div>

      {/* General Details Form */}
      <form onSubmit={handleProfileSubmit} className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900">Career & Personal Information</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Professional Headline"
              placeholder="e.g. Senior Full Stack Engineer | React & Node.js Specialist"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <Input
            label="Location"
            placeholder="e.g. Seattle, WA or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Input
            label="Years of Experience"
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
          />

          <Input
            label="Current Position"
            placeholder="e.g. Lead Frontend Engineer"
            value={currentPosition}
            onChange={(e) => setCurrentPosition(e.target.value)}
          />

          <Input
            label="Current Company"
            placeholder="e.g. TechCorp Inc."
            value={currentCompany}
            onChange={(e) => setCurrentCompany(e.target.value)}
          />

          <Input
            label="Expected Annual Salary ($USD)"
            type="number"
            placeholder="150000"
            value={expectedSalary}
            onChange={(e) => setExpectedSalary(e.target.value ? Number(e.target.value) : '')}
          />

          <Input
            label="Notice Period"
            placeholder="e.g. Immediate, 2 Weeks, 1 Month"
            value={noticePeriod}
            onChange={(e) => setNoticePeriod(e.target.value)}
          />

          <Input
            label="LinkedIn Profile URL"
            placeholder="https://linkedin.com/in/username"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />

          <Input
            label="GitHub Profile URL"
            placeholder="https://github.com/username"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />

          <div className="sm:col-span-2">
            <Input
              label="Portfolio / Website URL"
              placeholder="https://myportfolio.dev"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </div>
        </div>

        <Textarea
          label="Professional Summary / Bio"
          placeholder="Brief summary of your background, architectural focus, and goals..."
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" isLoading={isSaving}>
            <Save className="w-4 h-4" />
            Save Profile & Skills
          </Button>
        </div>
      </form>
    </div>
  );
};

