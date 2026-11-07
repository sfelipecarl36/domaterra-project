import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export async function contratarPlano(cpfCnpj: string) {
  const { data, error } = await supabase.functions.invoke(
    "contratar-plano",
    {
      body: { cpfCnpj },
    }
  );

  if (error) {
    let mensagem = error.message;

    if (error instanceof FunctionsHttpError) {
      try {
        const resposta = await error.context.json();
        mensagem = resposta?.error ?? mensagem;
      } catch {
        mensagem = "Não foi possível iniciar a contratação.";
      }
    }

    throw new Error(mensagem);
  }

  if (!data?.success) {
    throw new Error(
      data?.error ?? "Não foi possível criar a assinatura."
    );
  }

  return data as {
    success: boolean;
    message: string;
    asaasSubscriptionId: string;
    status: string;
  };
}
