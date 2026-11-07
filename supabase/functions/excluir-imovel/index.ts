import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function responder(
  dados: Record<string, unknown>,
  status = 200
) {
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
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return responder({ error: "Método não permitido." }, 405);
  }

  try {


    const anonKey = JSON.parse(
            Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}"
        );

        const serviceKey = JSON.parse(
            Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"
        );
        const chavePublica = anonKey.default as string | undefined;
        const chaveServico = serviceKey.default as string | undefined;


    // const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    

    if (!supabaseUrl || !anonKey || !serviceKey) {
      throw new Error("Configuração do servidor incompleta.");
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return responder({ error: "Faça login novamente." }, 401);
    }

    const token = authorization.slice(7);

    const supabaseUsuario = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: autenticacao, error: erroAuth } =
      await supabaseUsuario.auth.getUser(token);

    if (erroAuth || !autenticacao.user) {
      return responder({ error: "Sessão inválida." }, 401);
    }

    const corpo = await req.json().catch(() => null);
    const imovelId = corpo?.imovelId;

    if (
      typeof imovelId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(imovelId)
    ) {
      return responder({ error: "ID do imóvel inválido." }, 400);
    }

    const { data: imovel, error: erroImovel } =
      await supabaseAdmin
        .from("properties")
        .select("id, broker_id, status")
        .eq("id", imovelId)
        .eq("broker_id", autenticacao.user.id)
        .maybeSingle();

    if (erroImovel) throw erroImovel;

    if (!imovel) {
      return responder(
        { error: "Imóvel não encontrado ou sem permissão." },
        404
      );
    }

    if (imovel.status !== "deleting") {
      const { error: erroInicio } =
        await supabaseUsuario.rpc(
          "corretor_iniciar_exclusao_imovel",
          { p_imovel_id: imovelId }
        );

      if (erroInicio) {
        return responder({ error: erroInicio.message }, 400);
      }
    }

    const { data: fotos, error: erroFotos } =
      await supabaseAdmin
        .from("property_images")
        .select("storage_path")
        .eq("property_id", imovelId);

    if (erroFotos) throw erroFotos;

    const caminhos = [
      ...new Set(
        (fotos ?? [])
          .map((foto) => foto.storage_path)
          .filter(
            (caminho): caminho is string =>
              typeof caminho === "string" &&
              caminho.length > 0
          )
      ),
    ];

    for (let i = 0; i < caminhos.length; i += 100) {
      const lote = caminhos.slice(i, i + 100);

      const { error: erroStorage } =
        await supabaseAdmin.storage
          .from("imoveis")
          .remove(lote);

      if (erroStorage) {
        throw new Error(
          `Falha ao remover fotografias: ${erroStorage.message}`
        );
      }
    }

    const { data: excluidos, error: erroExclusao } =
      await supabaseAdmin
        .from("properties")
        .delete()
        .eq("id", imovelId)
        .eq("broker_id", autenticacao.user.id)
        .eq("status", "deleting")
        .select("id");

    if (erroExclusao) throw erroExclusao;

    if (!excluidos?.length) {
      throw new Error(
        "O imóvel não pôde ser removido. Tente novamente."
      );
    }

    return responder({
      success: true,
      message: "Imóvel excluído definitivamente.",
    });
  } catch (error) {
    console.error("Erro ao excluir imóvel:", error);

    return responder(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o imóvel.",
      },
      500
    );
  }
});
