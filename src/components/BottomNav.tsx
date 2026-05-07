import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "./Icon";

const items = [
  { to: "/", label: "Hem", icon: "home" },
  { to: "/map", label: "Karta", icon: "map" },
  { to: "/round", label: "Runda", icon: "directions_walk" },
  { to: "/profile", label: "Profil", icon: "person" },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md flex justify-around items-center px-4 pb-6 pt-3 border-t border-outline-variant/40 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,106,167,0.06)]">
      {items.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-all duration-150 ${
              active
                ? "text-primary font-bold"
                : "text-on-surface-variant opacity-60 hover:text-primary hover:opacity-100"
            }`}
          >
            <Icon name={item.icon} fill={active} />
            <span className="text-xs mt-1 tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
