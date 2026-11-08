import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ArrowUpRight, House, ArrowRight } from "lucide-react";

export default function Footer() {
  const contato = {
    telefone: "(91) 99999-9999",
    telefoneLink: "5591999999999",
    email: "email@gmail.com",
    endereco: "Passagem Belém",
  };

  const links = [
    { nome: "Início", rota: "/" },
    { nome: "Explorar imóveis", rota: "/imoveis" },
    { nome: "Seja um corretor", rota: "/cadastro-corretor" },
  ];

  return (
    <footer className="bg-[#111111] text-white">
      <div className="h-1 w-full bg-[#FE540C]" />

      <div className="mx-auto max-w-7xl px-5 pt-14 pb-12 sm:pt-16 lg:pt-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.85fr_1fr] lg:gap-16">
          <div>
            <Link to="/" className="inline-block" aria-label="Oxus Imobiliária — início">
              <img
                src="/logo-footer.png"
                alt="Oxus Imobiliária"
                className="h-auto max-h-28 w-auto max-w-[250px] object-contain object-left sm:max-w-[290px]"
              />
            </Link>

            <p className="mt-7 max-w-sm text-sm leading-7 text-[#B6B6B6]">
              Conectando pessoas, imóveis e oportunidades. Encontre seu próximo
              imóvel com praticidade, segurança e confiança.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-[#D4D4D4]">
              <House size={15} className="text-[#FE540C]" />
              Seu próximo capítulo começa aqui.
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold tracking-wide text-white">
              Navegação
            </h3>
            <div className="mt-4 h-0.5 w-10 rounded-full bg-[#FE540C]" />

            <nav aria-label="Links do rodapé" className="mt-7 flex flex-col items-start gap-4">
              {links.map((link) => (
                <Link
                  key={link.rota}
                  to={link.rota}
                  className="group inline-flex items-center gap-2 text-sm text-[#B6B6B6] transition-colors hover:text-white"
                >
                  <ArrowRight size={14} className="text-[#FE540C] transition-transform group-hover:translate-x-1" />
                  {link.nome}
                </Link>
              ))}
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 text-sm text-[#B6B6B6] transition-colors hover:text-white"
              >
                <ArrowUpRight size={15} className="text-[#FE540C] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                Área do corretor
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-base font-semibold tracking-wide text-white">
              Fale com a Oxus
            </h3>
            <div className="mt-4 h-0.5 w-10 rounded-full bg-[#FE540C]" />

            <div className="mt-7 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Phone size={18} className="text-[#FE540C]" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-sm font-medium text-white">Telefone</p>
                  {contato.telefone ? (
                    <a href={`tel:+${contato.telefoneLink}`} className="text-sm text-[#B6B6B6] transition-colors hover:text-[#FE540C]">
                      {contato.telefone}
                    </a>
                  ) : (
                    <span className="text-sm text-[#B6B6B6]">A informar</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Mail size={18} className="text-[#FE540C]" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-sm font-medium text-white">E-mail</p>
                  {contato.email ? (
                    <a href={`mailto:${contato.email}`} className="break-all text-sm text-[#B6B6B6] transition-colors hover:text-[#FE540C]">
                      {contato.email}
                    </a>
                  ) : (
                    <span className="text-sm text-[#B6B6B6]">A informar</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <MapPin size={18} className="text-[#FE540C]" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-sm font-medium text-white">Endereço</p>
                  <p className="text-sm leading-6 text-[#B6B6B6]">
                    {contato.endereco || "A informar"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0B0B0B]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center text-xs text-[#969696] md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} Oxus Imobiliária. Todos os direitos reservados.</p>
          <p>Conectando você ao seu próximo imóvel.</p>
        </div>
      </div>
    </footer>
  );
}
