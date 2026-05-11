'use client';

import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Briefcase,
  Brain,
  Shield,
  Kanban,
  Wallet,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI CV Analyzer',
    description: 'Upload your CV and get AI-powered analysis with match scores against job descriptions.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: GraduationCap,
    title: 'AI Mock Interview',
    description: 'Practice interviews with AI that provides real-time feedback on your responses.',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    icon: Briefcase,
    title: 'Smart Job Matching',
    description: 'Auto-matching algorithm finds candidates with >80% match score for your positions.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Kanban,
    title: 'Digital Workspace',
    description: 'Kanban boards, time tracking, and project management for freelance work.',
    color: 'text-rose-600 bg-rose-50',
  },
  {
    icon: Wallet,
    title: 'Escrow Protection',
    description: 'Secure payments with milestone-based escrow. Platform fee included transparently.',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: Shield,
    title: 'ND 13/2023 Compliant',
    description: 'Full compliance with Vietnam data protection law. Privacy consent management built-in.',
    color: 'text-slate-600 bg-slate-50',
  },
];

const stats = [
  { value: '10,000+', label: 'Students', icon: Users },
  { value: '2,500+', label: 'Companies', icon: Briefcase },
  { value: '15,000+', label: 'Jobs Posted', icon: TrendingUp },
  { value: '85%', label: 'Match Rate', icon: Zap },
];

const testimonials = [
  {
    name: 'Nguyen Thi Lan',
    role: 'CS Student, HCMUT',
    text: 'The AI CV Analyzer helped me optimize my resume and I landed an internship at a top tech company within 2 weeks.',
    avatar: 'NL',
  },
  {
    name: 'Tran Van Minh',
    role: 'Freelance Developer',
    text: 'The escrow system gives me peace of mind. I always get paid for my work, and the workspace tools keep me organized.',
    avatar: 'TM',
  },
  {
    name: 'Pham Hoai Anh',
    role: 'HR Manager, FPT Software',
    text: 'Auto-matching saves us hours of screening. The >80% match score threshold means we only see qualified candidates.',
    avatar: 'PA',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              AI-Powered Career Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your Career Journey{' '}
              <span className="gradient-primary-text">Starts Here</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Vietnam&apos;s first AI-powered platform connecting students with jobs, freelance projects, and skill development. Compliant with ND 13/2023.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="gradient-primary border-0 text-white h-12 px-8 text-base">
                <Link href="/register">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
          <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
            <p className="mt-4 text-lg text-muted-foreground">A complete ecosystem for student career development</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="group overflow-hidden border-0 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${feature.color}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Create Profile', desc: 'Sign up, build your profile, and upload your CV for AI analysis.' },
              { step: '02', title: 'Get Matched', desc: 'Our AI matches you with jobs and projects that fit your skills.' },
              { step: '03', title: 'Grow & Earn', desc: 'Take skill tests, earn badges, work on projects with escrow protection.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Students & Companies</h2>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 sm:p-12">
            <div className="relative text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Launch Your Career?</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                Join thousands of Vietnamese students already finding opportunities on StudentHub.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="h-12 bg-white px-8 text-base font-semibold text-primary hover:bg-white/90">
                  <Link href="/register">Create Free Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 border-white/30 px-8 text-base text-white hover:bg-white/10">
                  <Link href="/jobs">Explore Jobs</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
