import { supabase } from "@/integrations/supabase/client";

const PRINT_FILES_BUCKET = "print-files";

export const uploadPrintDesignFile = async (file: File, userId: string | null) => {
  const folder = userId ?? "anon";
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from(PRINT_FILES_BUCKET).upload(path, file);
  if (error) throw error;

  return path;
};

export const getPrintDesignFileUrl = async (path: string) => {
  const { data, error } = await supabase.storage.from(PRINT_FILES_BUCKET).createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
};
