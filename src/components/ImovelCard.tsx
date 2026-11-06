import { Link } from "react-router-dom";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  ArrowUpRight,
  ImageOff,
} from "lucide-react";
import { useState } from "react";

export type Imovel = {
  id: string;
  titulo: string;
  cidade: string;
  bairro: string;
  preco: number;
  quartos: number;
  banheiros: number;
  area: number;
  imagem: string | null;
  destaque: boolean;
};

type Props = {
  imovel: Imovel;
};

export default function ImovelCard({ imovel }: Props) {
  const [erroImagem, setErroImagem] = useState(false);

  const precoFormatado = imovel.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  return (
    <Link
      to={`/imoveis/${imovel.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Imagem do imóvel */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {imovel.imagem && !erroImagem ? (
          <img
            src={imovel.imagem}
            alt={imovel.titulo}
            onError={() => setErroImagem(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <ImageOff size={36} />
          </div>
        )}

        {imovel.destaque && (
          <span className="absolute left-4 top-4 rounded-md bg-[#C9A34A] px-3 py-1.5 text-xs font-semibold text-[#071B2E]">
            Destaque
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="mb-2 text-2xl font-bold text-[#071B2E]">
          {precoFormatado}
        </p>

        <h3 className="line-clamp-2 min-h-12 text-base font-semibold text-slate-800">
          {imovel.titulo}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={16} className="shrink-0 text-[#C9A34A]" />
          <span>
            {imovel.bairro}, {imovel.cidade}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <BedDouble size={18} />
            {imovel.quartos} quartos
          </span>

          <span className="flex items-center gap-2">
            <Bath size={18} />
            {imovel.banheiros} banh.
          </span>

          <span className="flex items-center gap-2">
            <Maximize size={18} />
            {imovel.area} m²
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm font-semibold text-[#071B2E]">
          <span>Ver detalhes</span>
          <ArrowUpRight
            size={20}
            className="text-[#C9A34A] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>
      </div>
    </Link>
  );
}
