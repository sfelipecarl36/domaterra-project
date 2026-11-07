import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  X,
  House,
  Building2,
  BriefcaseBusiness,
  LogIn,
} from "lucide-react";

type Props = {
  aberto: boolean;
  fechar: () => void;
};

export default function MobileSidebar({
  aberto,
  fechar,
}: Props) {
  useEffect(() => {
    if (!aberto) return;

    function aoPressionarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") fechar();
    }

    document.addEventListener("keydown", aoPressionarTecla);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoPressionarTecla);
      document.body.style.overflow = "";
    };
  }, [aberto, fechar]);

  const links = [
    { nome: "Início", rota: "/", icone: House },
    { nome: "Explorar imóveis", rota: "/imoveis", icone: Building2 },
    {
      nome: "Seja um corretor",
      rota: "/cadastro-corretor",
      icone: BriefcaseBusiness,
    },
    { nome: "Entrar", rota: "/login", icone: LogIn },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${
        aberto ? "visible" : "invisible pointer-events-none"
      }`}
    >
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={fechar}
        className={`absolute inset-0 w-full bg-black/50 transition-opacity duration-300 ${
          aberto ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`absolute right-0 top-0 flex h-full w-[82%] max-w-80 flex-col bg-white shadow-xl transition-transform duration-300 ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-6">
          <span className="text-lg font-semibold tracking-wide text-[#FE540C]">
            MENU
          </span>

          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar menu"
            className="rounded-lg p-2 text-[#111111] transition-colors hover:bg-[#FFF1EB] hover:text-[#FE540C]"
          >
            <X size={25} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-5">
          {links.map((link) => {
            const Icone = link.icone;

            return (
              <NavLink
                key={link.rota}
                to={link.rota}
                end={link.rota === "/"}
                onClick={fechar}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#FE540C] text-white"
                      : "text-[#333333] hover:bg-[#FFF1EB] hover:text-[#FE540C]"
                  }`
                }
              >
                <Icone size={20} />
                {link.nome}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-gray-200 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#FE540C]">
            OXUS
          </p>
          <p className="mt-1 text-xs text-[#666666]">
            Negócios Imobiliários
          </p>
        </div>
      </aside>
    </div>
  );
}
