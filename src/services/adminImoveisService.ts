import { supabase } from "../lib/supabase";

export type StatusImovel =
  | "draft"
  | "pending_review"
  | "published"
  | "paused"
  | "sold";

export type FotoAdmin = {
  id: string;
  storage_path: string;
  position: number;
  url: string | null;
};

export type ImovelAdmin = {
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
  status: StatusImovel;
  featured: boolean;
  created_at: string;
  fotos: FotoAdmin[];
};

type FotoBanco = {
  id: string;
  storage_path: string;
  position: number;
};

type ImovelBanco = Omit<ImovelAdmin, "fotos"> & {
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
  status,
  featured,
  created_at,
  property_images (
    id,
    storage_path,
    position
  )
`;

async function prepararImovel(
  imovel: ImovelBanco
): Promise<ImovelAdmin> {
  const fotosOrdenadas = [...(imovel.property_images ?? [])]
    .sort((a, b) => a.position - b.position);

  const fotos = await Promise.all(
    fotosOrdenadas.map(async (foto) => {
      const { data, error } = await supabase.storage
        .from("imoveis")
        .createSignedUrl(foto.storage_path, 3600);

      return {
        ...foto,
        url: error ? null : data.signedUrl,
      };
    })
  );

  const { property_images, ...dados } = imovel;
  void property_images;

  return {
    ...dados,
    fotos,
  };
}

export async function listarImoveisAdmin() {
  const { data, error } = await supabase
    .from("properties")
    .select(campos)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return Promise.all(
    ((data ?? []) as ImovelBanco[]).map(prepararImovel)
  );
}

export async function buscarImovelAdmin(id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select(campos)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return prepararImovel(data as ImovelBanco);
}

export async function alterarStatusImovel(
  id: string,
  status: "draft" | "pending_review" | "published" | "paused"
) {
  const { error } = await supabase.rpc(
    "admin_alterar_status_imovel",
    {
      p_imovel_id: id,
      p_status: status,
    }
  );

  if (error) throw error;
}
