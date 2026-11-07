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
    <main className="min-h-[70vh] bg-[#F5F6F8]">
      <section className="bg-[#071B2E] px-5 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Encontre seu próximo imóvel
          </h1>

          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Explore os imóveis disponíveis na Domaterra.
          </p>

          <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-xl bg-white px-5 py-4 text-[#071B2E]">
            <Search size={21} className="shrink-0 text-slate-400" />

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
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#071B2E]">
              Imóveis disponíveis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {carregando
                ? "Carregando..."
                : `${filtrados.length} imóvel(is) encontrado(s)`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#071B2E]"
          >
            <SlidersHorizontal size={18} />
            Filtros
          </button>
        </div>

        {mostrarFiltros && (
          <div className="mb-8 grid gap-4 rounded-xl border border-slate-100 bg-white p-5 md:grid-cols-4">
            <select
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
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
              onChange={(e) => setPrecoMaximo(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
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
              onChange={(e) => setQuartos(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
            >
              <option value="">Qualquer quantidade de quartos</option>
              <option value="1">1+ quarto</option>
              <option value="2">2+ quartos</option>
              <option value="3">3+ quartos</option>
              <option value="4">4+ quartos</option>
            </select>

            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-3 text-sm"
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>

            <button
              type="button"
              onClick={limparFiltros}
              className="text-left text-sm font-medium text-[#C9A34A]"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {erro && (
          <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="py-16 text-center text-slate-500">
            Carregando imóveis...
          </p>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-20 text-center">
            <House size={44} className="text-[#C9A34A]" />

            <h3 className="mt-5 text-lg font-semibold text-[#071B2E]">
              Nenhum imóvel encontrado
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              Ainda não existem imóveis publicados que correspondam
              aos filtros selecionados.
            </p>

            <button
              type="button"
              onClick={limparFiltros}
              className="mt-6 text-sm font-semibold text-[#C9A34A]"
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
