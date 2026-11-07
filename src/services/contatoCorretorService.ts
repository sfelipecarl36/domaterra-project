import { supabase } from "../lib/supabase";

export type ContatoCorretor = {
  broker_id: string;
  display_name: string;
  creci: string;
  creci_state: string;
  whatsapp: string;
};

export async function buscarMeuContato(
  userId: string
): Promise<ContatoCorretor | null> {
  const { data, error } = await supabase
    .from("broker_contacts")
    .select("*")
    .eq("broker_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data as ContatoCorretor | null;
}

export async function salvarMeuContato(
  contato: ContatoCorretor
) {
  const { error } = await supabase
    .from("broker_contacts")
    .upsert(
      {
        ...contato,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "broker_id" }
    );

  if (error) throw error;
}

export async function buscarContatoPublico(
  brokerId: string
): Promise<ContatoCorretor | null> {
  const { data, error } = await supabase
    .from("broker_contacts")
    .select(`
      broker_id,
      display_name,
      creci,
      creci_state,
      whatsapp
    `)
    .eq("broker_id", brokerId)
    .maybeSingle();

  if (error) throw error;

  return data as ContatoCorretor | null;
}
