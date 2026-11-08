import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, UserRound } from "lucide-react";
import MobileSidebar from "./MobileSidebar";

const links = [
  { nome: "Início", rota: "/" },
  { nome: "Imóveis", rota: "/imoveis" },
  { nome: "Seja um corretor", rota: "/cadastro-corretor" },
];

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#EDEDED] bg-white/95 shadow-[0_4px_24px_rgba(0,0,0,0.035)] backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 lg:h-[88px] lg:px-8">
          <Link
            to="/"
            aria-label="Oxus Imobiliária — página inicial"
            className="flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FE540C]"
          >
            <img
              src="/logo.png"
              alt="Oxus Imobiliária"
              className="h-12 w-auto max-w-[155px] object-contain sm:h-14 sm:max-w-[175px] lg:h-16 lg:max-w-[195px]"
            />
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.rota}
                to={link.rota}
                end={link.rota === "/"}
                className={({ isActive }) =>
                  `relative rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#FE540C] ${
                    isActive
                      ? "bg-orange-50 text-[#FE540C]"
                      : "text-[#333333] hover:bg-[#F7F7F7] hover:text-[#FE540C]"
                  }`
                }
              >
                {link.nome}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/login"
            className="hidden shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FE540C] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(254,84,12,0.16)] transition-all hover:bg-[#E64B0A] hover:shadow-[0_7px_18px_rgba(254,84,12,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FE540C] lg:inline-flex"
          >
            <UserRound size={17} aria-hidden="true" />
            Área do corretor
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu de navegação"
            aria-expanded={menuAberto}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#F1E6E1] bg-[#FFF7F3] text-[#FE540C] transition-colors hover:border-[#FE540C] hover:bg-[#FFF0E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FE540C] lg:hidden"
          >
            <Menu size={23} aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileSidebar
        aberto={menuAberto}
        fechar={() => setMenuAberto(false)}
      />
    </>
  );
}
