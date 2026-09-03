import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, Database, ArrowRight, BrainCircuit, AlertCircle } from 'lucide-react';

interface AuthLandingProps {
  onSignIn: () => Promise<void>;
  onOpenSecurity: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({ onSignIn, onOpenSecurity }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSignIn();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site or open in a new tab.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing. Please try again.');
      } else {
        setError(err.message || 'Unable to sign in with Google. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0A0A0B]">
      <div className="max-w-3xl mx-auto w-full">
        {/* Main Card */}
        <div className="bg-[#121214] rounded-2xl border border-[#27272A] shadow-2xl p-8 sm:p-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              Isolated Firestore &amp; Firebase Auth
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini 3.6 Flash
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl text-zinc-100 font-semibold tracking-tight mb-4">
            Private Reflective Journaling &amp; Brainstorming
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed max-w-2xl mb-8">
            ReflectAI provides a secure, private sanctuary to explore your thoughts, untangle complex decisions, 
            and brainstorm solutions. Engage in thoughtful multi-turn dialogues with Gemini 3.6 Flash, with guaranteed 
            document-level data isolation in Cloud Firestore.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Authentication Notice</p>
                <p className="mt-0.5 text-xs text-rose-300">{error}</p>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 pb-8 border-b border-[#27272A]">
            <button
              id="google-signin-btn"
              onClick={handleSignIn}
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-sm font-semibold text-zinc-950 bg-white hover:bg-zinc-200 active:bg-zinc-300 transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.24C.45 8.18 0 9.94 0 12s.45 3.82 1.24 5.39l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.61l4.03 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              {loading ? 'Connecting with Google...' : 'Sign In with Google'}
            </button>

            <button
              id="view-threat-model-btn"
              onClick={onOpenSecurity}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              Review Threat Model &amp; Architecture
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Core Technical Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">User Data Isolation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Rules strictly enforce <code className="text-[11px] bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-zinc-300">request.auth.uid == userId</code>. Other users can never read your reflections.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">Multi-Turn Dialogue</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Converse iteratively with Gemini 3.6 Flash. Receive structured summaries, key takeaways, and probing questions.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">Cloud Firestore Persistence</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatic persistence with undefined-sanitized transactions, so your thoughts and AI replies are saved securely.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          Google Cloud Run &amp; Firebase Architecture &bull; Zero hardcoded credentials &bull; OWASP Compliant
        </p>
      </div>
    </div>
  );
};
