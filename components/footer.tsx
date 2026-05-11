import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Student<span className="gradient-primary-text">Hub</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vietnam&apos;s leading platform connecting students with career opportunities, freelance projects, and skill development.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">For Students</h4>
            <div className="flex flex-col gap-2">
              <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Jobs</Link>
              <Link href="/skills" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Skill Tests</Link>
              <Link href="/workspace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Workspace</Link>
              <Link href="/cv-analyzer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI CV Analyzer</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">For Employers</h4>
            <div className="flex flex-col gap-2">
              <Link href="/candidates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Candidates</Link>
              <Link href="/jobs/post" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Post a Job</Link>
              <Link href="/credits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Buy Credits</Link>
              <Link href="/workspace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Manage Projects</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/compliance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">NĐ 13/2023 Compliance</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} StudentHub. All rights reserved. Compliant with NĐ 13/2023/NĐ-CP.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with care for Vietnamese students
          </p>
        </div>
      </div>
    </footer>
  );
}
