import { useEffect } from "react";
import { Link } from "react-router-dom";
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
        className={`absolute right-0 top-0 flex h-full w-[82%] max-w-80 flex-col bg-[#071B2E] shadow-xl transition-transform duration-300 ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between bg-[#071B2E] px-6 py-6">
          <span className="text-lg font-semibold tracking-wide text-[#C9A34A]">
            MENU
          </span>

          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar menu"
            className="text-white"
          >
            <X size={25} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-5">
          {links.map((link) => {
            const Icone = link.icone;

            return (
              <Link
                key={link.rota}
                to={link.rota}
                onClick={fechar}
                className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Icone size={20} />
                {link.nome}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-6 text-center text-xs text-[#C9A34A]">
          Domaterra Negócios Imobiliários
        </div>
      </aside>
    </div>
  );
}