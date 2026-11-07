
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  House,
} from "lucide-react";

import ImovelCard, {
  type Imovel,
} from "../components/ImovelCard";

import { buscarImoveis } from "../services/imoveisService";

export default function Imoveis() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState(
    searchParams.get("busca") ?? ""
  );
  const [cidade, setCidade] = useState("");
  const [precoMaximo, setPrecoMaximo] = useState("");
  const [quartos, setQuartos] = useState("");
  const [ordenacao, setOrdenacao] = useState("recentes");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await buscarImoveis();

        if (ativo) setImoveis(dados);
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

  useEffect(() => {
    setBusca(searchParams.get("busca") ?? "");
  }, [searchParams]);

  const cidades = useMemo(
    () =>
      [...new Set(imoveis.map((imovel) => imovel.cidade))]
        .sort((a, b) => a.localeCompare(b, "pt-BR")),
    [imoveis]
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    const resultado = imoveis.filter((imovel) => {
      const texto = [
        imovel.titulo,
        imovel.cidade,
        imovel.bairro,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      if (termo && !texto.includes(termo)) return false;
      if (cidade && imovel.cidade !== cidade) return false;

      if (
        precoMaximo &&
        imovel.preco > Number(precoMaximo)
      ) {
        return false;
      }

      if (quartos && imovel.quartos < Number(quartos)) {
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

    return resultado;
  }, [imoveis, busca, cidade, precoMaximo, quartos, ordenacao]);

  function limparFiltros() {
    setBusca("");
    setCidade("");
    setPrecoMaximo("");
    setQuartos("");
    setSearchParams({});
  }

  return (
    <main className="min-h-[70vh] bg-[#F7F7F7]">
      <section className="border-b border-gray-200 bg-white px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#FE540C]">
            OXUS IMOBILIÁRIA
          </span>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
            Encontre seu próximo imóvel
          </h1>

          <p className="mt-3 text-sm text-[#555555] sm:text-base">
            Explore os imóveis disponíveis na Oxus.
          </p>

          <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-xl border border-gray-200 bg-[#F7F7F7] px-5 py-4 shadow-sm">
            <Search
              size={21}
              className="shrink-0 text-[#FE540C]"
            />

            <input
              value={busca}
              onChange={(event) => {
                const valor = event.target.value;
                setBusca(valor);

                if (valor) {
                  setSearchParams({ busca: valor });
                } else {
                  setSearchParams({});
                }
              }}
              placeholder="Busque por cidade, bairro ou imóvel"
              aria-label="Buscar imóveis"
              className="w-full bg-transparent text-sm text-[#111111] placeholder:text-[#777777] outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#111111]">
              Imóveis disponíveis
            </h2>

            <p className="mt-1 text-sm text-[#555555]">
              {carregando
                ? "Carregando..."
                : `${filtrados.length} imóvel(is) encontrado(s)`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            aria-expanded={mostrarFiltros}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              mostrarFiltros
                ? "border-[#FE540C] bg-[#FFF1EB] text-[#FE540C]"
                : "border-gray-200 bg-white text-[#111111] hover:border-[#FE540C] hover:text-[#FE540C]"
            }`}
          >
            <SlidersHorizontal size={18} />
            Filtros
          </button>
        </div>

        {mostrarFiltros && (
          <div className="mb-8 grid gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-4">
            <select
              value={cidade}
              onChange={(event) => setCidade(event.target.value)}
              aria-label="Filtrar por cidade"
              className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-[#333333] outline-none focus:border-[#FE540C]"
            >
              <option value="">Todas as cidades</option>
              {cidades.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={precoMaximo}
              onChange={(event) => setPrecoMaximo(event.target.value)}
              aria-label="Filtrar por preço máximo"
              className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-[#333333] outline-none focus:border-[#FE540C]"
            >
              <option value="">Qualquer preço</option>
              <option value="300000">Até R$ 300 mil</option>
              <option value="500000">Até R$ 500 mil</option>
              <option value="800000">Até R$ 800 mil</option>
              <option value="1000000">Até R$ 1 milhão</option>
              <option value="2000000">Até R$ 2 milhões</option>
            </select>

            <select
              value={quartos}
              onChange={(event) => setQuartos(event.target.value)}
              aria-label="Filtrar por quantidade de quartos"
              className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-[#333333] outline-none focus:border-[#FE540C]"
            >
              <option value="">Qualquer quantidade de quartos</option>
              <option value="1">1+ quarto</option>
              <option value="2">2+ quartos</option>
              <option value="3">3+ quartos</option>
              <option value="4">4+ quartos</option>
            </select>

            <select
              value={ordenacao}
              onChange={(event) => setOrdenacao(event.target.value)}
              aria-label="Ordenar imóveis"
              className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-[#333333] outline-none focus:border-[#FE540C]"
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>

            <button
              type="button"
              onClick={limparFiltros}
              className="text-left text-sm font-medium text-[#FE540C] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {erro && (
          <p
            role="alert"
            className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="py-16 text-center text-[#555555]">
            Carregando imóveis...
          </p>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF1EB]">
              <House
                size={36}
                className="text-[#FE540C]"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-[#111111]">
              Nenhum imóvel encontrado
            </h3>

            <p className="mt-2 max-w-md text-sm text-[#555555]">
              Ainda não existem imóveis publicados que correspondam
              aos filtros selecionados.
            </p>

            <button
              type="button"
              onClick={limparFiltros}
              className="mt-6 text-sm font-semibold text-[#FE540C] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
