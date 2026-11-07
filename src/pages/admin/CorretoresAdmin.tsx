
import { useEffect, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type Corretor = {
  id: string;
  full_name: string;
  phone: string | null;
  creci: string | null;
  creci_state: string | null;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function CorretoresAdmin() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregar() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        phone,
        creci,
        creci_state,
        approval_status,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setErro("Não foi possível carregar os corretores.");
    } else {
      setCorretores((data ?? []) as Corretor[]);
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function alterarStatus(
    corretor: Corretor,
    status: Corretor["approval_status"]
  ) {
    const acao =
      status === "approved" ? "aprovar" : "rejeitar";

    if (
      !window.confirm(
        `Deseja ${acao} o cadastro de ${corretor.full_name}?`
      )
    ) {
      return;
    }

    setProcessando(corretor.id);
    setErro("");
    setMensagem("");

    try {
      const { error } = await supabase.rpc(
        "admin_alterar_status_corretor",
        {
          p_corretor_id: corretor.id,
          p_status: status,
        }
      );

      if (error) throw error;

      setCorretores((anteriores) =>
        anteriores.map((item) =>
          item.id === corretor.id
            ? { ...item, approval_status: status }
            : item
        )
      );

      setMensagem("Situação cadastral atualizada.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o cadastro."
      );
    } finally {
      setProcessando(null);
    }
  }

  const filtrados = corretores.filter((corretor) => {
    const texto = [
      corretor.full_name,
      corretor.creci,
      corretor.creci_state,
    ]
      .join(" ")
      .toLowerCase();

    return texto.includes(busca.toLowerCase());
  });

  return (
    <div className="space-y-7">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-semibold text-[#111111]">
          Corretores
        </h1>

        <p className="mt-2 text-sm text-[#555555]">
          Consulte e avalie os cadastros profissionais.
        </p>
      </div>

      {/* Campo de busca */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-colors focus-within:border-[#FE540C]">
        <Search
          size={19}
          className="shrink-0 text-[#FE540C]"
        />

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou CRECI"
          className="w-full bg-transparent text-sm text-[#111111] placeholder:text-[#888888] outline-none"
        />
      </div>

      {/* Mensagens */}
      {erro && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {erro}
        </p>
      )}

      {mensagem && (
        <p
          role="status"
          className="rounded-xl bg-green-50 p-4 text-sm text-green-700"
        >
          {mensagem}
        </p>
      )}

      {/* Listagem */}
      {carregando ? (
        <p className="text-sm text-[#555555]">
          Carregando corretores...
        </p>
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <Search
            size={36}
            className="mx-auto text-[#FE540C]"
          />

          <p className="mt-4 text-sm text-[#555555]">
            Nenhum corretor encontrado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrados.map((corretor) => (
            <div
              key={corretor.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-[#FE540C]/30 hover:shadow-md sm:p-6"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                {/* Dados do corretor */}
                <div>
                  <h2 className="text-lg font-semibold text-[#111111]">
                    {corretor.full_name || "Nome não informado"}
                  </h2>

                  <p className="mt-2 text-sm text-[#555555]">
                    CRECI: {corretor.creci || "Não informado"}
                    {corretor.creci_state
                      ? ` / ${corretor.creci_state}`
                      : ""}
                  </p>

                  <p className="mt-1 text-sm text-[#555555]">
                    Telefone: {corretor.phone || "Não informado"}
                  </p>

                  {/* Situação cadastral */}
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    {corretor.approval_status === "approved" ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700">
                        <CheckCircle2 size={14} />
                        Aprovado
                      </span>
                    ) : corretor.approval_status === "rejected" ? (
                      <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
                        <XCircle size={14} />
                        Rejeitado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                        <Clock3 size={14} />
                        Pendente
                      </span>
                    )}
                  </div>
                </div>

                {/* Botões de aprovação e rejeição */}
                <div className="flex flex-wrap gap-3">
                  {corretor.approval_status !== "approved" && (
                    <button
                      type="button"
                      disabled={processando === corretor.id}
                      onClick={() =>
                        alterarStatus(corretor, "approved")
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FE540C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E64B0A] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 size={17} />
                      Aprovar
                    </button>
                  )}

                  {corretor.approval_status !== "rejected" && (
                    <button
                      type="button"
                      disabled={processando === corretor.id}
                      onClick={() =>
                        alterarStatus(corretor, "rejected")
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={17} />
                      Rejeitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
