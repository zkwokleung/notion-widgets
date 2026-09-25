export function getTextToSpeechURL(lang: string, text: string) {
  if (text === "") {
    return "";
  }

  const params = new URLSearchParams({
    ie: "UTF-8",
    q: text,
    tl: lang,
    client: "tw-ob",
  });

  return `https://translate.google.com.vn/translate_tts?${params}`;
}
