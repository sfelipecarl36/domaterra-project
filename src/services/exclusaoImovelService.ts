import { supabase } from "../lib/supabase";

export async function excluirImovelDefinitivamente(
  imovelId: string
) {
  const { data, error } = await supabase.functions.invoke(
    "excluir-imovel",
    {
      body: { imovelId },
    }
  );

  if (error) {
    let mensagem = error.message;

    if (
      "context" in error &&
      error.context instanceof Response
    ) {
      const resposta = await error.context
        .json()
        .catch(() => null);

      mensagem = resposta?.error ?? mensagem;
    }

    throw new Error(mensagem);
  }

  if (!data?.success) {
    throw new Error(
      data?.error ?? "Não foi possível excluir o imóvel."
    );
  }

  return data;
}
