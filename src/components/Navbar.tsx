import React from 'react';
import { Sparkles, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onSignOut: () => void;
  onOpenSecurity: () => void;
  entryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onOpenSecurity,
  entryCount,
}) => {
  return (
    <header className="border-b border-[#27272A] bg-[#0A0A0B]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-zinc-50 flex items-center justify-center border border-zinc-800 shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg text-zinc-100 tracking-tight">ReflectAI</span>
              <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">Private Multi-Turn Reflection &amp; Brainstorming</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="security-threat-model-btn"
            onClick={onOpenSecurity}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
            title="View Agentic Threat Model & Security Safeguards"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Security Architecture</span>
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center text-xs font-semibold">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-zinc-200 leading-none truncate max-w-[140px]">
                    {user.displayName || 'Journaler'}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate max-w-[140px] mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                id="sign-out-btn"
                onClick={onSignOut}
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
