import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

export function TopBar() {
  const [img,  setImg]  = useState(() => { try { return localStorage.getItem("pubman_img")  ?? ""; } catch { return ""; } });
  const [name, setName] = useState(() => { try { return localStorage.getItem("pubman_user") ?? ""; } catch { return ""; } });

  useEffect(() => {
    function sync() {
      try {
        setImg(localStorage.getItem("pubman_img")  ?? "");
        setName(localStorage.getItem("pubman_user") ?? "");
      } catch {}
    }
    window.addEventListener("pubman-user-changed", sync);
    return () => window.removeEventListener("pubman-user-changed", sync);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md flex justify-between items-center w-full px-5 py-2 h-16 border-b border-outline-variant/30">
      <Link to="/" className="text-xl font-bold font-display text-primary tracking-tight hover:opacity-80 transition">
        Pubman
      </Link>
      <Link to="/profile">
        <img
          src={img}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 hover:opacity-80 transition"
        />
      </Link>
    </header>
  );
}
