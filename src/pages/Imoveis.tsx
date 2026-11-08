import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  House,
  X,
  MapPin,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";

import ImovelCard, { type Imovel } from "../components/ImovelCard";
import { buscarImoveis } from "../services/imoveisService";

export default function Imoveis() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const busca = searchParams.get("busca") ?? "";
  const cidade = searchParams.get("cidade") ?? "";
  const tipo = searchParams.get("tipo") ?? "";
  const precoMaximo = searchParams.get("preco") ?? "";
  const quartos = searchParams.get("quartos") ?? "";
  const ordenacao = searchParams.get("ordem") ?? "recentes";

  function atualizarFiltro(chave: string, valor: string) {
    setSearchParams((anteriores) => {
      const novos = new URLSearchParams(anteriores);

      if (valor) {
        novos.set(chave, valor);
      } else {
        novos.delete(chave);
      }

      return novos;
    }, { replace: true });
  }

  function limparFiltros() {
    setSearchParams({}, { replace: true });
  }

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await buscarImoveis();

        if (ativo) {
          setImoveis(dados);
          setErro("");
        }
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar os imóveis.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const cidades = useMemo(() => {
    return [...new Set(imoveis.map((item) => item.cidade))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [imoveis]);

  const tipos = useMemo(() => {
    return [...new Set(
      imoveis.map((item) => item.tipo).filter(
        (valor): valor is string => Boolean(valor)
      )
    )].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [imoveis]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    const resultado = imoveis.filter((imovel) => {
      const texto = [
        imovel.titulo,
        imovel.cidade,
        imovel.bairro,
      ].join(" ").toLocaleLowerCase("pt-BR");

      if (termo && !texto.includes(termo)) return false;
      if (cidade && imovel.cidade !== cidade) return false;
      if (tipo && imovel.tipo !== tipo) return false;

      if (
        precoMaximo &&
        imovel.preco > Number(precoMaximo)
      ) {
        return false;
      }

      if (
        quartos &&
        imovel.quartos < Number(quartos)
      ) {
        return false;
      }

      return true;
    });

    if (ordenacao === "menor-preco") {
      resultado.sort((a, b) => a.preco - b.preco);
    }

    if (ordenacao === "maior-preco") {
      resultado.sort((a, b) => b.preco - a.preco);
    }

    // "recentes" mantém a ordem original do serviço.
    return resultado;
  }, [
    imoveis,
    busca,
    cidade,
    tipo,
    precoMaximo,
    quartos,
    ordenacao,
  ]);

  const filtrosAtivos = [
    busca,
    cidade,
    tipo,
    precoMaximo,
    quartos,
  ].filter(Boolean).length;

  const classeSelect =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#333333] outline-none transition-colors focus:border-[#FE540C] focus:ring-2 focus:ring-[#FE540C]/10";

  return (
    <main className="min-h-[70vh] bg-[#F8F8F8]">

      {/* CABEÇALHO */}
      <section className="border-b border-gray-200 bg-white px-5 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FE540C]">
            Oxus Negócios Imobiliários
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl md:text-5xl">
            Encontre seu próximo imóvel.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-gray-600 md:text-base">
            Explore oportunidades imobiliárias e encontre
            o imóvel que combina com seus planos.
          </p>

          {/* BUSCA */}
          <div className="mt-9 flex max-w-3xl items-center gap-4 rounded-2xl border border-gray-200 bg-[#F8F8F8] px-5 py-4 transition-colors focus-within:border-[#FE540C]">
            <Search
              size={22}
              className="shrink-0 text-[#FE540C]"
            />

            <input
              type="search"
              value={busca}
              onChange={(event) =>
                atualizarFiltro("busca", event.target.value)
              }
              placeholder="Busque por cidade, bairro ou imóvel..."
              aria-label="Buscar imóveis"
              className="w-full min-w-0 bg-transparent text-sm text-[#111111] outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:py-16">

        {/* TÍTULO E AÇÕES */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-[#111111]">
              Imóveis disponíveis
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {carregando
                ? "Carregando oportunidades..."
                : erro
                  ? "Não foi possível obter os resultados"
                  : `${filtrados.length} ${
                      filtrados.length === 1
                        ? "imóvel encontrado"
                        : "imóveis encontrados"
                    }`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500">
              <ArrowUpDown size={17} />

              <select
                value={ordenacao}
                onChange={(event) =>
                  atualizarFiltro("ordem", event.target.value)
                }
                aria-label="Ordenar imóveis"
                className="max-w-44 bg-transparent text-sm font-medium text-[#333333] outline-none"
              >
                <option value="recentes">Mais recentes</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              aria-expanded={mostrarFiltros}
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${
                mostrarFiltros
                  ? "border-[#FE540C] bg-[#FFF1EB] text-[#FE540C]"
                  : "border-gray-200 bg-white text-[#111111] hover:border-[#FE540C]"
              }`}
            >
              <SlidersHorizontal size={18} />
              Filtros

              {filtrosAtivos > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FE540C] px-1 text-xs text-white">
                  {filtrosAtivos}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* PAINEL DE FILTROS */}
        {mostrarFiltros && (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111111]">
                Refinar sua busca
              </h3>

              <button
                type="button"
                onClick={() => setMostrarFiltros(false)}
                aria-label="Fechar filtros"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-gray-600">
                  Localização
                </span>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#FE540C]"
                  />

                  <select
                    value={cidade}
                    onChange={(event) =>
                      atualizarFiltro("cidade", event.target.value)
                    }
                    className={`${classeSelect} pl-10`}
                  >
                    <option value="">Todas as cidades</option>

                    {cidades.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-gray-600">
                  Tipo de imóvel
                </span>

                <select
                  value={tipo}
                  onChange={(event) =>
                    atualizarFiltro("tipo", event.target.value)
                  }
                  className={classeSelect}
                >
                  <option value="">Todos os tipos</option>

                  {tipos.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-gray-600">
                  Preço máximo
                </span>

                <select
                  value={precoMaximo}
                  onChange={(event) =>
                    atualizarFiltro("preco", event.target.value)
                  }
                  className={classeSelect}
                >
                  <option value="">Qualquer preço</option>
                  <option value="300000">Até R$ 300 mil</option>
                  <option value="500000">Até R$ 500 mil</option>
                  <option value="800000">Até R$ 800 mil</option>
                  <option value="1000000">Até R$ 1 milhão</option>
                  <option value="2000000">Até R$ 2 milhões</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-gray-600">
                  Quartos
                </span>

                <select
                  value={quartos}
                  onChange={(event) =>
                    atualizarFiltro("quartos", event.target.value)
                  }
                  className={classeSelect}
                >
                  <option value="">Qualquer quantidade</option>
                  <option value="1">1+ quarto</option>
                  <option value="2">2+ quartos</option>
                  <option value="3">3+ quartos</option>
                  <option value="4">4+ quartos</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={limparFiltros}
                className="text-sm font-semibold text-[#FE540C] hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}

        {/* CARREGAMENTO */}
        {carregando && (
          <div
            role="status"
            aria-label="Carregando imóveis"
            className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div className="aspect-[4/3] animate-pulse bg-gray-200" />

                <div className="space-y-4 p-6">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
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
            className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 px-6 py-16 text-center"
          >
            <AlertCircle size={36} className="text-red-500" />

            <h3 className="mt-5 text-lg font-bold text-[#111111]">
              Não foi possível carregar os imóveis
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              Tente acessar novamente em alguns instantes.
            </p>
          </div>
        )}

        {/* SEM RESULTADOS */}
        {!carregando && !erro && filtrados.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1EB]">
              <House size={35} className="text-[#FE540C]" />
            </div>

            <h3 className="mt-6 text-xl font-bold text-[#111111]">
              Nenhum imóvel encontrado
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-gray-600">
              Não encontramos imóveis com os filtros
              selecionados. Experimente ajustar sua busca.
            </p>

            <button
              type="button"
              onClick={limparFiltros}
              className="mt-7 rounded-xl bg-[#FE540C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#E64B0A]"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* IMÓVEIS */}
        {!carregando && !erro && filtrados.length > 0 && (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
