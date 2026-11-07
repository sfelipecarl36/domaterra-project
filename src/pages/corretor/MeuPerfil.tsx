import { useEffect, useState, type FormEvent } from "react";
import { Save, UserRound } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  buscarMeuPerfil,
  type Perfil,
} from "../../services/perfilService";
import { Link } from "react-router-dom";

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
    return <p className="text-slate-500">Carregando perfil...</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#071B2E]">
          Meu perfil
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Atualize suas informações profissionais.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#071B2E] text-[#C9A34A]">
            <UserRound size={26} />
          </div>

          <div>
            <h2 className="font-semibold text-[#071B2E]">
              Dados do corretor
            </h2>

            <p className="text-sm text-slate-500">
              Informações do seu cadastro
            </p>
          </div>
        </div>

        {erro && (
          <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </p>
        )}

        {mensagem && (
          <p role="status" className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
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

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Situação cadastral
              </p>

              <p className="mt-1 font-semibold text-[#071B2E]">
                {perfil.approval_status === "approved"
                  ? "Aprovado"
                  : perfil.approval_status === "rejected"
                    ? "Não aprovado"
                    : "Pendente de análise"}
              </p>
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#071B2E] px-6 py-3 font-semibold text-white hover:bg-[#123754] disabled:opacity-60"
            >
              <Save size={18} />
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>

            <Link
                to="/corretor/contato"
                className="inline-flex items-center rounded-lg bg-[#071B2E] px-5 py-3 text-sm font-semibold text-white">
                Configurar contato profissional
            </Link>
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
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        required
        value={valor}
        onChange={(event) => alterar(event.target.value)}
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#C9A34A]"
      />
    </div>
    
  );
}
