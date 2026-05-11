'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Brain, Upload, FileText, Target, TrendingUp, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Lightbulb, Sparkles } from 'lucide-react';

interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  skillMatch: Record<string, number>;
}

export default function CVAnalyzerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!cvText.trim() || !jdText.trim()) {
      toast.error('Please paste both your CV content and the Job Description');
      return;
    }
    setAnalyzing(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cv-analyzer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cv: cvText, jd: jdText }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        // Fallback: client-side analysis
        const cvWords = new Set(cvText.toLowerCase().split(/\s+/));
        const jdWords = jdText.toLowerCase().split(/\s+/);
        const commonTechTerms = ['javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql', 'git', 'docker', 'aws', 'figma', 'agile', 'rest', 'api', 'css', 'html'];
        const matchedSkills = commonTechTerms.filter((term) => cvWords.has(term) && jdWords.includes(term));
        const jdSkills = commonTechTerms.filter((term) => jdWords.includes(term));
        const matchScore = jdSkills.length > 0 ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 50;

        setResult({
          matchScore,
          strengths: matchedSkills.map((s) => `Strong match: ${s}`),
          gaps: jdSkills.filter((s) => !matchedSkills.includes(s)).map((s) => `Missing: ${s}`),
          suggestions: ['Add more relevant keywords to your CV', 'Highlight project experience with required technologies', 'Quantify your achievements with metrics'],
          skillMatch: Object.fromEntries(jdSkills.map((s) => [s, cvWords.has(s) ? 100 : 0])),
        });
      }
    } catch {
      // Fallback analysis
      const cvWords = new Set(cvText.toLowerCase().split(/\s+/));
      const commonTechTerms = ['javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql', 'git', 'docker', 'aws', 'figma', 'agile', 'rest', 'api', 'css', 'html'];
      const jdWords = jdText.toLowerCase().split(/\s+/);
      const matchedSkills = commonTechTerms.filter((term) => cvWords.has(term) && jdWords.includes(term));
      const jdSkills = commonTechTerms.filter((term) => jdWords.includes(term));
      const matchScore = jdSkills.length > 0 ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 50;

      setResult({
        matchScore,
        strengths: matchedSkills.map((s) => `Strong match: ${s}`),
        gaps: jdSkills.filter((s) => !matchedSkills.includes(s)).map((s) => `Missing: ${s}`),
        suggestions: ['Add more relevant keywords to your CV', 'Highlight project experience with required technologies', 'Quantify your achievements with metrics'],
        skillMatch: Object.fromEntries(jdSkills.map((s) => [s, cvWords.has(s) ? 100 : 0])),
      });
    }

    setAnalyzing(false);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" /> AI CV Analyzer
          </h1>
          <p className="mt-1 text-muted-foreground">Paste your CV and a Job Description to get an AI-powered match analysis</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Your CV Content</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your CV/resume content here..."
                rows={12}
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="resize-none"
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" /> Job Description</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here..."
                rows={12}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={handleAnalyze} disabled={analyzing} size="lg" className="gradient-primary border-0 text-white px-12">
            <Sparkles className="mr-2 h-5 w-5" />
            {analyzing ? 'Analyzing...' : 'Analyze Match'}
          </Button>
        </div>

        {result && (
          <div className="mt-8 space-y-6">
            {/* Match Score */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Match Score</p>
                <p className={`text-6xl font-bold ${scoreColor(result.matchScore)}`}>{result.matchScore}%</p>
                <Progress value={result.matchScore} className="mt-4 h-3 max-w-md mx-auto" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {result.matchScore >= 80 ? 'Excellent match! You should apply.' : result.matchScore >= 60 ? 'Good potential. Consider addressing the gaps.' : 'Significant gaps. Review suggestions below.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Strengths */}
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5" /> Strengths</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                    {result.strengths.length === 0 && <p className="text-sm text-muted-foreground">No strong matches found</p>}
                  </ul>
                </CardContent>
              </Card>

              {/* Gaps */}
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-red-600"><AlertCircle className="h-5 w-5" /> Gaps</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        {g}
                      </li>
                    ))}
                    {result.gaps.length === 0 && <p className="text-sm text-muted-foreground">No significant gaps found</p>}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /> Suggestions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Skill Match Breakdown */}
            {Object.keys(result.skillMatch).length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Skill Match Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(result.skillMatch).map(([skill, score]) => (
                      <div key={skill} className="flex items-center gap-3">
                        <span className="w-24 text-sm capitalize truncate">{skill}</span>
                        <Progress value={score} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-10">{score}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
