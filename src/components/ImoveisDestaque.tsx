import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import ImovelCard from "./ImovelCard";
import { imoveisExemplo } from "../data/imoveisExemplo";

export default function ImoveisDestaque() {
  const destaques = imoveisExemplo
    .filter((imovel) => imovel.destaque)
    .slice(0, 6);

  return (
    <section className="bg-[#F5F6F8] px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A34A]">
              Selecionados para você
            </span>

            <h2 className="mt-3 text-3xl font-semibold text-[#071B2E] md:text-4xl">
              Imóveis em destaque
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Explore algumas oportunidades disponíveis na Domaterra.
            </p>
          </div>

          <Link
            to="/imoveis"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#071B2E] transition-colors hover:text-[#C9A34A]"
          >
            Ver todos os imóveis
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {destaques.map((imovel) => (
            <ImovelCard key={imovel.id} imovel={imovel} />
          ))}
        </div>
      </div>
    </section>
  );
}