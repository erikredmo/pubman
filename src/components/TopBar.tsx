import { Icon } from "./Icon";

export function TopBar({ userName }: { userName?: string }) {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md flex justify-between items-center w-full px-5 py-2 h-16 border-b border-outline-variant/30">
      <div className="flex items-center gap-4">
        <button className="hover:opacity-80 transition active:scale-95">
          <Icon name="menu" className="text-primary" />
        </button>
        <span className="text-xl font-bold font-display text-primary tracking-tight">
          Pubman
        </span>
      </div>
      <div className="flex items-center gap-3">
        {userName && (
          <span className="text-sm font-semibold text-on-surface-variant hidden sm:block">
            {userName}
          </span>
        )}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed hover:opacity-80 transition cursor-pointer">
          <img
            alt="User"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZUmlE0KwqoGzKipdWmV93EJeWjyxNCAbUkpTA7-CfmaYFWQhu32bBgjNs6RqCvt509eb96kqC5JtuAvIfR9LrTcWAitem0Ormsk6fUmOSucK49WEtfY9yhEv2TZ-fmm0z9oDlgW3WJOwa1HC7Se7hY4TOHyPRiagdJvNuEQuvvsa2gnFS1zexctO0UQmr9l5PWoSqk8Zevh-_kAsPsEVk0aDIl0Q2usUylGFCV2pzrcvsdejZMb545tnShxNEqTLbmnLtVYFQRIk"
          />
        </div>
      </div>
    </header>
  );
}
