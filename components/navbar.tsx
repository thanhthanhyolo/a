'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  GraduationCap,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Bell,
  Settings,
  Building2,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = {
  candidate: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/workspace', label: 'Workspace', icon: GraduationCap },
    { href: '/skills', label: 'Skills', icon: User },
  ],
  employer: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/candidates', label: 'Candidates', icon: User },
    { href: '/workspace', label: 'Workspace', icon: GraduationCap },
    { href: '/credits', label: 'Credits', icon: Building2 },
  ],
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/audit', label: 'Audit Logs', icon: Settings },
    { href: '/admin/compliance', label: 'Compliance', icon: Building2 },
  ],
};

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (profile?.role || 'candidate') as keyof typeof navLinks;
  const links = navLinks[role] || navLinks.candidate;
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Student<span className="gradient-primary-text">Hub</span>
            </span>
          </Link>

          {user && (
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            !loading && (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="gradient-primary border-0 text-white">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      {mobileOpen && user && (
        <div className="border-t md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
