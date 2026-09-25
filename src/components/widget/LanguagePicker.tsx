import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { languageFlag, languageName, supportedLanguages } from "@/utils/lang";

interface LanguagePickerProps {
  value: string;
  onChange: (value: string) => void;
  languages?: string[];
  /** Show only the flag and code, for tight rows. */
  compact?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}

function LanguagePicker({
  value,
  onChange,
  languages = supportedLanguages,
  compact = false,
  disabled,
  className,
  "aria-label": ariaLabel,
}: LanguagePickerProps) {
  // Keep the current value selectable even when it's outside the offered list.
  const options = languages.includes(value) ? languages : [value, ...languages];

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className={cn(compact ? "w-[5.5rem]" : "w-40", "shrink-0", className)}
      >
        <SelectValue>
          <span aria-hidden>{languageFlag(value)}</span>
          <span className="truncate">{compact ? value : languageName(value)}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((code) => (
          <SelectItem key={code} value={code}>
            <span aria-hidden>{languageFlag(code)}</span>
            {languageName(code)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default LanguagePicker;
