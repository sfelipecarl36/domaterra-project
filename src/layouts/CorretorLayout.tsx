
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  House,
  UserRound,
  CreditCard,
  LogOut,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const links = [
  {
    label: "Visão geral",
    to: "/corretor",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Meus imóveis",
    to: "/corretor/imoveis",
    icon: House,
    end: false,
  },
  {
    label: "Meu perfil",
    to: "/corretor/perfil",
    icon: UserRound,
    end: false,
  },
  {
    label: "Minha assinatura",
    to: "/corretor/assinatura",
    icon: CreditCard,
    end: false,
  },
];

export default function CorretorLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [menuAberto, setMenuAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      alert("Não foi possível sair. Tente novamente.");
    } finally {
      setSaindo(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="flex min-h-screen">
        {menuAberto && (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white text-[#111111] shadow-sm transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            menuAberto ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-24 items-center justify-between border-b border-gray-200 px-6">
            <img
              src="/logo.png"
              alt="Oxus Imobiliária"
              className="max-h-14 max-w-44 object-contain"
            />

            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="text-[#111111] lg:hidden"
              aria-label="Fechar menu"
            >
              <X size={23} />
            </button>
          </div>

          <div className="px-6 pt-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FE540C]">
              Painel do corretor
            </p>
          </div>

          <nav className="mt-5 flex-1 space-y-1 px-4">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#FE540C] text-white shadow-sm"
                        : "text-[#333333] hover:bg-[#FFF1EB] hover:text-[#FE540C]"
                    }`
                  }
                >
                  <Icon size={19} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-gray-200 p-4">
            <NavLink
              to="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#333333] transition-colors hover:bg-[#FFF1EB] hover:text-[#FE540C]"
            >
              <ArrowLeft size={19} />
              Voltar ao site
            </NavLink>

            <button
              type="button"
              onClick={sair}
              disabled={saindo}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#333333] transition-colors hover:bg-[#FFF1EB] hover:text-[#FE540C] disabled:opacity-50"
            >
              <LogOut size={19} />
              {saindo ? "Saindo..." : "Sair da conta"}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-5 lg:px-10">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMenuAberto(true)}
                className="text-[#111111] lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={25} />
              </button>

              <div>
                <p className="text-sm font-semibold text-[#111111]">
                  Área do corretor
                </p>
                <p className="hidden text-xs text-gray-500 sm:block">
                  Gerencie sua conta Oxus
                </p>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1EB] text-sm font-semibold text-[#FE540C]">
              {user?.email?.charAt(0).toUpperCase() ?? "C"}
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl p-5 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
