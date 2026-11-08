import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Save,
  House,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

type Formulario = {
  title: string;
  description: string;
  property_type: string;
  price: string;
  city: string;
  neighborhood: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  parking_spaces: string;
  area: string;
};

const inicial: Formulario = {
  title: "",
  description: "",
  property_type: "apartamento",
  price: "",
  city: "",
  neighborhood: "",
  address: "",
  bedrooms: "0",
  bathrooms: "0",
  parking_spaces: "0",
  area: "",
};

export default function FormularioImovel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const editando = Boolean(id);

  const [form, setForm] = useState<Formulario>(inicial);
  const [carregando, setCarregando] = useState(Boolean(id));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!id || !user) return;

      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .eq("broker_id", user.id)
          .eq("status", "draft")
          .single();

        if (error) throw error;

        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          property_type: data.property_type ?? "apartamento",
          price: String(data.price ?? ""),
          city: data.city ?? "",
          neighborhood: data.neighborhood ?? "",
          address: data.address ?? "",
          bedrooms: String(data.bedrooms ?? 0),
          bathrooms: String(data.bathrooms ?? 0),
          parking_spaces: String(data.parking_spaces ?? 0),
          area: String(data.area ?? ""),
        });
      } catch {
        setErro("Não foi possível carregar este rascunho.");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id, user]);

  function alterar(campo: keyof Formulario, valor: string) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    setErro("");
    setSalvando(true);

    const preco = Number(form.price);
    const area = Number(form.area);

    if (
      !Number.isFinite(preco) ||
      preco <= 0 ||
      !Number.isFinite(area) ||
      area <= 0
    ) {
      setErro("Informe um preço e uma área válidos.");
      setSalvando(false);
      return;
    }

    const numeros = [
      form.bedrooms,
      form.bathrooms,
      form.parking_spaces,
    ].map(Number);

    if (
      numeros.some(
        (numero) =>
          !Number.isInteger(numero) || numero < 0
      )
    ) {
      setErro("As quantidades devem ser números inteiros positivos ou zero.");
      setSalvando(false);
      return;
    }

    const dados = {
      title: form.title.trim(),
      description: form.description.trim(),
      property_type: form.property_type,
      price: preco,
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim(),
      address: form.address.trim(),
      bedrooms: numeros[0],
      bathrooms: numeros[1],
      parking_spaces: numeros[2],
      area,
    };

    try {
      if (editando) {
        const { data, error } = await supabase
          .from("properties")
          .update(dados)
          .eq("id", id!)
          .eq("broker_id", user.id)
          .eq("status", "draft")
          .select("id");

        if (error) throw error;

        if (!data?.length) {
          throw new Error("Rascunho não encontrado ou sem permissão.");
        }
      } else {
        const { error } = await supabase
          .from("properties")
          .insert({
            ...dados,
            broker_id: user.id,
            status: "draft",
          });

        if (error) throw error;
      }

      navigate("/corretor/imoveis", {
        replace: true,
        state: {
          mensagem: editando
            ? "Imóvel atualizado com sucesso!"
            : "Imóvel cadastrado como rascunho!",
        },
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o imóvel."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="text-slate-500">Carregando imóvel...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/corretor/imoveis"
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#111111]"
        >
          <ArrowLeft size={17} />
          Voltar aos imóveis
        </Link>

        <h1 className="text-3xl font-semibold text-[#111111]">
          {editando ? "Editar imóvel" : "Cadastrar imóvel"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Preencha as informações do imóvel. Ele será salvo
          como rascunho.
        </p>
      </div>

      <form
        onSubmit={salvar}
        className="space-y-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <House className="text-[#FE540C]" size={24} />

          <h2 className="text-lg font-semibold text-[#111111]">
            Informações do imóvel
          </h2>
        </div>

        <Campo
          label="Título do anúncio"
          value={form.title}
          onChange={(v) => alterar("title", v)}
          placeholder="Ex.: Apartamento moderno no Umarizal"
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tipo de imóvel
            </label>

            <select
              value={form.property_type}
              onChange={(e) =>
                alterar("property_type", e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FE540C]"
            >
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <Campo
            label="Preço de venda (R$)"
            type="number"
            value={form.price}
            onChange={(v) => alterar("price", v)}
            placeholder="Ex.: 450000"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            label="Cidade"
            value={form.city}
            onChange={(v) => alterar("city", v)}
            placeholder="Ex.: Belém"
            required
          />

          <Campo
            label="Bairro"
            value={form.neighborhood}
            onChange={(v) => alterar("neighborhood", v)}
            placeholder="Ex.: Umarizal"
            required
          />
        </div>

        <Campo
          label="Endereço"
          value={form.address}
          onChange={(v) => alterar("address", v)}
          placeholder="Rua, número e complemento"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Campo
            label="Quartos"
            type="number"
            value={form.bedrooms}
            onChange={(v) => alterar("bedrooms", v)}
            min="0"
            step="1"
          />

          <Campo
            label="Banheiros"
            type="number"
            value={form.bathrooms}
            onChange={(v) => alterar("bathrooms", v)}
            min="0"
            step="1"
          />

          <Campo
            label="Vagas"
            type="number"
            value={form.parking_spaces}
            onChange={(v) => alterar("parking_spaces", v)}
            min="0"
            step="1"
          />

          <Campo
            label="Área (m²)"
            type="number"
            value={form.area}
            onChange={(v) => alterar("area", v)}
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Descrição
          </label>

          <textarea
            rows={6}
            value={form.description}
            onChange={(e) =>
              alterar("description", e.target.value)
            }
            placeholder="Descreva os diferenciais do imóvel..."
            className="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FE540C]"
          />
        </div>

        <div className="rounded-xl border border-[#FE540C]/30 bg-[#FE540C]/10 p-4 text-sm leading-6 text-[#111111]">
          O imóvel será salvo como rascunho e não ficará
          visível no catálogo público.
        </div>

        {erro && (
          <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/corretor/imoveis"
            className="rounded-lg border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={salvando}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#fe540c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#E64B0A] disabled:opacity-60"
          >
            <Save size={18} />
            {salvando ? "Salvando..." : "Salvar imóvel"}
          </button>
        </div>
      </form>
    </div>
  );
}

type CampoProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  step?: string;
  required?: boolean;
};

function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  step,
  required = false,
}: CampoProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        required={required}
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FE540C]"
      />
    </div>
  );
}
