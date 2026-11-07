
import { createClient } from "npm:@supabase/supabase-js@2";

function responder(dados: unknown, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function compararTokens(a: string, b: string) {
  const encoder = new TextEncoder();
  const x = encoder.encode(a);
  const y = encoder.encode(b);

  let diferenca = x.length ^ y.length;

  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diferenca |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }

  return diferenca === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return responder({ error: "Método não permitido." }, 405);
  }

  const tokenEsperado = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
  const tokenRecebido = req.headers.get("asaas-access-token");

  if (
    !tokenEsperado ||
    !tokenRecebido ||
    !compararTokens(tokenRecebido, tokenEsperado)
  ) {
    return responder({ error: "Não autorizado." }, 401);
  }

  try {
    const evento = await req.json();

    if (
      !["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"].includes(
        evento?.event
      )
    ) {
      return responder({ received: true, ignored: true });
    }

    const pagamentoId = evento?.payment?.id;

    if (typeof pagamentoId !== "string" || !pagamentoId) {
      return responder({ error: "Pagamento inválido." }, 400);
    }

    const urlSupabase = Deno.env.get("SUPABASE_URL");
    const chavesSecretas = JSON.parse(
      Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"
    );
    const chaveServico = chavesSecretas.default;
    const chaveAsaas = Deno.env.get("ASAAS_API_KEY");
    const urlAsaas = Deno.env.get("ASAAS_BASE_URL");

    if (
      !urlSupabase ||
      !chaveServico ||
      !chaveAsaas ||
      !urlAsaas
    ) {
      throw new Error("Configuração do servidor incompleta.");
    }

    const respostaAsaas = await fetch(
      `${urlAsaas}/payments/${encodeURIComponent(pagamentoId)}`,
      {
        headers: {
          accept: "application/json",
          access_token: chaveAsaas,
          "User-Agent": "Oxus/1.0",
        },
      }
    );

    if (!respostaAsaas.ok) {
      throw new Error("Não foi possível consultar o Asaas.");
    }

    const pagamento = await respostaAsaas.json();

    if (!["CONFIRMED", "RECEIVED"].includes(pagamento.status)) {
      return responder({ received: true, ignored: true });
    }

    if (
      pagamento.id !== pagamentoId ||
      typeof pagamento.subscription !== "string" ||
      typeof pagamento.value !== "number" ||
      typeof pagamento.dueDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(pagamento.dueDate)
    ) {
      return responder(
        { error: "Dados da cobrança incompatíveis." },
        422
      );
    }

    const supabase = createClient(
      urlSupabase,
      chaveServico,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: resultado, error } = await supabase.rpc(
      "registrar_pagamento_asaas_v2",
      {
        p_asaas_subscription_id: pagamento.subscription,
        p_asaas_payment_id: pagamento.id,
        p_amount: pagamento.value,
        p_paid_at: new Date().toISOString(),
        p_due_date: pagamento.dueDate,
      }
    );

    if (error) throw error;

    if (
      resultado === "assinatura_nao_encontrada" ||
      resultado === "valor_divergente" ||
      resultado === "dados_invalidos"
    ) {
      console.error("Pagamento requer revisão:", {
        pagamentoId,
        resultado,
      });

      return responder(
        { error: "Pagamento requer revisão." },
        422
      );
    }

    if (
      ![
        "ativada",
        "ja_processado",
        "ciclo_ja_processado",
      ].includes(resultado)
    ) {
      throw new Error("Resultado inesperado do banco.");
    }

    return responder({
      received: true,
      result: resultado,
    });
  } catch (error) {
    console.error("Erro no webhook:", error);

    return responder(
      { error: "Falha ao processar pagamento." },
      500
    );
  }
});
