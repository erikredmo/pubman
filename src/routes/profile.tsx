import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";

const PRESET_SEEDS = ["Bear", "River", "Storm", "Nova", "Blaze", "Dawn", "Echo", "Frost"];

function dicebearUrl(seed: string, size = 128) {
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(seed)}&size=${size}`;
}

function seedFromUrl(url: string, fallback: string): string {
  try {
    return decodeURIComponent(new URL(url).searchParams.get("seed") ?? fallback);
  } catch {
    return fallback;
  }
}

function safeGet(key: string) {
  try { return localStorage.getItem(key) ?? ""; } catch { return ""; }
}

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
  const navigate = useNavigate();

  const [name, setName] = useState(() => safeGet("pubman_user"));
  const [img,  setImg]  = useState(() => safeGet("pubman_img") || dicebearUrl(safeGet("pubman_user")));

  const [stats, setStats] = useState({ rounds: 0, beers: 0, bars: 0 });

  const [showKonto, setShowKonto] = useState(false);
  const [editName,  setEditName]  = useState(name);
  const [editSeed,  setEditSeed]  = useState(() => {
    const storedImg  = safeGet("pubman_img");
    const storedName = safeGet("pubman_user");
    return storedImg ? seedFromUrl(storedImg, storedName) : storedName;
  });
  const [nameError, setNameError] = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (!name) return;
    loadStats(name);
  }, [name]);

  async function loadStats(userName: string) {
    const { data: checkins } = await supabase
      .from("participant_checkins")
      .select("session_id, completed, cancelled")
      .eq("user_name", userName);

    const rounds = (checkins ?? []).filter((c) => !c.cancelled).length;
    const totalCompleted = (checkins ?? []).reduce((s, r) => s + Number(r.completed), 0);

    if (!checkins?.length) {
      setStats({ rounds: 0, beers: 0, bars: 0 });
      return;
    }

    // Unique bars: join sessions → round_stops / custom_stops
    const sessionIds = checkins.map((c) => c.session_id);
    const { data: sessions } = await supabase
      .from("round_sessions")
      .select("id, round_id, custom_stops")
      .in("id", sessionIds);

    const roundIds = (sessions ?? [])
      .map((s) => s.round_id)
      .filter((id): id is string => !!id && id !== "");

    let stops: { round_id: string; bar_name: string; position: number }[] = [];
    if (roundIds.length) {
      const { data } = await supabase
        .from("round_stops")
        .select("round_id, bar_name, position")
        .in("round_id", roundIds);
      stops = data ?? [];
    }

    const barNames = new Set<string>();
    for (const checkin of checkins) {
      const session = (sessions ?? []).find((s) => s.id === checkin.session_id);
      if (!session) continue;
      const count = Number(checkin.completed);
      if (session.round_id && session.round_id !== "") {
        stops
          .filter((s) => s.round_id === session.round_id && s.position <= count)
          .forEach((s) => barNames.add(s.bar_name));
      } else if (session.custom_stops) {
        const custom: { name: string }[] = Array.isArray(session.custom_stops)
          ? session.custom_stops
          : JSON.parse(session.custom_stops as string);
        custom.slice(0, count).forEach((s) => barNames.add(s.name));
      }
    }

    setStats({ rounds, beers: totalCompleted, bars: barNames.size });
  }

  function openKonto() {
    setEditName(name);
    setEditSeed(seedFromUrl(img, name));
    setNameError("");
    setShowKonto((v) => !v);
  }

  async function saveKonto() {
    const newName = editName.trim();
    if (!newName) { setNameError("Ange ett namn."); return; }
    setNameError("");
    setSaving(true);

    const newImg = dicebearUrl(editSeed || newName);

    if (newName !== name) {
      const { data: existing } = await supabase
        .from("users").select("name").eq("name", newName).maybeSingle();
      if (existing) { setNameError("Namnet är redan taget."); setSaving(false); return; }
    }

    const { error: updateError } = await supabase
      .from("users").update({ name: newName, img: newImg }).eq("name", name);
    if (updateError) { setNameError("Kunde inte spara. Försök igen."); setSaving(false); return; }

    if (newName !== name) {
      await supabase.from("session_participants").update({ user_name: newName }).eq("user_name", name);
      await supabase.from("participant_checkins").update({ user_name: newName }).eq("user_name", name);
    }

    try {
      localStorage.setItem("pubman_user", newName);
      localStorage.setItem("pubman_img", newImg);
    } catch {}

    setName(newName);
    setImg(newImg);
    setSaving(false);
    setShowKonto(false);
    window.dispatchEvent(new Event("pubman-user-changed"));
  }

  function clearSession() {
    try {
      localStorage.removeItem("pubman_user");
      localStorage.removeItem("pubman_img");
      localStorage.removeItem("pubman_active_round");
    } catch {}
    navigate({ to: "/" });
  }

  // Avatar seeds: always show current first, then presets (no duplicates)
  const avatarOptions = [editSeed, ...PRESET_SEEDS.filter((s) => s !== editSeed)].slice(0, 8);

  return (
    <div className="min-h-screen pb-32 bg-background text-on-background">
      <TopBar />
      <main className="px-5 pt-8">

        {/* Profile card */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 app-shadow border border-outline-variant/30 flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 mb-4">
            <img alt={name} className="w-full h-full object-cover" src={img} />
          </div>
          <h1 className="text-2xl font-bold font-display text-on-surface">{name}</h1>
        </div>

        {/* Statistik */}
        <h2 className="text-xl font-bold text-on-surface mb-4 font-display">Statistik</h2>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {([
            { v: stats.beers,  l: "Öl" },
            { v: stats.bars,   l: "Krogar" },
            { v: stats.rounds, l: "Rundor" },
          ] as const).map((s) => (
            <div key={s.l} className="bg-surface-container-lowest rounded-2xl p-4 app-shadow border border-outline-variant/30 text-center">
              <p className="text-3xl font-extrabold text-primary font-display">{s.v}</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Inställningar */}
        <h2 className="text-xl font-bold text-on-surface mb-4 font-display">Inställningar</h2>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 divide-y divide-outline-variant/30 overflow-hidden">

          {/* Konto */}
          <button
            onClick={openKonto}
            className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-low transition text-left"
          >
            <Icon name="settings" className="text-primary" />
            <span className="flex-grow text-base font-medium text-on-surface">Konto</span>
            <Icon name={showKonto ? "expand_less" : "chevron_right"} className="text-on-surface-variant" />
          </button>

          {showKonto && (
            <div className="px-5 py-5 bg-surface-container-low space-y-5">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  Profilnamn
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => { setEditName(e.target.value); setNameError(""); }}
                  className="w-full bg-background rounded-xl px-4 py-3 text-base text-on-surface outline-none border border-outline-variant/40 focus:border-primary transition"
                />
                {nameError && <p className="text-xs text-error mt-1.5">{nameError}</p>}
              </div>

              {/* Avatar picker */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  Profilbild
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {avatarOptions.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => setEditSeed(seed)}
                      className={`rounded-xl overflow-hidden border-2 transition active:scale-95 ${
                        editSeed === seed ? "border-primary shadow-md" : "border-transparent opacity-60"
                      }`}
                    >
                      <img
                        src={dicebearUrl(seed, 64)}
                        alt={seed}
                        className="w-full aspect-square object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveKonto}
                disabled={saving}
                className="w-full py-3 bg-primary text-on-primary font-semibold rounded-xl transition active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? "Sparar..." : "Spara ändringar"}
              </button>
            </div>
          )}

          <button onClick={clearSession} className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-low transition text-left">
            <Icon name="logout" className="text-error" />
            <span className="flex-grow text-base font-medium text-error">Logga ut</span>
            <Icon name="chevron_right" className="text-on-surface-variant" />
          </button>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
