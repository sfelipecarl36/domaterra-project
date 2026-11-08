import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Car,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  MessageCircle,
  X,
  Images,
  Star,
  Home,
} from "lucide-react";

import type { Imovel } from "../components/ImovelCard";
import { buscarImovelPorId } from "../services/imoveisService";

export default function DetalhesImovel() {
  const { id } = useParams();
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [indiceFoto, setIndiceFoto] = useState(0);
  const [galeriaAberta, setGaleriaAberta] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");
      setImovel(null);
      setIndiceFoto(0);
      setGaleriaAberta(false);

      if (!id) {
        setCarregando(false);
        return;
      }

      try {
        const dados = await buscarImovelPorId(id);
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

    carregar();
    return () => {
      ativo = false;
    };
  }, [id]);

  useEffect(() => {
    if (!galeriaAberta) return;

    function aoPressionarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") setGaleriaAberta(false);
    }

    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [galeriaAberta]);

  if (carregando) {
    return (
      <main className="min-h-[70vh] bg-[#F8F9FA] px-5 py-12">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-5 w-36 rounded bg-slate-200" />
          <div className="h-9 w-2/3 rounded bg-slate-200" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="aspect-[16/10] rounded-3xl bg-slate-200 lg:col-span-2" />
            <div className="h-64 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (erro || !imovel) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F8F9FA] px-5 text-center">
        <Home size={44} className="mb-4 text-[#FE540C]" />
        <h1 className="text-2xl font-bold text-[#111111]">
          {erro || "Imóvel não encontrado"}
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          O anúncio pode não estar mais disponível no catálogo.
        </p>
        <Link
          to="/imoveis"
          className="mt-6 rounded-xl bg-[#FE540C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#E64B0A]"
        >
          Voltar ao catálogo
        </Link>
      </main>
    );
  }

  const imagens = imovel.imagens?.length
    ? imovel.imagens
    : imovel.imagem
      ? [imovel.imagem]
      : [];

  const preco = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(imovel.preco);

  const telefoneOriginal = imovel.corretor?.telefone?.replace(/\D/g, "") ?? "";
  const telefone = telefoneOriginal
    ? telefoneOriginal.startsWith("55")
      ? telefoneOriginal
      : `55${telefoneOriginal}`
    : "";
  const mensagem = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${imovel.titulo}" anunciado na Oxus.`
  );
  const whatsapp = telefone ? `https://wa.me/${telefone}?text=${mensagem}` : null;

  function anterior() {
    setIndiceFoto((atual) => (atual === 0 ? imagens.length - 1 : atual - 1));
  }

  function proxima() {
    setIndiceFoto((atual) => (atual === imagens.length - 1 ? 0 : atual + 1));
  }

  return (
    <main className="min-h-[70vh] bg-[#F8F9FA] px-4 py-8 pb-12 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/imoveis"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#FE540C]"
        >
          <ArrowLeft size={17} /> Voltar aos imóveis
        </Link>

        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {imovel.tipo && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {imovel.tipo}
                </span>
              )}
              {imovel.destaque && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#FE540C]">
                  <Star size={13} fill="currentColor" /> Destaque
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-4xl">
              {imovel.titulo}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={17} className="shrink-0 text-[#FE540C]" />
              {imovel.bairro}, {imovel.cidade}
            </p>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-3">
          <div className="space-y-7 lg:col-span-2">
            <section aria-label="Fotografias do imóvel">
              <div className="group relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl bg-slate-200 sm:rounded-3xl">
                {imagens.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setGaleriaAberta(true)}
                      className="h-full w-full cursor-zoom-in"
                      aria-label="Ampliar fotografia"
                    >
                      <img
                        src={imagens[indiceFoto]}
                        alt={`${imovel.titulo} - Foto ${indiceFoto + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                    {imagens.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={anterior}
                          aria-label="Foto anterior"
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-slate-900 shadow-lg transition hover:bg-[#FE540C] hover:text-white sm:left-5"
                        >
                          <ChevronLeft size={21} />
                        </button>
                        <button
                          type="button"
                          onClick={proxima}
                          aria-label="Próxima foto"
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-slate-900 shadow-lg transition hover:bg-[#FE540C] hover:text-white sm:right-5"
                        >
                          <ChevronRight size={21} />
                        </button>
                      </>
                    )}
                    <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white">
                      <Images size={15} /> {indiceFoto + 1} / {imagens.length}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <ImageOff size={48} />
                    <span>Sem fotografias</span>
                  </div>
                )}
              </div>

              {imagens.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {imagens.map((imagem, index) => (
                    <button
                      key={`${imagem}-${index}`}
                      type="button"
                      onClick={() => setIndiceFoto(index)}
                      aria-label={`Visualizar foto ${index + 1}`}
                      aria-current={indiceFoto === index ? "true" : undefined}
                      className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-36 ${
                        indiceFoto === index
                          ? "border-[#FE540C]"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={imagem} alt={`Miniatura ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="mb-6 text-xl font-bold text-[#111111]">Características do imóvel</h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <Caracteristica icon={BedDouble} valor={`${imovel.quartos} quartos`} />
                <Caracteristica icon={Bath} valor={`${imovel.banheiros} banheiros`} />
                <Caracteristica icon={Maximize} valor={`${imovel.area} m²`} />
                <Caracteristica icon={Car} valor={`${imovel.vagas ?? 0} vagas`} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-[#111111]">Sobre o imóvel</h2>
              <div className="mt-3 h-1 w-10 rounded-full bg-[#FE540C]" />
              <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-600">
                {imovel.descricao || "Nenhuma descrição disponível."}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-[#111111]">Localização</h2>
              <div className="mt-3 h-1 w-10 rounded-full bg-[#FE540C]" />
              <p className="mt-5 flex items-start gap-2 text-sm text-slate-600">
                <MapPin size={19} className="shrink-0 text-[#FE540C]" />
                <span>{imovel.bairro}, {imovel.cidade}</span>
              </p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6 sm:p-7">
                <p className="text-sm font-medium text-slate-500">Valor do imóvel</p>
                <p className="mt-2 break-words text-3xl font-extrabold tracking-tight text-[#FE540C]">
                  {preco}
                </p>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="text-lg font-bold text-[#111111]">Fale com o corretor</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Tire suas dúvidas e saiba mais sobre este imóvel.
                </p>
                {imovel.corretor?.nome && (
                  <p className="mt-5 font-semibold text-slate-900">{imovel.corretor.nome}</p>
                )}
                {imovel.corretor?.creci && (
                  <p className="mt-1 text-xs text-slate-500">CRECI: {imovel.corretor.creci}</p>
                )}
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FE540C] px-4 py-4 text-sm font-bold text-white transition hover:bg-[#E64B0A]"
                  >
                    <MessageCircle size={19} /> Conversar no WhatsApp
                  </a>
                ) : (
                  <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                    O contato do corretor ainda não está disponível.
                  </p>
                )}
                <p className="mt-4 text-center text-xs text-slate-400">
                  Atendimento diretamente com o corretor responsável.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {galeriaAberta && imagens.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galeria ampliada"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
        >
          <button
            type="button"
            onClick={() => setGaleriaAberta(false)}
            aria-label="Fechar galeria"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
          >
            <X size={24} />
          </button>
          <img
            src={imagens[indiceFoto]}
            alt={`${imovel.titulo} - Foto ampliada ${indiceFoto + 1}`}
            className="max-h-[85vh] max-w-full object-contain"
          />
          {imagens.length > 1 && (
            <>
              <button
                type="button"
                onClick={anterior}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30"
              >
                <ChevronLeft size={25} />
              </button>
              <button
                type="button"
                onClick={proxima}
                aria-label="Próxima foto"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30"
              >
                <ChevronRight size={25} />
              </button>
            </>
          )}
          <span className="absolute bottom-5 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white">
            {indiceFoto + 1} de {imagens.length}
          </span>
        </div>
      )}
    </main>
  );
}

type CaracteristicaProps = {
  icon: typeof BedDouble;
  valor: string;
};

function Caracteristica({ icon: Icon, valor }: CaracteristicaProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-[#FFF6F1] px-2 py-5 text-center">
      <Icon size={24} className="text-[#FE540C]" />
      <span className="text-xs font-semibold text-[#111111] sm:text-sm">{valor}</span>
    </div>
  );
}
