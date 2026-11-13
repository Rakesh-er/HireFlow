import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA / Remote');
  const [openings, setOpenings] = useState(1);
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [workplaceType, setWorkplaceType] = useState('HYBRID');
  const [experienceMin, setExperienceMin] = useState(3);
  const [experienceMax, setExperienceMax] = useState(6);
  const [salaryMin, setSalaryMin] = useState(120000);
  const [salaryMax, setSalaryMax] = useState(160000);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/jobs', {
        title,
        department,
        location,
        openings: Number(openings),
        employmentType,
        workplaceType,
        experienceMin: Number(experienceMin),
        experienceMax: Number(experienceMax),
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        description,
        requirements,
        responsibilities,
        status,
      });

      navigate('/recruiter/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job opening.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Jobs
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Job Opening</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish an opening to the public careers board and start receiving applications.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Job Title"
                placeholder="e.g. Senior Frontend Engineer"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <Input
              label="Department"
              placeholder="e.g. Engineering, Design, Product"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />

            <Input
              label="Location"
              placeholder="e.g. San Francisco, CA / Remote"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Select
              label="Employment Type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              options={[
                { label: 'Full Time', value: 'FULL_TIME' },
                { label: 'Part Time', value: 'PART_TIME' },
                { label: 'Contract', value: 'CONTRACT' },
                { label: 'Internship', value: 'INTERNSHIP' },
              ]}
            />

            <Select
              label="Workplace Type"
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value)}
              options={[
                { label: 'Hybrid', value: 'HYBRID' },
                { label: 'On-Site', value: 'ON_SITE' },
                { label: 'Remote', value: 'REMOTE' },
              ]}
            />

            <Input
              label="Minimum Experience (Years)"
              type="number"
              min={0}
              value={experienceMin}
              onChange={(e) => setExperienceMin(Number(e.target.value))}
            />

            <Input
              label="Maximum Experience (Years)"
              type="number"
              min={0}
              value={experienceMax}
              onChange={(e) => setExperienceMax(Number(e.target.value))}
            />

            <Input
              label="Minimum Salary (USD / Annual)"
              type="number"
              min={0}
              value={salaryMin}
              onChange={(e) => setSalaryMin(Number(e.target.value))}
            />

            <Input
              label="Maximum Salary (USD / Annual)"
              type="number"
              min={0}
              value={salaryMax}
              onChange={(e) => setSalaryMax(Number(e.target.value))}
            />

            <Input
              label="Number of Openings"
              type="number"
              min={1}
              value={openings}
              onChange={(e) => setOpenings(Number(e.target.value))}
            />

            <Select
              label="Initial Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { label: 'Published (Immediate Public Listing)', value: 'PUBLISHED' },
                { label: 'Draft (Internal Review)', value: 'DRAFT' },
              ]}
            />
          </div>

          <Textarea
            label="Job Description"
            placeholder="Detailed description of the role, impact, and team environment..."
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Textarea
            label="Key Requirements"
            placeholder="• 4+ years of TypeScript/React experience&#10;• Experience designing distributed systems&#10;• Strong communication skills..."
            rows={5}
            required
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />

          <Textarea
            label="Core Responsibilities (Optional)"
            placeholder="• Architect and ship scalable full-stack features&#10;• Conduct code reviews and mentor peers..."
            rows={4}
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/recruiter/jobs">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              <Save className="w-4 h-4" />
              Save and Create Opening
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

