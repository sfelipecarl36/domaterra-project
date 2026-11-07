
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  const contato = {
    telefone: "(91) 99999-9999",
    telefoneLink: "5591999999999",
    email: "email@gmail.com",
    endereco: "Passagem Belém",
  };

  return (
    <footer className="border-t border-gray-200 bg-white text-[#111111]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-16">
        <div>
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="Oxus Imobiliária"
              className="mb-6 h-28 w-auto max-w-full object-contain object-left"
            />
          </Link>

          <p className="max-w-sm text-sm leading-7 text-[#555555]">
            Conectando pessoas, imóveis e oportunidades.
            Encontre seu próximo imóvel com praticidade
            e confiança.
          </p>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-semibold text-[#FE540C]">
            Links rápidos
          </h3>

          <nav className="flex flex-col items-start gap-4 text-sm text-[#444444]">
            <Link
              to="/"
              className="transition-colors hover:text-[#FE540C]"
            >
              Início
            </Link>

            <Link
              to="/imoveis"
              className="transition-colors hover:text-[#FE540C]"
            >
              Explorar imóveis
            </Link>

            <Link
              to="/cadastro-corretor"
              className="transition-colors hover:text-[#FE540C]"
            >
              Seja um corretor
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 transition-colors hover:text-[#FE540C]"
            >
              Área do corretor
              <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-semibold text-[#FE540C]">
            Entre em contato
          </h3>

          <div className="flex flex-col gap-6 text-sm text-[#444444]">
            <div className="flex items-start gap-3">
              <Phone
                size={20}
                className="mt-0.5 shrink-0 text-[#FE540C]"
              />

              <div>
                <p className="mb-1 font-medium text-[#111111]">
                  Telefone
                </p>

                {contato.telefone ? (
                  <a
                    href={`tel:${contato.telefoneLink}`}
                    className="transition-colors hover:text-[#FE540C]"
                  >
                    {contato.telefone}
                  </a>
                ) : (
                  <span className="text-[#666666]">
                    A informar
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail
                size={20}
                className="mt-0.5 shrink-0 text-[#FE540C]"
              />

              <div>
                <p className="mb-1 font-medium text-[#111111]">
                  E-mail
                </p>

                {contato.email ? (
                  <a
                    href={`mailto:${contato.email}`}
                    className="break-all transition-colors hover:text-[#FE540C]"
                  >
                    {contato.email}
                  </a>
                ) : (
                  <span className="text-[#666666]">
                    A informar
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin
                size={20}
                className="mt-0.5 shrink-0 text-[#FE540C]"
              />

              <div>
                <p className="mb-1 font-medium text-[#111111]">
                  Endereço
                </p>

                <p className="max-w-xs leading-6 text-[#555555]">
                  {contato.endereco || "A informar"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center text-xs text-[#666666] md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} Oxus Imobiliária.
            Todos os direitos reservados.
          </p>

          <p>
            Conectando você ao seu próximo imóvel.
          </p>
        </div>
      </div>
    </footer>
  );
}
