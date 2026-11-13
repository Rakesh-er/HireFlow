import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Organization } from '../../types';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Building2, Save, CheckCircle2 } from 'lucide-react';

export const CompanySettingsPage: React.FC = () => {
  const [org, setOrg] = useState<Organization | null>(null);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await api.get('/organizations/current');
        const data = response.data.data;
        setOrg(data);
        setName(data.name || '');
        setWebsite(data.website || '');
        setIndustry(data.industry || '');
        setCompanySize(data.companySize || '');
        setLocation(data.location || '');
        setDescription(data.description || '');
      } catch (err) {
        console.error('Failed to load organization profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrg();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.patch('/organizations/current', {
        name,
        website: website || undefined,
        industry: industry || undefined,
        companySize: companySize || undefined,
        location: location || undefined,
        description: description || undefined,
      });

      setSuccessMsg('Company profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update company profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Company Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your organization profile, branding, and careers page information.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 space-y-6">
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Organization Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<Building2 className="w-4 h-4" />}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Website URL"
              placeholder="https://company.example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <Input
              label="Industry / Domain"
              placeholder="e.g. Enterprise Software, FinTech"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />

            <Input
              label="Company Size"
              placeholder="e.g. 50-100 employees"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
            />

            <Input
              label="Headquarters Location"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <Textarea
            label="Company Overview & Bio"
            placeholder="Tell candidates about your company culture, mission, and benefits..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

