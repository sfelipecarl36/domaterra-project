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
    <main>
      <section className="bg-[#071B2E] px-5 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <span className="mb-5 inline-block rounded-full border border-[#C9A34A]/40 px-5 py-2 text-xs font-medium tracking-widest text-[#C9A34A]">
            DOMATERRA NEGÓCIOS IMOBILIÁRIOS
          </span>

          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            O imóvel ideal para sua
            <span className="text-[#C9A34A]"> próxima conquista.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-slate-300 md:text-lg">
            Encontre imóveis e conecte-se diretamente com
            corretores profissionais em um só lugar.
          </p>

          <form
            onSubmit={pesquisar}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-xl bg-white p-3 shadow-xl sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-3 px-3">
              <MapPin className="shrink-0 text-[#C9A34A]" size={21} />

              <input
                type="text"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Cidade, bairro ou imóvel..."
                className="w-full py-3 text-sm text-slate-800 outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#C9A34A] px-7 py-4 font-semibold text-[#071B2E] transition-colors hover:bg-[#B68C36]"
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
            <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A34A]">
              Nossa plataforma
            </span>

            <h2 className="mt-3 text-3xl font-semibold text-[#071B2E]">
              Uma nova forma de encontrar imóveis
            </h2>
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
                  className="rounded-xl border border-slate-100 bg-[#F5F6F8] p-8"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#071B2E] text-[#C9A34A]">
                    <Icone size={26} />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-[#071B2E]">
                    {item.titulo}
                  </h3>

                  <p className="text-sm leading-7 text-slate-500">
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