import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function responder(dados: unknown, status = 200) {
    return new Response(JSON.stringify(dados), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
        },
    });
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return responder({ error: "Método não permitido." }, 405);
    }

    try {
        const urlSupabase = Deno.env.get("SUPABASE_URL");

        const chavesPublicas = JSON.parse(
            Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}"
        );

        const chavesSecretas = JSON.parse(
            Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"
        );

        const chavePublica = chavesPublicas.default as string | undefined;
        const chaveServico = chavesSecretas.default as string | undefined;

        const chaveAsaas = Deno.env.get("ASAAS_API_KEY");
        const urlAsaas = Deno.env.get("ASAAS_BASE_URL");

        if (
            !urlSupabase ||
            !chavePublica ||
            !chaveServico ||
            !chaveAsaas ||
            !urlAsaas
        ) {
            return responder(
                { error: "Configuração do servidor incompleta." },
                500
            );
        }

        const authorization = req.headers.get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return responder({ error: "Sessão não encontrada." }, 401);
        }

        const token = authorization.slice(7);

        const supabaseUsuario = createClient(
            urlSupabase,
            chavePublica
        );

        const supabaseAdmin = createClient(
            urlSupabase,
            chaveServico
        );

        const { data: autenticacao, error: erroAuth } =
            await supabaseUsuario.auth.getUser(token);

        if (erroAuth || !autenticacao.user) {
            return responder({ error: "Sessão inválida." }, 401);
        }

        const corretorId = autenticacao.user.id;

        const { data: assinatura, error: erroAssinatura } =
            await supabaseAdmin
                .from("subscriptions")
                .select("asaas_subscription_id")
                .eq("broker_id", corretorId)
                .maybeSingle();

        if (erroAssinatura) {
            throw new Error("Não foi possível consultar a assinatura.");
        }

        if (!assinatura?.asaas_subscription_id) {
            return responder(
                { error: "Nenhuma assinatura encontrada." },
                404
            );
        }

        async function consultarAsaas(caminho: string) {
            const respostaApi = await fetch(
                `${urlAsaas}${caminho}`,
                {
                    method: "GET",
                    headers: {
                        accept: "application/json",
                        access_token: chaveAsaas!,
                        "User-Agent": "Domaterra/1.0",
                    },
                }
            );

            const resultado = await respostaApi.json();

            if (!respostaApi.ok) {
                throw new Error(
                    resultado?.errors?.[0]?.description ??
                    "Não foi possível consultar o Asaas."
                );
            }

            return resultado;
        }

        const assinaturaId = encodeURIComponent(
            assinatura.asaas_subscription_id
        );

        const lista = await consultarAsaas(
            `/subscriptions/${assinaturaId}/payments?limit=100`
        );

        const cobrancas = Array.isArray(lista.data)
            ? lista.data
            : [];

        const pendentes = cobrancas
            .filter(
                (cobranca: {
                    status?: string;
                    id?: string;
                    billingType?: string;
                }) =>
                    cobranca.id &&
                    cobranca.billingType === "PIX" &&
                    ["PENDING", "OVERDUE"].includes(
                        cobranca.status ?? ""
                    )
            )
            .sort(
                (
                    a: { dueDate?: string },
                    b: { dueDate?: string }
                ) =>
                    (a.dueDate ?? "").localeCompare(b.dueDate ?? "")
            );

        const cobranca = pendentes[0];

        if (!cobranca) {
            return responder({
                success: true,
                disponivel: false,
                message:
                    "Nenhuma cobrança PIX pendente está disponível no momento.",
            });
        }

        const pix = await consultarAsaas(
            `/payments/${encodeURIComponent(cobranca.id)}/pixQrCode`
        );

        if (!pix.payload || !pix.encodedImage) {
            return responder(
                { error: "O Asaas ainda não disponibilizou o PIX." },
                503
            );
        }

        return responder({
            success: true,
            disponivel: true,
            cobranca: {
                id: cobranca.id,
                value: cobranca.value,
                dueDate: cobranca.dueDate,
                status: cobranca.status,
            },
            pix: {
                payload: pix.payload,
                encodedImage: pix.encodedImage,
                expirationDate: pix.expirationDate ?? null,
            },
        });
    } catch (erro) {
        console.error("Erro ao consultar PIX:", erro);

        return responder(
            {
                error:
                    erro instanceof Error
                        ? erro.message
                        : "Erro ao consultar pagamento PIX.",
            },
            500
        );
    }
});
