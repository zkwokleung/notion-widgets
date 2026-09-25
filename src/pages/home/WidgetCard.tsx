import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { RegisteredWidget } from "../../widgets/registry";

function WidgetCard({ widget }: { widget: RegisteredWidget }) {
  const { type, title, description, Icon } = widget;

  return (
    <Link
      to={`/new/${type}`}
      className="group flex h-full flex-col gap-3 rounded-lg border border-border p-4 outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4"
      >
        <Icon />
      </span>
      <span className="flex flex-col gap-1">
        <span className="flex items-center gap-1 font-medium">
          {title}
          <ArrowRight
            aria-hidden
            className="size-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          />
        </span>
        <span className="text-muted-foreground">{description}</span>
      </span>
    </Link>
  );
}

export default WidgetCard;
