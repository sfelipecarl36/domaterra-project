import { useEffect, useState, type FormEvent } from "react";
import { Save, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  buscarMeuPerfil,
  type Perfil,
} from "../../services/perfilService";

export default function MeuPerfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [creci, setCreci] = useState("");
  const [ufCreci, setUfCreci] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarMeuPerfil();

        setPerfil(dados);
        setNome(dados.full_name ?? "");
        setTelefone(dados.phone ?? "");
        setCreci(dados.creci ?? "");
        setUfCreci(dados.creci_state ?? "");
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar seu perfil."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!perfil) return;

    setSalvando(true);
    setMensagem("");
    setErro("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: nome.trim(),
          phone: telefone.trim(),
          creci: creci.trim(),
          creci_state: ufCreci.trim().toUpperCase(),
        })
        .eq("id", perfil.id);

      if (error) throw error;

      setMensagem("Seus dados foram atualizados com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar seus dados."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <p className="text-sm text-[#555555]">
        Carregando perfil...
      </p>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-semibold text-[#111111]">
          Meu perfil
        </h1>

        <p className="mt-2 text-sm text-[#555555]">
          Atualize suas informações profissionais.
        </p>
      </div>

      {/* Cartão principal */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1EB] text-[#FE540C]">
            <UserRound size={26} />
          </div>

          <div>
            <h2 className="font-semibold text-[#111111]">
              Dados do corretor
            </h2>

            <p className="text-sm text-[#555555]">
              Informações do seu cadastro
            </p>
          </div>
        </div>

        {/* Mensagens */}
        {erro && (
          <p
            role="alert"
            className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {mensagem && (
          <p
            role="status"
            className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700"
          >
            {mensagem}
          </p>
        )}

        {perfil && (
          <form onSubmit={salvar} className="space-y-5">
            <Campo
              label="Nome completo"
              valor={nome}
              alterar={setNome}
            />

            <Campo
              label="Telefone / WhatsApp"
              valor={telefone}
              alterar={setTelefone}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Campo
                  label="Número do CRECI"
                  valor={creci}
                  alterar={setCreci}
                />
              </div>

              <Campo
                label="UF do CRECI"
                valor={ufCreci}
                alterar={setUfCreci}
              />
            </div>

            {/* Situação cadastral */}
            <div className="rounded-xl border border-gray-200 bg-[#F7F7F7] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#555555]">
                Situação cadastral
              </p>

              <div className="mt-2">
                {perfil.approval_status === "approved" ? (
                  <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                    Aprovado
                  </span>
                ) : perfil.approval_status === "rejected" ? (
                  <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
                    Não aprovado
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                    Pendente de análise
                  </span>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              <button
                type="submit"
                disabled={salvando}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FE540C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E64B0A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>

              <Link
                to="/corretor/contato"
                className="inline-flex items-center justify-center rounded-lg border border-[#FE540C] bg-white px-5 py-3 text-sm font-semibold text-[#FE540C] transition-colors hover:bg-[#FFF1EB]"
              >
                Configurar contato profissional
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Campo({
  label,
  valor,
  alterar,
}: {
  label: string;
  valor: string;
  alterar: (valor: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#333333]">
        {label}
      </label>

      <input
        required
        value={valor}
        onChange={(event) => alterar(event.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#FE540C]"
      />
    </div>
  );
}
