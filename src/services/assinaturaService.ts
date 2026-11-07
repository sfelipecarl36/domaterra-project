import { supabase } from "../lib/supabase";

export type PlanoAssinatura = {
  id: string;
  name: string;
  price: number;
  property_limit: number;
  billing_cycle: string;
  active: boolean;
};

export type Assinatura = {
  id: string;
  broker_id: string;
  plan_id: string;
  status: "pending" | "active" | "past_due" | "canceled" | "expired";
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type ResumoAssinatura = {
  plano: PlanoAssinatura | null;
  assinatura: Assinatura | null;
  imoveisUtilizados: number;
};

export async function buscarResumoAssinatura(
  corretorId: string
): Promise<ResumoAssinatura> {
  const { data: plano, error: erroPlano } = await supabase
    .from("subscription_plans")
    .select("id, name, price, property_limit, billing_cycle, active")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (erroPlano) throw erroPlano;

  const { data: assinatura, error: erroAssinatura } = await supabase
    .from("subscriptions")
    .select(`
      id,
      broker_id,
      plan_id,
      status,
      starts_at,
      expires_at,
      created_at
    `)
    .eq("broker_id", corretorId)
    .maybeSingle();

  if (erroAssinatura) throw erroAssinatura;

  const { count, error: erroImoveis } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("broker_id", corretorId)
    .in("status", ["published", "pending_review"]);

  if (erroImoveis) throw erroImoveis;

  return {
    plano: plano as PlanoAssinatura | null,
    assinatura: assinatura as Assinatura | null,
    imoveisUtilizados: count ?? 0,
  };
}
