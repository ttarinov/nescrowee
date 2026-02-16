import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ExternalLink } from "@hugeicons/core-free-icons";

const NovaIntegrationPost = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 pt-32">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-8"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          <span>Back to Blog</span>
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-invert max-w-none"
        >
          <div className="mb-8">
            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Integration
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Encrypted Evidence Storage with NOVA
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Securing dispute evidence with client-side encryption and IPFS storage through NOVA SDK
          </p>

          <div className="text-sm text-gray-500 mb-12">
            Published February 16, 2026 · Nescrowee Team
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Why Encrypted Evidence?</h2>
              <p>
                When disputes arise, both parties need to submit evidence: code snippets, design files, communication logs, screenshots. But uploading sensitive files to a centralized server creates privacy risks. What if the server is compromised? What if employees can access the files?
              </p>
              <p>
                Nescrowee uses NOVA SDK to encrypt evidence client-side before it ever leaves the browser. Files are encrypted with AES-256-GCM, uploaded to IPFS, and only decrypted when needed for AI dispute resolution—and even then, only after PII scrubbing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How NOVA Works</h2>
              <p>
                NOVA provides encrypted storage with group access control. Here's the flow:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Create group:</strong> When a contract is created, we create a NOVA group named <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">nescrowee-{`{contractId}`}</code></li>
                <li><strong>Add members:</strong> Both client and freelancer are added to the group</li>
                <li><strong>Upload:</strong> When someone uploads evidence, it's encrypted client-side (AES-256-GCM) before upload</li>
                <li><strong>IPFS:</strong> Encrypted file is stored on IPFS, CID returned</li>
                <li><strong>Metadata:</strong> CID + file metadata stored in NEAR Social DB as structured message</li>
                <li><strong>Retrieve:</strong> When AI needs evidence, files are decrypted via NOVA SDK</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Client-Side Encryption</h2>
              <p>
                The encryption happens entirely in the browser using Web Crypto API. The private keys are managed in TEE hardware by NOVA, so even NOVA can't decrypt your files. Only members of the group (client and freelancer) can decrypt.
              </p>
              <p>
                This means:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Files are encrypted before leaving your device</li>
                <li>NOVA can't read your files</li>
                <li>Only contract parties can decrypt</li>
                <li>AI only sees decrypted content after PII scrubbing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Integration with Dispute Resolution</h2>
              <p>
                When a dispute is raised, the AI investigation process:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Retrieves all evidence messages from NEAR Social DB</li>
                <li>Filters for text files (txt, md, csv, json, log)</li>
                <li>Decrypts each file via NOVA SDK</li>
                <li>Scrubs PII (accounts, emails, URLs, etc.)</li>
                <li>Feeds anonymized content to AI for analysis</li>
              </ol>
              <p>
                Non-text files (images, PDFs, etc.) are stored but not currently analyzed by AI. Future versions may add vision model support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Privacy Guarantees</h2>
              <p>
                NOVA's architecture ensures:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>End-to-end encryption:</strong> Files encrypted client-side, decrypted only by authorized parties</li>
                <li><strong>Group access control:</strong> Only contract parties can access their evidence vault</li>
                <li><strong>TEE key management:</strong> Private keys stored in Trusted Execution Environment</li>
                <li><strong>IPFS storage:</strong> Decentralized, censorship-resistant storage</li>
                <li><strong>PII scrubbing:</strong> AI never sees raw, identifiable information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Technical Implementation</h2>
              <p>
                The NOVA integration uses:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">nova-sdk-js</code> for client-side encryption/decryption</li>
                <li>NEAR account authentication (NOVA uses NEAR accounts for identity)</li>
                <li>NEAR Social DB for metadata storage</li>
                <li>IPFS for encrypted file storage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Learn More</h2>
              <p>
                Check out our{" "}
                <Link to="/docs/api-reference" className="text-purple-400 hover:text-purple-300 underline">
                  API documentation
                </Link>{" "}
                for NOVA integration details, or visit{" "}
                <a
                  href="https://nova-sdk.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                >
                  NOVA SDK <HugeiconsIcon icon={ExternalLink} size={14} />
                </a>
                .
              </p>
            </section>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default NovaIntegrationPost;
