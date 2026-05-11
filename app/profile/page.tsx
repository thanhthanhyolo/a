'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, User, MapPin, GraduationCap, Link as LinkIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    bio: '',
    address: '',
    university: '',
    major: '',
    gpa: '',
    graduation_year: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        address: profile.address || '',
        university: profile.university || '',
        major: profile.major || '',
        gpa: profile.gpa?.toString() || '',
        graduation_year: profile.graduation_year?.toString() || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        bio: form.bio,
        address: form.address,
        university: form.university,
        major: form.major,
        gpa: form.gpa ? parseFloat(form.gpa) : null,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
        linkedin_url: form.linkedin_url,
        portfolio_url: form.portfolio_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated');
      refreshProfile();
    }
    setSaving(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="mt-1 text-muted-foreground">Keep your profile up to date for better job matching</p>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" /> Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+84 xxx xxx xxx" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell employers about yourself..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ho Chi Minh City, Vietnam" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5" /> Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>University</Label>
                  <Input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="Bach Khoa University" />
                </div>
                <div className="space-y-2">
                  <Label>Major</Label>
                  <Input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} placeholder="Computer Science" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>GPA</Label>
                  <Input value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} placeholder="3.5" type="number" step="0.1" min="0" max="4" />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} placeholder="2026" type="number" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><LinkIcon className="h-5 w-5" /> Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/yourprofile" />
              </div>
              <div className="space-y-2">
                <Label>Portfolio</Label>
                <Input value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} placeholder="https://yourportfolio.com" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gradient-primary border-0 text-white px-8">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
