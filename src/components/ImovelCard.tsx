
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

  descricao?: string;
  endereco?: string;
  vagas?: number;
  tipo?: string;
  imagens?: string[];
  corretor?: {
    nome: string;
    telefone: string;
    creci?: string;
  };
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
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FE540C]/30 hover:shadow-lg"
    >
      <div className="relative h-56 overflow-hidden bg-[#F7F7F7]">
        {imovel.imagem && !erroImagem ? (
          <img
            src={imovel.imagem}
            alt={imovel.titulo}
            onError={() => setErroImagem(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <ImageOff size={36} />
          </div>
        )}

        {imovel.destaque && (
          <span className="absolute left-4 top-4 rounded-lg bg-[#FE540C] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            Destaque
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="mb-2 text-2xl font-bold text-[#FE540C]">
          {precoFormatado}
        </p>

        <h3 className="line-clamp-2 min-h-12 text-base font-semibold text-[#111111]">
          {imovel.titulo}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-sm text-[#555555]">
          <MapPin
            size={16}
            className="shrink-0 text-[#FE540C]"
          />
          <span>
            {imovel.bairro}, {imovel.cidade}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-gray-100 pt-4 text-sm text-[#555555]">
          <span className="flex items-center gap-2">
            <BedDouble size={18} className="text-[#666666]" />
            {imovel.quartos} quartos
          </span>

          <span className="flex items-center gap-2">
            <Bath size={18} className="text-[#666666]" />
            {imovel.banheiros} banh.
          </span>

          <span className="flex items-center gap-2">
            <Maximize size={18} className="text-[#666666]" />
            {imovel.area} m²
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-[#FE540C]">
          <span>Ver detalhes</span>

          <ArrowUpRight
            size={20}
            className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>
      </div>
    </Link>
  );
}
