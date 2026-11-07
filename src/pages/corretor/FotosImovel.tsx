import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import GerenciadorFotos from "../../components/GerenciadorFotos";

export default function FotosImovel() {
  const { id } = useParams();
  const { user } = useAuth();

  const [titulo, setTitulo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!id || !user) {
        setCarregando(false);
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select("title")
        .eq("id", id)
        .eq("broker_id", user.id)
        .eq("status", "draft")
        .single();

      if (error) {
        setErro("Imóvel não encontrado ou sem permissão.");
      } else {
        setTitulo(data.title);
      }

      setCarregando(false);
    }

    carregar();
  }, [id, user]);

  if (carregando) {
    return <p className="text-slate-500">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/corretor/imoveis"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#071B2E]"
      >
        <ArrowLeft size={17} />
        Voltar aos imóveis
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-[#071B2E]">
          Fotografias do imóvel
        </h1>

        {titulo && (
          <p className="mt-2 text-sm text-slate-500">
            {titulo}
          </p>
        )}
      </div>

      {erro ? (
        <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">
          {erro}
        </div>
      ) : id ? (
        <GerenciadorFotos imovelId={id} />
      ) : (
        <p className="text-sm text-slate-500">
          Imóvel não identificado.
        </p>
      )}
    </div>
  );
}
