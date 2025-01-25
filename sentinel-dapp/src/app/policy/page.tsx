import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-6">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>

            <p>
              Welcome to Sentinel Protocol. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              use our protocol and related services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Information We Collect
            </h2>

            <p>
              We collect information that you provide directly to us when using
              the Sentinel Protocol.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. How We Use Your Information
            </h2>

            <p>
              We use the collected information for various purposes, including:
            </p>

            <ul className="list-disc pl-6 mb-4">
              <li>Facilitating transactions and smart contract interactions</li>

              <li>Improving and optimizing our protocol</li>

              <li>Providing customer support</li>

              <li>Ensuring protocol security and preventing fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>

            <p>
              We implement appropriate technical and organizational measures to
              protect your information. However, please note that no method of
              transmission over the internet or electronic storage is 100%
              secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>

            <p>
              If you have any questions about this Privacy Policy, please
              contact us.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
