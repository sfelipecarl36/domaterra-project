import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Building2,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import ImoveisDestaque from "../components/ImoveisDestaque";

const vantagens = [
  {
    titulo: "Encontre seu imóvel",
    descricao:
      "Explore oportunidades e descubra imóveis que combinam com seus objetivos.",
    icone: Building2,
  },
  {
    titulo: "Corretores profissionais",
    descricao:
      "Entre em contato diretamente com o profissional responsável pelo anúncio.",
    icone: ShieldCheck,
  },
  {
    titulo: "Negocie diretamente",
    descricao:
      "Tire dúvidas, agende visitas e dê o próximo passo com mais praticidade.",
    icone: KeyRound,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  function pesquisar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parametros = new URLSearchParams();

    if (busca.trim()) {
      parametros.set("busca", busca.trim());
    }

    navigate(
      `/imoveis${parametros.size ? `?${parametros}` : ""}`
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* BANNER PRINCIPAL */}
      <section
        className="relative flex min-h-[680px] items-center overflow-hidden bg-cover bg-center px-5 py-20 md:min-h-[740px]"
        style={{
          backgroundImage: "url('/banner-home.png')",
        }}
      >
        {/* Sobreposição escura */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />

        {/* Detalhe laranja */}
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-[#FE540C]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#FE540C]" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Oxus Negócios Imobiliários
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Seu próximo imóvel começa
              <span className="text-[#FE540C]">
                {" "}aqui.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/85 md:text-lg">
              Descubra oportunidades, explore imóveis e
              conecte-se diretamente com corretores
              profissionais.
            </p>

            {/* FORMULÁRIO DE BUSCA */}
            <form
              onSubmit={pesquisar}
              className="mt-10 flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
            >
              <div className="flex min-h-14 flex-1 items-center gap-3 px-4">
                <MapPin
                  size={22}
                  className="shrink-0 text-[#FE540C]"
                />

                <input
                  type="text"
                  value={busca}
                  onChange={(event) =>
                    setBusca(event.target.value)
                  }
                  placeholder="Cidade, bairro ou imóvel..."
                  aria-label="Buscar imóveis"
                  className="w-full min-w-0 bg-transparent text-sm text-[#111111] outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#FE540C] px-7 font-semibold text-white transition-all hover:bg-[#E64B0A]"
              >
                <Search size={19} />
                Buscar imóveis
              </button>
            </form>

            {/* LINK PARA CATÁLOGO */}
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link
                to="/imoveis"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#FE540C]"
              >
                Explorar todos os imóveis
                <ArrowUpRight size={18} />
              </Link>

              <span className="hidden h-4 w-px bg-white/30 sm:block" />

              <span className="flex items-center gap-2 text-xs text-white/75">
                <CheckCircle2
                  size={16}
                  className="text-[#FE540C]"
                />
                Contato direto com corretores
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* IMÓVEIS EM DESTAQUE */}
      <ImoveisDestaque />

      {/* SEÇÃO INSTITUCIONAL */}
      <section className="bg-[#F8F8F8] px-5 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FE540C]">
                Por que escolher a Oxus?
              </span>

              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#111111] md:text-4xl">
                Uma maneira mais simples de
                encontrar seu próximo imóvel.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-gray-600 md:text-base">
                Conectamos pessoas a oportunidades
                imobiliárias, facilitando a busca e o
                contato com os profissionais responsáveis.
              </p>
            </div>

            <Link
              to="/imoveis"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:border-[#FE540C] hover:text-[#FE540C]"
            >
              Ver imóveis disponíveis
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {vantagens.map((item, index) => {
              const Icone = item.icone;

              return (
                <div
                  key={item.titulo}
                  className="group rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#FE540C]/30 hover:shadow-xl hover:shadow-black/5 md:p-9"
                >
                  <div className="mb-8 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1EB] text-[#FE540C] transition-colors group-hover:bg-[#FE540C] group-hover:text-white">
                      <Icone size={25} />
                    </div>

                    <span className="text-sm font-semibold text-gray-300">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#111111]">
                    {item.titulo}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-gray-600">
                    {item.descricao}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CHAMADA FINAL */}
      <section className="bg-[#111111] px-5 py-16 md:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FE540C]">
              Seu próximo passo
            </span>

            <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
              Pronto para encontrar seu imóvel?
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-gray-400">
              Explore as oportunidades disponíveis
              e encontre o imóvel ideal para você.
            </p>
          </div>

          <Link
            to="/imoveis"
            className="inline-flex items-center gap-3 rounded-xl bg-[#FE540C] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#E64B0A]"
          >
            Explorar imóveis
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>
    </main>
  );
}
