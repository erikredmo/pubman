import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { TopBar } from "@/components/TopBar";
import { supabase } from "@/lib/supabase";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const Route = createFileRoute("/round")({
  validateSearch: (search: Record<string, unknown>) => ({
    id:        typeof search.id        === "string" ? search.id        : "",
    name:      typeof search.name      === "string" ? search.name      : "Okänd runda",
    sessionId: typeof search.sessionId === "string" ? search.sessionId : "",
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
type ParticipantState = { completed: number; checked_in: boolean };

function roundTitle(userName: string) {
  return userName.endsWith("s") ? `${userName} runda` : `${userName}s runda`;
}

function avatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(name)}&size=64`;
}

function safeGet(key: string): string {
  try { return localStorage.getItem(key) ?? ""; } catch { return ""; }
}

function readStoredRound() {
  try {
    const s = localStorage.getItem("pubman_active_round");
    if (s) return JSON.parse(s) as { id: string; name: string; sessionId: string };
  } catch {}
  return null;
}

function RoundPage() {
  const raw = Route.useSearch();
  const navigate = useNavigate();
  const userName = safeGet("pubman_user");

  const stored = (raw.id === "" && raw.name === "Okänd runda" && raw.sessionId === "")
    ? readStoredRound()
    : null;

  const id        = stored?.id        ?? raw.id;
  const name      = stored?.name      ?? raw.name;
  const sessionId = stored?.sessionId ?? raw.sessionId;
  const notChosen = id === "" && name === "Okänd runda";

  const [stops, setStops]               = useState<Stop[]>([]);
  const [sessionCode, setSessionCode]   = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantStates, setParticipantStates] = useState<Record<string, ParticipantState>>({});
  const [participantImgs,   setParticipantImgs]   = useState<Record<string, string>>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loadError, setLoadError]       = useState(false);

  // Local state for solo play (no session)
  const [localCompleted, setLocalCompleted] = useState(0);
  const [localCheckedIn, setLocalCheckedIn] = useState(false);

  const myState     = participantStates[userName];
  const myCompleted = sessionId ? (myState?.completed ?? 0) : localCompleted;
  const myCheckedIn = sessionId ? (myState?.checked_in ?? false) : localCheckedIn;

  // Persist the active round so the Runda tab always returns here
  useEffect(() => {
    if (!notChosen) {
      localStorage.setItem("pubman_active_round", JSON.stringify({ id, name, sessionId }));
    }
  }, [id, name, sessionId, notChosen]);

  // Load stops from round_stops (preset rounds)
  useEffect(() => {
    if (id) {
      supabase
        .from("round_stops")
        .select("bar_name, tag")
        .eq("round_id", id)
        .order("position")
        .then(({ data, error: err }) => {
          if (err) { setLoadError(true); return; }
          setStops(
            (data ?? []).map((row) => ({
              name: String(row.bar_name),
              tag:  row.tag ? String(row.tag) : null,
            }))
          );
        });
    }
  }, [id]);

  // Load session metadata, participant checkins, and subscribe to realtime
  useEffect(() => {
    if (!sessionId) {
      if (!id) {
        try {
          const s = localStorage.getItem("pubman_custom_stops");
          if (s) setStops(JSON.parse(s));
        } catch {}
      }
      return;
    }

    // Session metadata (code + custom stops)
    supabase
      .from("round_sessions")
      .select("code, custom_stops")
      .eq("id", sessionId)
      .single()
      .then(({ data: session }) => {
        if (!session) return;
        setSessionCode(String(session.code));
        if (!id && session.custom_stops) {
          try {
            const s = Array.isArray(session.custom_stops)
              ? session.custom_stops
              : JSON.parse(session.custom_stops as string);
            setStops(s as Stop[]);
          } catch {}
        }
      });

    // Participants list + their avatar imgs
    supabase
      .from("session_participants")
      .select("user_name, joined_at")
      .eq("session_id", sessionId)
      .order("joined_at")
      .then(async ({ data }) => {
        const names = (data ?? []).map((r) => String(r.user_name));
        setParticipants(names);
        if (names.length) {
          const { data: users } = await supabase
            .from("users").select("name, img").in("name", names);
          const imgs: Record<string, string> = {};
          (users ?? []).forEach((u) => { imgs[String(u.name)] = String(u.img); });
          setParticipantImgs(imgs);
        }
      });

    // Per-user checkin states
    supabase
      .from("participant_checkins")
      .select("user_name, completed, checked_in")
      .eq("session_id", sessionId)
      .then(({ data }) => {
        const states: Record<string, ParticipantState> = {};
        (data ?? []).forEach((r) => {
          states[String(r.user_name)] = {
            completed:  Number(r.completed),
            checked_in: Boolean(r.checked_in),
          };
        });
        setParticipantStates(states);
      });

    // Realtime
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participant_checkins", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as { user_name: string; completed: number; checked_in: boolean };
          setParticipantStates((prev) => ({
            ...prev,
            [row.user_name]: { completed: row.completed, checked_in: row.checked_in },
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "session_participants", filter: `session_id=eq.${sessionId}` },
        async (payload) => {
          const row = payload.new as { user_name: string };
          setParticipants((prev) =>
            prev.includes(row.user_name) ? prev : [...prev, row.user_name]
          );
          const { data: u } = await supabase
            .from("users").select("name, img").eq("name", row.user_name).single();
          if (u) setParticipantImgs((prev) => ({ ...prev, [String(u.name)]: String(u.img) }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, id]);

  const total      = stops.length;
  const isFinished = total > 0 && myCompleted >= total;
  const nextStop   = !isFinished && myCompleted + 1 < total ? stops[myCompleted + 1] : null;

  const circ   = 2 * Math.PI * 44;
  const offset = circ * (1 - (total > 0 ? myCompleted / total : 0));

  async function startRoundSession() {
    const code = generateCode();
    const payload: Record<string, unknown> = {
      round_id: id, round_name: name, code, created_by: userName,
    };
    if (!id) payload.custom_stops = stops;
    const { data: session, error } = await supabase
      .from("round_sessions")
      .insert(payload)
      .select()
      .single();
    if (error || !session) return;
    await supabase.from("session_participants").insert({ session_id: session.id, user_name: userName });
    await supabase.from("participant_checkins")
      .upsert({ session_id: session.id, user_name: userName }, { onConflict: "session_id,user_name" });
    navigate({ to: "/round", search: { id, name, sessionId: String(session.id) } });
  }

  async function cancelRound() {
    if (sessionId) {
      await supabase.from("participant_checkins")
        .update({ cancelled: true })
        .eq("session_id", sessionId).eq("user_name", userName);
    }
    try { localStorage.removeItem("pubman_active_round"); } catch {}
    navigate({ to: "/discover" });
  }

  async function toggleUser(targetUser: string, action: "checkin" | "checkout") {
    if (sessionId) {
      const state = participantStates[targetUser] ?? { completed: 0, checked_in: false };
      if (action === "checkin") {
        await supabase.from("participant_checkins")
          .update({ checked_in: true, updated_at: new Date().toISOString() })
          .eq("session_id", sessionId).eq("user_name", targetUser);
      } else {
        await supabase.from("participant_checkins")
          .update({ checked_in: false, completed: state.completed + 1, updated_at: new Date().toISOString() })
          .eq("session_id", sessionId).eq("user_name", targetUser);
      }
    } else {
      if (action === "checkin") setLocalCheckedIn(true);
      else { setLocalCheckedIn(false); setLocalCompleted((c) => c + 1); }
    }
  }

  if (notChosen) {
    return (
      <div className="min-h-screen pb-32 bg-background text-on-background">
        <TopBar />
        <main className="flex flex-col items-center justify-center px-5 pt-24 text-center">
          <Icon name="local_bar" className="text-primary text-5xl mb-4" />
          <h2 className="text-2xl font-bold font-display text-on-surface mb-2">
            Du har inte valt någon runda.
          </h2>
          <p className="text-on-surface-variant mb-8">Välj en färdig runda eller skapa din egen.</p>
          <Link
            to="/discover"
            className="px-8 py-3.5 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 transition"
          >
            Välj runda
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen pb-32 bg-background text-on-background">
        <TopBar />
        <main className="px-5 pt-8">
          <p className="text-xs text-primary font-bold tracking-widest uppercase mb-1">Vald runda</p>
          <h1 className="text-4xl font-extrabold text-on-surface mb-2 font-display tracking-tight">{name}</h1>
          <p className="text-lg text-on-surface-variant mb-8">{roundTitle(userName)}</p>
          <div className="bg-surface-container-lowest rounded-2xl p-5 app-shadow border border-outline-variant/30 flex items-center gap-4 mb-8">
            <Icon name="local_bar" className="text-primary text-3xl" />
            <div>
              <p className="text-base font-semibold text-on-surface">{total > 0 ? `${total} krogar` : "Laddar..."}</p>
              <p className="text-sm text-on-surface-variant">Tryck på Starta för att dra igång rundan.</p>
            </div>
          </div>
          <button
            onClick={startRoundSession}
            className="w-full py-4 bg-primary text-on-primary text-lg font-bold font-display rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Icon name="play_arrow" />
            Starta runda
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-background text-on-background">
      <TopBar />
      <main className="flex-grow px-5 pt-8 pb-32">

        {/* Header */}
        <section className="mb-8">
          <p className="text-xs text-primary font-bold tracking-widest uppercase mb-1">Dagens Runda</p>
          <h1 className="text-4xl font-extrabold text-on-surface mb-2 font-display tracking-tight">{name}</h1>
          <p className="text-lg text-on-surface-variant mb-4">{roundTitle(userName)}</p>

          <div className="bg-surface-container-lowest rounded-2xl p-6 app-shadow border border-outline-variant/30 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-container" cx="50" cy="50" fill="transparent" r="44"
                  stroke="currentColor" strokeWidth="8" />
                <circle className="text-primary transition-all duration-700" cx="50" cy="50" fill="transparent" r="44"
                  stroke="currentColor" strokeDasharray={circ} strokeDashoffset={offset}
                  strokeLinecap="round" strokeWidth="8" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-primary font-display">{myCompleted}/{total}</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">Pubar</span>
              </div>
            </div>

            {myCompleted > 0 && (
              <div className="w-full flex items-center bg-surface-container-low p-4 rounded-xl mb-3 gap-3">
                <Icon name="history" className="text-primary" />
                <span className="text-base font-semibold">Senaste: {stops[myCompleted - 1].name}</span>
              </div>
            )}

            {sessionCode && (
              <div className="w-full flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-0.5">
                    Kod för att gå med
                  </p>
                  <p className="text-2xl font-extrabold text-primary font-display tracking-widest">{sessionCode}</p>
                </div>
                {participants.length > 0 && (
                  <div className="flex -space-x-2">
                    {participants.map((p) => (
                      <img key={p} src={participantImgs[p] || avatarUrl(p)} alt={p} title={p}
                        className="w-9 h-9 rounded-full border-2 border-background object-cover" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Route list */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-on-surface mb-4 font-display">Rutt</h2>
          {loadError && (
            <p className="text-error text-sm mb-4">Kunde inte ladda krogar. Kontrollera din anslutning.</p>
          )}
          <div className="space-y-4">
            {stops.map((stop, i) => {
              const isDone   = i < myCompleted;
              const isActive = !isFinished && i === myCompleted;
              const isFuture = isFinished ? false : i > myCompleted;
              const payer    = participants.length > 0 ? participants[i % participants.length] : null;

              // Who is physically at this bar right now
              const atBar = participants.filter((p) => {
                const s = participantStates[p];
                return s && s.completed === i && s.checked_in;
              });

              // Who is moving toward this bar (between stop i-1 and stop i)
              const movingToward = participants.filter((p) => {
                const s = participantStates[p];
                return s && s.completed === i && !s.checked_in && i < total;
              });

              // Who has already visited this bar (checked out and moved on)
              const visited = participants.filter((p) => {
                const s = participantStates[p];
                return (s?.completed ?? 0) > i;
              });

              return (
                <div key={stop.name} className={`flex gap-4 items-start relative ${isFuture ? "opacity-50" : ""}`}>

                  {/* Connector line + moving avatars */}
                  {i < stops.length - 1 && (
                    <div className={`absolute left-[11px] top-8 -bottom-4 w-[2px] ${isDone ? "bg-primary-container/60" : "bg-outline-variant/30"}`} />
                  )}
                  {movingToward.length > 0 && i > 0 && (
                    <div className="absolute left-0 -top-5 flex -space-x-1 z-20">
                      {movingToward.map((p) => (
                        <button
                          key={p}
                          onClick={() => toggleUser(p, "checkin")}
                          title={`Checka in ${p}`}
                          className="active:scale-95 transition-transform"
                        >
                          <img src={participantImgs[p] || avatarUrl(p)} alt={p}
                            className="w-6 h-6 rounded-full border-2 border-primary/60 object-cover animate-pulse" />
                        </button>
                      ))}
                    </div>
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

                  {/* Card */}
                  <div className={`flex-grow rounded-2xl p-4 border ${
                    isActive
                      ? "bg-surface-container-lowest border-2 border-primary app-shadow"
                      : isDone
                      ? "bg-surface-container-lowest border-outline-variant/30 app-shadow"
                      : "bg-surface-container border-outline-variant/10"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className={`text-lg font-bold font-display ${isActive ? "text-primary" : "text-on-surface"}`}>
                          {stop.name}
                        </h3>
                        {payer && (
                          <p className="text-xs font-semibold text-primary mt-0.5">🍺 {payer} bjuder</p>
                        )}
                        <p className="text-xs text-on-surface-variant italic mt-0.5">
                          {isDone ? "Besökt"
                            : isActive ? (myCheckedIn ? "Incheckat" : "På väg till")
                            : "Kommande stopp"}
                        </p>

                        {/* Avatars of people currently at this bar */}
                        {atBar.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {atBar.map((p) => (
                              <button
                                key={p}
                                onClick={() => toggleUser(p, "checkout")}
                                title={`Checka ut ${p}`}
                                className="flex items-center gap-1 active:scale-95 transition-transform"
                              >
                                <img src={participantImgs[p] || avatarUrl(p)} alt={p}
                                  className="w-7 h-7 rounded-full border-2 border-primary object-cover" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Avatars of people who have already visited this bar */}
                        {visited.length > 0 && (
                          <div className="flex -space-x-1.5 mt-2">
                            {visited.map((p) => (
                              <img key={p} src={participantImgs[p] || avatarUrl(p)} alt={p} title={`${p} var här`}
                                className="w-6 h-6 rounded-full border-2 border-background object-cover opacity-60" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
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
                          onClick={() => toggleUser(userName, myCheckedIn ? "checkout" : "checkin")}
                          className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors active:scale-[0.98]"
                        >
                          <Icon name={myCheckedIn ? "logout" : "how_to_reg"} className="text-[18px]" />
                          {myCheckedIn ? "Checka ut" : "Checka in"}
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
            <p className="text-on-surface-variant text-sm mb-5">Ni besökte alla {total} krogar. Ät något!</p>
            <button
              onClick={() => {
                try { localStorage.removeItem("pubman_active_round"); } catch {}
                navigate({ to: "/discover" });
              }}
              className="w-full py-3 bg-primary text-on-primary font-semibold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Icon name="flag" className="text-[18px]" />
              Avsluta runda
            </button>
          </div>
        ) : nextStop ? (
          <div className="mt-8">
            <button className="w-full py-4 bg-primary text-white text-lg font-bold font-display rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              <Icon name="location_on" />
              Nästa stopp: {nextStop.name}
            </button>
          </div>
        ) : null}

        {/* Cancel round */}
        {!isFinished && (
          <div className="mt-4">
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-3 text-error text-sm font-semibold rounded-xl border border-error/30 active:scale-[0.98] transition"
              >
                Avbryt runda
              </button>
            ) : (
              <div className="bg-error/10 border border-error/20 rounded-2xl p-4">
                <p className="text-sm text-on-surface font-semibold mb-3 text-center">
                  Avbryta rundan? Dina besökta krogar räknas fortfarande.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2.5 border border-outline-variant/40 text-on-surface text-sm font-semibold rounded-xl active:scale-[0.98] transition"
                  >
                    Tillbaka
                  </button>
                  <button
                    onClick={cancelRound}
                    className="flex-1 py-2.5 bg-error text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition"
                  >
                    Ja, avbryt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
