"use server";

export interface TranslateActionResponse {
  translatedText: string;
  detectedLang?: string;
  sourceLang: string;
  targetLang: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Server-side Google Translate Neural Proxy Action
 * Transports query to Google Translate API with zero client-side network exposure.
 */
export async function translateAction(
  text: string,
  from: string,
  to: string
): Promise<TranslateActionResponse> {
  if (!text || !text.trim()) {
    return {
      translatedText: "",
      sourceLang: from,
      targetLang: to,
      success: true,
    };
  }

  try {
    const sl = from === "auto" ? "auto" : from;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text.trim())}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Google Translate upstream error: HTTP ${res.status}`);
    }

    const data = await res.json();

    let fullTranslation = "";
    if (Array.isArray(data) && Array.isArray(data[0])) {
      for (const segment of data[0]) {
        if (Array.isArray(segment) && typeof segment[0] === "string") {
          fullTranslation += segment[0];
        }
      }
    }

    let detectedLang: string | undefined = undefined;
    if (typeof data[2] === "string") {
      detectedLang = data[2];
    } else if (Array.isArray(data[8]) && Array.isArray(data[8][0]) && typeof data[8][0][0] === "string") {
      detectedLang = data[8][0][0];
    }

    return {
      translatedText: fullTranslation || text,
      detectedLang,
      sourceLang: from,
      targetLang: to,
      success: true,
    };
  } catch (err: any) {
    console.error("[translateAction] Translation fetch failed:", err?.message || err);
    return {
      translatedText: "",
      sourceLang: from,
      targetLang: to,
      success: false,
      errorMessage: err?.message || "Translation service unavailable",
    };
  }
}
