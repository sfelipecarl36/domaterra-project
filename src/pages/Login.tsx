
import { useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Mail, LockKeyhole, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const mensagem = (
    location.state as { mensagem?: string } | null
  )?.mensagem;

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      navigate("/corretor", { replace: true });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-[#F7F7F7] p-16 text-center text-[#555555]">
        Carregando...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/corretor" replace />;
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#F7F7F7] px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="Oxus Imobiliária"
            className="mx-auto mb-7 h-16 max-w-48 object-contain"
          />

          <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
            Área do corretor
          </h1>

          <p className="mt-3 text-sm text-[#555555]">
            Acesse sua conta na Oxus.
          </p>
        </div>

        {mensagem && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-lg border border-[#FE540C]/30 bg-[#FFF1EB] p-4"
          >
            <Mail
              size={22}
              className="mt-0.5 shrink-0 text-[#FE540C]"
            />

            <div>
              <p className="text-sm font-semibold text-[#111111]">
                Confirme seu e-mail
              </p>

              <p className="mt-1 text-sm leading-6 text-[#555555]">
                {mensagem}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={entrar} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#333333]"
            >
              E-mail
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 transition-colors focus-within:border-[#FE540C]">
              <Mail
                size={19}
                className="shrink-0 text-[#FE540C]"
              />

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full bg-transparent py-4 text-sm text-[#111111] placeholder:text-[#888888] outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-2 block text-sm font-medium text-[#333333]"
            >
              Senha
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 transition-colors focus-within:border-[#FE540C]">
              <LockKeyhole
                size={19}
                className="shrink-0 text-[#FE540C]"
              />

              <input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                className="w-full bg-transparent py-4 text-sm text-[#111111] placeholder:text-[#888888] outline-none"
              />
            </div>
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FE540C] py-4 font-semibold text-white transition-colors hover:bg-[#E64B0A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={19} />
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/recuperar-senha"
            className="text-[#555555] transition-colors hover:text-[#FE540C]"
          >
            Esqueceu sua senha?
          </Link>

          <p className="mt-5 text-[#555555]">
            Ainda não tem uma conta?{" "}
            <Link
              to="/cadastro-corretor"
              className="font-semibold text-[#FE540C] hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
