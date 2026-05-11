'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Brain, GraduationCap, TrendingUp, Award, FileText, Clock, CircleCheck as CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import type { Application, Job, UserBadge, MatchScore } from '@/lib/types';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [appsRes, matchesRes, badgesRes, jobsRes] = await Promise.all([
        supabase.from('applications').select('*, job:jobs(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('match_scores').select('*').eq('user_id', user.id).order('score', { ascending: false }).limit(5),
        supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id).order('awarded_at', { ascending: false }).limit(6),
        supabase.from('jobs').select('*, company:companies(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(4),
      ]);
      setApplications(appsRes.data || []);
      setMatchScores(matchesRes.data || []);
      setBadges(badgesRes.data || []);
      setRecentJobs(jobsRes.data || []);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user) return null;

  const isEmployer = profile?.role === 'employer';

  const statCards = isEmployer
    ? [
        { label: 'Active Jobs', value: '--', icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
        { label: 'Applications', value: '--', icon: FileText, color: 'text-teal-600 bg-teal-50' },
        { label: 'Credits', value: '--', icon: Zap, color: 'text-amber-600 bg-amber-50' },
        { label: 'Match Rate', value: '85%', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
      ]
    : [
        { label: 'Applications', value: applications.length.toString(), icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
        { label: 'Match Score', value: matchScores.length > 0 ? `${Math.round(matchScores[0].score)}%` : '--', icon: Brain, color: 'text-teal-600 bg-teal-50' },
        { label: 'Badges', value: badges.length.toString(), icon: Award, color: 'text-amber-600 bg-amber-50' },
        { label: 'Profile', value: profile?.is_verified ? 'Verified' : 'Pending', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
      ];

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {profile?.full_name || 'Student'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isEmployer ? 'Manage your hiring pipeline' : 'Track your career progress and discover new opportunities'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Jobs */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{isEmployer ? 'Your Posted Jobs' : 'Recommended Jobs'}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/jobs">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Briefcase className="mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No jobs found. Check back soon!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentJobs.map((job) => (
                      <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{job.title}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{(job as unknown as Record<string, unknown>).company && typeof (job as unknown as Record<string, unknown>).company === 'object' && ((job as unknown as Record<string, unknown>).company as Record<string, unknown>)?.name ? ((job as unknown as Record<string, unknown>).company as Record<string, unknown>).name as string : 'Company'}</span>
                            <span>-</span>
                            <span>{job.salary_min && job.salary_max ? `${(job.salary_min / 1000000).toFixed(0)}M - ${(job.salary_max / 1000000).toFixed(0)}M VND` : 'Salary negotiable'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{job.job_type}</Badge>
                          {job.is_remote && <Badge variant="outline" className="text-xs">Remote</Badge>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applications */}
            {!isEmployer && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No applications yet. Start applying to jobs!</p>
                      <Button size="sm" className="mt-3 gradient-primary border-0 text-white" asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((app) => (
                        <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{app.job?.title || 'Job'}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Applied {new Date(app.created_at).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <Badge variant={app.status === 'offered' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">
                            {app.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{profile?.bio ? '80%' : '40%'}</span>
                </div>
                <Progress value={profile?.bio ? 80 : 40} className="h-2" />
                <div className="mt-4 space-y-2">
                  {!profile?.bio && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> Add a bio</p>}
                  {!profile?.is_verified && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> Complete eKYC verification</p>}
                </div>
                <Button size="sm" variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/profile">Complete Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length === 0 ? (
                  <div className="text-center py-4">
                    <Award className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">Take skill tests to earn badges</p>
                    <Button size="sm" variant="outline" className="mt-3" asChild>
                      <Link href="/skills">Skill Tests</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {badges.map((ub) => (
                      <div key={ub.id} className="flex flex-col items-center gap-1 rounded-lg border p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                          <Award className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-[10px] text-center font-medium leading-tight">{ub.badge?.name || 'Badge'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/cv-analyzer"><Brain className="mr-2 h-4 w-4" /> AI CV Analyzer</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/skills"><GraduationCap className="mr-2 h-4 w-4" /> Take Skill Test</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/workspace"><Clock className="mr-2 h-4 w-4" /> Workspace</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
