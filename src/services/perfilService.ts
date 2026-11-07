
import { supabase } from "../lib/supabase";

export type Perfil = {
  id: string;
  full_name: string;
  phone: string | null;
  creci: string | null;
  creci_state: string | null;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
};

export async function buscarMeuPerfil(): Promise<Perfil> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return data as Perfil;
}
