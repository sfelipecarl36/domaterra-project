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
    return (
      <p className="text-sm text-[#555555]">
        Carregando...
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Voltar */}
      <Link
        to="/corretor/perfil"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#555555] transition-colors hover:text-[#FE540C]"
      >
        <ArrowLeft size={18} />
        Voltar ao perfil
      </Link>

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-semibold text-[#111111]">
          Contato profissional
        </h1>

        <p className="mt-2 text-sm text-[#555555]">
          Configure as informações que aparecerão nos seus anúncios.
        </p>
      </div>

      {/* Formulário */}
      <form
        onSubmit={salvar}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1EB] text-[#FE540C]">
            <Phone size={23} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#111111]">
              Informações de contato
            </h2>

            <p className="mt-1 text-sm text-[#555555]">
              Dados exibidos aos interessados nos imóveis
            </p>
          </div>
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

        {/* Autorização */}
        <div className="rounded-xl border border-gray-200 bg-[#F7F7F7] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={22}
              className="shrink-0 text-[#FE540C]"
            />

            <div>
              <h3 className="text-sm font-semibold text-[#111111]">
                Autorização de divulgação
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#555555]">
                Seu nome profissional, CRECI e WhatsApp
                comercial poderão ser exibidos publicamente
                nos anúncios da Oxus.
              </p>
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-[#FE540C]/40">
            <input
              type="checkbox"
              checked={autorizado}
              onChange={(e) => setAutorizado(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-[#FE540C]"
            />

            <span className="text-sm leading-6 text-[#333333]">
              Autorizo a divulgação dessas informações
              profissionais nos meus anúncios.
            </span>
          </label>
        </div>

        {/* Mensagens */}
        {erro && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {mensagem && (
          <p
            role="status"
            className="rounded-lg bg-green-50 p-4 text-sm text-green-700"
          >
            {mensagem}
          </p>
        )}

        {/* Salvar */}
        <button
          type="submit"
          disabled={salvando}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FE540C] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#E64B0A] disabled:cursor-not-allowed disabled:opacity-50"
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
      <label className="mb-2 block text-sm font-medium text-[#333333]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#888888] outline-none transition-colors focus:border-[#FE540C]"
      />
    </div>
  );
}
