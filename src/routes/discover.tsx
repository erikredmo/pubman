import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Upptäck rundor — Pubman" },
      { name: "description", content: "Bläddra bland pubrundor i Stockholm, Göteborg och Malmö." },
    ],
  }),
  component: DiscoverPage,
});

type Crawl = {
  name: string;
  img: string;
  rating: number;
  km: string;
  pubs: number;
};

const stockholm: Crawl[] = [
  {
    name: "Söders Höjder",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm1rmoT-XeDKhPG2YDZw9_2tG-VDJRRM0KqpVTeioBxaeJPvJTEPGp4_w24JxjIniedbsSzKtkJqMN8eBK64WX0HX86WSi7aDuuYZk_wXewlXTQYuVBYEZnhUzlUVgjWZUFYdckPARFtGfeVIVcP-ex5Lu6fYuXWKmafG7ARS4RLqkzGQjADDnfhr2F80gJMxjZxWzP_qPNWMHT8t1bb9rbo4lT-z8NHR8Kd_W3Qd9ua0f1Px2lahTBNdQrRFaWcaGZ2gyLi5N7QU",
    rating: 4.8, km: "2.4 km", pubs: 5,
  },
  {
    name: "Vin i City",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA64HEFKBHElCge2c3MZUC-pGNS2NuCSdxOzcBmqaUhQG_13aqz1VYokHr9dLy1jyIZENo-4x1SB1pgKXQwmVoziooMgSsOwMlibg7mmXNp0lU2ScgK7HPjohHRHTD8rPURz-qY2IgWwvghHQ1JaMSXNCGqQfzf0T-67yeghJahB6o8ES0yghQWSYPZsKe7nSRB3-fr3BlNLS9ihuG5zezAJ0WSclK8wD1u2pobcgTr00COoqQhN3DeeyX2cmzevcDlr_jB7SDXahk",
    rating: 4.5, km: "1.1 km", pubs: 4,
  },
];

const goteborg: Crawl[] = [
  {
    name: "Majorna Runt",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjDtZSCq8oZ4DjqZsunRbLgTH_h7mDHwFHVHqOt0TlcmTxiJUq24g9U8PA569CIhIDIjiK-1YOf1kosHqxaesvny-fWOAATlQm1fRMhIqT8rGvJNhKaAuYtGPbXIcNnaXKv9KGC9FlzTToBQsGYwDpaHFV4t8sGWvBC3w80HGy025QFeth4XLdbe2_UAjRVaMc3gAgi_xcn5QhR2Ue0Nf_F3yVsVuegfhF4A9DJcQ-Dh2GS8JSP6ElyP7YrbH402JrbvCRxchiS38",
    rating: 4.9, km: "3.2 km", pubs: 6,
  },
];

function CrawlCard({ c }: { c: Crawl }) {
  return (
    <div className="flex-shrink-0 w-[280px] bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(0,106,167,0.05)] overflow-hidden">
      <div className="relative h-40">
        <img alt={c.name} className="w-full h-full object-cover" src={c.img} />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
          <Icon name="star" className="text-secondary text-[16px]" fill />
          <span className="text-xs font-semibold text-on-surface">{c.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-lg font-bold mb-1 font-display">{c.name}</h4>
        <div className="flex items-center gap-3 text-on-surface-variant text-xs mb-3">
          <div className="flex items-center gap-1">
            <Icon name="distance" className="text-[16px]" /> {c.km}
          </div>
          <div className="flex items-center gap-1">
            <Icon name="local_bar" className="text-[16px]" /> {c.pubs} krogar
          </div>
        </div>
        <Link
          to="/round"
          className="block text-center w-full bg-primary-container text-on-primary py-3 rounded-2xl text-sm font-semibold hover:bg-primary transition-colors"
        >
          Starta Runda
        </Link>
      </div>
    </div>
  );
}

function DiscoverPage() {
  return (
    <div className="min-h-screen pb-32 bg-background text-on-background">
      <TopBar />
      <main>
        <section className="px-5 pt-8 pb-4">
          <div className="relative h-[240px] w-full rounded-3xl overflow-hidden shadow-lg group">
            <img
              alt="Stockholms Skärgårdstur"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhGdPO648efv_qV_rzckW9RRW_5ubauwe2c2mafa9AxGBP6U09zLjB7fvAQJ_dy_6XbbIWGQe-_1TYdkO-JfZcO9hGYcT8sGfjOAL8oAeqs4uEFEUKE2X80ztxqqqdXt3jq7upR6umwCNko1WTYzLOPO0BAlwd8TkN0Uk9-Y8-PA2P5xqWi1wACTzfjvyeaRbptO8nL4B2f3T6ZEaBXoDHdLHEwPPj6JrdIjdHP0Sua5tJatCgdqYjIMbMgg3BjpD1lxAJ7CGOfAM"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
              <p className="text-white text-xs font-semibold uppercase tracking-widest mb-1">
                Dagens Rekommendation
              </p>
              <h2 className="text-white text-3xl font-extrabold font-display leading-tight">
                Stockholms Skärgårdstur
              </h2>
            </div>
          </div>
        </section>

        <section className="px-5 mb-8">
          <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl px-4 py-2 shadow-sm mb-3">
            <Icon name="search" className="text-outline" />
            <input
              type="text"
              placeholder="Sök stad eller bar..."
              className="bg-transparent border-none focus:outline-none w-full text-base text-on-surface-variant placeholder:text-on-surface-variant"
            />
          </div>

          <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar">
            <button className="px-5 py-1.5 rounded-full bg-primary-container text-on-primary text-sm font-semibold whitespace-nowrap">Stockholm</button>
            <button className="px-5 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant text-sm font-semibold whitespace-nowrap">Göteborg</button>
            <button className="px-5 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant text-sm font-semibold whitespace-nowrap">Malmö</button>
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <span className="bg-secondary-container/15 text-secondary px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">Öl</span>
            <span className="bg-tertiary-container/10 text-tertiary px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border border-tertiary/20">Vin</span>
            <span className="bg-primary-container/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">Cocktails</span>
            <span className="bg-surface-container-highest text-on-surface-variant px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">Uteservering</span>
          </div>
        </section>

        <section className="mb-8">
          <div className="px-5 flex justify-between items-center mb-3">
            <h3 className="text-2xl font-bold text-on-surface font-display">Stockholm</h3>
            <button className="text-primary text-sm font-semibold">Visa alla</button>
          </div>
          <div className="flex overflow-x-auto gap-4 px-5 hide-scrollbar pb-2">
            {stockholm.map((c) => <CrawlCard key={c.name} c={c} />)}
          </div>
        </section>

        <section className="mb-8">
          <div className="px-5 flex justify-between items-center mb-3">
            <h3 className="text-2xl font-bold text-on-surface font-display">Göteborg</h3>
            <button className="text-primary text-sm font-semibold">Visa alla</button>
          </div>
          <div className="flex overflow-x-auto gap-4 px-5 hide-scrollbar pb-2">
            {goteborg.map((c) => <CrawlCard key={c.name} c={c} />)}
          </div>
        </section>
      </main>

      <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40">
        <Icon name="add" />
      </button>

      <BottomNav />
    </div>
  );
}
