import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, House } from "lucide-react";
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

        if (ativo) setImoveis(dados);
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar os destaques.");
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

  return (
    <section className="bg-[#F5F6F8] px-5 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#C9A34A]">
              Oportunidades selecionadas
            </p>

            <h2 className="text-3xl font-semibold text-[#071B2E]">
              Imóveis em destaque
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Conheça os imóveis selecionados pela Domaterra.
            </p>
          </div>

          <Link
            to="/imoveis"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#071B2E] hover:text-[#C9A34A]"
          >
            Ver todos os imóveis
            <ArrowRight size={18} />
          </Link>
        </div>

        {erro && (
          <p role="alert" className="mb-6 text-sm text-red-600">
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="py-10 text-center text-slate-500">
            Carregando destaques...
          </p>
        ) : imoveis.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center">
            <House size={40} className="text-[#C9A34A]" />

            <h3 className="mt-4 text-lg font-semibold text-[#071B2E]">
              Em breve, novos destaques
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Os imóveis selecionados aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
