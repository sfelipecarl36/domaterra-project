import { supabase } from "../lib/supabase";
import type { Imovel } from "../components/ImovelCard";
import { buscarContatoPublico } from "./contatoCorretorService";

type FotoBanco = {
  storage_path: string;
  position: number;
};

type ImovelBanco = {
  id: string;
  broker_id: string;
  title: string;
  description: string | null;
  property_type: string;
  price: number;
  city: string;
  neighborhood: string;
  address: string | null;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  area: number;
  featured: boolean;
  property_images: FotoBanco[];
};

const campos = `
  id,
  broker_id,
  title,
  description,
  property_type,
  price,
  city,
  neighborhood,
  address,
  bedrooms,
  bathrooms,
  parking_spaces,
  area,
  featured,
  property_images (
    storage_path,
    position
  )
`;

async function obterUrlFoto(caminho: string) {
  const { data, error } = await supabase.storage
    .from("imoveis")
    .createSignedUrl(caminho, 3600);

  return error ? null : data.signedUrl;
}

async function converterImovel(
  imovel: ImovelBanco,
  incluirContato = false
): Promise<Imovel> {
  const fotos = [...(imovel.property_images ?? [])].sort(
    (a, b) => a.position - b.position
  );

  const urls = await Promise.all(
    fotos.map((foto) => obterUrlFoto(foto.storage_path))
  );

  const imagens = urls.filter(
    (url): url is string => Boolean(url)
  );

  let corretor: Imovel["corretor"] | undefined;

  if (incluirContato) {
    const contato = await buscarContatoPublico(
      imovel.broker_id
    );

    if (contato) {
      corretor = {
        nome: contato.display_name,
        telefone: contato.whatsapp,
        creci: `${contato.creci}/${contato.creci_state}`,
      };
    }
  }

  return {
    id: imovel.id,
    titulo: imovel.title,
    cidade: imovel.city,
    bairro: imovel.neighborhood,
    preco: imovel.price,
    quartos: imovel.bedrooms,
    banheiros: imovel.bathrooms,
    area: imovel.area,
    imagem: imagens[0] ?? null,
    imagens,
    destaque: imovel.featured,
    descricao: imovel.description ?? "",
    endereco: imovel.address ?? "",
    vagas: imovel.parking_spaces,
    tipo: imovel.property_type,
    corretor,
  };
}

export async function buscarImoveis(): Promise<Imovel[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(campos)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return Promise.all(
    ((data ?? []) as ImovelBanco[]).map((imovel) =>
      converterImovel(imovel)
    )
  );
}

export async function buscarImovelPorId(
  id: string
): Promise<Imovel | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(campos)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return converterImovel(data as ImovelBanco, true);
}

export async function buscarImoveisDestaque(): Promise<Imovel[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(campos)
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) throw error;

  return Promise.all(
    ((data ?? []) as ImovelBanco[]).map((imovel) =>
      converterImovel(imovel)
    )
  );
}
