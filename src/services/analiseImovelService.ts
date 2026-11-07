import { supabase } from "../lib/supabase";

export async function enviarImovelParaAnalise(
  imovelId: string
) {
  const { error } = await supabase.rpc(
    "enviar_imovel_para_analise",
    {
      p_imovel_id: imovelId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}
