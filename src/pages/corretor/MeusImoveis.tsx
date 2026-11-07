import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  House,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Images,
  ImageOff,
  Send,
  Clock3,
  Eye,
  PauseCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { enviarImovelParaAnalise } from "../../services/analiseImovelService";
import { alterarStatusMeuImovel } from "../../services/gerenciamentoImovelService";
import { excluirImovelDefinitivamente } from "../../services/exclusaoImovelService";

type Foto = {
  id: string;
  storage_path: string;
  position: number;
};

type Imovel = {
  id: string;
  title: string;
  price: number;
  city: string;
  neighborhood: string;
  status: string;
  created_at: string;
  property_images: Foto[];
  imagemCapa: string | null;
};

const statusNomes: Record<string, string> = {
  draft: "Rascunho",
  pending_review: "Aguardando análise",
  published: "Publicado",
  paused: "Pausado",
  sold: "Vendido",
  deleting: "Exclusão pendente",
};

const statusCores: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700",
  pending_review: "bg-blue-50 text-blue-700",
  published: "bg-green-50 text-green-700",
  paused: "bg-slate-100 text-slate-600",
  sold: "bg-purple-50 text-purple-700",
  deleting: "bg-red-50 text-red-700",
};

export default function MeusImoveis() {
  const { user } = useAuth();
  const location = useLocation();

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const mensagem = (
    location.state as { mensagem?: string } | null
  )?.mensagem;

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!user) {
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro("");

      try {
        const { data, error } = await supabase
          .from("properties")
          .select(`
            id,
            title,
            price,
            city,
            neighborhood,
            status,
            created_at,
            property_images (
              id,
              storage_path,
              position
            )
          `)
          .eq("broker_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const resultado = await Promise.all(
          (data ?? []).map(async (imovel) => {
            const fotos = [...(imovel.property_images ?? [])]
              .sort((a, b) => a.position - b.position);

            let imagemCapa: string | null = null;

            if (fotos.length > 0) {
              const { data: urlData } = await supabase.storage
                .from("imoveis")
                .createSignedUrl(fotos[0].storage_path, 3600);

              imagemCapa = urlData?.signedUrl ?? null;
            }

            return {
              ...imovel,
              property_images: fotos,
              imagemCapa,
            };
          })
        );

        if (ativo) setImoveis(resultado);
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os imóveis."
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
  }, [user, location.key]);

  function atualizarStatus(id: string, status: string) {
    setImoveis((anteriores) =>
      anteriores.map((imovel) =>
        imovel.id === id ? { ...imovel, status } : imovel
      )
    );
  }

  async function enviarParaAnalise(imovel: Imovel) {
    if (imovel.status !== "draft") return;

    if (imovel.property_images.length === 0) {
      setErro("Adicione pelo menos uma fotografia.");
      return;
    }

    if (
      !window.confirm(
        `Enviar "${imovel.title}" para análise administrativa?`
      )
    ) {
      return;
    }

    setProcessando(imovel.id);
    setErro("");
    setSucesso("");

    try {
      await enviarImovelParaAnalise(imovel.id);
      atualizarStatus(imovel.id, "pending_review");
      setSucesso("Imóvel enviado para análise!");
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao enviar."
      );
    } finally {
      setProcessando(null);
    }
  }

  async function alterarStatus(
    imovel: Imovel,
    status: "paused" | "pending_review"
  ) {
    const acao =
      status === "paused"
        ? "pausar este anúncio"
        : "solicitar a reativação deste anúncio";

    if (!window.confirm(`Deseja ${acao}?`)) return;

    setProcessando(imovel.id);
    setErro("");
    setSucesso("");

    try {
      await alterarStatusMeuImovel(imovel.id, status);
      atualizarStatus(imovel.id, status);

      setSucesso(
        status === "paused"
          ? "Anúncio pausado e retirado do catálogo."
          : "Reativação solicitada. Aguardando análise."
      );
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao atualizar."
      );
    } finally {
      setProcessando(null);
    }
  }

  async function excluir(imovel: Imovel) {
    const permitidos = [
      "draft",
      "published",
      "paused",
      "sold",
      "deleting",
    ];

    if (!permitidos.includes(imovel.status)) return;

    const confirmou = window.confirm(
      `Excluir definitivamente "${imovel.title}"?\n\n` +
      "Todas as fotografias serão removidas e o anúncio não poderá ser recuperado."
    );

    if (!confirmou) return;

    setProcessando(imovel.id);
    setErro("");
    setSucesso("");

    try {
      await excluirImovelDefinitivamente(imovel.id);

      setImoveis((anteriores) =>
        anteriores.filter((item) => item.id !== imovel.id)
      );

      setSucesso("Imóvel excluído definitivamente.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o imóvel."
      );

      const { data } = await supabase
        .from("properties")
        .select("status")
        .eq("id", imovel.id)
        .maybeSingle();

      if (data?.status) {
        atualizarStatus(imovel.id, data.status);
      }
    } finally {
      setProcessando(null);
    }
  }

  function formatarPreco(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(valor);
  }

  function podeExcluir(status: string) {
    return [
      "draft",
      "published",
      "paused",
      "sold",
      "deleting",
    ].includes(status);
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-[#071B2E]">
            Meus imóveis
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Gerencie seus anúncios na Domaterra.
          </p>
        </div>

        <Link
          to="/corretor/imoveis/novo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#071B2E] px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={19} />
          Cadastrar imóvel
        </Link>
      </div>

      {mensagem && (
        <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
          {mensagem}
        </p>
      )}

      {sucesso && (
        <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
          {sucesso}
        </p>
      )}

      {erro && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-slate-500">Carregando imóveis...</p>
      ) : imoveis.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <House size={42} className="mx-auto text-[#C9A34A]" />
          <h2 className="mt-4 text-lg font-semibold text-[#071B2E]">
            Nenhum imóvel cadastrado
          </h2>
          <Link
            to="/corretor/imoveis/novo"
            className="mt-5 inline-block rounded-lg bg-[#071B2E] px-6 py-3 text-sm font-semibold text-white"
          >
            Cadastrar imóvel
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {imoveis.map((imovel) => {
            const ocupado = processando === imovel.id;

            return (
              <article
                key={imovel.id}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="relative h-52 bg-slate-100">
                  {imovel.imagemCapa ? (
                    <img
                      src={imovel.imagemCapa}
                      alt={imovel.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <ImageOff size={42} />
                    </div>
                  )}

                  {imovel.property_images.length > 0 && (
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/65 px-3 py-1.5 text-xs text-white">
                      <Images size={14} />
                      {imovel.property_images.length}
                    </span>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      statusCores[imovel.status] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusNomes[imovel.status] ?? imovel.status}
                  </span>

                  <div>
                    <p className="text-xl font-semibold text-[#071B2E]">
                      {formatarPreco(imovel.price)}
                    </p>
                    <h2 className="mt-2 font-semibold text-slate-800">
                      {imovel.title}
                    </h2>
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={16} />
                      {imovel.neighborhood}, {imovel.city}
                    </p>
                  </div>

                  {imovel.status === "draft" && (
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                      <Link
                        to={`/corretor/imoveis/${imovel.id}/editar`}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <Pencil size={16} />
                        Editar
                      </Link>

                      <Link
                        to={`/corretor/imoveis/${imovel.id}/fotos`}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <Images size={16} />
                        Fotos
                      </Link>

                      <button
                        type="button"
                        disabled={
                          ocupado ||
                          imovel.property_images.length === 0
                        }
                        onClick={() => enviarParaAnalise(imovel)}
                        className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-[#071B2E] p-3 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <Send size={17} />
                        {ocupado ? "Processando..." : "Enviar para análise"}
                      </button>

                      {imovel.property_images.length === 0 && (
                        <p className="col-span-2 text-center text-xs text-amber-700">
                          Adicione fotografias antes de enviar.
                        </p>
                      )}
                    </div>
                  )}

                  {imovel.status === "pending_review" && (
                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                      <Clock3 size={20} />
                      Aguardando aprovação administrativa.
                    </div>
                  )}

                  {imovel.status === "published" && (
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <Link
                        to={`/imoveis/${imovel.id}`}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#071B2E] p-3 text-sm font-semibold text-white"
                      >
                        <Eye size={17} />
                        Visualizar anúncio
                      </Link>

                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => alterarStatus(imovel, "paused")}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 p-3 text-sm text-amber-700 disabled:opacity-50"
                      >
                        <PauseCircle size={17} />
                        Pausar anúncio
                      </button>
                    </div>
                  )}

                  {imovel.status === "paused" && (
                    <div className="space-y-2">
                      <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
                        Este anúncio está pausado.
                      </p>

                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() =>
                          alterarStatus(imovel, "pending_review")
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#071B2E] p-3 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <RotateCcw size={17} />
                        Solicitar reativação
                      </button>
                    </div>
                  )}

                  {imovel.status === "sold" && (
                    <p className="flex items-center gap-2 rounded-lg bg-purple-50 p-3 text-sm text-purple-700">
                      <CheckCircle2 size={18} />
                      Imóvel vendido.
                    </p>
                  )}

                  {imovel.status === "deleting" && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      A exclusão foi iniciada. Você pode tentar
                      concluí-la novamente.
                    </p>
                  )}

                  {podeExcluir(imovel.status) && (
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => excluir(imovel)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                      {ocupado
                        ? "Processando..."
                        : imovel.status === "deleting"
                          ? "Concluir exclusão"
                          : "Excluir definitivamente"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
