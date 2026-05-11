'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, Briefcase, DollarSign, Building2, Clock, ArrowLeft, CircleCheck as CheckCircle2, Globe, GraduationCap, Send } from 'lucide-react';
import type { Job } from '@/lib/types';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*, company:companies(*)')
        .eq('id', id)
        .maybeSingle();
      setJob(data);
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (user && job) {
      supabase
        .from('applications')
        .select('id')
        .eq('job_id', job.id)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setHasApplied(!!data));
    }
  }, [user, job]);

  const handleApply = async () => {
    if (!user) { router.push('/login'); return; }
    setApplying(true);
    const { error } = await supabase.from('applications').insert({
      job_id: job!.id,
      user_id: user.id,
      cover_letter: coverLetter,
      status: 'applied',
    });
    if (error) {
      toast.error('Failed to apply');
    } else {
      toast.success('Application submitted!');
      setHasApplied(true);
    }
    setApplying(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!job) return <div className="flex min-h-screen items-center justify-center"><p>Job not found</p></div>;

  const company = job.company as Record<string, unknown> | undefined;
  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Negotiable';
    const fmt = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v.toLocaleString('vi-VN');
    return min && max ? `${fmt(min)} - ${fmt(max)} VND` : 'Negotiable';
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {company?.logo_url ? (
                      <img src={company.logo_url as string} alt="" className="h-10 w-10 rounded" />
                    ) : (
                      <Building2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <p className="mt-1 text-muted-foreground">{(company?.name as string) || 'Company'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize">{job.job_type}</Badge>
                      <Badge variant="outline" className="capitalize">{job.experience_level}</Badge>
                      {job.is_remote && <Badge variant="outline">Remote</Badge>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="text-sm font-medium">{formatSalary(job.salary_min, job.salary_max)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{job.address || 'Remote'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="text-sm font-medium capitalize">{job.experience_level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="text-sm font-medium">{job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('vi-VN') : 'Open'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{job.description}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-lg">Requirements</CardTitle></CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{job.requirements}</div>
              </CardContent>
            </Card>

            {job.benefits && (
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg">Benefits</CardTitle></CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{job.benefits}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Apply */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm sticky top-24">
              <CardHeader><CardTitle className="text-lg">Apply for this position</CardTitle></CardHeader>
              <CardContent>
                {hasApplied ? (
                  <div className="flex flex-col items-center py-4 text-center">
                    <CheckCircle2 className="mb-3 h-12 w-12 text-green-500" />
                    <p className="font-medium">Already Applied</p>
                    <p className="mt-1 text-xs text-muted-foreground">Your application is being reviewed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cover Letter</Label>
                      <Textarea
                        placeholder="Why are you a good fit for this role?"
                        rows={6}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleApply}
                      disabled={applying || !user}
                      className="w-full gradient-primary border-0 text-white"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </Button>
                    {!user && (
                      <p className="text-center text-xs text-muted-foreground">
                        Please <a href="/login" className="text-primary underline">sign in</a> to apply
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
