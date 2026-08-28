import { createServerFn } from "@tanstack/react-start";

export interface RespuestaOcr {
  success: boolean;
  data?: Record<string, string | null> | null;
  confidence?: number | null;
  warnings?: string[];
  error?: string;
}

export const procesarDocumento = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Se esperaba un archivo");
    const archivo = data.get("archivo");
    const tipoOrigen = String(data.get("tipo_origen") ?? "");
    const webhookOverride = String(data.get("webhook_url") ?? "");
    if (!(archivo instanceof File)) throw new Error("Archivo no válido");
    if (tipoOrigen !== "pdf" && tipoOrigen !== "imagen") throw new Error("Tipo de origen no válido");
    return { archivo, tipoOrigen, webhookOverride };
  })
  .handler(async ({ data }): Promise<RespuestaOcr> => {
    const webhookUrl = data.webhookOverride.trim() || process.env["N8N_WEBHOOK_URL"] || "";
    if (!webhookUrl) {
      return {
        success: false,
        error:
          "No hay una URL de webhook de n8n configurada. Indíquela en el campo de configuración antes de procesar el documento.",
      };
    }

    const cuerpo = new FormData();
    cuerpo.append("archivo", data.archivo, data.archivo.name);
    cuerpo.append("tipo_origen", data.tipoOrigen);

    let respuesta: Response;
    try {
      respuesta = await fetch(webhookUrl, { method: "POST", body: cuerpo });
    } catch {
      return { success: false, error: "No se pudo contactar el webhook de n8n." };
    }

    if (!respuesta.ok) {
      return { success: false, error: `n8n respondió con el código ${respuesta.status}.` };
    }

    let json: unknown;
    try {
      json = await respuesta.json();
    } catch {
      return { success: false, error: "n8n no devolvió una respuesta JSON válida." };
    }

    const resultado = (Array.isArray(json) ? json[0] : json) as RespuestaOcr | null;
    if (!resultado || typeof resultado !== "object") {
      return { success: false, error: "Respuesta de n8n con formato inesperado." };
    }

    return {
      success: resultado.success !== false,
      data: resultado.data ?? null,
      confidence: typeof resultado.confidence === "number" ? resultado.confidence : null,
      warnings: Array.isArray(resultado.warnings) ? resultado.warnings.map(String) : [],
      ...(resultado.error ? { error: String(resultado.error) } : {}),
    };
  });
