import type { Enums, Tables } from "@/types/database.types";

export type CategoriaDoc = Enums<"categoria_doc">;

export type DocumentoConUrl = Omit<Tables<"documentos">, "storage_path"> & {
  signedUrl: string;
};

export type UploadFormData = {
  clienteId: string;
  orgId: string;
  polizaId?: string;
  categoria: CategoriaDoc;
  nota?: string;
};
