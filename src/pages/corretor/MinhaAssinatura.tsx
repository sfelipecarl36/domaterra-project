import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Building2,
  AlertCircle,
  RefreshCw,
  LockKeyhole,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import {
  buscarResumoAssinatura,
  type ResumoAssinatura,
} from "../../services/assinaturaService";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarData(data: string | null) {
  if (!data) return "Não disponível";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(data));
}

export default function MinhaAssinatura() {
  const { user } = useAuth();

  const [resumo, setResumo] = useState<ResumoAssinatura | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!user) {
        setCarregando(false);
        return;
      }

      try {
        const dados = await buscarResumoAssinatura(user.id);

        if (ativo) setResumo(dados);
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar sua assinatura."
          );
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

  if (carregando) {
    return (
      <p className="text-sm text-slate-500">
        Carregando informações da assinatura...
      </p>
    );
  }

  if (erro) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-sm text-red-700">
        {erro}
      </div>
    );
  }

  if (!resumo?.plano) {
    return (
      <div className="rounded-xl bg-white p-6 text-slate-600">
        Nenhum plano de assinatura está disponível.
      </div>
    );
  }

  const { plano, assinatura, imoveisUtilizados } = resumo;

  const assinaturaValida =
    assinatura?.status === "active" &&
    !!assinatura.starts_at &&
    !!assinatura.expires_at &&
    new Date(assinatura.starts_at).getTime() <= Date.now() &&
    new Date(assinatura.expires_at).getTime() > Date.now();

  const limite = plano.property_limit;
  const porcentagem = Math.min(
    (imoveisUtilizados / limite) * 100,
    100
  );

  function nomeStatus() {
    if (assinaturaValida) return "Ativa";
    if (!assinatura) return "Sem assinatura";
    if (assinatura.status === "active") return "Vencida";

    const nomes: Record<string, string> = {
      pending: "Aguardando pagamento",
      past_due: "Pagamento atrasado",
      canceled: "Cancelada",
      expired: "Expirada",
    };

    return nomes[assinatura.status] ?? assinatura.status;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <h1 className="text-3xl font-semibold text-[#071B2E]">
          Minha assinatura
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Consulte seu plano e acompanhe a utilização dos seus anúncios.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 rounded-2xl bg-[#071B2E] p-7 text-white lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                <Building2 size={25} className="text-[#C9A34A]" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-slate-300">
                  Domaterra
                </p>
                <h2 className="text-xl font-semibold">
                  {plano.name}
                </h2>
              </div>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                assinaturaValida
                  ? "bg-green-500/20 text-green-200"
                  : "bg-white/10 text-slate-200"
              }`}
            >
              {nomeStatus()}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {moeda.format(plano.price)}
            </span>
            <span className="text-sm text-slate-300">
              /mês
            </span>
          </div>

          <div className="grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 text-[#C9A34A]"
              />
              <div>
                <p className="font-medium">
                  Até {limite} imóveis
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Publicados ou aguardando análise
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard
                size={20}
                className="mt-0.5 text-[#C9A34A]"
              />
              <div>
                <p className="font-medium">
                  Assinatura mensal
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Cobrança recorrente
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#071B2E]">
            Situação atual
          </h2>

          <div className="mt-6 space-y-5">
            <div className="flex items-start gap-3">
              <Clock3 size={19} className="text-[#C9A34A]" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Status
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {nomeStatus()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays size={19} className="text-[#C9A34A]" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Início
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatarData(assinatura?.starts_at ?? null)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw size={19} className="text-[#C9A34A]" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Validade
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatarData(assinatura?.expires_at ?? null)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#071B2E]">
              Utilização dos anúncios
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Acompanhe quantas vagas do plano estão ocupadas.
            </p>
          </div>

          <span className="text-2xl font-semibold text-[#071B2E]">
            {imoveisUtilizados}/{limite}
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={imoveisUtilizados}
          aria-valuemin={0}
          aria-valuemax={limite}
          className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"
        >
          <div
            className="h-full rounded-full bg-[#C9A34A] transition-all"
            style={{ width: `${porcentagem}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {Math.max(limite - imoveisUtilizados, 0)} vaga(s) disponíveis.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          {assinaturaValida ? (
            <CheckCircle2
              size={22}
              className="shrink-0 text-green-700"
            />
          ) : (
            <AlertCircle
              size={22}
              className="shrink-0 text-amber-700"
            />
          )}

          <div>
            <h2 className="font-semibold text-[#071B2E]">
              {assinaturaValida
                ? "Sua assinatura está ativa"
                : "Contratação ainda não disponível"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {assinaturaValida
                ? "Seu plano está dentro do período de validade."
                : "Estamos preparando a integração com o Asaas. Em breve, você poderá contratar ou renovar seu plano diretamente nesta página."}
            </p>
          </div>
        </div>

        {!assinaturaValida && (
          <button
            type="button"
            disabled
            className="mt-5 flex items-center gap-2 rounded-lg bg-[#071B2E] px-6 py-3 text-sm font-semibold text-white opacity-50"
          >
            <LockKeyhole size={17} />
            Contratar plano
          </button>
        )}
      </section>
    </div>
  );
}
