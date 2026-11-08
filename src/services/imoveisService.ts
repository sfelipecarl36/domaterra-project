
import { supabase } from "../lib/supabase";
import type { Imovel } from "../components/ImovelCard";
import { buscarContatoPublico } from "./contatoCorretorService";

type FotoBanco = {
  property_id: string;
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
};

type ImovelComFotos = ImovelBanco & {
  property_images: FotoBanco[];
};

async function carregarFotosEmLote(
  ids: string[]
): Promise<Map<string, FotoBanco[]>> {
  const fotosPorImovel = new Map<string, FotoBanco[]>();

  if (ids.length === 0) {
    return fotosPorImovel;
  }

  // Dividimos em lotes para evitar consultas muito grandes.
  const tamanhoLote = 100;

  for (let inicio = 0; inicio < ids.length; inicio += tamanhoLote) {
    const lote = ids.slice(inicio, inicio + tamanhoLote);

    const { data, error } = await supabase
      .from("property_images")
      .select("property_id, storage_path, position")
      .in("property_id", lote)
      .order("position", { ascending: true });

    if (error) throw error;

    for (const foto of data ?? []) {
      const lista = fotosPorImovel.get(foto.property_id) ?? [];

      lista.push(foto);
      fotosPorImovel.set(foto.property_id, lista);
    }
  }

  return fotosPorImovel;
}

async function obterUrlFoto(
  caminho: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("imoveis")
    .createSignedUrl(caminho, 3600);

  return error ? null : data.signedUrl;
}

async function converterImovel(
  imovel: ImovelComFotos,
  incluirContato = false
): Promise<Imovel> {
  const fotos = [...imovel.property_images].sort(
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

async function converterLista(
  imoveis: ImovelBanco[]
): Promise<Imovel[]> {
  if (imoveis.length === 0) return [];

  const ids = imoveis.map((item) => item.id);

  const fotosPorImovel = await carregarFotosEmLote(ids);

  return Promise.all(
    imoveis.map((item) =>
      converterImovel({
        ...item,
        property_images: fotosPorImovel.get(item.id) ?? [],
      })
    )
  );
}

export async function buscarImoveis(): Promise<Imovel[]> {
  const { data, error } = await supabase.rpc(
    "buscar_imoveis_publicos"
  );

  if (error) throw error;

  return converterLista((data ?? []) as ImovelBanco[]);
}

export async function buscarImovelPorId(
  id: string
): Promise<Imovel | null> {
  const { data, error } = await supabase
    .rpc("buscar_imoveis_publicos")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const imovel = data as ImovelBanco;

  const fotosPorImovel = await carregarFotosEmLote([id]);

  return converterImovel(
    {
      ...imovel,
      property_images: fotosPorImovel.get(id) ?? [],
    },
    true
  );
}

export async function buscarImoveisDestaque(): Promise<Imovel[]> {
  const { data, error } = await supabase
    .rpc("buscar_imoveis_publicos")
    .eq("featured", true)
    .limit(6);

  if (error) throw error;

  return converterLista((data ?? []) as ImovelBanco[]);
}
