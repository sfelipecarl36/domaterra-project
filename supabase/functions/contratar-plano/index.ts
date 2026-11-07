import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function resposta(dados: unknown, status = 200) {
    return new Response(JSON.stringify(dados), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
        },
    });
}

function somenteNumeros(valor: string) {
    return valor.replace(/\D/g, "");
}

function dataHoje() {
    const agora = new Date();
    const ano = agora.getUTCFullYear();
    const mes = String(agora.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(agora.getUTCDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return resposta({ error: "Método não permitido." }, 405);
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
            console.error("Variáveis ausentes:", {
                SUPABASE_URL: !urlSupabase,
                SUPABASE_ANON_KEY: !chavePublica,
                SUPABASE_SERVICE_ROLE_KEY: !chaveServico,
                ASAAS_API_KEY: !chaveAsaas,
                ASAAS_BASE_URL: !urlAsaas,
            });

            return resposta(
                { error: "Configuração do servidor incompleta." },
                500
            );
        }

        const authorization = req.headers.get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return resposta({ error: "Não autenticado." }, 401);
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
            return resposta({ error: "Sessão inválida." }, 401);
        }

        const usuario = autenticacao.user;

        const corpo = await req.json().catch(() => null);
        const cpfCnpj = somenteNumeros(
            String(corpo?.cpfCnpj ?? "")
        );

        if (![11, 14].includes(cpfCnpj.length)) {
            return resposta(
                { error: "Informe um CPF ou CNPJ válido." },
                400
            );
        }

        const { data: perfil, error: erroPerfil } =
            await supabaseAdmin
                .from("profiles")
                .select("id, full_name, approval_status, phone")
                .eq("id", usuario.id)
                .single();

        if (erroPerfil || !perfil) {
            return resposta(
                { error: "Cadastro do corretor não encontrado." },
                404
            );
        }

        if (perfil.approval_status !== "approved") {
            return resposta(
                { error: "Seu cadastro precisa estar aprovado." },
                403
            );
        }

        const { data: plano, error: erroPlano } =
            await supabaseAdmin
                .from("subscription_plans")
                .select("id, name, price, property_limit")
                .eq("name", "Plano Corretor")
                .eq("active", true)
                .single();

        if (erroPlano || !plano) {
            return resposta(
                { error: "Plano indisponível." },
                404
            );
        }

        const { data: assinaturaExistente } =
            await supabaseAdmin
                .from("subscriptions")
                .select("status, expires_at, asaas_subscription_id")
                .eq("broker_id", usuario.id)
                .maybeSingle();

        if (
            assinaturaExistente?.status === "active" &&
            assinaturaExistente.expires_at &&
            new Date(assinaturaExistente.expires_at) > new Date()
        ) {
            return resposta(
                { error: "Você já possui uma assinatura ativa." },
                409
            );
        }

        if (assinaturaExistente?.asaas_subscription_id) {
            return resposta(
                {
                    error:
                        "Já existe uma assinatura vinculada a este corretor. Consulte a situação da cobrança antes de contratar novamente.",
                },
                409
            );
        }

        const { error: erroCobranca } =
            await supabaseAdmin
                .from("broker_billing_profiles")
                .upsert({
                    broker_id: usuario.id,
                    cpf_cnpj: cpfCnpj,
                    updated_at: new Date().toISOString(),
                });

        if (erroCobranca) {
            throw new Error("Não foi possível salvar os dados de cobrança.");
        }

        const { data: tentativa, error: erroTentativa } =
            await supabaseAdmin
                .from("subscription_checkout_attempts")
                .insert({
                    broker_id: usuario.id,
                    plan_id: plano.id,
                    status: "processing",
                })
                .select("id")
                .single();

        if (erroTentativa || !tentativa) {
            return resposta(
                {
                    error:
                        "Já existe uma contratação em andamento. Aguarde a confirmação antes de tentar novamente.",
                },
                409
            );
        }

        async function chamarAsaas(
            caminho: string,
            metodo: string,
            dados?: unknown
        ) {
            const respostaApi = await fetch(
                `${urlAsaas}${caminho}`,
                {
                    method: metodo,
                    headers: {
                        "Content-Type": "application/json",
                        accept: "application/json",
                        access_token: chaveAsaas!,
                        "User-Agent": "Oxus/1.0",
                    },
                    body: dados ? JSON.stringify(dados) : undefined,
                }
            );

            const resultado = await respostaApi.json();

            if (!respostaApi.ok) {
                throw new Error(
                    resultado?.errors?.[0]?.description ??
                    "Erro de comunicação com o Asaas."
                );
            }

            return resultado;
        }

        const cliente = await chamarAsaas(
            "/customers",
            "POST",
            {
                name: perfil.full_name,
                cpfCnpj,
                email: usuario.email,
                mobilePhone: somenteNumeros(perfil.phone ?? ""),
                externalReference: usuario.id,
            }
        );

        if (!cliente.id) {
            throw new Error("O Asaas não retornou o cliente.");
        }

        const { error: erroCliente } =
            await supabaseAdmin
                .from("subscription_checkout_attempts")
                .update({
                    asaas_customer_id: cliente.id,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", tentativa.id);

        if (erroCliente) {
            throw new Error(
                "Cliente criado, mas não foi possível registrar seu identificador."
            );
        }

        const assinaturaAsaas = await chamarAsaas(
            "/subscriptions",
            "POST",
            {
                customer: cliente.id,
                billingType: "PIX",
                value: Number(plano.price),
                nextDueDate: dataHoje(),
                cycle: "MONTHLY",
                description: `Oxus - ${plano.name}`,
                externalReference: tentativa.id,
                pixAutomaticAuthorizationMode: "DISABLED",
            }
        );

        if (!assinaturaAsaas.id) {
            throw new Error("O Asaas não retornou a assinatura.");
        }

        const { error: erroRegistro } =
            await supabaseAdmin
                .from("subscription_checkout_attempts")
                .update({
                    status: "created",
                    asaas_subscription_id: assinaturaAsaas.id,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", tentativa.id);

        if (erroRegistro) {
            throw new Error(
                "Assinatura criada no Asaas, mas não registrada localmente."
            );
        }

        const { error: erroAssinatura } =
            await supabaseAdmin
                .from("subscriptions")
                .upsert(
                    {
                        broker_id: usuario.id,
                        plan_id: plano.id,
                        status: "pending",
                        starts_at: null,
                        expires_at: null,
                        asaas_customer_id: cliente.id,
                        asaas_subscription_id: assinaturaAsaas.id,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "broker_id" }
                );

        if (erroAssinatura) {
            throw new Error(
                "Assinatura criada no Asaas, mas pendente de sincronização."
            );
        }

        return resposta({
            success: true,
            message: "Assinatura criada. Aguardando pagamento.",
            asaasSubscriptionId: assinaturaAsaas.id,
            status: "pending",
        });
    } catch (erro) {
        console.error("Erro na contratação:", erro);

        return resposta(
            {
                error:
                    erro instanceof Error
                        ? erro.message
                        : "Não foi possível iniciar a contratação.",
            },
            500
        );
    }
});
