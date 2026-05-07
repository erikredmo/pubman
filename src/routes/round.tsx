import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/round")({
  head: () => ({
    meta: [
      { title: "Aktiv runda — Pubman" },
      { name: "description", content: "Följ din pågående pubrunda steg för steg." },
    ],
  }),
  component: RoundPage,
});

function RoundPage() {
  const progress = 3;
  const total = 5;
  const circ = 2 * Math.PI * 44;
  const offset = circ * (1 - progress / total);

  return (
    <div className="min-h-screen pb-32 bg-background text-on-background">
      <TopBar userName="Sven Svensson" />
      <main className="flex-grow px-5 pt-8 pb-32">
        <section className="mb-8">
          <p className="text-xs text-primary font-bold tracking-widest uppercase mb-1">
            Dagens Runda
          </p>
          <h1 className="text-4xl font-extrabold text-on-surface mb-2 font-display tracking-tight">
            Söderns Höjder
          </h1>
          <p className="text-lg text-on-surface-variant mb-4">Svens Runda</p>

          <div className="bg-surface-container-lowest rounded-2xl p-6 app-shadow border border-outline-variant/30 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-container" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" strokeWidth="8" />
                <circle
                  className="text-primary transition-all duration-700"
                  cx="50" cy="50" fill="transparent" r="44"
                  stroke="currentColor"
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-primary font-display">
                  {progress}/{total}
                </span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">Pubar</span>
              </div>
            </div>
            <div className="w-full flex justify-between items-center bg-surface-container-low p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Icon name="history" className="text-primary" />
                <span className="text-base font-semibold">Senaste: Pelikan</span>
              </div>
              <button className="text-primary text-sm font-semibold hover:underline">
                Visa historik
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-on-surface mb-4 font-display">Rutt</h2>
          <div className="space-y-4">
            {/* Completed */}
            <div className="flex gap-4 items-start relative">
              <div className="absolute left-[11px] top-8 -bottom-4 w-[2px] bg-primary-container/40" />
              <div className="z-10 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center ring-4 ring-background">
                <Icon name="check" className="text-white text-[16px]" />
              </div>
              <div className="flex-grow bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 app-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface font-display">Kvarnen</h3>
                    <p className="text-xs text-on-surface-variant">Besökt 16:45</p>
                  </div>
                  <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded uppercase">
                    Uteservering
                  </span>
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="flex gap-4 items-start relative">
              <div className="absolute left-[11px] top-8 -bottom-4 w-[2px] bg-outline-variant/30" />
              <div className="z-10 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center ring-4 ring-background shadow-[0_0_12px_rgba(0,106,167,0.3)]">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="flex-grow bg-surface-container-lowest p-4 rounded-2xl border-2 border-primary app-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-primary font-display">Pelikan</h3>
                    <p className="text-xs text-on-surface-variant italic">Här är vi nu</p>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border border-white bg-surface-variant overflow-hidden">
                      <img alt="P1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVr4lFSAh8Fhcdia1n2Of7KHiA4q2TptRuBzkh17OpAhX_3bNLwSs-pocLc5mLhYcqyCD37h-ITMdd2CRqBpl4A91H6dZhbljLXpktCHRFo5Zbu-bYJs1PLhEOVEl-fd9D9nqRtxCkjGkk-J2d_u9ssOwk8AccD3D09i5qJn3l_AOiQimG0A6sgms5IaKfkZAVzikKyWAgt_HuudAr6NUxv86AlO_C3J2MFq-UYDxE1JETgpFYI8zYxVq7hu9RfUxfczZutfcVbE4" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-6 h-6 rounded-full border border-white bg-surface-variant overflow-hidden">
                      <img alt="P2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx8uFaqv7FVpgDfSTBOun4ynu1Q5cwvnxR997eJKU2tbExlXoXVgfwhF1_SyQ6SyzLISaahlaFnWF6w1x_-RHI_zQbpsyCNEdwTUlqJBNVYfhYdiqA8Cfy6NJTbsf2qUoRZFK9K6W8FigsQaM0aLpUbAnjX2MM9TLCHHjijgK7QA3iBpESl1Ov4G0s9hg1OLyPZmNfYt8rrVPf0pqT69pXCLxVXEdOg79WjReKrnfATXQdEWvGzThk6CCOBeAjgrcT885nT_H8Dnc" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-6 h-6 rounded-full border border-white bg-primary flex items-center justify-center text-[10px] text-white font-bold">+2</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <button className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors active:scale-[0.98]">
                    <Icon name="how_to_reg" className="text-[18px]" />
                    Checka in / Checka ut
                  </button>
                </div>
              </div>
            </div>

            {/* Future */}
            <div className="flex gap-4 items-start opacity-50">
              <div className="z-10 w-6 h-6 rounded-full bg-surface-variant border-2 border-background ring-4 ring-background" />
              <div className="flex-grow bg-surface-container p-4 rounded-2xl border border-outline-variant/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface font-display">Lilla Barkarby</h3>
                    <p className="text-xs text-on-surface-variant">Beräknad ankomst 19:30</p>
                  </div>
                  <Icon name="lock" className="text-on-surface-variant/50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <button className="w-full py-4 bg-primary text-white text-lg font-bold font-display rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <Icon name="location_on" />
            Nästa stopp: Katarina Ölkafé
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
