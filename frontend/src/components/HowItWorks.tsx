import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="border-t border-[#242428] bg-[#0A0A0B] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono text-[#00E5A0] tracking-wider uppercase mb-2">
            Protocol Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] tracking-tight">
            How StakedTakes Works
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] mt-2">
            A deterministic pipeline turning subjective online pronouncements into audited, skin-in-the-game predictive intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-[#17171A] border border-[#242428] p-6 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-[#00E5A0] mb-3">
                01. Post & Cite
              </div>
              <h3 className="text-base font-semibold text-[#FAFAFA] mb-2">
                Author Falsifiable Claim
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Formulate an unambiguous claim with a clear resolution deadline. Submit primary and fallback source URLs (e.g. regulatory filings, repos, official statistical releases).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#242428] font-mono text-[11px] text-[#71717A]">
              Author defines criteria bounds
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#17171A] border border-[#242428] p-6 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-[#00E5A0] mb-3">
                02. Stake & Calibrate
              </div>
              <h3 className="text-base font-semibold text-[#FAFAFA] mb-2">
                Lock GEN & Confidence
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Commit GEN tokens into GenLayer smart escrow and set your subjective probability (51% to 99%). Extreme confidence carries amplified reputation stakes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#242428] font-mono text-[11px] text-[#71717A]">
              Non-custodial smart escrow
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#17171A] border border-[#242428] p-6 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-[#00E5A0] mb-3">
                03. GenLayer Resolution
              </div>
              <h3 className="text-base font-semibold text-[#FAFAFA] mb-2">
                AI Validator Quorum
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                At the deadline, GenLayer Intelligent Contracts deploy decentralized LLM validator nodes. Nodes parse the cited sources, evaluate the criteria, and vote TRUE, FALSE, or INVALID.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#242428] font-mono text-[11px] text-[#71717A]">
              Verifiable execution traces
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#17171A] border border-[#242428] p-6 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-[#00E5A0] mb-3">
                04. Settle & Brier Score
              </div>
              <h3 className="text-base font-semibold text-[#FAFAFA] mb-2">
                Finalize & Index Update
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Following a 48-hour appeal window, stakes are settled. The Brier score quadratic penalty is calculated, permanently updating the author's public Credibility Index (0–10,000).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#242428] font-mono text-[11px] text-[#71717A]">
              Immutable forecasting track record
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
