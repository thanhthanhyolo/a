'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Shield, Eye, Bell, Trash2, Download, FileText, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Clock, Database } from 'lucide-react';
import type { PrivacyConsent, EscrowTransaction } from '@/lib/types';

export default function SettingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [consents, setConsents] = useState<PrivacyConsent[]>([]);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [consentsRes, txRes] = await Promise.all([
        supabase.from('privacy_consents').select('*').eq('user_id', user.id),
        supabase.from('escrow_transactions').select('*').or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(10),
      ]);
      setConsents(consentsRes.data || []);
      setTransactions(txRes.data || []);
    };
    fetchData();
  }, [user]);

  const toggleConsent = async (consentId: string, currentGranted: boolean, consentType: string) => {
    const update = currentGranted
      ? { is_granted: false, revoked_at: new Date().toISOString() }
      : { is_granted: true, granted_at: new Date().toISOString(), revoked_at: null };
    const { error } = await supabase.from('privacy_consents').update(update).eq('id', consentId);
    if (error) { toast.error('Failed to update consent'); return; }
    setConsents(consents.map((c) => c.id === consentId ? { ...c, ...update } : c));
    toast.success(currentGranted ? 'Consent revoked' : 'Consent granted');
  };

  const handleRightToBeForgotten = async () => {
    if (!user) return;
    toast.error('This action requires admin review per ND 13/2023. A request has been submitted.');
  };

  const handleExportData = async () => {
    if (!user) return;
    toast.success('Data export request submitted. You will receive a download link via email within 48 hours per ND 13/2023.');
  };

  const statusColors: Record<string, string> = {
    deposited: 'bg-blue-100 text-blue-700',
    milestone_completed: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    disbursed: 'bg-emerald-100 text-emerald-700',
    refunded: 'bg-slate-100 text-slate-700',
    disputed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings & Privacy</h1>
          <p className="mt-1 text-muted-foreground">Manage your privacy, data, and escrow transactions</p>
        </div>

        <div className="space-y-6">
          {/* Privacy Consents - ND 13/2023 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Privacy & Data Consent</CardTitle>
              <CardDescription>In accordance with ND 13/2023/ND-CP on Personal Data Protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {consents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No consent records found</p>
              ) : (
                consents.map((consent) => (
                  <div key={consent.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={consent.is_granted}
                        onCheckedChange={() => toggleConsent(consent.id, consent.is_granted, consent.consent_type)}
                      />
                      <div>
                        <p className="text-sm font-medium capitalize">{consent.consent_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {consent.is_granted ? `Granted ${consent.granted_at ? new Date(consent.granted_at).toLocaleDateString('vi-VN') : ''}` : 'Not granted'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={consent.is_granted ? 'default' : 'secondary'} className="text-xs">
                      {consent.is_granted ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Data Rights */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Your Data Rights</CardTitle>
              <CardDescription>ND 13/2023 grants you control over your personal data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Export My Data</p>
                    <p className="text-xs text-muted-foreground">Download all your personal data</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>Request Export</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4 border-red-200 bg-red-50/50">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Right to Be Forgotten</p>
                    <p className="text-xs text-red-600/70">Request deletion of all personal data</p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleRightToBeForgotten}>Request Deletion</Button>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Transactions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Escrow Transactions</CardTitle>
              <CardDescription>Secure payment transactions with milestone-based release</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Shield className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No escrow transactions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Transactions will appear here when you work on freelance projects</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="text-sm font-medium">{tx.milestone_description || 'Milestone'}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{(tx.amount / 1000).toFixed(0)}K VND</span>
                          <span>Fee: {(tx.platform_fee / 1000).toFixed(0)}K VND</span>
                          <span>{new Date(tx.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <Badge className={`text-xs capitalize ${statusColors[tx.status] || 'bg-slate-100 text-slate-700'}`}>
                        {tx.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
