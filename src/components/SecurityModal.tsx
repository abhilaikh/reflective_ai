import React from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, Server, EyeOff, Layers } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#121214] rounded-2xl max-w-4xl w-full border border-[#27272A] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#27272A] flex items-center justify-between bg-[#18181B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Agentic Threat Model &amp; Security Architecture</h2>
              <p className="text-xs text-zinc-400">OWASP Top 10 Web &amp; LLM Compliance Audit</p>
            </div>
          </div>
          <button
            id="close-security-modal-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-zinc-300 text-sm bg-[#121214]">
          {/* Section 1: Threat Summary Table across the 5 Threat Zones */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              1. Agentic Threat Modeling (The 5 Threat Zones)
            </h3>
            <div className="overflow-x-auto border border-[#27272A] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#18181B] text-zinc-300 border-b border-[#27272A] font-semibold">
                    <th className="py-2.5 px-3">Threat Zone</th>
                    <th className="py-2.5 px-3">Threat Scenario</th>
                    <th className="py-2.5 px-3">OWASP Vector</th>
                    <th className="py-2.5 px-3">Implemented Countermeasure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-2.5 px-3 font-medium text-zinc-100">1. Input Surfaces</td>
                    <td className="py-2.5 px-3 text-zinc-400">Malicious user input, oversized payloads, prototype pollution</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-mono text-[10px]">OWASP A03 / LLM02</span></td>
                    <td className="py-2.5 px-3 text-emerald-300">Top-level JSON parser with 5MB limits; strict type checking; null-safe parameter destructuring.</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-2.5 px-3 font-medium text-zinc-100">2. Planning &amp; Reasoning</td>
                    <td className="py-2.5 px-3 text-zinc-400">Prompt injection, jailbreak attempts to bypass journal role</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-mono text-[10px]">OWASP LLM01</span></td>
                    <td className="py-2.5 px-3 text-emerald-300">Deterministic system instructions; treats input strictly as plain journal content; structured JSON schema enforcement.</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-2.5 px-3 font-medium text-zinc-100">3. Tool Execution</td>
                    <td className="py-2.5 px-3 text-zinc-400">Dynamic code execution, SSRF, unauthenticated backend tampering</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-mono text-[10px]">OWASP LLM07 / A01</span></td>
                    <td className="py-2.5 px-3 text-emerald-300">Zero dynamic eval; backend API handles model proxy without executing foreign code or unvetted URLs.</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-2.5 px-3 font-medium text-zinc-100">4. Memory &amp; State</td>
                    <td className="py-2.5 px-3 text-zinc-400">Cross-user data leakage, unauthorized document tampering, undefined crashes</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-mono text-[10px]">OWASP A01 / A05</span></td>
                    <td className="py-2.5 px-3 text-emerald-300">Strict Firestore path isolation (<code className="text-[11px] bg-zinc-800 border border-zinc-700/60 px-1 py-0.5 rounded text-zinc-200">request.auth.uid == userId</code>); client-side undefined-stripping sanitizer.</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-2.5 px-3 font-medium text-zinc-100">5. Inter-System Comm.</td>
                    <td className="py-2.5 px-3 text-zinc-400">Exposure of Gemini API key, frontend API leaks, token harvesting</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-mono text-[10px]">OWASP A02 / LLM06</span></td>
                    <td className="py-2.5 px-3 text-emerald-300">Server-side proxy strictly in Node/Express; GEMINI_API_KEY never sent to browser; secret manager readiness.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Firestore Security Rules Enforcement */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              2. Firestore Rule Verification &amp; User Data Isolation
            </h3>
            <div className="bg-[#0A0A0B] text-zinc-200 border border-[#27272A] rounded-xl p-4 font-mono text-xs overflow-x-auto">
              <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`}</pre>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Deployed to Google Cloud Firestore with zero insecure defaults (no wildcard read/write).
            </p>
          </div>

          {/* Section 3: Resilient Model Fallback Ladder */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              3. Gemini Model Resilience &amp; Fallback Protocol
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A]">
                <span className="text-[10px] font-semibold text-emerald-400 uppercase">Primary</span>
                <p className="font-semibold text-zinc-100 mt-0.5">gemini-3.6-flash</p>
                <p className="text-[11px] text-zinc-400 mt-1">High-speed conversational reflection</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A]">
                <span className="text-[10px] font-semibold text-blue-400 uppercase">High-Availability</span>
                <p className="font-semibold text-zinc-100 mt-0.5">gemini-3.1-flash-lite</p>
                <p className="text-[11px] text-zinc-400 mt-1">Fallback on 503 or 429 quota exhaustion</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A]">
                <span className="text-[10px] font-semibold text-purple-400 uppercase">Dynamic Alias</span>
                <p className="font-semibold text-zinc-100 mt-0.5">gemini-flash-latest</p>
                <p className="text-[11px] text-zinc-400 mt-1">Adaptive route compatibility</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A]">
                <span className="text-[10px] font-semibold text-amber-400 uppercase">Deep Reasoning</span>
                <p className="font-semibold text-zinc-100 mt-0.5">gemini-3.7-flash</p>
                <p className="text-[11px] text-zinc-400 mt-1">Final analytical fallback tier</p>
              </div>
            </div>
          </div>

          {/* Section 4: Zero-Hardcoding Hygiene */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
              4. Zero-Hardcoding Hygiene &amp; Secret Isolation
            </h3>
            <div className="p-3 bg-[#18181B] rounded-xl border border-[#27272A] space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero hardcoded API keys in source repository.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Backend Express proxy routes all AI requests via <code className="bg-zinc-800 border border-zinc-700/60 px-1 py-0.5 rounded text-zinc-200">process.env.GEMINI_API_KEY</code>.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Google Secret Manager integration documented in production <code className="bg-zinc-800 border border-zinc-700/60 px-1 py-0.5 rounded text-zinc-200">README.md</code>.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#18181B] border-t border-[#27272A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            Close Threat Review
          </button>
        </div>
      </div>
    </div>
  );
};
