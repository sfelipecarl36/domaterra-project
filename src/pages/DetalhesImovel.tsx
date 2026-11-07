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
} from "lucide-react";
import type { Imovel } from "../components/ImovelCard";
import { buscarImovelPorId } from "../services/imoveisService";

export default function DetalhesImovel() {
  const { id } = useParams();

  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [indiceFoto, setIndiceFoto] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");
      setIndiceFoto(0);

      if (!id) {
        setCarregando(false);
        return;
      }

      try {
        const dados = await buscarImovelPorId(id);

        if (ativo) setImovel(dados);
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar este imóvel.");
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

  if (carregando) {
    return (
      <main className="min-h-[70vh] bg-[#F5F6F8] px-5 py-20 text-center text-slate-500">
        Carregando imóvel...
      </main>
    );
  }

  if (erro || !imovel) {
    return (
      <main className="min-h-[70vh] bg-[#F5F6F8] px-5 py-20 text-center">
        <h1 className="text-2xl font-semibold text-[#071B2E]">
          {erro || "Imóvel não encontrado"}
        </h1>

        <Link
          to="/imoveis"
          className="mt-5 inline-block font-semibold text-[#C9A34A]"
        >
          Voltar ao catálogo
        </Link>
      </main>
    );
  }

  const imagens =
    imovel.imagens?.length
      ? imovel.imagens
      : imovel.imagem
        ? [imovel.imagem]
        : [];

  const preco = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(imovel.preco);

  const telefone = imovel.corretor?.telefone?.replace(/\D/g, "");

  const mensagem = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${imovel.titulo}" anunciado na Domaterra.`
  );

  const whatsapp = telefone
    ? `https://wa.me/${telefone}?text=${mensagem}`
    : null;

  function anterior() {
    setIndiceFoto((atual) =>
      atual === 0 ? imagens.length - 1 : atual - 1
    );
  }

  function proxima() {
    setIndiceFoto((atual) =>
      atual === imagens.length - 1 ? 0 : atual + 1
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#F5F6F8] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/imoveis"
          className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#071B2E]"
        >
          <ArrowLeft size={17} />
          Voltar aos imóveis
        </Link>

        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-[#071B2E] sm:text-3xl">
            {imovel.titulo}
          </h1>

          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={17} />
            {imovel.bairro}, {imovel.cidade}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-7 lg:col-span-2">
            <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl bg-slate-200">
              {imagens.length > 0 ? (
                <>
                  <img
                    src={imagens[indiceFoto]}
                    alt={`${imovel.titulo} - Foto ${indiceFoto + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {imagens.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={anterior}
                        aria-label="Foto anterior"
                        className="absolute left-4 rounded-full bg-white/90 p-3 text-[#071B2E]"
                      >
                        <ChevronLeft size={22} />
                      </button>

                      <button
                        type="button"
                        onClick={proxima}
                        aria-label="Próxima foto"
                        className="absolute right-4 rounded-full bg-white/90 p-3 text-[#071B2E]"
                      >
                        <ChevronRight size={22} />
                      </button>

                      <span className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-2 text-xs text-white">
                        {indiceFoto + 1} / {imagens.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <ImageOff size={48} />
                  <span>Sem fotografias</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 sm:grid-cols-4">
              <Caracteristica
                icon={BedDouble}
                valor={`${imovel.quartos} quartos`}
              />
              <Caracteristica
                icon={Bath}
                valor={`${imovel.banheiros} banheiros`}
              />
              <Caracteristica
                icon={Maximize}
                valor={`${imovel.area} m²`}
              />
              <Caracteristica
                icon={Car}
                valor={`${imovel.vagas ?? 0} vagas`}
              />
            </div>

            <section className="rounded-2xl bg-white p-7">
              <h2 className="text-xl font-semibold text-[#071B2E]">
                Sobre o imóvel
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {imovel.descricao ||
                  "Nenhuma descrição disponível."}
              </p>
            </section>

            <section className="rounded-2xl bg-white p-7">
              <h2 className="text-xl font-semibold text-[#071B2E]">
                Localização
              </h2>

              <p className="mt-4 text-sm text-slate-600">
                {imovel.bairro}, {imovel.cidade}
              </p>
            </section>
          </div>

          <aside>
            <div className="sticky top-28 rounded-2xl bg-white p-7 shadow-sm">
              <p className="text-sm text-slate-500">
                Valor de venda
              </p>

              <p className="mt-2 text-3xl font-semibold text-[#071B2E]">
                {preco}
              </p>

              <div className="my-6 border-t border-slate-100" />

              <h3 className="font-semibold text-[#071B2E]">
                Entre em contato
              </h3>

              {imovel.corretor?.nome && (
                <p className="mt-3 text-sm text-slate-600">
                  {imovel.corretor.nome}
                </p>
              )}

              {imovel.corretor?.creci && (
                <p className="mt-1 text-xs text-slate-500">
                  CRECI: {imovel.corretor.creci}
                </p>
              )}

              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#071B2E] px-5 py-4 text-sm font-semibold text-white hover:bg-[#123754]"
                >
                  <MessageCircle size={19} />
                  Conversar no WhatsApp
                </a>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  O contato do corretor ainda não está disponível.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

type CaracteristicaProps = {
  icon: typeof BedDouble;
  valor: string;
};

function Caracteristica({
  icon: Icon,
  valor,
}: CaracteristicaProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center text-[#071B2E]">
      <Icon size={23} className="text-[#C9A34A]" />
      <span className="text-xs font-medium sm:text-sm">
        {valor}
      </span>
    </div>
  );
}
