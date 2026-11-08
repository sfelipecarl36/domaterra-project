import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  ArrowUpRight,
  ImageOff,
  BadgeCheck,
} from "lucide-react";

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
  const [imagemComErro, setImagemComErro] = useState<string | null>(
    null
  );

  const precoFormatado = imovel.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  const imagemDisponivel =
    Boolean(imovel.imagem) &&
    imagemComErro !== imovel.imagem;

  const caracteristicas = [
    {
      icone: BedDouble,
      valor: imovel.quartos,
      descricao: imovel.quartos === 1 ? "Quarto" : "Quartos",
    },
    {
      icone: Bath,
      valor: imovel.banheiros,
      descricao: imovel.banheiros === 1 ? "Banheiro" : "Banheiros",
    },
    {
      icone: Maximize,
      valor: imovel.area,
      descricao: "m²",
    },
  ];

  return (
    <Link
      to={`/imoveis/${imovel.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FE540C]/30 hover:shadow-xl hover:shadow-black/10"
    >
      {/* IMAGEM DO IMÓVEL */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F4F4]">
        {imagemDisponivel ? (
          <img
            src={imovel.imagem!}
            alt={imovel.titulo}
            loading="lazy"
            onError={() =>
              setImagemComErro(imovel.imagem)
            }
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
            <ImageOff size={36} strokeWidth={1.5} />

            <span className="text-xs font-medium">
              Imagem não disponível
            </span>
          </div>
        )}

        {/* SELO DE DESTAQUE */}
        {imovel.destaque && (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-[#FE540C] px-3 py-2 text-xs font-bold text-white shadow-lg">
            <BadgeCheck size={15} />
            Em destaque
          </div>
        )}

        {/* TIPO DO IMÓVEL */}
        {imovel.tipo && (
          <span className="absolute bottom-4 left-4 max-w-[85%] truncate rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#111111] shadow-sm">
            {imovel.tipo}
          </span>
        )}
      </div>

      {/* CONTEÚDO */}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {/* PREÇO */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Valor do imóvel
          </span>

          <p className="mt-1 text-2xl font-bold tracking-tight text-[#FE540C]">
            {precoFormatado}
          </p>
        </div>

        {/* TÍTULO */}
        <h3 className="mt-4 line-clamp-2 min-h-12 text-lg font-bold leading-6 text-[#111111] transition-colors group-hover:text-[#FE540C]">
          {imovel.titulo}
        </h3>

        {/* LOCALIZAÇÃO */}
        <div className="mt-3 flex items-start gap-2 text-sm text-gray-500">
          <MapPin
            size={17}
            className="mt-0.5 shrink-0 text-[#FE540C]"
          />

          <span className="line-clamp-2">
            {[imovel.bairro, imovel.cidade]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>

        {/* CARACTERÍSTICAS */}
        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5">
          {caracteristicas.map((item) => {
            const Icone = item.icone;

            return (
              <div
                key={item.descricao}
                className="flex flex-col items-center gap-2 text-center"
              >
                <Icone
                  size={19}
                  strokeWidth={1.8}
                  className="text-[#FE540C]"
                />

                <div>
                  <p className="text-sm font-bold text-[#111111]">
                    {item.valor}
                    {item.descricao === "m²" ? " m²" : ""}
                  </p>

                  {item.descricao !== "m²" && (
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {item.descricao}
                    </p>
                  )}

                  {item.descricao === "m²" && (
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Área
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* RODAPÉ */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-5">
          <span className="text-sm font-bold text-[#111111] transition-colors group-hover:text-[#FE540C]">
            Ver detalhes do imóvel
          </span>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1EB] text-[#FE540C] transition-colors group-hover:bg-[#FE540C] group-hover:text-white">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}
