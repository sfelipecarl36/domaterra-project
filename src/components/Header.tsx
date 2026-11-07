import { Link, NavLink } from "react-router-dom";
import { Menu, UserRound } from "lucide-react";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  const links = [
    { nome: "Início", rota: "/" },
    { nome: "Imóveis", rota: "/imoveis" },
    { nome: "Seja um corretor", rota: "/cadastro-corretor" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Oxus Imobiliária"
              className="h-14 w-auto max-w-44 object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.rota}
                to={link.rota}
                end={link.rota === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-[#FE540C] ${
                    isActive
                      ? "text-[#FE540C]"
                      : "text-[#111111]"
                  }`
                }
              >
                {link.nome}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/login"
            className="hidden items-center gap-2 rounded-lg border border-[#FE540C] px-5 py-3 text-sm font-medium text-[#FE540C] transition-colors hover:bg-[#FE540C] hover:text-white md:flex"
          >
            <UserRound size={18} />
            Área do corretor
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-[#FE540C] md:hidden"
          >
            <Menu size={27} />
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
