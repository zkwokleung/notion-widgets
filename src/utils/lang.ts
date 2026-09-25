export const supportedLanguages = [
  "en",
  "zh-TW",
  "zh-CN",
  "ja",
  "ko",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "ru",
  "id",
  "vi",
  "th",
  "ar",
  "hi",
  "nl",
  "sv",
  "pl",
  "tr",
];

const displayNames = new Intl.DisplayNames(["en"], { type: "language" });

export function languageName(code: string): string {
  try {
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

// Languages aren't countries; these pick the flag most readers associate with each.
const flagRegion: Record<string, string> = {
  en: "GB",
  ja: "JP",
  ko: "KR",
  ar: "SA",
  hi: "IN",
  vi: "VN",
  sv: "SE",
  zh: "CN",
};

export function languageFlag(code: string): string {
  const [language, region] = code.split("-");
  const country = (region ?? flagRegion[language] ?? language).toUpperCase();
  return country.replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}
