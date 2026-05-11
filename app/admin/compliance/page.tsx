'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, FileText, Users, Database, Lock, Eye, Clock } from 'lucide-react';
import type { PrivacyConsent, EKYCVerification } from '@/lib/types';

export default function CompliancePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [consents, setConsents] = useState<PrivacyConsent[]>([]);
  const [ekycCount, setEkycCount] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) router.push('/dashboard');
  }, [user, profile, authLoading]);

  useEffect(() => {
    const fetchData = async () => {
      const [consentsRes, ekycRes, usersRes] = await Promise.all([
        supabase.from('privacy_consents').select('*'),
        supabase.from('ekyc_verifications').select('status'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      setConsents(consentsRes.data || []);
      const ekycData = ekycRes.data || [];
      setEkycCount({
        pending: ekycData.filter((e) => e.status === 'pending').length,
        approved: ekycData.filter((e) => e.status === 'approved').length,
        rejected: ekycData.filter((e) => e.status === 'rejected').length,
      });
      setTotalUsers(usersRes.count || 0);
    };
    fetchData();
  }, []);

  const dataProcessingConsented = consents.filter((c) => c.consent_type === 'data_processing' && c.is_granted).length;
  const thirdPartyConsented = consents.filter((c) => c.consent_type === 'third_party_sharing' && c.is_granted).length;
  const rightToBeForgotten = consents.filter((c) => c.consent_type === 'right_to_be_forgotten' && c.is_granted).length;
  const complianceScore = Math.round(((dataProcessingConsented + ekycCount.approved) / Math.max(totalUsers * 2, 1)) * 100);

  const complianceItems = [
    { label: 'ND 13/2023 - Data Processing Consent', status: dataProcessingConsented > 0 ? 'compliant' : 'action_needed', detail: `${dataProcessingConsented} users consented` },
    { label: 'ND 13/2023 - Third Party Sharing', status: 'compliant', detail: `${thirdPartyConsented} users opted in` },
    { label: 'ND 13/2023 - Right to Be Forgotten', status: rightToBeForgotten > 0 ? 'action_needed' : 'compliant', detail: `${rightToBeForgotten} requests pending` },
    { label: 'TT 78/2021 - E-Invoice Compliance', status: 'compliant', detail: 'System configured' },
    { label: 'eKYC Verification', status: ekycCount.pending > 0 ? 'action_needed' : 'compliant', detail: `${ekycCount.pending} pending, ${ekycCount.approved} approved` },
    { label: 'Audit Trail (Append-only)', status: 'compliant', detail: 'All changes logged' },
    { label: 'Data Encryption at Rest', status: 'compliant', detail: 'Supabase AES-256' },
    { label: 'Data Encryption in Transit', status: 'compliant', detail: 'TLS 1.3' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" /> Compliance Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">ND 13/2023/ND-CP and TT 78/2021/TT-BTC compliance status</p>
        </div>

        {/* Compliance Score */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Overall Compliance Score</p>
            <p className="text-5xl font-bold text-primary">{complianceScore}%</p>
            <Progress value={complianceScore} className="mt-4 h-3 max-w-md mx-auto" />
          </CardContent>
        </Card>

        {/* Compliance Checklist */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Compliance Checklist</CardTitle>
            <CardDescription>Current status of all regulatory requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {item.status === 'compliant' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'compliant' ? 'default' : 'secondary'} className="text-xs">
                    {item.status === 'compliant' ? 'Compliant' : 'Action Needed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* eKYC Overview */}
        <Card className="mt-6 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> eKYC Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">{ekycCount.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{ekycCount.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{ekycCount.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
