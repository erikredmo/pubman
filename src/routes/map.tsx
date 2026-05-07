import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Karta — Pubman" },
      { name: "description", content: "Se pubrundan visualiserad på kartan." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopBar />
      <main className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[#dbe4e9] relative">
            <img
              alt="Stockholm map"
              className="w-full h-full object-cover opacity-60 grayscale contrast-125 brightness-110"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM60QI81xC5hJ0Eu9FQOwgscZtRjcJd4t4Cpc8L1PU0BxpwRMW_w4K6rWdIC0d_7JAE4pWkzLN1icY3-hV41X-BfzXxYeiaGmB-ymK3qey35UJh6K89gcULyW86zpwHg8dkZazPoQ4jD3ITjG9sXpQEBtfAoBIs_LF2tyNhwKB9Mqkwili6wYCeCd-0jElf6A2yRkERuFQaeMuAAMyewK0g8SYZPihoWJyQQibLi0vl526Ovh0B07Qlzf6knzMzNSbzEqH-ny_AMk"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface-container-low/40 to-background/20 pointer-events-none" />

            <div className="absolute top-[35%] left-[30%] -translate-x-1/2 -translate-y-1/2">
              <div className="bg-primary p-2 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer">
                <Icon name="sports_bar" className="text-white text-[18px]" fill />
              </div>
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1 rounded-lg shadow-sm whitespace-nowrap">
                <span className="text-xs font-medium text-on-surface">Pelikan</span>
              </div>
            </div>

            <div className="absolute top-[50%] left-[55%] -translate-x-1/2 -translate-y-1/2">
              <div className="bg-primary-container p-3 rounded-full shadow-[0_0_20px_rgba(0,106,167,0.4)] border-2 border-white scale-110 cursor-pointer">
                <Icon name="local_bar" className="text-on-primary text-[20px]" fill />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1 rounded-lg shadow-sm whitespace-nowrap border border-primary-container">
                <span className="text-xs font-bold text-primary">Kvarnen</span>
              </div>
            </div>

            <div className="absolute top-[42%] left-[75%] -translate-x-1/2 -translate-y-1/2 opacity-60">
              <div className="bg-outline p-2 rounded-full shadow-md border-2 border-white">
                <Icon name="restaurant" className="text-white text-[18px]" />
              </div>
            </div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <path d="M 300 350 Q 425 450 550 500" fill="transparent" stroke="#005181" strokeDasharray="8 8" strokeWidth="4" />
              <path d="M 550 500 Q 650 460 750 420" fill="transparent" stroke="#c0c7d1" strokeDasharray="4 4" strokeWidth="3" />
            </svg>
          </div>
        </div>

        <div className="absolute top-4 left-5 z-20 bg-surface-container-lowest/90 backdrop-blur-sm px-4 py-3 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center">
                <Icon name="check" className="text-white text-[14px]" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-container flex items-center justify-center">
                <span className="text-xs font-bold text-on-primary">2</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-variant flex items-center justify-center">
                <span className="text-xs font-bold text-on-surface-variant">3</span>
              </div>
            </div>
            <div className="h-4 w-[1px] bg-outline-variant" />
            <div>
              <p className="text-xs text-on-surface-variant">Pågående runda</p>
              <p className="text-sm font-semibold text-primary">Södermalm Crawl</p>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
          <button className="w-12 h-12 bg-surface-container-lowest rounded-2xl shadow-md flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors">
            <Icon name="search" />
          </button>
          <button className="w-12 h-12 bg-surface-container-lowest rounded-2xl shadow-md flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors">
            <Icon name="layers" />
          </button>
        </div>

        <div className="absolute bottom-28 left-5 right-5 z-30">
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,81,129,0.15)] border border-outline-variant/30 backdrop-blur-md bg-opacity-95">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  alt="Kvarnen"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9erdWaVLzdJg9LUpmtFCcMCfDCWZWOV-lvHGHSeqyjxt4ldKqKunPVDyMDe2olUBhk0svR0Ctm97dRF0lAiEMKTr1I8kahTdm_2n-5vqGl2sD-CrT9mAbpdos_y-zuG0ylmXldTTlYlgO8zXGXC-PQhimUl_59-q0h-hwSUuJWRVZep7xcJndc03evbYpWhERout7LIoE2Zmj4lpsjAKeKUevUIciopA9q8Ra5rBEKFTu5BNW6BLjqwrsGCVTjBQnTLURQt8Lkbk"
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-primary font-display truncate">Kvarnen</h3>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1">
                      <Icon name="location_on" className="text-[14px]" />
                      Södermalm, Stockholm
                    </p>
                  </div>
                  <span className="bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap">
                    Öppet nu
                  </span>
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  <span className="bg-surface-container text-on-surface-variant text-xs px-3 py-1 rounded-lg whitespace-nowrap">Uteservering</span>
                  <span className="bg-surface-container text-on-surface-variant text-xs px-3 py-1 rounded-lg whitespace-nowrap">Klassisk miljö</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="flex-grow bg-primary text-white text-sm font-semibold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm">
                <Icon name="directions" className="text-[18px]" />
                Få vägbeskrivning
              </button>
              <button className="w-12 h-12 border border-outline-variant rounded-lg flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors">
                <Icon name="favorite" />
              </button>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
