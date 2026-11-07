import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import {
  buscarResumoAssinatura,
  type ResumoAssinatura,
} from "../../services/assinaturaService";

import { contratarPlano } from "../../services/contratacaoService";

import {
  consultarPixAssinatura,
  type DadosPixAssinatura,
} from "../../services/pixAssinaturaService";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarData(data: string | null | undefined) {
  if (!data) return "Não disponível";

  const dataNormalizada = /^\d{4}-\d{2}-\d{2}$/.test(data)
    ? `${data}T12:00:00`
    : data;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dataNormalizada));
}

export default function MinhaAssinatura() {
  const { user } = useAuth();

  const [resumo, setResumo] =
    useState<ResumoAssinatura | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [cpfCnpj, setCpfCnpj] = useState("");
  const [contratando, setContratando] = useState(false);
  const [erroContratacao, setErroContratacao] = useState("");
  const [mensagemContratacao, setMensagemContratacao] =
    useState("");

  const [dadosPix, setDadosPix] =
    useState<DadosPixAssinatura | null>(null);

  const [carregandoPix, setCarregandoPix] = useState(false);
  const [erroPix, setErroPix] = useState("");
  const [copiado, setCopiado] = useState(false);

  async function carregarPix() {
    setCarregandoPix(true);
    setErroPix("");

    try {
      const resultado = await consultarPixAssinatura();
      setDadosPix(resultado);
    } catch (error) {
      setErroPix(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o PIX."
      );
    } finally {
      setCarregandoPix(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!user) {
        setCarregando(false);
        return;
      }

      try {
        const dados = await buscarResumoAssinatura(user.id);

        if (!ativo) return;

        setResumo(dados);

        if (dados.assinatura) {
          await carregarPix();
        }
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

  async function iniciarContratacao() {
    setErroContratacao("");
    setMensagemContratacao("");

    const documento = cpfCnpj.replace(/\D/g, "");

    if (![11, 14].includes(documento.length)) {
      setErroContratacao("Informe um CPF ou CNPJ válido.");
      return;
    }

    setContratando(true);

    try {
      const resultado = await contratarPlano(documento);

      setMensagemContratacao(resultado.message);

      if (user) {
        const atualizado = await buscarResumoAssinatura(
          user.id
        );

        setResumo(atualizado);
      }

      await carregarPix();
    } catch (error) {
      setErroContratacao(
        error instanceof Error
          ? error.message
          : "Não foi possível contratar o plano."
      );
    } finally {
      setContratando(false);
    }
  }

  async function copiarPix() {
    const codigo = dadosPix?.pix?.payload;

    if (!codigo) return;

    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
    } catch {
      setErroPix("Não foi possível copiar o código PIX.");
    }
  }

  if (carregando) {
    return (
      <p className="text-sm text-slate-500">
        Carregando assinatura...
      </p>
    );
  }

  if (erro) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-red-700">
        {erro}
      </div>
    );
  }

  if (!resumo?.plano) {
    return (
      <p className="text-slate-600">
        Nenhum plano disponível.
      </p>
    );
  }

  const { plano, assinatura, imoveisUtilizados } = resumo;

  const assinaturaValida =
    assinatura?.status === "active" &&
    !!assinatura.expires_at &&
    new Date(assinatura.expires_at).getTime() > Date.now();

  const limite = plano.property_limit;

  const porcentagem = Math.min(
    (imoveisUtilizados / limite) * 100,
    100
  );

  const aguardandoPagamento =
    assinatura?.status === "pending" ||
    assinatura?.status === "past_due";

  const nomeStatus = assinaturaValida
    ? "Ativa"
    : !assinatura
      ? "Sem assinatura"
      : assinatura.status === "active"
        ? "Vencida"
        : ({
          pending: "Aguardando pagamento",
          past_due: "Pagamento atrasado",
          canceled: "Cancelada",
          expired: "Expirada",
        }[assinatura.status] ?? assinatura.status);

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <h1 className="text-3xl font-semibold text-[#071B2E]">
          Minha assinatura
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Gerencie seu plano e acompanhe seus pagamentos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 rounded-2xl bg-[#071B2E] p-7 text-white lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <Building2 className="text-[#C9A34A]" />
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

          <div>
            <span className="text-4xl font-bold">
              {moeda.format(plano.price)}
            </span>

            <span className="ml-2 text-sm text-slate-300">
              /mês
            </span>
          </div>

          <div className="grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#C9A34A]" />

              <div>
                <p className="font-medium">
                  Até {limite} imóveis
                </p>

                <p className="text-xs text-slate-300">
                  Publicados ou em análise
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="text-[#C9A34A]" />

              <div>
                <p className="font-medium">
                  Assinatura mensal
                </p>

                <p className="text-xs text-slate-300">
                  Pagamento via PIX
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#071B2E]">
            Situação atual
          </h2>

          <div className="mt-5 space-y-5 text-sm">
            <div>
              <p className="font-medium text-slate-800">
                Status
              </p>

              <p className="mt-1 text-slate-500">
                {nomeStatus}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays
                size={19}
                className="text-[#C9A34A]"
              />

              <div>
                <p className="font-medium text-slate-800">
                  Início
                </p>

                <p className="mt-1 text-slate-500">
                  {formatarData(assinatura?.starts_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw
                size={19}
                className="text-[#C9A34A]"
              />

              <div>
                <p className="font-medium text-slate-800">
                  Validade
                </p>

                <p className="mt-1 text-slate-500">
                  {formatarData(assinatura?.expires_at)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#071B2E]">
              Utilização dos anúncios
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Vagas ocupadas no seu plano.
            </p>
          </div>

          <span className="text-2xl font-semibold text-[#071B2E]">
            {imoveisUtilizados}/{limite}
          </span>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#C9A34A]"
            style={{ width: `${porcentagem}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {Math.max(limite - imoveisUtilizados, 0)} vagas disponíveis.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-7">
        <div className="flex items-start gap-3">
          {assinaturaValida ? (
            <CheckCircle2
              className="shrink-0 text-green-700"
            />
          ) : (
            <AlertCircle
              className="shrink-0 text-amber-700"
            />
          )}

          <div>
            <h2 className="font-semibold text-[#071B2E]">
              {assinaturaValida
                ? "Assinatura ativa"
                : aguardandoPagamento
                  ? "Aguardando pagamento"
                  : "Contrate seu plano"}
            </h2>

            <p className="mt-2 text-sm text-slate-700">
              {assinaturaValida
                ? "Seu plano está dentro do período de validade."
                : aguardandoPagamento
                  ? "Sua assinatura foi criada. Utilize o PIX abaixo para pagar."
                  : "Contrate o plano mensal para anunciar seus imóveis."}
            </p>
          </div>
        </div>

        {!assinaturaValida && !assinatura && (
          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="cpfCnpj"
                className="mb-2 block text-sm font-medium"
              >
                CPF ou CNPJ para cobrança
              </label>

              <input
                id="cpfCnpj"
                value={cpfCnpj}
                onChange={(event) =>
                  setCpfCnpj(event.target.value)
                }
                placeholder="Digite seu CPF ou CNPJ"
                inputMode="numeric"
                maxLength={18}
                className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A34A]"
              />
            </div>

            <button
              type="button"
              onClick={iniciarContratacao}
              disabled={contratando}
              className="flex items-center gap-2 rounded-lg bg-[#071B2E] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {contratando ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <CreditCard size={18} />
              )}

              {contratando
                ? "Processando..."
                : "Contratar plano"}
            </button>
          </div>
        )}

        {erroContratacao && (
          <p className="mt-4 text-sm text-red-700">
            {erroContratacao}
          </p>
        )}

        {mensagemContratacao && (
          <p className="mt-4 text-sm text-green-700">
            {mensagemContratacao}
          </p>
        )}

        {assinatura && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-[#071B2E]">
                {assinaturaValida
                  ? "Renovar assinatura"
                  : "Pagamento via PIX"}
              </h3>

              <button
                type="button"
                onClick={carregarPix}
                disabled={carregandoPix}
                className="flex items-center gap-2 text-sm font-medium text-[#071B2E] disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    carregandoPix ? "animate-spin" : ""
                  }
                />

                Atualizar PIX
              </button>
            </div>

            {carregandoPix && (
              <p className="mt-5 text-sm text-slate-500">
                Consultando cobrança no Asaas...
              </p>
            )}

            {erroPix && (
              <p className="mt-5 text-sm text-red-700">
                {erroPix}
              </p>
            )}

            {!carregandoPix &&
              dadosPix &&
              !dadosPix.disponivel && (
                <p className="mt-5 text-sm text-slate-600">
                  {assinaturaValida
                    ? "Sua assinatura está em dia. A próxima cobrança PIX aparecerá aqui quando estiver disponível no Asaas."
                    : dadosPix.message}
                </p>
              )}

            {dadosPix?.disponivel &&
              dadosPix.pix &&
              dadosPix.cobranca && (
                <div className="mt-6 space-y-5">
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={`data:image/png;base64,${dadosPix.pix.encodedImage}`}
                      alt="QR Code PIX da assinatura Domaterra"
                      className="h-56 w-56 rounded-xl border border-slate-200 bg-white p-2"
                    />

                    <p className="text-center text-sm text-slate-500">
                      Escaneie o QR Code com seu aplicativo bancário.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <p>
                      <strong>Valor:</strong>{" "}
                      {moeda.format(dadosPix.cobranca.value)}
                    </p>

                    <p className="mt-2">
                      <strong>Vencimento:</strong>{" "}
                      {formatarData(dadosPix.cobranca.dueDate)}
                    </p>

                    <p className="mt-2">
                      <strong>Expiração do QR Code:</strong>{" "}
                      {formatarData(dadosPix.pix.expirationDate)}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#071B2E]">
                      PIX copia e cola
                    </label>

                    <textarea
                      readOnly
                      value={dadosPix.pix.payload}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-700"
                    />

                    <button
                      type="button"
                      onClick={copiarPix}
                      className="mt-3 flex items-center gap-2 rounded-lg bg-[#071B2E] px-5 py-3 text-sm font-semibold text-white"
                    >
                      {copiado ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <Copy size={17} />
                      )}

                      {copiado
                        ? "Código copiado"
                        : "Copiar código PIX"}
                    </button>
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    O pagamento será confirmado pelo Asaas.
                    A assinatura ainda não será ativada
                    automaticamente nesta etapa.
                  </p>
                </div>
              )}
          </div>
        )}
      </section>
    </div>
  );
}
