import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, LoaderCircle, Monitor, Moon, Sun } from "lucide-react";
import { Suspense, useId, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { createWidget } from "../../api/client";
import type { ThemeOption } from "../../lib/display";
import { withConfig } from "../../widgets/configCodec";
import { rememberEditKey, savedWidgetUrl } from "../../widgets/editKeys";
import { defaultConfig, type RegisteredWidget } from "../../widgets/registry";
import { displaySearch } from "../displayParams";
import LoadingSpinner from "../LoadingSpinner";
import LinkField from "./LinkField";

const themeOptions: { value: ThemeOption; label: string; Icon: typeof Sun }[] = [
  { value: "auto", label: "Auto", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

function isThemeOption(value: string): value is ThemeOption {
  return themeOptions.some((option) => option.value === value);
}

function WidgetBuilderPage({ widget }: { widget: RegisteredWidget }) {
  const { Component, Icon } = widget;
  const [config, setConfig] = useState(() => defaultConfig(widget));
  const [theme, setTheme] = useState<ThemeOption>("auto");
  const [transparent, setTransparent] = useState(false);
  const themeLabelId = useId();
  const previewLabelId = useId();
  const transparentId = useId();

  const createEmbed = useMutation({
    mutationFn: () => createWidget(widget.type, config),
    onSuccess: ({ id, editKey }) => rememberEditKey(id, editKey),
    onError: () => toast.error("Couldn't create the embed link. Try again."),
  });

  const display = displaySearch({ theme, transparent });
  const created = createEmbed.data;

  const handleConfigChange = (next: unknown) => {
    setConfig(next);
    // The saved copy no longer matches the preview, so its links would be misleading.
    createEmbed.reset();
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 text-sm sm:px-8 sm:py-12">
      <header className="flex flex-col gap-4">
        <Link
          to="/"
          className="flex w-fit items-center gap-1 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          All widgets
        </Link>
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-5"
          >
            <Icon />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">{widget.title}</h1>
            <p className="text-muted-foreground">{widget.description}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby={previewLabelId} className="flex min-w-0 flex-col gap-2">
          <h2 id={previewLabelId} className="text-xs font-medium text-muted-foreground">
            Preview
          </h2>
          <div
            className={cn(
              "rounded-xl bg-muted p-3 text-foreground sm:p-6",
              theme !== "auto" && theme
            )}
          >
            <div
              className={cn(
                "rounded-lg border border-border",
                transparent ? "border-dashed bg-transparent" : "bg-background"
              )}
            >
              <div className="p-3">
                <Suspense fallback={<LoadingSpinner />}>
                  <Component config={config} onChange={handleConfigChange} readOnly={false} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
          <div className="flex flex-col gap-2">
            <Label id={themeLabelId}>Theme</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={0}
              value={theme}
              onValueChange={(value) => {
                if (isThemeOption(value)) setTheme(value);
              }}
              aria-labelledby={themeLabelId}
            >
              {themeOptions.map(({ value, label, Icon: OptionIcon }) => (
                <ToggleGroupItem key={value} value={value}>
                  <OptionIcon aria-hidden />
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor={transparentId}>Transparent background</Label>
            <Switch id={transparentId} checked={transparent} onCheckedChange={setTransparent} />
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="lg"
              disabled={createEmbed.isPending}
              onClick={() => createEmbed.mutate()}
            >
              {createEmbed.isPending && <LoaderCircle className="animate-spin" />}
              {createEmbed.isPending ? "Creating…" : "Create embed link"}
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to={`/${widget.type}?${withConfig(display, config)}`}>
                <ExternalLink aria-hidden />
                Open without saving
              </Link>
            </Button>
          </div>

          {created && (
            <section aria-label="Embed links" className="flex flex-col gap-4">
              <LinkField
                label="Embed link (can edit)"
                url={savedWidgetUrl(created.id, created.editKey, display)}
              />
              <LinkField label="Read-only link" url={savedWidgetUrl(created.id, undefined, display)} />
              <p className="rounded-lg bg-muted p-3 text-muted-foreground">
                In Notion, type /embed, paste the link, and resize the block.
              </p>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

export default WidgetBuilderPage;
