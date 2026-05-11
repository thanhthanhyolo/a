'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Zap, CreditCard, TrendingUp, CircleArrowDown as ArrowDownCircle, CircleArrowUp as ArrowUpCircle, Gift } from 'lucide-react';
import type { CreditTransaction } from '@/lib/types';

const packages = [
  { credits: 100, price: 99000, label: 'Starter', popular: false },
  { credits: 500, price: 449000, label: 'Professional', popular: true },
  { credits: 1000, price: 799000, label: 'Enterprise', popular: false },
];

export default function CreditsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [creditRes, txRes] = await Promise.all([
        supabase.from('credits').select('balance').eq('user_id', user.id).maybeSingle(),
        supabase.from('credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);
      setBalance(creditRes.data?.balance || 0);
      setTransactions(txRes.data || []);
    };
    fetchData();
  }, [user]);

  const handlePurchase = async (pkg: typeof packages[0]) => {
    toast.success(`Processing purchase of ${pkg.credits} credits for ${pkg.price.toLocaleString('vi-VN')} VND...`);
    if (!user) return;
    const { data: credit } = await supabase.from('credits').select('id, balance').eq('user_id', user.id).maybeSingle();
    if (credit) {
      await supabase.from('credits').update({ balance: credit.balance + pkg.credits, updated_at: new Date().toISOString() }).eq('id', credit.id);
    } else {
      await supabase.from('credits').insert({ user_id: user.id, balance: pkg.credits });
    }
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: pkg.credits,
      transaction_type: 'purchase',
      description: `Purchased ${pkg.credits} credits - ${pkg.label} package`,
    });
    setBalance(balance + pkg.credits);
    toast.success(`${pkg.credits} credits added to your account!`);
  };

  const formatVND = (amount: number) => `${amount.toLocaleString('vi-VN')} VND`;

  const txIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'spend': return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      case 'refund': return <ArrowDownCircle className="h-4 w-4 text-blue-500" />;
      case 'bonus': return <Gift className="h-4 w-4 text-amber-500" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Credits</h1>
          <p className="mt-1 text-muted-foreground">Purchase credits to unlock candidate profiles and premium features</p>
        </div>

        {/* Balance */}
        <Card className="mb-8 border-0 shadow-sm gradient-primary text-white">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-white/80">Current Balance</p>
              <p className="text-4xl font-bold">{balance}</p>
              <p className="text-sm text-white/80">credits</p>
            </div>
            <Zap className="h-12 w-12 text-white/30" />
          </CardContent>
        </Card>

        {/* Packages */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Purchase Credits</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.label} className={`border-0 shadow-sm relative ${pkg.popular ? 'ring-2 ring-primary' : ''}`}>
                {pkg.popular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 gradient-primary border-0 text-white">Most Popular</Badge>}
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold">{pkg.credits}</p>
                  <p className="text-sm text-muted-foreground">credits</p>
                  <p className="mt-3 text-lg font-semibold">{formatVND(pkg.price)}</p>
                  <p className="text-xs text-muted-foreground">{formatVND(Math.round(pkg.price / pkg.credits))}/credit</p>
                  <Button onClick={() => handlePurchase(pkg)} className="mt-4 w-full gradient-primary border-0 text-white">
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg">Transaction History</CardTitle></CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      {txIcon(tx.transaction_type)}
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
