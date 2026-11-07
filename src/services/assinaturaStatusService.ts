
import { supabase } from "../lib/supabase";

export type SituacaoAssinatura = {
  situacao: string;
  validade: string | null;
  limite_imoveis: number | null;
  imoveis_utilizados: number;
};

export async function consultarSituacaoAssinatura() {
  const { data, error } = await supabase
    .rpc("consultar_situacao_assinatura");

  if (error) {
    throw error;
  }

  const resultado = data?.[0];

  if (!resultado) {
    throw new Error(
      "Não foi possível consultar a assinatura."
    );
  }

  return resultado as SituacaoAssinatura;
}
