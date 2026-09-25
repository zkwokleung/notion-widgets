import { X } from "lucide-react";
import LanguagePicker from "@/components/widget/LanguagePicker";
import SpeakButton from "@/components/widget/SpeakButton";
import { useTranslation } from "@/hooks/useTranslation";
import { languageName } from "@/utils/lang";
import ActionButton from "./ActionButton";
import CopyButton from "./CopyButton";

interface TranslationRowProps {
  text: string;
  from: string;
  lang: string;
  languages: string[];
  readOnly: boolean;
  onLangChange: (lang: string) => void;
  onRemove: () => void;
}

function TranslationRow({
  text,
  from,
  lang,
  languages,
  readOnly,
  onLangChange,
  onRemove,
}: TranslationRowProps) {
  const translation = useTranslation(text, from, lang);
  const name = languageName(lang);

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-1 py-2 @lg:grid-cols-[10rem_minmax(0,1fr)_auto]">
      <LanguagePicker
        value={lang}
        onChange={onLangChange}
        languages={languages}
        disabled={readOnly}
        aria-label={`Target language: ${name}`}
        className="justify-self-start @lg:w-full"
      />
      <output
        aria-label={`${name} translation`}
        className="col-span-2 min-w-0 px-2.5 py-1 leading-5 whitespace-pre-wrap break-words select-text @lg:col-span-1 @lg:col-start-2 @lg:row-start-1 @lg:px-0"
      >
        {translation || <span className="text-muted-foreground">Translation</span>}
      </output>
      <div className="col-start-2 row-start-1 flex items-center opacity-70 transition-opacity focus-within:opacity-100 hover:opacity-100 @lg:col-start-3">
        <CopyButton text={translation} label={`Copy ${name} translation`} />
        <SpeakButton text={translation} lang={lang} subject={`${name} translation`} />
        {!readOnly && (
          <ActionButton label={`Remove ${name}`} tooltip="Remove" onClick={onRemove}>
            <X />
          </ActionButton>
        )}
      </div>
    </li>
  );
}

export default TranslationRow;
