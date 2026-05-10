import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { TopBar } from "@/components/TopBar";
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

function CrawlCard({ c, onPreview }: { c: Round; onPreview: (round: Round) => void }) {
  return (
    <button
      onClick={() => onPreview(c)}
      className="flex-shrink-0 w-[280px] bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(0,106,167,0.05)] overflow-hidden text-left active:scale-[0.98] transition-transform"
    >
      <div className="relative h-40">
        <img alt={c.name} className="w-full h-full object-cover" src={c.img} />
        <TagBadges tags={c.tags} />
      </div>
      <div className="p-4">
        <h4 className="text-lg font-bold mb-1 font-display">{c.name}</h4>
        <div className="flex items-center gap-3 text-on-surface-variant text-xs mb-1">
          <div className="flex items-center gap-1">
            <Icon name="distance" className="text-[16px]" /> {c.km}
          </div>
          <div className="flex items-center gap-1">
            <Icon name="local_bar" className="text-[16px]" /> {c.stopCount} krogar
          </div>
        </div>
      </div>
    </button>
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
  const navigate = useNavigate();
  const userName = localStorage.getItem("pubman_user") ?? "";

  const [mode, setMode] = useState<Mode>("ready");
  const [city, setCity] = useState<City>("Stockholm");
  const [activeTags, setActiveTags] = useState<Set<Tag>>(new Set());
  const [selectedBars, setSelectedBars] = useState<Set<string>>(new Set());
  const [allBars, setAllBars] = useState<Bar[]>([]);
  const [allRounds, setAllRounds] = useState<Round[]>([]);
  const [showNaming, setShowNaming] = useState(false);
  const [roundName, setRoundName] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [barsError, setBarsError] = useState(false);
  const [roundsError, setRoundsError] = useState(false);
  const [previewRound, setPreviewRound] = useState<Round | null>(null);
  const [previewStops, setPreviewStops] = useState<{ name: string; tag: string | null }[]>([]);

  useEffect(() => {
    supabase
      .from("bars")
      .select("*")
      .order("name")
      .then(({ data, error: err }) => {
        if (err) { setBarsError(true); return; }
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
    ]).then(([{ data: roundData, error: roundErr }, { data: stopData }]) => {
      if (roundErr) { setRoundsError(true); return; }
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

  function startSession(round: Round) {
    navigate({ to: "/round", search: { id: round.id, name: round.name, sessionId: "" } });
  }

  function openPreview(round: Round) {
    setPreviewRound(round);
    setPreviewStops([]);
    supabase
      .from("round_stops")
      .select("bar_name, tag")
      .eq("round_id", round.id)
      .order("position")
      .then(({ data }) => {
        setPreviewStops(
          (data ?? []).map((r) => ({ name: String(r.bar_name), tag: r.tag ? String(r.tag) : null }))
        );
      });
  }

  function startCustomRound() {
    if (!roundName.trim()) return;
    const stops = [...selectedBars]
      .map((id) => allBars.find((b) => b.id === id))
      .filter(Boolean)
      .map((bar) => ({ name: bar!.name, tag: null }));
    localStorage.setItem("pubman_custom_stops", JSON.stringify(stops));
    navigate({ to: "/round", search: { id: "", name: roundName.trim(), sessionId: "" } });
  }

  async function saveAndStartRound() {
    const trimmedName = roundName.trim();
    if (!trimmedName || saving) return;
    setSaveError("");
    setSaving(true);

    const bars = [...selectedBars]
      .map((id) => allBars.find((b) => b.id === id))
      .filter(Boolean) as Bar[];

    const { data: round, error } = await supabase
      .from("rounds")
      .insert({ name: trimmedName, city, km: "", tags: [], img: "" })
      .select()
      .single();

    if (error || !round) {
      setSaveError(
        error?.code === "23505"
          ? "Det finns redan en runda med det namnet."
          : "Kunde inte spara rundan. Försök igen."
      );
      setSaving(false);
      return;
    }

    await supabase.from("round_stops").insert(
      bars.map((bar, i) => ({ round_id: round.id, bar_name: bar.name, position: i + 1, tag: null }))
    );

    setAllRounds((prev) => [
      ...prev,
      { id: String(round.id), name: String(round.name), city, km: "", tags: [], stopCount: bars.length, img: "" },
    ]);

    setSaving(false);
    navigate({ to: "/round", search: { id: String(round.id), name: String(round.name), sessionId: "" } });
  }

  async function joinByCode() {
    const upper = joinCode.trim().toUpperCase();
    if (!upper) return;
    setJoinError("");
    const { data: session, error } = await supabase
      .from("round_sessions")
      .select("*")
      .eq("code", upper)
      .single();
    if (error || !session) {
      setJoinError("Ingen runda hittades med den koden.");
      return;
    }
    const { error: joinErr } = await supabase
      .from("session_participants")
      .upsert({ session_id: session.id, user_name: userName }, { onConflict: "session_id,user_name" });
    if (joinErr) { setJoinError("Kunde inte gå med i rundan. Försök igen."); return; }
    await supabase
      .from("participant_checkins")
      .upsert({ session_id: session.id, user_name: userName }, { onConflict: "session_id,user_name" });
    navigate({ to: "/round", search: { id: String(session.round_id), name: String(session.round_name), sessionId: String(session.id) } });
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
        <section className="px-5 pt-8 pb-2">
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
          <button
            onClick={() => { setShowJoin(true); setJoinCode(""); setJoinError(""); }}
            className="w-full mt-3 text-center text-sm text-primary font-semibold py-2"
          >
            Har du en kod? Gå med i en runda →
          </button>
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
            {roundsError ? (
              <p className="px-5 text-error text-sm">Kunde inte ladda rundor. Kontrollera din anslutning.</p>
            ) : visibleCrawls.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 px-5 hide-scrollbar pb-2">
                {visibleCrawls.map((c) => (
                  <CrawlCard key={c.id} c={c} onPreview={openPreview} />
                ))}
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
            {barsError ? (
              <p className="text-error text-sm">Kunde inte ladda krogar. Kontrollera din anslutning.</p>
            ) : visibleBars.length > 0 ? (
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

      {/* FAB: start custom round */}
      {mode === "custom" && selectedCount > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-40">
          <button
            onClick={() => { setShowNaming(true); setRoundName(""); }}
            className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
          >
            <Icon name="route" />
            Välj runda med {selectedCount} {selectedCount === 1 ? "krog" : "krogar"}
          </button>
        </div>
      )}

      {/* Naming overlay */}
      {showNaming && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNaming(false)} />
          <div className="relative w-full bg-background rounded-t-3xl p-6 pb-28">
            <h2 className="text-2xl font-bold font-display mb-1">Namnge runda</h2>
            <p className="text-on-surface-variant text-sm mb-5">
              {selectedCount} {selectedCount === 1 ? "krog" : "krogar"} vald
            </p>
            <input
              autoFocus
              type="text"
              placeholder="T.ex. Fredagskväll..."
              value={roundName}
              onChange={(e) => { setRoundName(e.target.value); setSaveError(""); }}
              onKeyDown={(e) => e.key === "Enter" && startCustomRound()}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3.5 text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
            />
            {saveError && <p className="text-sm text-error mb-3">{saveError}</p>}
            <div className="flex flex-col gap-2">
              <button
                onClick={saveAndStartRound}
                disabled={!roundName.trim() || saving}
                className="w-full py-3.5 bg-primary text-on-primary font-semibold rounded-xl disabled:opacity-40 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <Icon name="bookmark" className="text-[18px]" />
                {saving ? "Sparar..." : "Spara & starta runda"}
              </button>
              <button
                onClick={startCustomRound}
                disabled={!roundName.trim() || saving}
                className="w-full py-3 text-on-surface-variant text-sm font-medium border border-outline-variant/40 rounded-xl disabled:opacity-40 active:scale-[0.98] transition"
              >
                Starta utan att spara
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round preview sheet */}
      {previewRound && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewRound(null)} />
          <div className="relative w-full bg-background rounded-t-3xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="relative h-40 flex-shrink-0">
              <img src={previewRound.img} alt={previewRound.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="text-2xl font-extrabold font-display text-white">{previewRound.name}</h2>
                <div className="flex items-center gap-3 text-white/80 text-xs mt-1">
                  <span className="flex items-center gap-1"><Icon name="distance" className="text-[14px]" />{previewRound.km}</span>
                  <span className="flex items-center gap-1"><Icon name="local_bar" className="text-[14px]" />{previewRound.stopCount} krogar</span>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Krogar på rundan</h3>
              {previewStops.length === 0 ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 mb-5">
                  {previewStops.map((stop, i) => (
                    <div key={stop.name} className="flex items-center gap-3 py-2.5 border-b border-outline-variant/20 last:border-0">
                      <span className="text-xs font-bold text-primary w-5 text-center">{i + 1}</span>
                      <span className="flex-grow text-base font-medium text-on-surface">{stop.name}</span>
                      {stop.tag && (
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container px-2 py-0.5 rounded">
                          {stop.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 pb-10 pt-3 flex-shrink-0 border-t border-outline-variant/20">
              <button
                onClick={() => { setPreviewRound(null); startSession(previewRound); }}
                className="w-full py-3.5 bg-primary text-on-primary font-semibold rounded-xl active:scale-[0.98] transition"
              >
                Välj runda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join overlay */}
      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowJoin(false)} />
          <div className="relative w-full bg-background rounded-t-3xl p-6 pb-28">
            <h2 className="text-2xl font-bold font-display mb-1">Gå med i runda</h2>
            <p className="text-on-surface-variant text-sm mb-5">Ange den 6-siffriga koden från den som startade rundan.</p>
            <input
              autoFocus
              type="text"
              placeholder="T.ex. AB3CDE"
              value={joinCode}
              maxLength={6}
              onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
              onKeyDown={(e) => e.key === "Enter" && joinByCode()}
              className={`w-full bg-surface-container-low border rounded-xl px-4 py-3.5 text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 tracking-widest font-bold uppercase mb-1 transition ${
                joinError ? "border-error focus:ring-error/40" : "border-outline-variant/40 focus:ring-primary/40"
              }`}
            />
            {joinError && (
              <p className="text-sm text-error mb-3">{joinError}</p>
            )}
            {!joinError && <div className="mb-4" />}
            <button
              onClick={joinByCode}
              disabled={joinCode.trim().length < 6}
              className="w-full py-3.5 bg-primary text-on-primary font-semibold rounded-xl disabled:opacity-40 active:scale-[0.98] transition"
            >
              Gå med
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
