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
    <footer className="bg-[#071B2E] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-16">

        <div>
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="Domaterra Negócios Imobiliários"
              className="mb-6 h-28 w-auto max-w-full object-contain object-left"
            />
          </Link>

          <p className="max-w-sm text-sm leading-7 text-slate-400">
            Conectando pessoas, imóveis e oportunidades.
            Encontre seu próximo imóvel com praticidade
            e confiança.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="mb-6 text-lg font-semibold text-[#C9A34A]">
            Links rápidos
          </h3>

          <nav className="flex flex-col items-start gap-4 text-sm text-slate-300">
            <Link
              to="/"
              className="transition-colors hover:text-[#C9A34A]"
            >
              Início
            </Link>

            <Link
              to="/imoveis"
              className="transition-colors hover:text-[#C9A34A]"
            >
              Explorar imóveis
            </Link>

            <Link
              to="/cadastro-corretor"
              className="transition-colors hover:text-[#C9A34A]"
            >
              Seja um corretor
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 transition-colors hover:text-[#C9A34A]"
            >
              Área do corretor
              <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>

        {/* Contato */}
        <div>
          <h3 className="mb-6 text-lg font-semibold text-[#C9A34A]">
            Entre em contato
          </h3>

          <div className="flex flex-col gap-6 text-sm text-slate-300">

            {/* Telefone */}
            <div className="flex items-start gap-3">
              <Phone
                size={20}
                className="mt-0.5 shrink-0 text-[#C9A34A]"
              />

              <div>
                <p className="mb-1 font-medium text-white">
                  Telefone
                </p>

                {contato.telefone ? (
                  <a
                    href={`tel:${contato.telefoneLink}`}
                    className="hover:text-[#C9A34A]"
                  >
                    {contato.telefone}
                  </a>
                ) : (
                  <span className="text-slate-500">
                    A informar
                  </span>
                )}
              </div>
            </div>

            {/* E-mail */}
            <div className="flex items-start gap-3">
              <Mail
                size={20}
                className="mt-0.5 shrink-0 text-[#C9A34A]"
              />

              <div>
                <p className="mb-1 font-medium text-white">
                  E-mail
                </p>

                {contato.email ? (
                  <a
                    href={`mailto:${contato.email}`}
                    className="break-all hover:text-[#C9A34A]"
                  >
                    {contato.email}
                  </a>
                ) : (
                  <span className="text-slate-500">
                    A informar
                  </span>
                )}
              </div>
            </div>

            {/* endereço */}
            <div className="flex items-start gap-3">
              <MapPin
                size={20}
                className="mt-0.5 shrink-0 text-[#C9A34A]"
              />

              <div>
                <p className="mb-1 font-medium text-white">
                  Endereço
                </p>

                <p className="max-w-xs leading-6 text-slate-400">
                  {contato.endereco || "A informar"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé Inferior */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center text-xs text-slate-400 md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} Domaterra Negócios Imobiliários.
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
