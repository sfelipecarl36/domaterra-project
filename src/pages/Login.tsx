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
      <div className="p-16 text-center text-slate-500">
        Carregando...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/corretor" replace />;
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#F5F6F8] px-5 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#071B2E]">
            Área do corretor
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Acesse sua conta na Domaterra.
          </p>
        </div>

        {mensagem && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-lg border border-[#C9A34A]/30 bg-[#C9A34A]/10 p-4"
          >
            <Mail
              size={22}
              className="mt-0.5 shrink-0 text-[#C9A34A]"
            />

            <div>
              <p className="text-sm font-semibold text-[#071B2E]">
                Confirme seu e-mail
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {mensagem}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={entrar} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              E-mail
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4">
              <Mail size={19} className="text-slate-400" />

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full py-4 text-sm text-slate-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Senha
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4">
              <LockKeyhole size={19} className="text-slate-400" />

              <input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                className="w-full py-4 text-sm text-slate-800 outline-none"
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#071B2E] py-4 font-semibold text-white transition-colors hover:bg-[#123754] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={19} />
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/recuperar-senha"
            className="text-slate-500 transition-colors hover:text-[#C9A34A]"
          >
            Esqueceu sua senha?
          </Link>

          <p className="mt-5 text-slate-500">
            Ainda não tem uma conta?{" "}
            <Link
              to="/cadastro-corretor"
              className="font-semibold text-[#C9A34A]"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
