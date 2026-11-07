
import { useEffect, useState } from "react";
import {
  Users,
  House,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type Indicadores = {
  corretores: number;
  pendentes: number;
  imoveis: number;
  publicados: number;
};

export default function DashboardAdmin() {
  const [dados, setDados] = useState<Indicadores>({
    corretores: 0,
    pendentes: 0,
    imoveis: 0,
    publicados: 0,
  });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const [
          corretores,
          pendentes,
          imoveis,
          publicados,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("approval_status", "pending"),

          supabase
            .from("properties")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("properties")
            .select("*", { count: "exact", head: true })
            .eq("status", "published"),
        ]);

        const falha = [
          corretores,
          pendentes,
          imoveis,
          publicados,
        ].find((resultado) => resultado.error);

        if (falha?.error) throw falha.error;

        setDados({
          corretores: corretores.count ?? 0,
          pendentes: pendentes.count ?? 0,
          imoveis: imoveis.count ?? 0,
          publicados: publicados.count ?? 0,
        });
      } catch {
        setErro("Não foi possível carregar os indicadores.");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const indicadores = [
    {
      titulo: "Corretores cadastrados",
      valor: dados.corretores,
      icon: Users,
    },
    {
      titulo: "Aguardando aprovação",
      valor: dados.pendentes,
      icon: Clock3,
    },
    {
      titulo: "Total de imóveis",
      valor: dados.imoveis,
      icon: House,
    },
    {
      titulo: "Imóveis publicados",
      valor: dados.publicados,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#071B2E]">
          Visão geral
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Acompanhe os principais números da Domaterra.
        </p>
      </div>

      {erro && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-slate-500">
          Carregando indicadores...
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {indicadores.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.titulo}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {item.titulo}
                  </p>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071B2E]/5 text-[#071B2E]">
                    <Icon size={22} />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-semibold text-[#071B2E]">
                  {item.valor}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
