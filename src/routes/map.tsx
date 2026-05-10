import "leaflet/dist/leaflet.css";
import type * as LeafletType from "leaflet";
import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Karta — Pubman" },
      { name: "description", content: "Se pubrundan visualiserad på kartan." },
    ],
  }),
  component: MapPage,
});

type Stop = { name: string; lat: number; lng: number; position: number };
type ParticipantState = { completed: number; checked_in: boolean };

function avatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(name)}&size=64`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildMarkerHtml(
  label: string,
  state: "done" | "active" | "future",
  atBar: string[],
  movingToward: string[],
  visited: string[],
  participantImgs: Record<string, string>
): string {
  const bg = state === "done" ? "#4caf50" : state === "active" ? "#005181" : "#9e9e9e";
  const ring = state === "active"
    ? "box-shadow:0 0 0 3px rgba(0,81,129,0.25),0 2px 8px rgba(0,0,0,0.3);"
    : "box-shadow:0 2px 8px rgba(0,0,0,0.3);";

  function avatarRow(users: string[], border: string, opacity: number) {
    if (!users.length) return "";
    const imgs = users
      .slice(0, 4)
      .map((p) => {
        const src = escapeHtml(participantImgs[p] || avatarUrl(p));
        return `<img src="${src}" title="${escapeHtml(p)}" style="width:20px;height:20px;border-radius:50%;border:2px solid ${border};margin:0 -2px;object-fit:cover;opacity:${opacity};flex-shrink:0;" />`;
      })
      .join("");
    return `<div style="display:flex;justify-content:center;margin-top:3px;padding:0 2px;">${imgs}</div>`;
  }

  return `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:32px;height:32px;border-radius:50%;background:${bg};color:#fff;
        display:flex;align-items:center;justify-content:center;
        font-size:13px;font-weight:700;font-family:sans-serif;
        border:3px solid #fff;${ring}">
        ${label}
      </div>
      ${avatarRow(atBar, "#005181", 1)}
      ${avatarRow(movingToward, "#f59e0b", 0.9)}
      ${avatarRow(visited, "#ccc", 0.5)}
    </div>
  `;
}

function MapPage() {
  // Leaflet is browser-only — load it dynamically to avoid SSR crash
  const leafletRef = useRef<typeof LeafletType | null>(null);
  const mapRef = useRef<LeafletType.Map | null>(null);
  const markerGroupRef = useRef<LeafletType.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noRound, setNoRound] = useState(false);

  const [userName] = useState(() => {
    try { return localStorage.getItem("pubman_user") ?? ""; } catch { return ""; }
  });

  const [stops, setStops]               = useState<Stop[]>([]);
  const [roundName, setRoundName]       = useState("");
  const [sessionId, setSessionId]       = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantStates, setParticipantStates] = useState<Record<string, ParticipantState>>({});
  const [participantImgs, setParticipantImgs]     = useState<Record<string, string>>({});

  const myCompleted = participantStates[userName]?.completed ?? 0;

  // Dynamic Leaflet import (client-only)
  useEffect(() => {
    import("leaflet").then((mod) => {
      leafletRef.current = mod;
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadRound();
  }, [mounted]);

  async function loadRound() {
    let activeRound: { id?: string; sessionId?: string; name?: string } | null = null;
    try {
      const raw = localStorage.getItem("pubman_active_round");
      if (raw) activeRound = JSON.parse(raw);
    } catch {}

    if (!activeRound) { setNoRound(true); setLoading(false); return; }

    const { id: roundId, sessionId: sid, name } = activeRound;
    if (name) setRoundName(name);
    if (sid) setSessionId(sid);

    if (!roundId) { setNoRound(true); setLoading(false); return; }

    const { data: stopRows } = await supabase
      .from("round_stops")
      .select("bar_name, position, lat, lng")
      .eq("round_id", roundId)
      .order("position");

    const mapped: Stop[] = (stopRows ?? [])
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => ({
        name:     String(s.bar_name),
        lat:      Number(s.lat),
        lng:      Number(s.lng),
        position: Number(s.position),
      }));

    if (!mapped.length) { setNoRound(true); setLoading(false); return; }

    setStops(mapped);
    setLoading(false); // unblock render before fetching participants

    if (sid) {
      const [{ data: pData }, { data: checkins }] = await Promise.all([
        supabase.from("session_participants").select("user_name, joined_at")
          .eq("session_id", sid).order("joined_at"),
        supabase.from("participant_checkins").select("user_name, completed, checked_in")
          .eq("session_id", sid),
      ]);

      const names = (pData ?? []).map((r) => String(r.user_name));
      setParticipants(names);

      if (names.length) {
        const { data: users } = await supabase.from("users").select("name, img").in("name", names);
        const imgs: Record<string, string> = {};
        (users ?? []).forEach((u) => { imgs[String(u.name)] = String(u.img); });
        setParticipantImgs(imgs);
      }

      const states: Record<string, ParticipantState> = {};
      (checkins ?? []).forEach((r) => {
        states[String(r.user_name)] = { completed: Number(r.completed), checked_in: Boolean(r.checked_in) };
      });
      setParticipantStates(states);
    }
  }

  // Realtime subscription
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`map:${sessionId}`)
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
          setParticipants((prev) => prev.includes(row.user_name) ? prev : [...prev, row.user_name]);
          const { data: u } = await supabase.from("users").select("name, img").eq("name", row.user_name).single();
          if (u) setParticipantImgs((prev) => ({ ...prev, [String(u.name)]: String(u.img) }));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  // Initialize map — depends on loading so the effect re-fires when the container becomes visible
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mounted || loading || !containerRef.current || stops.length === 0 || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const latLngs = stops.map((s) => [s.lat, s.lng] as [number, number]);
    L.polyline(latLngs, { color: "#005181", weight: 3, opacity: 0.55, dashArray: "7 6" }).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    map.fitBounds(L.latLngBounds(latLngs), { padding: [56, 80] });
  }, [mounted, loading, stops]);

  // Re-render markers whenever participant state changes
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !markerGroupRef.current || stops.length === 0) return;

    markerGroupRef.current.clearLayers();
    const total = stops.length;

    stops.forEach((stop, i) => {
      const state: "done" | "active" | "future" =
        i < myCompleted ? "done" : i === myCompleted ? "active" : "future";

      const atBar = participants.filter((p) => {
        const s = participantStates[p];
        return s && s.completed === i && s.checked_in;
      });
      const movingToward = participants.filter((p) => {
        const s = participantStates[p];
        return s && s.completed === i && !s.checked_in && i < total;
      });
      const visited = participants.filter((p) => (participantStates[p]?.completed ?? 0) > i);

      const html = buildMarkerHtml(String(i + 1), state, atBar, movingToward, visited, participantImgs);
      const icon = L.divIcon({ className: "", iconSize: [32, 32], iconAnchor: [16, 16], html });

      L.marker([stop.lat, stop.lng], { icon })
        .bindTooltip(stop.name, { permanent: false, direction: "top", offset: [0, -20] })
        .addTo(markerGroupRef.current!);
    });
  }, [stops, myCompleted, participants, participantStates, participantImgs]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerGroupRef.current = null; }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <TopBar />

      <main className="flex-1 relative" style={{ height: "calc(100vh - 4rem - 4rem)" }}>
        {!mounted || loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : noRound ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center">
              <Icon name="map" className="text-3xl text-on-surface-variant" />
            </div>
            <h2 className="text-xl font-bold text-on-surface font-display">Ingen aktiv runda</h2>
            <p className="text-on-surface-variant text-sm">
              Starta eller gå med i en runda för att se den på kartan.
            </p>
          </div>
        ) : (
          <>
            <div ref={containerRef} className="absolute inset-0 z-0" />

            {/* Status card */}
            {roundName && (
              <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
                <div className="bg-surface-container-lowest/95 backdrop-blur-sm px-4 py-3 rounded-2xl border border-outline-variant/30 shadow-md">
                  <div className="flex items-center gap-3">
                    <Icon name="route" className="text-primary text-xl" />
                    <div className="min-w-0">
                      <p className="text-xs text-on-surface-variant">Pågående runda</p>
                      <p className="text-sm font-semibold text-primary truncate">{roundName}</p>
                    </div>
                    <div className="ml-auto text-right flex-shrink-0">
                      <p className="text-xs text-on-surface-variant">Stopp</p>
                      <p className="text-sm font-bold text-on-surface">{myCompleted} / {stops.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legend — top-right, below status card */}
            <div className="absolute top-24 right-4 z-[1000] pointer-events-none">
              <div className="bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-1.5">
                {([
                  { color: "#005181", label: "Incheckat" },
                  { color: "#f59e0b", label: "På väg" },
                  { color: "#ccc",    label: "Besökt" },
                ] as const).map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: "1.5px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#555", fontFamily: "sans-serif" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
