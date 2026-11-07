import { useEffect, useState } from "react";
import {
  House,
  CheckCircle2,
  Clock3,
  UserRound,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  buscarMeuPerfil,
  type Perfil,
} from "../../services/perfilService";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardCorretor() {
  const { user } = useAuth();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [totalImoveis, setTotalImoveis] = useState(0);
  const [publicados, setPublicados] = useState(0);
  const [rascunhos, setRascunhos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!user) return;

      try {
        const perfilData = await buscarMeuPerfil();
        setPerfil(perfilData);

        const { data, error } = await supabase
          .from("properties")
          .select("id, status")
          .eq("broker_id", user.id);

        if (error) throw error;

        const imoveis = data ?? [];

        setTotalImoveis(imoveis.length);
        setPublicados(
          imoveis.filter((item) => item.status === "published")
            .length
        );
        setRascunhos(
          imoveis.filter((item) => item.status === "draft")
            .length
        );
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o painel."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [user]);

  if (carregando) {
    return <p className="text-slate-500">Carregando painel...</p>;
  }

  const nome = perfil?.full_name?.trim() || "Corretor";

  const situacoes = {
    pending: {
      titulo: "Cadastro em análise",
      texto:
        "Seus dados foram recebidos e aguardam verificação. A publicação de imóveis ainda não está disponível.",
      classe: "bg-amber-50 border-amber-200 text-amber-800",
    },
    approved: {
      titulo: "Cadastro aprovado",
      texto:
        "Seu cadastro profissional foi aprovado. A publicação será liberada conforme as regras de assinatura da plataforma.",
      classe: "bg-green-50 border-green-200 text-green-800",
    },
    rejected: {
      titulo: "Cadastro não aprovado",
      texto:
        "Seu cadastro precisa de revisão. Entre em contato com a administração da Oxus.",
      classe: "bg-red-50 border-red-200 text-red-800",
    },
  };

  const situacao =
    situacoes[perfil?.approval_status ?? "pending"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#111111] sm:text-3xl">
          Olá, {nome}!
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Bem-vindo ao seu painel Oxus.
        </p>
      </div>

      {erro && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </div>
      )}

      {perfil && (
        <div className={`rounded-xl border p-5 ${situacao.classe}`}>
          <div className="flex items-start gap-3">
            <Clock3 size={22} className="shrink-0" />

            <div>
              <h2 className="font-semibold">{situacao.titulo}</h2>
              <p className="mt-1 text-sm leading-6">
                {situacao.texto}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Indicador
          titulo="Total de imóveis"
          valor={totalImoveis}
          icon={House}
        />

        <Indicador
          titulo="Imóveis publicados"
          valor={publicados}
          icon={CheckCircle2}
        />

        <Indicador
          titulo="Rascunhos"
          valor={rascunhos}
          icon={Clock3}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Link
          to="/corretor/imoveis"
          className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-[#111111]">
            <House size={24} />
          </div>

          <h3 className="text-lg font-semibold text-[#111111]">
            Meus imóveis
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Acompanhe os imóveis cadastrados na plataforma.
          </p>

          <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#FE540C]">
            Acessar imóveis
            <ArrowRight size={17} />
          </span>
        </Link>

        <Link
          to="/corretor/perfil"
          className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-[#111111]">
            <UserRound size={24} />
          </div>

          <h3 className="text-lg font-semibold text-[#111111]">
            Meu perfil
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Consulte seus dados profissionais e situação cadastral.
          </p>

          <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#FE540C]">
            Ver perfil
            <ArrowRight size={17} />
          </span>
        </Link>
      </div>
    </div>
  );
}

type IndicadorProps = {
  titulo: string;
  valor: number;
  icon: typeof House;
};

function Indicador({
  titulo,
  valor,
  icon: Icon,
}: IndicadorProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {titulo}
        </p>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-[#111111]">
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-5 text-3xl font-semibold text-[#111111]">
        {valor}
      </p>
    </div>
  );
}
