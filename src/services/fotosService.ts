import { supabase } from "../lib/supabase";

const BUCKET = "imoveis";
const LIMITE_FOTOS = 15;
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export type FotoImovel = {
  id: string;
  property_id: string;
  storage_path: string;
  position: number;
  url: string;
};

export async function buscarFotos(
  imovelId: string
): Promise<FotoImovel[]> {
  const { data, error } = await supabase
    .from("property_images")
    .select("id, property_id, storage_path, position")
    .eq("property_id", imovelId)
    .order("position", { ascending: true });

  if (error) throw error;

  const fotos = await Promise.all(
    (data ?? []).map(async (foto) => {
      const { data: urlData, error: urlError } =
        await supabase.storage
          .from(BUCKET)
          .createSignedUrl(foto.storage_path, 3600);

      if (urlError) throw urlError;

      return {
        ...foto,
        url: urlData.signedUrl,
      };
    })
  );

  return fotos;
}

export async function enviarFotos(
  imovelId: string,
  arquivos: File[],
  quantidadeAtual: number
) {
  if (quantidadeAtual + arquivos.length > LIMITE_FOTOS) {
    throw new Error(
      `Cada imóvel pode ter no máximo ${LIMITE_FOTOS} fotografias.`
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Você precisa estar autenticado.");
  }

  const { data: existentes, error: consultaError } =
    await supabase
      .from("property_images")
      .select("position")
      .eq("property_id", imovelId)
      .order("position", { ascending: false })
      .limit(1);

  if (consultaError) throw consultaError;

  let proximaPosicao = (existentes?.[0]?.position ?? -1) + 1;

  for (const arquivo of arquivos) {
    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      throw new Error(
        `Formato não permitido: ${arquivo.name}`
      );
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      throw new Error(
        `A imagem ${arquivo.name} ultrapassa 5 MB.`
      );
    }

    const extensao =
      arquivo.type === "image/png"
        ? "png"
        : arquivo.type === "image/webp"
          ? "webp"
          : "jpg";

    const caminho =
      `${user.id}/${imovelId}/${crypto.randomUUID()}.${extensao}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(caminho, arquivo, {
        contentType: arquivo.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { error: registroError } = await supabase
      .from("property_images")
      .insert({
        property_id: imovelId,
        storage_path: caminho,
        position: proximaPosicao,
      });

    if (registroError) {
      await supabase.storage.from(BUCKET).remove([caminho]);
      throw registroError;
    }

    proximaPosicao++;
  }
}

export async function excluirFoto(foto: FotoImovel) {
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([foto.storage_path]);

  if (storageError) throw storageError;

  const { error } = await supabase
    .from("property_images")
    .delete()
    .eq("id", foto.id);

  if (error) throw error;
}

export async function definirFotoPrincipal(
  imovelId: string,
  fotoId: string
) {
  const { data, error } = await supabase
    .from("property_images")
    .select("id, position")
    .eq("property_id", imovelId)
    .order("position", { ascending: true });

  if (error) throw error;

  const selecionada = data?.find((foto) => foto.id === fotoId);

  if (!selecionada) {
    throw new Error("Fotografia não encontrada.");
  }

  const outras = (data ?? []).filter(
    (foto) => foto.id !== fotoId
  );

  const ordem = [selecionada, ...outras];

  for (let i = 0; i < ordem.length; i++) {
    const { error: updateError } = await supabase
      .from("property_images")
      .update({ position: i })
      .eq("id", ordem[i].id);

    if (updateError) throw updateError;
  }
}
