import { useState, useEffect } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { supabase, type DbUser } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    let hasUser = false;
    try { hasUser = !!localStorage.getItem("pubman_user"); } catch {}
    if (hasUser) throw redirect({ to: "/discover" });
  },
  head: () => ({
    meta: [
      { title: "Pubman — Välj användare" },
      { name: "description", content: "Logga in på Pubman och upptäck stans bästa rundor." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<DbUser | null>(null);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase
      .from("users")
      .select("*")
      .order("name")
      .then(({ data, error: err }) => {
        if (err) { setLoadError(true); setLoading(false); return; }
        setUsers(data ?? []);
        setLoading(false);
      });
  }, []);

  function pickUser(user: DbUser) {
    setSelected(user);
    setPw("");
    setError(false);
  }

  function back() {
    setSelected(null);
    setPw("");
    setError(false);
  }

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!selected) return;
    if (pw === selected.password) {
      localStorage.setItem("pubman_user", selected.name);
      localStorage.setItem("pubman_img",  selected.img);
      navigate({ to: "/discover" });
    } else {
      setError(true);
      setPw("");
    }
  }

  return (
    <div className="min-h-screen pb-28 bg-background text-on-background">
      <main className="px-5 pt-6 max-w-sm mx-auto">

        {/* Step 1: pick a user */}
        {!selected && (
          <>
            <section className="py-8 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-primary leading-tight mb-2">
                Hallå Pubman, törstig?
              </h1>
              <p className="text-lg text-on-surface-variant">
                Välj din användare för att logga in.
              </p>
            </section>

            {loading ? (
              <div className="flex justify-center mt-8">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : loadError ? (
              <p className="text-center text-error mt-8 text-sm">
                Kunde inte ladda användare. Kontrollera din anslutning.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => pickUser(user)}
                    className="bg-surface-container-lowest p-6 rounded-2xl soft-glow-shadow border border-outline-variant/30 flex flex-col items-center text-center active:scale-[0.97] transition-all duration-200 hover:border-primary/40"
                  >
                    <img
                      src={user.img}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-primary/20"
                    />
                    <span className="text-base font-semibold text-on-surface">{user.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 2: enter password */}
        {selected && (
          <>
            <section className="py-8 text-center">
              <img
                src={selected.img}
                alt={selected.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-primary/20"
              />
              <h1 className="text-3xl font-extrabold tracking-tight text-primary leading-tight mb-1">
                Hej, {selected.name}!
              </h1>
              <p className="text-on-surface-variant">Skriv in ditt lösenord.</p>
            </section>

            <form onSubmit={submit} className="flex flex-col gap-4 mt-2">
              <div className="relative">
                <input
                  autoFocus
                  type="password"
                  placeholder="Lösenord"
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); setError(false); }}
                  className={`w-full bg-surface-container-low border rounded-xl px-4 py-3.5 text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 transition ${
                    error
                      ? "border-error focus:ring-error/40"
                      : "border-outline-variant/40 focus:ring-primary/40"
                  }`}
                />
                {error && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <Icon name="error" className="text-[16px]" />
                    Fel lösenord, försök igen.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition"
              >
                Logga in
              </button>

              <button
                type="button"
                onClick={back}
                className="w-full py-3 text-on-surface-variant text-sm font-medium flex items-center justify-center gap-1 hover:text-on-surface transition"
              >
                <Icon name="arrow_back" className="text-[18px]" />
                Byt användare
              </button>
            </form>
          </>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
