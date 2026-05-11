import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: May 2026</p>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 prose prose-sm max-w-none">
              <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
              <p>By accessing and using StudentHub, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.</p>

              <h2 className="text-lg font-semibold mt-6">2. Service Description</h2>
              <p>StudentHub provides a platform connecting students with employment and freelance opportunities, including AI-powered CV analysis, skill testing, workspace management, and escrow-protected payments.</p>

              <h2 className="text-lg font-semibold mt-6">3. User Accounts</h2>
              <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. You must be at least 16 years old to use this service.</p>

              <h2 className="text-lg font-semibold mt-6">4. Credit System (Xu)</h2>
              <p>Employers purchase credits to unlock candidate profiles. Credits are non-refundable except as required by Vietnamese consumer protection law. The platform fee for escrow transactions is calculated as: Total = ProjectValue + PlatformFee.</p>

              <h2 className="text-lg font-semibold mt-6">5. Escrow Service</h2>
              <p>Escrow transactions follow the milestone-based flow: Deposited → Milestone Completed → Approved → Disbursed. Disputes are handled through our resolution process. Platform fees are deducted upon disbursement.</p>

              <h2 className="text-lg font-semibold mt-6">6. eKYC Verification</h2>
              <p>Users may be required to complete eKYC verification by uploading their CCCD (Citizen Identity Card) and completing facial recognition. This data is processed in accordance with ND 13/2023/ND-CP.</p>

              <h2 className="text-lg font-semibold mt-6">7. Prohibited Activities</h2>
              <ul>
                <li>Providing false information in your profile or CV</li>
                <li>Attempting to circumvent the credit system</li>
                <li>Harassing or discriminating against other users</li>
                <li>Using the platform for illegal activities</li>
                <li>Attempting to access other users&apos; data without authorization</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">8. Intellectual Property</h2>
              <p>You retain ownership of content you submit. By posting content, you grant StudentHub a non-exclusive license to use, display, and distribute that content for platform operations.</p>

              <h2 className="text-lg font-semibold mt-6">9. Limitation of Liability</h2>
              <p>StudentHub acts as an intermediary platform. We are not liable for the quality of work, payment disputes beyond our escrow service, or actions of third parties. Our liability is limited to the maximum extent permitted by Vietnamese law.</p>

              <h2 className="text-lg font-semibold mt-6">10. Governing Law</h2>
              <p>These terms are governed by the laws of the Socialist Republic of Vietnam. Any disputes shall be resolved through the courts of Ho Chi Minh City, Vietnam.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
