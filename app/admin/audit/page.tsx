'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Clock, User, Database, Shield } from 'lucide-react';
import type { AuditLog } from '@/lib/types';

export default function AuditLogsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) router.push('/dashboard');
  }, [user, profile, authLoading]);

  useEffect(() => {
    const fetchLogs = async () => {
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (tableFilter !== 'all') query = query.eq('table_name', tableFilter);
      const { data } = await query;
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, [tableFilter]);

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return log.action.toLowerCase().includes(q) || log.table_name.toLowerCase().includes(q);
  });

  const actionColors: Record<string, string> = {
    INSERT: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Database className="h-7 w-7 text-primary" /> Audit Logs
          </h1>
          <p className="mt-1 text-muted-foreground">Append-only log of all data changes (ND 13/2023 compliance)</p>
        </div>

        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search actions, tables..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  <SelectItem value="profiles">Profiles</SelectItem>
                  <SelectItem value="jobs">Jobs</SelectItem>
                  <SelectItem value="applications">Applications</SelectItem>
                  <SelectItem value="escrow_transactions">Escrow</SelectItem>
                  <SelectItem value="privacy_consents">Privacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Table</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Record</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No audit logs found</td></tr>
                  ) : (
                    filtered.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${actionColors[log.action] || 'bg-slate-100 text-slate-700'}`}>
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{log.table_name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.record_id?.slice(0, 8) || '--'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{log.user_id?.slice(0, 8) || 'system'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
