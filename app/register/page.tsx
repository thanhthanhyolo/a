'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'candidate',
    consent: false,
    dataProcessing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent || !form.dataProcessing) {
      toast.error('You must accept the privacy terms to continue (ND 13/2023)');
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, role: form.role },
      },
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: form.fullName,
        email: form.email,
        role: form.role,
        privacy_consent: form.consent,
        data_processing_consent: form.dataProcessing,
        consent_date: new Date().toISOString(),
      });
      await supabase.from('privacy_consents').insert([
        { user_id: data.user.id, consent_type: 'data_processing', is_granted: true, granted_at: new Date().toISOString() },
        { user_id: data.user.id, consent_type: 'third_party_sharing', is_granted: false },
        { user_id: data.user.id, consent_type: 'marketing', is_granted: false },
      ]);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Student<span className="gradient-primary-text">Hub</span></span>
          </Link>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join Vietnam&apos;s leading student career platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Nguyen Van A" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@university.edu.vn" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>I am a</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Student / Candidate</SelectItem>
                  <SelectItem value="employer">Employer / Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Checkbox id="consent" checked={form.consent} onCheckedChange={(v) => setForm({ ...form, consent: v as boolean })} className="mt-0.5" />
                <Label htmlFor="consent" className="text-xs leading-relaxed font-normal">
                  I agree to the <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> and consent to the processing of my personal data in accordance with ND 13/2023/ND-CP.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="dataProcessing" checked={form.dataProcessing} onCheckedChange={(v) => setForm({ ...form, dataProcessing: v as boolean })} className="mt-0.5" />
                <Label htmlFor="dataProcessing" className="text-xs leading-relaxed font-normal">
                  I consent to the processing of sensitive personal data (CV, skills, location) for job matching purposes.
                </Label>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary border-0 text-white" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
