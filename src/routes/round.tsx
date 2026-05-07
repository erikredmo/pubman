import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/round")({
  validateSearch: (search: Record<string, unknown>) => ({
    id:   typeof search.id   === "string" ? search.id   : "",
    name: typeof search.name === "string" ? search.name : "Okänd runda",
  }),
  head: () => ({
    meta: [
      { title: "Aktiv runda — Pubman" },
      { name: "description", content: "Följ din pågående pubrunda steg för steg." },
    ],
  }),
  component: RoundPage,
});

type Stop = { name: string; tag: string | null };

function RoundPage() {
  const { id, name } = Route.useSearch();
  const [stops, setStops] = useState<Stop[]>([]);
  const [completed, setCompleted] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("round_stops")
      .select("bar_name, tag")
      .eq("round_id", id)
      .order("position")
      .then(({ data }) => {
        setStops(
          (data ?? []).map((row) => ({
            name: String(row.bar_name),
            tag:  row.tag ? String(row.tag) : null,
          }))
        );
      });
  }, [id]);

  const total = stops.length;
  const isFinished = total > 0 && completed === total;
  const nextStop = !isFinished && completed + 1 < total ? stops[completed + 1] : null;

  const circ = 2 * Math.PI * 44;
  const offset = circ * (1 - (total > 0 ? completed / total : 0));

  function handleCheckButton() {
    if (!checkedIn) {
      setCheckedIn(true);
    } else {
      setCheckedIn(false);
      setCompleted((c) => c + 1);
    }
  }

  return (
    <div className="min-h-screen pb-32 bg-background text-on-background">
      <TopBar userName="Sven Svensson" />
      <main className="flex-grow px-5 pt-8 pb-32">

        {/* Header */}
        <section className="mb-8">
          <p className="text-xs text-primary font-bold tracking-widest uppercase mb-1">
            Dagens Runda
          </p>
          <h1 className="text-4xl font-extrabold text-on-surface mb-2 font-display tracking-tight">
            {name}
          </h1>
          <p className="text-lg text-on-surface-variant mb-4">Svens Runda</p>

          {/* Progress ring */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 app-shadow border border-outline-variant/30 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-surface-container"
                  cx="50" cy="50" fill="transparent" r="44"
                  stroke="currentColor" strokeWidth="8"
                />
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
                  {completed}/{total}
                </span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">Pubar</span>
              </div>
            </div>

            {completed > 0 && (
              <div className="w-full flex justify-between items-center bg-surface-container-low p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Icon name="history" className="text-primary" />
                  <span className="text-base font-semibold">Senaste: {stops[completed - 1].name}</span>
                </div>
                <button className="text-primary text-sm font-semibold hover:underline">
                  Visa historik
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Route list */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-on-surface mb-4 font-display">Rutt</h2>
          <div className="space-y-4">
            {stops.map((stop, i) => {
              const isDone    = i < completed;
              const isActive  = !isFinished && i === completed;
              const isFuture  = isFinished ? false : i > completed;

              return (
                <div key={stop.name} className={`flex gap-4 items-start relative ${isFuture ? "opacity-50" : ""}`}>
                  {/* Connector line */}
                  {i < stops.length - 1 && (
                    <div
                      className={`absolute left-[11px] top-8 -bottom-4 w-[2px] ${
                        isDone ? "bg-primary-container/60" : "bg-outline-variant/30"
                      }`}
                    />
                  )}

                  {/* Step icon */}
                  {isDone && (
                    <div className="z-10 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center ring-4 ring-background flex-shrink-0">
                      <Icon name="check" className="text-white text-[16px]" />
                    </div>
                  )}
                  {isActive && (
                    <div className="z-10 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center ring-4 ring-background shadow-[0_0_12px_rgba(0,106,167,0.3)] flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                  {isFuture && (
                    <div className="z-10 w-6 h-6 rounded-full bg-surface-variant border-2 border-background ring-4 ring-background flex-shrink-0" />
                  )}
                  {isFinished && (
                    <div className="z-10 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center ring-4 ring-background flex-shrink-0">
                      <Icon name="check" className="text-white text-[16px]" />
                    </div>
                  )}

                  {/* Card */}
                  <div
                    className={`flex-grow rounded-2xl p-4 border ${
                      isActive
                        ? "bg-surface-container-lowest border-2 border-primary app-shadow"
                        : isDone || isFinished
                        ? "bg-surface-container-lowest border-outline-variant/30 app-shadow"
                        : "bg-surface-container border-outline-variant/10"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3
                          className={`text-lg font-bold font-display ${
                            isActive ? "text-primary" : "text-on-surface"
                          }`}
                        >
                          {stop.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant italic">
                          {isDone
                            ? "Besökt"
                            : isActive
                            ? checkedIn
                              ? "Incheckat - njut"
                              : "På väg till"
                            : isFinished
                            ? "Besökt"
                            : "Kommande stopp"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {stop.tag && (
                          <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded uppercase">
                            {stop.tag}
                          </span>
                        )}
                        {isFuture && <Icon name="lock" className="text-on-surface-variant/50" />}
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-4 pt-4 border-t border-primary/10">
                        <button
                          onClick={handleCheckButton}
                          className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors active:scale-[0.98]"
                        >
                          <Icon name={checkedIn ? "logout" : "how_to_reg"} className="text-[18px]" />
                          {checkedIn ? "Checka ut" : "Checka in"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        {isFinished ? (
          <div className="mt-8 bg-primary-container/20 border border-primary/20 rounded-2xl p-6 text-center">
            <Icon name="celebration" className="text-primary text-4xl mb-2" />
            <h3 className="text-xl font-bold text-on-surface font-display mb-1">Runda klar!</h3>
            <p className="text-on-surface-variant text-sm">
              Ni besökte alla {total} krogar. Ät något!
            </p>
          </div>
        ) : nextStop ? (
          <div className="mt-8">
            <button className="w-full py-4 bg-primary text-white text-lg font-bold font-display rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              <Icon name="location_on" />
              Nästa stopp: {nextStop.name}
            </button>
          </div>
        ) : null}

      </main>
      <BottomNav />
    </div>
  );
}
