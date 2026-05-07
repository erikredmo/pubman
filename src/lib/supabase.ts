import { createClient } from "@supabase/supabase-js";

const url  = import.meta.env.VITE_SUPABASE_URL  as string;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export type DbBar = {
  id: string;
  name: string;
  city: string;
  type: string;
  tags: string[];
  img: string;
};

export type DbUser = {
  id: string;
  name: string;
  password: string;
  color: string;
};

export type DbRound = {
  id: string;
  name: string;
  city: string;
  km: string;
  tags: string[];
  img: string;
};

export type DbRoundStop = {
  id: string;
  round_id: string;
  bar_name: string;
  position: number;
  tag: string | null;
};
