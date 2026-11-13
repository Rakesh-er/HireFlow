import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CandidateProfile } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Search,
  MapPin,
  Briefcase,
  FileText,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

export const CandidatesDirectoryPage: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (location) params.location = location;

      const response = await api.get('/candidates', { params });
      setCandidates(response.data.data || []);
    } catch (err) {
      console.error('Failed to load candidate pool:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Talent Pool</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search vetted professionals across your applicant database and skills taxonomy.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:w-auto">
          <Input
            placeholder="Search candidate name, headline, or current position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>

        <div className="w-full sm:w-60">
          <Input
            placeholder="Filter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </div>

        <Button onClick={fetchCandidates}>Search Candidates</Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="We couldn't find any candidate profiles matching your query. Adjust your search criteria."
          actionText="Reset Search"
          onAction={() => {
            setSearch('');
            setLocation('');
            fetchCandidates();
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((c) => (
            <Card key={c.id} className="flex flex-col justify-between hover:border-primary-300">
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    {c.user?.name.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{c.user?.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{c.headline || 'Candidate'}</p>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {c.experienceYears ? `${c.experienceYears} yrs exp` : 'Entry level'}
                    </span>
                  </div>
                </div>

                {c.summary && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {c.summary}
                  </p>
                )}

                {/* Skills badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.skills?.slice(0, 4).map((item) => (
                    <Badge key={item.id} variant="default" size="sm">
                      {item.skill.name}
                    </Badge>
                  ))}
                  {(c.skills?.length || 0) > 4 && (
                    <Badge variant="outline" size="sm">
                      +{(c.skills?.length || 0) - 4} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {c.location || 'Location Not Set'}
                  </span>
                  {c.resumeUrl && (
                    <a
                      href={c.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" /> Resume
                    </a>
                  )}
                </div>
              </CardContent>

              <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
                <span className="text-[11px] text-slate-400">
                  {c.currentCompany ? `@ ${c.currentCompany}` : 'Available'}
                </span>
                <Link to={`/recruiter/candidates/${c.id}`}>
                  <Button size="sm" variant="ghost" className="text-xs font-medium">
                    Full Profile
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

