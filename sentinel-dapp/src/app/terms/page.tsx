import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-6">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. Agreement to Terms
            </h2>

            <p>
              By accessing or using the Sentinel Protocol, you agree to be bound
              by these Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Protocol Usage</h2>

            <p>
              The Sentinel Protocol provides decentralized insurance and risk
              management services. Users must:
            </p>

            <ul className="list-disc pl-6 mb-4">
              <li>Be of legal age in their jurisdiction</li>

              <li>Have a compatible cryptocurrency wallet</li>

              <li>
                Understand the risks associated with blockchain technology
              </li>

              <li>Take responsibility for their own actions on the protocol</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Risks and Disclaimers
            </h2>

            <p>Users acknowledge that:</p>

            <ul className="list-disc pl-6 mb-4">
              <li>
                Cryptocurrency and smart contract interactions carry inherent
                risks
              </li>

              <li>Past performance does not guarantee future results</li>

              <li>
                The protocol operates on blockchain technology which may
                experience downtime or technical issues
              </li>

              <li>
                Users are responsible for securing their private keys and wallet
                access
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Limitation of Liability
            </h2>

            <p>
              The Sentinel Protocol and its developers shall not be liable for
              any damages or losses resulting from the use of the protocol,
              including but not limited to:
            </p>

            <ul className="list-disc pl-6 mb-4">
              <li>Financial losses</li>

              <li>Technical failures</li>

              <li>Smart contract vulnerabilities</li>

              <li>User errors</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Modifications</h2>

            <p>
              We reserve the right to modify these terms at any time. Users will
              be notified of significant changes through the protocol's official
              communication channels.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>

            <p>
              For questions about these Terms of Service, please contact us.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
