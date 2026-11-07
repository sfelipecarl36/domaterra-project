import { CreditCard } from "lucide-react";

export default function AssinaturasAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#071B2E]">
          Assinaturas
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Gerencie os planos dos corretores.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <CreditCard
          size={42}
          className="mx-auto text-[#C9A34A]"
        />

        <h2 className="mt-5 text-lg font-semibold text-[#071B2E]">
          Integração de pagamentos
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          O módulo de assinaturas será integrado
          posteriormente ao Asaas.
        </p>
      </div>
    </div>
  );
}
