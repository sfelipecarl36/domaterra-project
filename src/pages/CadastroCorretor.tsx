import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { supabase } from "../lib/supabase";

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF",
  "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
  "RO", "RR", "SC", "SP", "SE", "TO",
];

export default function CadastroCorretor() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [creci, setCreci] = useState("");
  const [ufCreci, setUfCreci] = useState("PA");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setEnviando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            full_name: nome.trim(),
            phone: telefone.trim(),
            creci: creci.trim(),
            creci_state: ufCreci,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        navigate("/corretor", { replace: true });
      } else {
        navigate("/login", {
          replace: true,
          state: {
            mensagem:
              "Cadastro recebido! Verifique sua caixa de entrada e clique no link enviado para confirmar seu e-mail. Confira também a pasta de spam.",
          },
        });
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-[#F7F7F7] px-5 py-16">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="Oxus Imobiliária"
            className="mx-auto mb-7 h-16 max-w-48 object-contain"
          />

          <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
            Seja um corretor Oxus
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#555555]">
            Cadastre-se para solicitar acesso à plataforma
            e futuramente anunciar seus imóveis.
          </p>
        </div>

        <form onSubmit={cadastrar} className="space-y-5">
          <Campo
            label="Nome completo"
            value={nome}
            onChange={setNome}
            placeholder="Seu nome completo"
          />

          <Campo
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="seu@email.com"
          />

          <Campo
            label="Telefone / WhatsApp"
            type="tel"
            value={telefone}
            onChange={setTelefone}
            placeholder="(91) 99999-9999"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Campo
                label="Número do CRECI"
                value={creci}
                onChange={setCreci}
                placeholder="Número de registro"
              />
            </div>

            <div>
              <label
                htmlFor="uf-creci"
                className="mb-2 block text-sm font-medium text-[#333333]"
              >
                UF do CRECI
              </label>

              <select
                id="uf-creci"
                value={ufCreci}
                onChange={(e) => setUfCreci(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#FE540C]"
              >
                {estados.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Campo
            label="Senha"
            type="password"
            value={senha}
            onChange={setSenha}
            placeholder="Mínimo de 8 caracteres"
          />

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
            <UserPlus size={19} />
            {enviando ? "Cadastrando..." : "Criar minha conta"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#555555]">
          Já possui uma conta?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#FE540C] hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}

type CampoProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
};

function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: CampoProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#333333]">
        {label}
      </label>

      <input
        type={type}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#888888] outline-none transition-colors focus:border-[#FE540C]"
      />
    </div>
  );
}
