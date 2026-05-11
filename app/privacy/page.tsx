import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">In accordance with Nghị định 13/2023/NĐ-CP on Personal Data Protection</p>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 prose prose-sm max-w-none">
              <h2 className="text-lg font-semibold">1. Data Controller</h2>
              <p>StudentHub operates as the data controller for all personal data collected on this platform. We are committed to protecting your personal data in compliance with Vietnam&apos;s data protection regulations.</p>

              <h2 className="text-lg font-semibold mt-6">2. Data We Collect</h2>
              <ul>
                <li><strong>Identity Data:</strong> Full name, date of birth, ID card number (for eKYC)</li>
                <li><strong>Contact Data:</strong> Email address, phone number</li>
                <li><strong>Professional Data:</strong> CV/resume content, skills, education, work experience</li>
                <li><strong>Location Data:</strong> Approximate location for job matching</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Behavioral Data:</strong> Platform usage patterns, search queries</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">3. Legal Basis for Processing</h2>
              <p>We process your data based on:</p>
              <ul>
                <li>Your explicit consent (Article 6, ND 13/2023)</li>
                <li>Contractual necessity for service delivery</li>
                <li>Legal obligations under Vietnamese law</li>
                <li>Legitimate interests for platform improvement</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">4. Sensitive Personal Data</h2>
              <p>Per Article 11 of ND 13/2023, we process the following sensitive data only with your explicit consent:</p>
              <ul>
                <li>Biometric data (facial recognition for eKYC)</li>
                <li>ID card information</li>
                <li>Financial data (for escrow transactions)</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">5. Your Rights</h2>
              <ul>
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
                <li><strong>Right to Erasure:</strong> Request deletion (&quot;Right to be Forgotten&quot;)</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Export your data in a standard format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">6. Data Retention</h2>
              <p>We retain your data only as long as necessary for the purposes stated. Audit logs are maintained on an append-only basis and cannot be deleted, in compliance with financial record-keeping requirements under TT 78/2021/TT-BTC.</p>

              <h2 className="text-lg font-semibold mt-6">7. Data Security</h2>
              <p>We implement appropriate technical and organizational measures including:</p>
              <ul>
                <li>AES-256 encryption at rest</li>
                <li>TLS 1.3 encryption in transit</li>
                <li>Row Level Security (RLS) on all database tables</li>
                <li>Append-only audit logs</li>
                <li>Regular security assessments</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">8. Contact</h2>
              <p>For privacy inquiries, contact our Data Protection Officer at: privacy@studenthub.vn</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
