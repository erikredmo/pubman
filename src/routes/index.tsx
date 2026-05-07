import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pubman — Upptäck stans bästa rundor" },
      { name: "description", content: "Kurerade pubrundor genom Stockholms unika vattenhål." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <div className="min-h-screen pb-28 bg-background text-on-background">
      <TopBar />
      <main className="px-5 pt-6">
        <section className="py-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary leading-tight mb-2">
            Upptäck stans bästa rundor.
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xs mx-auto">
            Följ med på en kurerad upplevelse genom Stockholms unika vattenhål.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 mt-8 max-w-sm mx-auto">
          {/* Guest */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl soft-glow-shadow border border-outline-variant/30 flex flex-col items-center text-center active:scale-[0.98] transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-4 text-primary">
              <Icon name="explore" className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Gäst</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Utforska pubrundor och boka din plats direkt utan konto.
            </p>
            <Link
              to="/discover"
              className="mt-auto w-full py-3 px-6 bg-primary-container text-on-primary text-sm font-semibold tracking-wide rounded-lg hover:opacity-90 transition active:scale-95"
            >
              Hitta runda
            </Link>
          </div>

          {/* Member */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl soft-glow-shadow border border-primary/20 flex flex-col items-center text-center active:scale-[0.98] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <span className="bg-primary text-on-primary text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">
                Rekommenderas
              </span>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 text-on-primary">
              <Icon name="star" className="text-3xl" fill />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Medlem</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Skapa egna rundor, bjud in vänner och spara dina favoritställen.
            </p>
            <Link
              to="/discover"
              className="mt-auto w-full py-3 px-6 bg-primary text-on-primary text-sm font-semibold tracking-wide rounded-lg hover:opacity-90 transition active:scale-95"
            >
              Logga in
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-2xl overflow-hidden relative h-48 soft-glow-shadow border border-outline-variant/20 max-w-sm mx-auto">
          <img
            alt="Stockholm Map"
            className="w-full h-full object-cover grayscale opacity-30 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3P_U_11dynS6978wAulZqg8oY48KBTEGP0veuhgT2eQhaHN7GWZwB-7sGTA0QT8rgeJV4TcW2HMx77-yW6rtT_Mo92xmwc2B3_jIG0vWE7gaAbJR7breJS43-GtEHZHueYE_VCkhZmD9AYRIT1RZvRyfbxw45O2R__n-6_XpTX-adMDVuTAGg1IBhqx0B31eNt6C7QpVXoS305MCISkGj2POT1PqMkyOUedHVqMHvckrgK2Wi4hCqYGWEbSnN0W2beuCpWXAFyyY"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h4 className="text-xl font-bold text-primary mb-2 font-display">Södermalm Crawl</h4>
            <div className="flex gap-2">
              <span className="bg-primary-container text-on-primary px-3 py-1 rounded-full text-xs font-medium">4 Stopp</span>
              <span className="bg-primary-container text-on-primary px-3 py-1 rounded-full text-xs font-medium">2.4 km</span>
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
