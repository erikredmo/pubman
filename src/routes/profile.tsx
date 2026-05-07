import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil — Pubman" },
      { name: "description", content: "Din profil och dina sparade rundor." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="min-h-screen pb-32 bg-background text-on-background">
      <TopBar userName="Sven Svensson" />
      <main className="px-5 pt-8">
        <div className="bg-surface-container-lowest rounded-2xl p-6 app-shadow border border-outline-variant/30 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-fixed mb-4">
            <img
              alt="Sven"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZUmlE0KwqoGzKipdWmV93EJeWjyxNCAbUkpTA7-CfmaYFWQhu32bBgjNs6RqCvt509eb96kqC5JtuAvIfR9LrTcWAitem0Ormsk6fUmOSucK49WEtfY9yhEv2TZ-fmm0z9oDlgW3WJOwa1HC7Se7hY4TOHyPRiagdJvNuEQuvvsa2gnFS1zexctO0UQmr9l5PWoSqk8Zevh-_kAsPsEVk0aDIl0Q2usUylGFCV2pzrcvsdejZMb545tnShxNEqTLbmnLtVYFQRIk"
            />
          </div>
          <h1 className="text-2xl font-bold font-display text-on-surface">Sven Svensson</h1>
          <p className="text-sm text-on-surface-variant mt-1">Stockholm • Medlem sedan 2024</p>

          <div className="grid grid-cols-3 gap-3 w-full mt-6">
            {[
              { v: "12", l: "Rundor" },
              { v: "47", l: "Pubar" },
              { v: "8", l: "Vänner" },
            ].map((s) => (
              <div key={s.l} className="bg-surface-container-low rounded-xl p-3">
                <p className="text-2xl font-extrabold text-primary font-display">{s.v}</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-bold text-on-surface mt-8 mb-4 font-display">Inställningar</h2>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 divide-y divide-outline-variant/30 overflow-hidden">
          {[
            { i: "favorite", l: "Mina favoriter" },
            { i: "notifications", l: "Notiser" },
            { i: "settings", l: "Konto" },
            { i: "help", l: "Hjälp" },
          ].map((r) => (
            <button key={r.l} className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-low transition text-left">
              <Icon name={r.i} className="text-primary" />
              <span className="flex-grow text-base font-medium text-on-surface">{r.l}</span>
              <Icon name="chevron_right" className="text-on-surface-variant" />
            </button>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
