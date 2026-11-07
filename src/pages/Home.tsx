
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Building2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

import ImoveisDestaque from "../components/ImoveisDestaque";

export default function Home() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  function pesquisar(event: React.FormEvent<HTMLFormElement>) {
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
    <main className="bg-white">

      <section
        className="relative flex min-h-[650px] items-center bg-cover bg-center px-5 py-20 md:min-h-[720px]"
        style={{
          backgroundImage: "url('/banner-home.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto w-full max-w-7xl text-center">
          <span className="mb-6 inline-block rounded-full border border-white/40 bg-black/20 px-5 py-2 text-xs font-semibold tracking-widest text-white backdrop-blur-sm">
            OXUS NEGÓCIOS IMOBILIÁRIOS
          </span>

          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
            O imóvel ideal para sua
            <span className="text-[#FE540C]">
              {" "}próxima conquista.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/90 md:text-lg">
            Encontre imóveis e conecte-se diretamente com
            corretores profissionais em um só lugar.
          </p>

          <form
            onSubmit={pesquisar}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-3 px-3">
              <MapPin
                className="shrink-0 text-[#FE540C]"
                size={21}
              />

              <input
                type="text"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Cidade, bairro ou imóvel..."
                aria-label="Buscar imóveis"
                className="w-full bg-transparent py-3 text-sm text-[#111111] placeholder:text-[#777777] outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#FE540C] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#E64B0A]"
            >
              <Search size={19} />
              Buscar imóveis
            </button>
          </form>
        </div>
      </section>


      <ImoveisDestaque />

      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#FE540C]">
              Nossa plataforma
            </span>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#111111]">
              Uma nova forma de encontrar imóveis
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#555555]">
              Mais praticidade para encontrar oportunidades
              e entrar em contato com profissionais do mercado imobiliário.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                titulo: "Encontre seu imóvel",
                descricao:
                  "Explore anúncios de imóveis para comprar e encontre oportunidades.",
                icone: Building2,
              },
              {
                titulo: "Corretores profissionais",
                descricao:
                  "Entre em contato diretamente com o corretor responsável pelo anúncio.",
                icone: ShieldCheck,
              },
              {
                titulo: "Negocie diretamente",
                descricao:
                  "Converse, agende visitas e descubra o imóvel ideal para você.",
                icone: KeyRound,
              },
            ].map((item) => {
              const Icone = item.icone;

              return (
                <div
                  key={item.titulo}
                  className="rounded-2xl border border-gray-200 bg-[#F7F7F7] p-8 transition-colors hover:border-[#FE540C]/30"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFF1EB] text-[#FE540C]">
                    <Icone size={26} />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-[#111111]">
                    {item.titulo}
                  </h3>

                  <p className="text-sm leading-7 text-[#555555]">
                    {item.descricao}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
