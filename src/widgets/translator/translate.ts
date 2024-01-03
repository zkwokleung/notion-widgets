// Should be named as "languagesICareAbout"
export const supportedLanguages = [
  "zh-TW",
  "en",
  "ja",
  "ko",
  "es",
  "fr",
  "de",
  "id",
  "it",
];

export function langCodeToFlag(langCode: string) {
  /* * Special cases */
  // zh-CN -> CN, zh-TW -> TW
  langCode = langCode.split("-")[1] || langCode;

  // en -> uk
  if (langCode === "en") {
    langCode = "gb";
  }

  // ja -> jp
  if (langCode === "ja") {
    langCode = "jp";
  }

  // ko -> kr
  if (langCode === "ko") {
    langCode = "kr";
  }

  return langCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

export function langCodeToLanguageName(langCode: string) {
  // zh-CN -> Chinese, zh-TW -> Chinese (Traditional)
  langCode = langCode.split("-")[0] || langCode;

  switch (langCode) {
    case "zh":
      return "Chinese";
    case "en":
      return "English";
    case "ja":
      return "Japanese";
    case "ko":
      return "Korean";
    case "es":
      return "Spanish";
    case "fr":
      return "French";
    case "de":
      return "German";
    case "id":
      return "Indonesian";
    case "it":
      return "Italian";
    default:
      return langCode;
  }
}

export function translateTo(
  q: string,
  source: string,
  target: string
): Promise<any> {
  return fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${q}`
  )
    .then((res) => res.json())
    .then((res) => res[0][0][0]);
}
