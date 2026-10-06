/**
 * Unit Tests for In-Browser Language Translator
 */

import {
  detectLanguage,
  translateText,
  SUPPORTED_LANGUAGES,
  getLanguageMetadata,
} from "./logic";

export function runLanguageTranslatorTests(): boolean {
  console.log("Testing [language-translator] logic...");

  // 1. Language metadata validation
  if (SUPPORTED_LANGUAGES.length < 10) {
    throw new Error(`Expected at least 10 supported languages, found ${SUPPORTED_LANGUAGES.length}`);
  }
  const esMeta = getLanguageMetadata("es");
  if (!esMeta || esMeta.name !== "Spanish") {
    throw new Error("Failed to retrieve Spanish language metadata");
  }

  // 2. Heuristic language detection
  const detectedEs = detectLanguage("¿Cómo estás mi amigo?");
  if (detectedEs.code !== "es") {
    throw new Error(`Expected 'es' detection, got '${detectedEs.code}'`);
  }

  const detectedDe = detectLanguage("Guten Morgen und auf Wiedersehen");
  if (detectedDe.code !== "de") {
    throw new Error(`Expected 'de' detection, got '${detectedDe.code}'`);
  }

  const detectedJa = detectLanguage("こんにちは世界");
  if (detectedJa.code !== "ja") {
    throw new Error(`Expected 'ja' detection, got '${detectedJa.code}'`);
  }

  const detectedRu = detectLanguage("Здравствуйте и спасибо");
  if (detectedRu.code !== "ru") {
    throw new Error(`Expected 'ru' detection, got '${detectedRu.code}'`);
  }

  // 3. Exact full phrase translations
  const helloEs = translateText("hello", "en", "es");
  if (helloEs.translatedText.toLowerCase() !== "hola") {
    throw new Error(`Expected 'hola', got '${helloEs.translatedText}'`);
  }

  const thankYouFr = translateText("thank you", "en", "fr");
  if (thankYouFr.translatedText.toLowerCase() !== "merci") {
    throw new Error(`Expected 'merci', got '${thankYouFr.translatedText}'`);
  }

  // 4. Case preservation
  const capitalized = translateText("Hello", "en", "es");
  if (capitalized.translatedText !== "Hola") {
    throw new Error(`Expected capitalized 'Hola', got '${capitalized.translatedText}'`);
  }

  // 5. Punctuation attachment preservation
  const withPunct = translateText("Hello, friend!", "en", "es");
  if (!withPunct.translatedText.includes("Hola,") || !withPunct.translatedText.includes("amigo!")) {
    throw new Error(`Expected punctuation preserved in 'Hola, amigo!', got '${withPunct.translatedText}'`);
  }

  // 6. Multi-word phrase translation
  const aiTrans = translateText("artificial intelligence", "en", "es");
  if (aiTrans.translatedText.toLowerCase() !== "inteligencia artificial") {
    throw new Error(`Expected 'inteligencia artificial', got '${aiTrans.translatedText}'`);
  }

  // 7. Auto-detection translation
  const autoDetect = translateText("bonjour", "auto", "en");
  if (autoDetect.translatedText.toLowerCase() !== "hello") {
    throw new Error(`Expected auto-detect translation of 'bonjour' to 'hello', got '${autoDetect.translatedText}'`);
  }

  // 8. Statistics and accuracy score
  if (autoDetect.wordCount < 1 || autoDetect.accuracyScore === 0) {
    throw new Error("Invalid translation statistics computed");
  }

  return true;
}

export const runTests = runLanguageTranslatorTests;
