import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  buscarMeuContato,
  salvarMeuContato,
} from "../../services/contatoCorretorService";

export default function ContatoProfissional() {
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [creci, setCreci] = useState("");
  const [estado, setEstado] = useState("PA");
  const [whatsapp, setWhatsapp] = useState("");
  const [autorizado, setAutorizado] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!user) {
        setCarregando(false);
        return;
      }

      try {
        const contato = await buscarMeuContato(user.id);

        if (!ativo || !contato) return;

        setNome(contato.display_name);
        setCreci(contato.creci);
        setEstado(contato.creci_state);
        setWhatsapp(contato.whatsapp);
        setAutorizado(true);
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar seu contato.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [user]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    setErro("");
    setMensagem("");

    if (!autorizado) {
      setErro("Você precisa autorizar a divulgação dos dados.");
      return;
    }

    const numero = whatsapp.replace(/\D/g, "");

    if (numero.length < 12 || numero.length > 13) {
      setErro(
        "Informe o WhatsApp com DDI 55, DDD e número."
      );
      return;
    }

    setSalvando(true);

    try {
      await salvarMeuContato({
        broker_id: user.id,
        display_name: nome.trim(),
        creci: creci.trim(),
        creci_state: estado.trim().toUpperCase(),
        whatsapp: numero,
      });

      setMensagem("Contato profissional salvo com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os dados."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="text-slate-500">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/corretor/perfil"
        className="inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={18} />
        Voltar ao perfil
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-[#071B2E]">
          Contato profissional
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Configure as informações que aparecerão nos seus anúncios.
        </p>
      </div>

      <form
        onSubmit={salvar}
        className="space-y-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <Phone size={23} className="text-[#C9A34A]" />

          <h2 className="text-lg font-semibold text-[#071B2E]">
            Informações de contato
          </h2>
        </div>

        <Campo
          label="Nome profissional"
          value={nome}
          onChange={setNome}
          placeholder="Nome que aparecerá no anúncio"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            label="CRECI"
            value={creci}
            onChange={setCreci}
            placeholder="Número do registro"
          />

          <Campo
            label="UF do CRECI"
            value={estado}
            onChange={setEstado}
            placeholder="PA"
          />
        </div>

        <Campo
          label="WhatsApp comercial"
          value={whatsapp}
          onChange={setWhatsapp}
          placeholder="5591999999999"
        />

        <div className="rounded-xl bg-[#F5F6F8] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={22}
              className="shrink-0 text-[#C9A34A]"
            />

            <div>
              <h3 className="text-sm font-semibold text-[#071B2E]">
                Autorização de divulgação
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Seu nome profissional, CRECI e WhatsApp
                comercial poderão ser exibidos publicamente
                nos anúncios da Domaterra.
              </p>
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={autorizado}
              onChange={(e) => setAutorizado(e.target.checked)}
              className="mt-1 accent-[#C9A34A]"
            />

            <span className="text-sm text-slate-700">
              Autorizo a divulgação dessas informações
              profissionais nos meus anúncios.
            </span>
          </label>
        </div>

        {erro && (
          <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </p>
        )}

        {mensagem && (
          <p role="status" className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {mensagem}
          </p>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#071B2E] px-6 py-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save size={18} />
          {salvando ? "Salvando..." : "Salvar contato profissional"}
        </button>
      </form>
    </div>
  );
}

type CampoProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function Campo({
  label,
  value,
  onChange,
  placeholder,
}: CampoProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#C9A34A]"
      />
    </div>
  );
}
