export function getTextToSpeechURL(lang: string, text: string) {
  if (text === "") {
    return "";
  }

  return `https://translate.google.com.vn/translate_tts?ie=UTF-8&q=${text}&tl=${lang}&client=tw-ob`;
}
