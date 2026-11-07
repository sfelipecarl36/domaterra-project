import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  House,
  MapPin,
  ImageOff,
} from "lucide-react";
import {
  listarImoveisAdmin,
  type ImovelAdmin,
} from "../../services/adminImoveisService";

export default function ImoveisAdmin() {
  const [imoveis, setImoveis] = useState<ImovelAdmin[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await listarImoveisAdmin();

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

  const filtrados = useMemo(() => {
    return imoveis.filter((imovel) => {
      const texto = [
        imovel.title,
        imovel.city,
        imovel.neighborhood,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      const correspondeBusca = texto.includes(
        busca.toLocaleLowerCase("pt-BR")
      );

      const correspondeStatus =
        filtro === "todos" || imovel.status === filtro;

      return correspondeBusca && correspondeStatus;
    });
  }, [imoveis, busca, filtro]);

  function formatarPreco(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(valor);
  }

  function nomeStatus(status: string) {
    const nomes: Record<string, string> = {
      draft: "Rascunho",
      pending_review: "Aguardando análise",
      published: "Publicado",
      paused: "Pausado",
      sold: "Vendido",
    };

    return nomes[status] ?? status;
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-semibold text-[#071B2E]">
          Gestão de imóveis
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Analise e gerencie os anúncios cadastrados na Domaterra.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[1fr_200px]">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4">
          <Search size={19} className="text-slate-400" />

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, cidade ou bairro"
            className="w-full py-3 text-sm outline-none"
          />
        </div>

        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
        >
          <option value="todos">Todos os status</option>
          <option value="draft">Rascunhos</option>
          <option value="pending_review">Aguardando análise</option>
          <option value="published">Publicados</option>
          <option value="paused">Pausados</option>
          <option value="sold">Vendidos</option>
        </select>
      </div>

      {erro && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-sm text-slate-500">
          Carregando imóveis...
        </p>
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center">
          <House
            size={42}
            className="mx-auto text-[#C9A34A]"
          />

          <h2 className="mt-4 font-semibold text-[#071B2E]">
            Nenhum imóvel encontrado
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((imovel) => (
            <div
              key={imovel.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="relative h-48 bg-slate-100">
                {imovel.fotos[0]?.url ? (
                  <img
                    src={imovel.fotos[0].url}
                    alt={imovel.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <ImageOff size={42} />
                  </div>
                )}

                <span className="absolute bottom-3 right-3 rounded-lg bg-black/65 px-3 py-1.5 text-xs text-white">
                  {imovel.fotos.length} foto(s)
                </span>
              </div>

              <div className="p-5">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    imovel.status === "published"
                      ? "bg-green-50 text-green-700"
                      : imovel.status === "draft"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {nomeStatus(imovel.status)}
                </span>

                <p className="mt-4 text-xl font-semibold text-[#071B2E]">
                  {formatarPreco(imovel.price)}
                </p>

                <h2 className="mt-2 line-clamp-2 font-semibold text-[#071B2E]">
                  {imovel.title}
                </h2>

                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} />
                  {imovel.neighborhood}, {imovel.city}
                </p>

                <Link
                  to={`/admin/imoveis/${imovel.id}`}
                  className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#071B2E] px-4 py-3 text-sm font-semibold text-white hover:bg-[#123754]"
                >
                  <Eye size={18} />
                  Analisar imóvel
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
