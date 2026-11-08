import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  House,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import ImovelCard, {
  type Imovel,
} from "./ImovelCard";

import { buscarImoveisDestaque } from "../services/imoveisService";

export default function ImoveisDestaque() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await buscarImoveisDestaque();

        if (ativo) {
          setImoveis(dados);
          setErro("");
        }
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar os imóveis em destaque.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <section className="bg-white px-5 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-[#FE540C]"
              />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FE540C]">
                Oportunidades selecionadas
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#111111] md:text-4xl">
              Imóveis em destaque
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 md:text-base">
              Explore oportunidades imobiliárias e
              encontre o espaço ideal para sua próxima
              conquista.
            </p>
          </div>

          <Link
            to="/imoveis"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#111111] transition-all hover:border-[#FE540C] hover:text-[#FE540C]"
          >
            Ver todos os imóveis
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* CARREGAMENTO */}
        {carregando && (
          <div
            role="status"
            aria-label="Carregando imóveis em destaque"
            className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
              >
                <div className="aspect-[4/3] animate-pulse bg-gray-200" />

                <div className="space-y-4 p-6">
                  <div className="h-6 w-2/3 animate-pulse rounded-lg bg-gray-200" />

                  <div className="h-4 w-full animate-pulse rounded-lg bg-gray-100" />

                  <div className="h-4 w-1/2 animate-pulse rounded-lg bg-gray-100" />

                  <div className="mt-6 h-10 animate-pulse rounded-lg bg-gray-100" />
                </div>
              </div>
            ))}
            <span className="sr-only">
              Carregando imóveis...
            </span>
          </div>
        )}

        {/* ERRO */}
        {!carregando && erro && (
          <div
            role="alert"
            className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 px-6 py-14 text-center"
          >
            <AlertCircle
              size={38}
              className="text-red-500"
            />

            <h3 className="mt-5 text-lg font-bold text-[#111111]">
              Não foi possível carregar os destaques
            </h3>

            <p className="mt-2 max-w-md text-sm leading-7 text-gray-600">
              Ocorreu um problema ao buscar os imóveis.
              Tente acessar o catálogo novamente em alguns instantes.
            </p>

            <Link
              to="/imoveis"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FE540C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E64B0A]"
            >
              Acessar catálogo
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* SEM IMÓVEIS */}
        {!carregando && !erro && imoveis.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-[#FAFAFA] px-6 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1EB]">
              <House
                size={34}
                className="text-[#FE540C]"
              />
            </div>

            <h3 className="mt-6 text-xl font-bold text-[#111111]">
              Novas oportunidades em breve
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-gray-600">
              Estamos preparando novas oportunidades
              imobiliárias para você conhecer.
            </p>

            <Link
              to="/imoveis"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#FE540C] hover:underline"
            >
              Explorar catálogo
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* LISTAGEM */}
        {!carregando && !erro && imoveis.length > 0 && (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => (
              <ImovelCard
                key={imovel.id}
                imovel={imovel}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
