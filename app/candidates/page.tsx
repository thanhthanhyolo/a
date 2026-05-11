'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, GraduationCap, Award, Clock as Unlock, Zap, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, UserSkill } from '@/lib/types';

export default function CandidatesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<(Profile & { skills?: UserSkill[]; match_score?: number })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'employer')) router.push('/dashboard');
  }, [user, profile, authLoading]);

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*, user_skills(*, skill:skills(*))')
        .eq('role', 'candidate')
        .eq('privacy_consent', true);
      setCandidates(data || []);
      setLoading(false);
    };
    const fetchCredits = async () => {
      if (!user) return;
      const { data } = await supabase.from('credits').select('balance').eq('user_id', user.id).maybeSingle();
      setCredits(data?.balance || 0);
    };
    fetchCandidates();
    fetchCredits();
  }, [user]);

  const filtered = candidates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.university?.toLowerCase().includes(q) ||
      c.major?.toLowerCase().includes(q) ||
      c.skills?.some((s) => s.skill?.name?.toLowerCase().includes(q))
    );
  });

  const handleUnlock = async (candidateId: string) => {
    if (credits < 10) {
      toast.error('Not enough credits. Please purchase more credits.');
      return;
    }
    const { error: creditError } = await supabase.from('credit_transactions').insert({
      user_id: user!.id,
      amount: -10,
      transaction_type: 'spend',
      description: 'Unlock candidate profile',
      reference_id: candidateId,
      reference_type: 'candidate',
    });
    if (creditError) { toast.error('Failed to unlock'); return; }
    await supabase.from('credits').update({ balance: credits - 10, updated_at: new Date().toISOString() }).eq('user_id', user!.id);
    setCredits(credits - 10);
    toast.success('Profile unlocked! You can now view full contact details.');
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Find Candidates</h1>
            <p className="mt-1 text-muted-foreground">{filtered.length} candidates with matching profiles</p>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="font-semibold">{credits}</span>
            <span className="text-sm text-muted-foreground">credits</span>
            <Button size="sm" variant="outline" asChild>
              <a href="/credits">Buy More</a>
            </Button>
          </div>
        </div>

        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, university, major, or skills..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <CardContent className="p-6"><div className="h-40 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((candidate) => (
              <Card key={candidate.id} className="border-0 shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                      {candidate.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{candidate.full_name}</h3>
                      {candidate.major && <p className="text-sm text-muted-foreground">{candidate.major}</p>}
                      {candidate.university && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <GraduationCap className="h-3 w-3" /> {candidate.university}
                        </p>
                      )}
                    </div>
                  </div>

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {candidate.skills.slice(0, 5).map((s) => (
                        <Badge key={s.id} variant="secondary" className="text-xs">
                          {s.skill?.name || 'Skill'}
                        </Badge>
                      ))}
                      {candidate.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">+{candidate.skills.length - 5}</Badge>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs text-muted-foreground">10 credits to unlock</span>
                    </div>
                    <Button size="sm" onClick={() => handleUnlock(candidate.id)} className="gradient-primary border-0 text-white">
                      <Unlock className="mr-1 h-3 w-3" /> Unlock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
