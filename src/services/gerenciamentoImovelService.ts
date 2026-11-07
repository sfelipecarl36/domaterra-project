import { supabase } from "../lib/supabase";

export async function alterarStatusMeuImovel(
  imovelId: string,
  status: "paused" | "pending_review"
) {
  const { error } = await supabase.rpc(
    "corretor_alterar_status_imovel",
    {
      p_imovel_id: imovelId,
      p_status: status,
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}
