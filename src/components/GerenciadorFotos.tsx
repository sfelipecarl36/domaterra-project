import { useEffect, useState } from "react";
import {
  ImagePlus,
  Trash2,
  Star,
  LoaderCircle,
  ImageOff,
} from "lucide-react";
import {
  buscarFotos,
  enviarFotos,
  excluirFoto,
  definirFotoPrincipal,
  type FotoImovel,
} from "../services/fotosService";

type Props = {
  imovelId: string;
};

export default function GerenciadorFotos({ imovelId }: Props) {
  const [fotos, setFotos] = useState<FotoImovel[]>([]);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregar() {
    const dados = await buscarFotos(imovelId);
    setFotos(dados);
  }

  useEffect(() => {
    let ativo = true;

    async function iniciar() {
      setCarregando(true);

      try {
        const dados = await buscarFotos(imovelId);
        if (ativo) setFotos(dados);
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar as fotografias.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    iniciar();

    return () => {
      ativo = false;
    };
  }, [imovelId]);

  async function enviar() {
    if (arquivos.length === 0) return;

    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      await enviarFotos(imovelId, arquivos, fotos.length);
      setArquivos([]);
      await carregar();
      setMensagem("Fotografias enviadas com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar as fotografias."
      );

      try {
        await carregar();
      } catch {
        setErro("Não foi possível atualizar a lista de fotografias.");
      }
    } finally {
      setProcessando(false);
    }
  }

  async function remover(foto: FotoImovel) {
    if (!window.confirm("Deseja excluir esta fotografia?")) {
      return;
    }

    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      await excluirFoto(foto);
      await carregar();
      setMensagem("Fotografia excluída.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a fotografia."
      );
    } finally {
      setProcessando(false);
    }
  }

  async function tornarPrincipal(foto: FotoImovel) {
    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      await definirFotoPrincipal(imovelId, foto.id);
      await carregar();
      setMensagem("Imagem principal atualizada.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a imagem principal."
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-[#071B2E]">
          Fotografias do imóvel
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Adicione até 15 fotografias nos formatos JPG,
          PNG ou WEBP, com até 5 MB cada.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center transition-colors hover:border-[#C9A34A]">
        <ImagePlus size={36} className="text-[#C9A34A]" />

        <span className="mt-4 text-sm font-semibold text-[#071B2E]">
          Selecionar fotografias
        </span>

        <span className="mt-2 text-xs text-slate-500">
          Você pode selecionar várias imagens
        </span>

        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={processando}
          onChange={(event) => {
            setArquivos(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
          className="hidden"
        />
      </label>

      {arquivos.length > 0 && (
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-[#071B2E]">
            {arquivos.length} arquivo(s) selecionado(s)
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {arquivos.map((arquivo) => arquivo.name).join(", ")}
          </p>

          <button
            type="button"
            disabled={processando}
            onClick={enviar}
            className="mt-4 flex items-center gap-2 rounded-lg bg-[#071B2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {processando ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <ImagePlus size={18} />
            )}
            Enviar fotografias
          </button>
        </div>
      )}

      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </p>
      )}

      {mensagem && (
        <p role="status" className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {mensagem}
        </p>
      )}

      {carregando ? (
        <p className="text-sm text-slate-500">
          Carregando fotografias...
        </p>
      ) : fotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ImageOff size={34} className="text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            Nenhuma fotografia cadastrada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {fotos.map((foto, index) => (
            <div
              key={foto.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <img
                  src={foto.url}
                  alt={`Fotografia ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-md bg-[#C9A34A] px-2 py-1 text-xs font-semibold text-[#071B2E]">
                    Principal
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 p-3">
                <button
                  type="button"
                  disabled={processando || index === 0}
                  onClick={() => tornarPrincipal(foto)}
                  className="flex items-center gap-1 text-xs font-medium text-[#071B2E] disabled:opacity-40"
                >
                  <Star size={15} />
                  Principal
                </button>

                <button
                  type="button"
                  disabled={processando}
                  onClick={() => remover(foto)}
                  className="text-red-600 disabled:opacity-40"
                  aria-label="Excluir fotografia"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
