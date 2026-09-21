export const SUPPORTED_LANGUAGES = ['de', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'de';

export function getSupportedLanguage(
  language: string | null | undefined,
): SupportedLanguage | undefined {
  return SUPPORTED_LANGUAGES.find((supportedLanguage) => supportedLanguage === language);
}
