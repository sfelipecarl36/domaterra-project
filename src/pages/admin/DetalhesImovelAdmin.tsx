import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Star,
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Car,
  CheckCircle2,
  PauseCircle,
  RotateCcw,
  ImageOff,
  Clock3,
  AlertCircle,
} from "lucide-react";
import {
  buscarImovelAdmin,
  alterarStatusImovel,
  alterarDestaqueImovel,
  type ImovelAdmin,
} from "../../services/adminImoveisService";

type StatusAcao = "draft" | "published" | "paused" | "pending_review";

const nomesStatus: Record<string, string> = {
  draft: "Rascunho",
  pending_review: "Aguardando análise",
  published: "Publicado",
  paused: "Pausado",
  sold: "Vendido",
};

const coresStatus: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700",
  pending_review: "bg-blue-50 text-blue-700",
  published: "bg-green-50 text-green-700",
  paused: "bg-slate-100 text-slate-600",
  sold: "bg-purple-50 text-purple-700",
};

export default function DetalhesImovelAdmin() {
  const { id } = useParams();
  const [imovel, setImovel] = useState<ImovelAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");
      setMensagem("");
      setImovel(null);

      if (!id) {
        setErro("ID do imóvel não informado.");
        setCarregando(false);
        return;
      }

      try {
        const dados = await buscarImovelAdmin(id);
        if (ativo) setImovel(dados);
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar este imóvel."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, [id]);

  async function alternarDestaque() {
    if (!imovel || processando || imovel.status !== "published") return;

    const novoDestaque = !imovel.featured;
    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      await alterarDestaqueImovel(imovel.id, novoDestaque);
      setImovel((anterior) =>
        anterior?.id === imovel.id
          ? { ...anterior, featured: novoDestaque }
          : anterior
      );
      setMensagem(
        novoDestaque
          ? "Imóvel adicionado aos destaques."
          : "Imóvel removido dos destaques."
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o destaque."
      );
    } finally {
      setProcessando(false);
    }
  }

  async function alterarStatus(status: StatusAcao) {
    if (!imovel || processando) return;

    const acoes: Record<StatusAcao, string> = {
      draft: "devolver para correção",
      published: "publicar",
      paused: "pausar",
      pending_review: "reenviar para análise",
    };

    if (!window.confirm(`Deseja realmente ${acoes[status]} este imóvel?`)) {
      return;
    }

    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      await alterarStatusImovel(imovel.id, status);
      const atualizado = await buscarImovelAdmin(imovel.id);
      setImovel(
        atualizado ?? { ...imovel, status }
      );
      setMensagem("Situação do imóvel atualizada com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o imóvel."
      );
    } finally {
      setProcessando(false);
    }
  }

  if (carregando) {
    return <p className="text-sm text-slate-500">Carregando imóvel...</p>;
  }

  if (!imovel) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{erro || "Imóvel não encontrado."}</p>
        <Link to="/admin/imoveis" className="text-[#FE540C]">
          Voltar aos imóveis
        </Link>
      </div>
    );
  }

  const preco = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(imovel.price);

  return (
    <div className="space-y-7">
      <Link
        to="/admin/imoveis"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#111111]"
      >
        <ArrowLeft size={18} />
        Voltar aos imóveis
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-[#111111]">
          Analisar imóvel
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Confira as informações e gerencie a publicação do anúncio.
        </p>
      </div>

      {erro && (
        <div role="alert" className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {mensagem && (
        <div role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
          {mensagem}
        </div>
      )}

      <div className="grid gap-7 xl:grid-cols-3">
        <div className="space-y-7 xl:col-span-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-[#111111]">Fotografias</h2>
            {imovel.fotos.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-xl bg-slate-100 text-slate-400">
                <ImageOff size={40} />
                Nenhuma fotografia
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imovel.fotos.map((foto, index) => (
                  <div
                    key={foto.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"
                  >
                    {foto.url ? (
                      <img
                        src={foto.url}
                        alt={`Fotografia ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <ImageOff size={28} />
                      </div>
                    )}
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded bg-[#FE540C] px-2 py-1 text-xs font-semibold text-white">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#111111]">{imovel.title}</h2>
            <p className="mt-3 text-2xl font-semibold text-[#111111]">{preco}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={17} />
              {imovel.neighborhood}, {imovel.city}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-6 sm:grid-cols-4">
              <Caracteristica icon={BedDouble} valor={`${imovel.bedrooms} quartos`} />
              <Caracteristica icon={Bath} valor={`${imovel.bathrooms} banheiros`} />
              <Caracteristica icon={Maximize} valor={`${imovel.area} m²`} />
              <Caracteristica icon={Car} valor={`${imovel.parking_spaces} vagas`} />
            </div>

            <h3 className="mt-6 font-semibold text-[#111111]">Descrição</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {imovel.description || "Sem descrição."}
            </p>

            <h3 className="mt-6 font-semibold text-[#111111]">Endereço</h3>
            <p className="mt-2 text-sm text-slate-600">
              {imovel.address || "Não informado"}
            </p>
          </section>
        </div>

        <aside>
          <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111111]">Situação do anúncio</h2>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${coresStatus[imovel.status] ?? "bg-slate-100 text-slate-600"}`}>
              {nomesStatus[imovel.status] ?? imovel.status}
            </span>
            <p className="text-sm leading-6 text-slate-500">
              Somente imóveis publicados e elegíveis ficam visíveis no catálogo público.
            </p>

            {/* CONTROLE DE DESTAQUE */}
            {imovel.status === "published" && (
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Star
                        size={19}
                        className={
                          imovel.featured
                            ? "fill-[#FE540C] text-[#FE540C]"
                            : "text-slate-400"
                        }
                      />
                      <h3 className="text-sm font-semibold text-[#111111]">
                        Destacar imóvel
                      </h3>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Exibir na seção de destaques da página inicial.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={imovel.featured}
                    aria-label="Destacar imóvel"
                    disabled={processando}
                    onClick={alternarDestaque}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      imovel.featured ? "bg-[#FE540C]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        imovel.featured ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {imovel.featured && (
                  <p className="mt-4 rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-[#FE540C]">
                    Este imóvel está marcado como destaque.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 border-t border-slate-100 pt-5">
              {imovel.status === "pending_review" && (
                <>
                  <button
                    type="button"
                    disabled={processando}
                    onClick={() => alterarStatus("published")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FE540C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#E64B0A] disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} />
                    {processando ? "Processando..." : "Aprovar e publicar"}
                  </button>
                  <button
                    type="button"
                    disabled={processando}
                    onClick={() => alterarStatus("draft")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-700 disabled:opacity-50"
                  >
                    <RotateCcw size={18} />
                    Devolver para correção
                  </button>
                </>
              )}

              {imovel.status === "published" && (
                <button
                  type="button"
                  disabled={processando}
                  onClick={() => alterarStatus("paused")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-700 disabled:opacity-50"
                >
                  <PauseCircle size={18} />
                  Pausar anúncio
                </button>
              )}

              {imovel.status === "paused" && (
                <button
                  type="button"
                  disabled={processando}
                  onClick={() => alterarStatus("pending_review")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  <Clock3 size={18} />
                  Retornar para análise
                </button>
              )}

              {imovel.status === "draft" && (
                <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
                  Este imóvel ainda não foi enviado para análise pelo corretor.
                </p>
              )}

              {imovel.status === "sold" && (
                <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                  Este imóvel está marcado como vendido.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

type CaracteristicaProps = {
  icon: typeof BedDouble;
  valor: string;
};

function Caracteristica({ icon: Icon, valor }: CaracteristicaProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#111111]">
      <Icon size={20} className="text-[#FE540C]" />
      {valor}
    </div>
  );
}