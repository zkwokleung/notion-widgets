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
