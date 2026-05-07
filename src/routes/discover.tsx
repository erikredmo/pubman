import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Upptäck rundor — Pubman" },
      { name: "description", content: "Bläddra bland pubrundor i Stockholm, Göteborg och Malmö." },
    ],
  }),
  component: DiscoverPage,
});

type Mode = "ready" | "custom";
type Tag = "uteservering" | "rooftop";
type City = "Stockholm" | "Göteborg" | "Malmö";

type Bar = {
  id: string;
  name: string;
  city: City;
  type: string;
  tags: Tag[];
  img: string;
};

type Round = {
  id: string;
  name: string;
  city: City;
  km: string;
  tags: Tag[];
  img: string;
  stopCount: number;
};

const TAG_LABELS: Record<Tag, string> = {
  uteservering: "Uteservering",
  rooftop: "Rooftop",
};

function TagBadges({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="absolute bottom-3 left-3 flex gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-black/60 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
        >
          {tag === "rooftop" ? "🏙 Rooftop" : "☀️ Ute"}
        </span>
      ))}
    </div>
  );
}

function CrawlCard({ c }: { c: Round }) {
  return (
    <div className="flex-shrink-0 w-[280px] bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(0,106,167,0.05)] overflow-hidden">
      <div className="relative h-40">
        <img alt={c.name} className="w-full h-full object-cover" src={c.img} />
        <TagBadges tags={c.tags} />
      </div>
      <div className="p-4">
        <h4 className="text-lg font-bold mb-1 font-display">{c.name}</h4>
        <div className="flex items-center gap-3 text-on-surface-variant text-xs mb-3">
          <div className="flex items-center gap-1">
            <Icon name="distance" className="text-[16px]" /> {c.km}
          </div>
          <div className="flex items-center gap-1">
            <Icon name="local_bar" className="text-[16px]" /> {c.stopCount} krogar
          </div>
        </div>
        <Link
          to="/round"
          search={{ id: c.id, name: c.name }}
          className="block text-center w-full bg-primary-container text-on-primary py-3 rounded-2xl text-sm font-semibold hover:bg-primary transition-colors"
        >
          Starta Runda
        </Link>
      </div>
    </div>
  );
}

function BarCard({ bar, selected, onToggle }: { bar: Bar; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-full text-left bg-surface-container-lowest rounded-2xl overflow-hidden transition-all duration-200 ${
        selected
          ? "ring-2 ring-primary shadow-[0_0_0_2px] shadow-primary/20"
          : "border border-outline-variant/30"
      }`}
    >
      <div className="relative h-32">
        <img alt={bar.name} className="w-full h-full object-cover" src={bar.img} />
        <TagBadges tags={bar.tags} />
        <div
          className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            selected ? "bg-primary text-on-primary" : "bg-white/80 backdrop-blur text-on-surface-variant"
          }`}
        >
          <Icon name={selected ? "check" : "add"} className="text-[18px]" />
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-bold text-on-surface">{bar.name}</h4>
        <span className="text-xs text-on-surface-variant">{bar.type}</span>
      </div>
    </button>
  );
}

function DiscoverPage() {
  const [mode, setMode] = useState<Mode>("ready");
  const [city, setCity] = useState<City>("Stockholm");
  const [activeTags, setActiveTags] = useState<Set<Tag>>(new Set());
  const [selectedBars, setSelectedBars] = useState<Set<string>>(new Set());
  const [allBars, setAllBars] = useState<Bar[]>([]);
  const [allRounds, setAllRounds] = useState<Round[]>([]);

  useEffect(() => {
    supabase
      .from("bars")
      .select("*")
      .order("name")
      .then(({ data }) => {
        setAllBars(
          (data ?? []).map((row) => ({
            id:   String(row.id),
            name: String(row.name),
            city: row.city as City,
            type: String(row.type),
            tags: (row.tags as string[]).filter((t): t is Tag =>
              t === "uteservering" || t === "rooftop"
            ),
            img: String(row.img ?? ""),
          }))
        );
      });
  }, []);

  useEffect(() => {
    Promise.all([
      supabase.from("rounds").select("*").order("name"),
      supabase.from("round_stops").select("round_id"),
    ]).then(([{ data: roundData }, { data: stopData }]) => {
      const countByRound: Record<string, number> = {};
      (stopData ?? []).forEach((s) => {
        const rid = String(s.round_id);
        countByRound[rid] = (countByRound[rid] ?? 0) + 1;
      });
      setAllRounds(
        (roundData ?? []).map((row) => ({
          id:        String(row.id),
          name:      String(row.name),
          city:      row.city as City,
          km:        String(row.km),
          tags:      (row.tags as string[]).filter((t): t is Tag =>
            t === "uteservering" || t === "rooftop"
          ),
          img:       String(row.img ?? ""),
          stopCount: countByRound[String(row.id)] ?? 0,
        }))
      );
    });
  }, []);

  function toggleTag(tag: Tag) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function toggleBar(id: string) {
    setSelectedBars((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function switchMode(next: Mode) {
    setMode(next);
    setActiveTags(new Set());
  }

  const cities: City[] = ["Stockholm", "Göteborg", "Malmö"];
  const filterableTags: Tag[] = ["uteservering", "rooftop"];

  const visibleCrawls = allRounds
    .filter((c) => c.city === city && (activeTags.size === 0 || c.tags.some((t) => activeTags.has(t))))
    .sort((a, b) => a.name.localeCompare(b.name, "sv"));

  const visibleBars = allBars
    .filter((b) => b.city === city && (activeTags.size === 0 || b.tags.some((t) => activeTags.has(t))))
    .sort((a, b) => a.name.localeCompare(b.name, "sv"));

  const selectedCount = selectedBars.size;

  return (
    <div className="min-h-screen pb-32 bg-background text-on-background">
      <TopBar />
      <main>

        {/* Mode toggle */}
        <section className="px-5 pt-8 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => switchMode("ready")}
              className={`py-4 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 flex flex-col items-center gap-2 ${
                mode === "ready"
                  ? "bg-primary text-on-primary shadow-md"
                  : "bg-surface-container-low text-on-surface-variant border border-outline-variant/30"
              }`}
            >
              <Icon name="route" className="text-2xl" />
              Välj färdig runda
            </button>
            <button
              onClick={() => switchMode("custom")}
              className={`py-4 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 flex flex-col items-center gap-2 ${
                mode === "custom"
                  ? "bg-primary text-on-primary shadow-md"
                  : "bg-surface-container-low text-on-surface-variant border border-outline-variant/30"
              }`}
            >
              <Icon name="tune" className="text-2xl" />
              Skapa din egna runda
            </button>
          </div>
        </section>

        {/* Filters */}
        <section className="px-5 mb-6">
          <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  city === c
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {filterableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTags.has(tag)
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {TAG_LABELS[tag]}
              </button>
            ))}
          </div>
        </section>

        {/* Ready-made crawls */}
        {mode === "ready" && (
          <section className="mb-8">
            <div className="px-5 flex justify-between items-center mb-3">
              <h3 className="text-2xl font-bold text-on-surface font-display">{city}</h3>
            </div>
            {visibleCrawls.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 px-5 hide-scrollbar pb-2">
                {visibleCrawls.map((c) => <CrawlCard key={c.id} c={c} />)}
              </div>
            ) : (
              <p className="px-5 text-on-surface-variant text-sm">
                Inga rundor matchar dina filter.
              </p>
            )}
          </section>
        )}

        {/* Custom bar selection */}
        {mode === "custom" && (
          <section className="px-5 mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-2xl font-bold text-on-surface font-display">{city}</h3>
              {selectedCount > 0 && (
                <button onClick={() => setSelectedBars(new Set())} className="text-on-surface-variant text-sm">
                  Rensa val
                </button>
              )}
            </div>
            {visibleBars.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {visibleBars.map((bar) => (
                  <BarCard
                    key={bar.id}
                    bar={bar}
                    selected={selectedBars.has(bar.id)}
                    onToggle={() => toggleBar(bar.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm">
                Inga krogar matchar dina filter.
              </p>
            )}
          </section>
        )}

      </main>

      {/* FAB: add crawl (ready mode) or start custom round */}
      {mode === "ready" && (
        <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40">
          <Icon name="add" />
        </button>
      )}
      {mode === "custom" && selectedCount > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-40">
          <Link
            to="/round"
            search={{ id: "", name: "Min runda" }}
            className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
          >
            <Icon name="route" />
            Starta runda med {selectedCount} {selectedCount === 1 ? "krog" : "krogar"}
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
