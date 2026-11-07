import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type DadosPixAssinatura = {
  success: boolean;
  disponivel: boolean;
  message?: string;
  cobranca?: {
    id: string;
    value: number;
    dueDate: string;
    status: string;
  };
  pix?: {
    payload: string;
    encodedImage: string;
    expirationDate: string | null;
  };
};

export async function consultarPixAssinatura():
  Promise<DadosPixAssinatura> {
  const { data, error } = await supabase.functions.invoke(
    "consultar-pix-assinatura",
    {
      body: {},
    }
  );

  if (error) {
    let mensagem = error.message;

    if (error instanceof FunctionsHttpError) {
      try {
        const resposta = await error.context.json();
        mensagem = resposta?.error ?? mensagem;
      } catch {
        mensagem = "Não foi possível consultar o PIX.";
      }
    }

    throw new Error(mensagem);
  }

  return data as DadosPixAssinatura;
}
