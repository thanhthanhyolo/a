'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Briefcase, DollarSign, Building2, Filter, X } from 'lucide-react';
import type { Job } from '@/lib/types';

const jobTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'fulltime', label: 'Full-time' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

const experienceLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'entry', label: 'Entry' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
];

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('all');
  const [expLevel, setExpLevel] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(0);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*, company:companies(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      setJobs(data || []);
      setFiltered(data || []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = jobs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q) || j.category.toLowerCase().includes(q)
      );
    }
    if (jobType !== 'all') result = result.filter((j) => j.job_type === jobType);
    if (expLevel !== 'all') result = result.filter((j) => j.experience_level === expLevel);
    if (remoteOnly) result = result.filter((j) => j.is_remote);
    setFiltered(result);
  }, [search, jobType, expLevel, remoteOnly, jobs]);

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Negotiable';
    const fmt = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v.toLocaleString('vi-VN');
    if (min && max) return `${fmt(min)} - ${fmt(max)} VND`;
    return min ? `From ${fmt(min)} VND` : `Up to ${fmt(max)} VND`;
  };

  const clearFilters = () => {
    setSearch('');
    setJobType('all');
    setExpLevel('all');
    setRemoteOnly(false);
  };

  const hasFilters = search || jobType !== 'all' || expLevel !== 'all' || remoteOnly;

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Find Your Next Opportunity</h1>
          <p className="mt-1 text-muted-foreground">
            {filtered.length} job{filtered.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search jobs, skills, companies..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>{jobTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={expLevel} onValueChange={setExpLevel}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>{experienceLevels.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant={remoteOnly ? 'default' : 'outline'} onClick={() => setRemoteOnly(!remoteOnly)} className="whitespace-nowrap">
                Remote
              </Button>
            </div>
            {hasFilters && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {search && <Badge variant="secondary" className="text-xs">Search: {search}</Badge>}
                {jobType !== 'all' && <Badge variant="secondary" className="text-xs">{jobType}</Badge>}
                {expLevel !== 'all' && <Badge variant="secondary" className="text-xs">{expLevel}</Badge>}
                {remoteOnly && <Badge variant="secondary" className="text-xs">Remote</Badge>}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                  <X className="mr-1 h-3 w-3" /> Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <CardContent className="p-6"><div className="h-24 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-medium">No jobs found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
              {hasFilters && <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => {
              const company = job.company as Record<string, unknown> | undefined;
              return (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="border-0 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            {company?.logo_url ? (
                              <img src={company.logo_url as string} alt="" className="h-8 w-8 rounded" />
                            ) : (
                              <Building2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold truncate">{job.title}</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">{(company?.name as string) || 'Company'}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              {job.address && (
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.address}</span>
                              )}
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatSalary(job.salary_min, job.salary_max)}</span>
                              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.experience_level}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge variant="secondary" className="capitalize">{job.job_type}</Badge>
                          {job.is_remote && <Badge variant="outline">Remote</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
