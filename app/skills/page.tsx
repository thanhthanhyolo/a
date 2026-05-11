'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { GraduationCap, Award, CircleCheck as CheckCircle2, Clock, Trophy, Brain } from 'lucide-react';
import type { SkillTest, SkillTestAttempt, UserBadge, UserSkill } from '@/lib/types';

export default function SkillsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<SkillTest[]>([]);
  const [attempts, setAttempts] = useState<SkillTestAttempt[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [activeTest, setActiveTest] = useState<SkillTest | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [testsRes, attemptsRes, badgesRes, skillsRes] = await Promise.all([
        supabase.from('skill_tests').select('*, skill:skills(*)').eq('is_active', true),
        supabase.from('skill_test_attempts').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }),
        supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id),
        supabase.from('user_skills').select('*, skill:skills(*)').eq('user_id', user.id),
      ]);
      setTests(testsRes.data || []);
      setAttempts(attemptsRes.data || []);
      setBadges(badgesRes.data || []);
      setUserSkills(skillsRes.data || []);
    };
    fetchData();
  }, [user]);

  const startTest = (test: SkillTest) => {
    setActiveTest(test);
    setAnswers({});
  };

  const submitTest = async () => {
    if (!activeTest || !user) return;
    setSubmitting(true);
    const { data: questions } = await supabase
      .from('skill_test_questions')
      .select('*')
      .eq('test_id', activeTest.id)
      .order('sort_order');
    let score = 0;
    let total = 0;
    (questions || []).forEach((q, i) => {
      total += q.points;
      if (answers[i] === q.correct_answer) score += q.points;
    });
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = percentage >= activeTest.passing_score;

    await supabase.from('skill_test_attempts').insert({
      test_id: activeTest.id,
      user_id: user.id,
      answers,
      score: percentage,
      passed,
      completed_at: new Date().toISOString(),
    });

    if (passed) {
      const { data: badgeData } = await supabase.from('badges').select('id').eq('skill_id', activeTest.skill_id).eq('badge_type', 'skill').limit(1);
      if (badgeData && badgeData.length > 0) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badgeData[0].id,
        });
      }
      toast.success(`Passed! Score: ${percentage}%`);
    } else {
      toast.error(`Not passed. Score: ${percentage}% (need ${activeTest.passing_score}%)`);
    }

    setActiveTest(null);
    setSubmitting(false);
  };

  const hasAttempted = (testId: string) => attempts.some((a) => a.test_id === testId);
  const bestScore = (testId: string) => {
    const testAttempts = attempts.filter((a) => a.test_id === testId);
    return testAttempts.length > 0 ? Math.max(...testAttempts.map((a) => a.score)) : null;
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Skill Tests & Badges</h1>
          <p className="mt-1 text-muted-foreground">Prove your skills and earn verified badges</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Available Tests</CardTitle></CardHeader>
              <CardContent>
                {tests.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Brain className="mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No tests available yet. Check back soon!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tests.map((test) => {
                      const score = bestScore(test.id);
                      const attempted = hasAttempted(test.id);
                      return (
                        <div key={test.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{test.title}</h3>
                              <Badge variant="secondary" className="text-xs capitalize">{test.test_type}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {test.skill?.name || 'General'} - {test.duration_minutes} min - Pass: {test.passing_score}%
                            </p>
                            {score !== null && (
                              <div className="mt-2 flex items-center gap-2">
                                <Progress value={score} className="h-1.5 w-24" />
                                <span className="text-xs text-muted-foreground">Best: {score}%</span>
                                {score >= test.passing_score && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => startTest(test)}
                            className={attempted ? '' : 'gradient-primary border-0 text-white'}
                            variant={attempted ? 'outline' : 'default'}
                          >
                            {attempted ? 'Retake' : 'Start'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" /> Your Badges</CardTitle></CardHeader>
              <CardContent>
                {badges.length === 0 ? (
                  <div className="text-center py-4">
                    <Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">Pass skill tests to earn badges</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((ub) => (
                      <div key={ub.id} className="flex flex-col items-center gap-1 rounded-lg border p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                          <Award className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-[10px] text-center font-medium">{ub.badge?.name || 'Badge'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-lg">Your Skills</CardTitle></CardHeader>
              <CardContent>
                {userSkills.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Add skills in your profile</p>
                ) : (
                  <div className="space-y-2">
                    {userSkills.map((us) => (
                      <div key={us.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <span className="text-sm">{us.skill?.name || 'Skill'}</span>
                        <Badge variant="secondary" className="text-xs capitalize">{us.proficiency}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Test Dialog */}
      <Dialog open={!!activeTest} onOpenChange={() => setActiveTest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeTest?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-muted-foreground">Answer the questions below. Time limit: {activeTest?.duration_minutes} minutes.</p>
            {/* Placeholder questions for demo */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <p className="text-sm font-medium">Question {i}: Sample question text?</p>
                <div className="space-y-1.5">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={opt}
                        checked={answers[i] === opt}
                        onChange={() => setAnswers({ ...answers, [i]: opt })}
                      />
                      <span className="text-sm">Option {opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={submitTest} disabled={submitting} className="w-full gradient-primary border-0 text-white mt-4">
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
