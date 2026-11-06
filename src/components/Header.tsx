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
      <header className="sticky top-0 z-40 border-b border-[#C9A34A]/20 bg-[#071B2E]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Domaterra"
              className="h-14 w-auto max-w-44 object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.rota}
                to={link.rota}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-[#C9A34A] ${
                    isActive ? "text-[#C9A34A]" : "text-white"
                  }`
                }
              >
                {link.nome}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/login"
            className="hidden items-center gap-2 rounded-lg border border-[#C9A34A] px-5 py-3 text-sm font-medium text-[#C9A34A] transition-colors hover:bg-[#C9A34A] hover:text-[#071B2E] md:flex"
          >
            <UserRound size={18} />
            Área do corretor
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-[#C9A34A] md:hidden"
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