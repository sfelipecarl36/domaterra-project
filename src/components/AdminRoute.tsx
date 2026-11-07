import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function verificar() {
      if (!user) {
        setAutorizado(false);
        return;
      }

      setAutorizado(null);
      setErro("");

      const { data, error } = await supabase.rpc("is_admin");

      if (!ativo) return;

      if (error) {
        setErro("Não foi possível verificar sua permissão.");
        return;
      }

      setAutorizado(data === true);
    }

    if (!loading) verificar();

    return () => {
      ativo = false;
    };
  }, [user, loading]);

  if (loading || autorizado === null) {
    if (erro) {
      return (
        <div role="alert" className="p-10 text-center text-red-600">
          {erro}
        </div>
      );
    }

    return (
      <div className="p-10 text-center text-slate-500">
        Verificando acesso...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!autorizado) {
    return <Navigate to="/corretor" replace />;
  }

  return <Outlet />;
}
