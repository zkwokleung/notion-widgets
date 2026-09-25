import { widgetDefinitions } from "../../widgets/registry";
import WidgetCard from "./WidgetCard";

function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 text-sm sm:px-8 sm:py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notion Widgets</h1>
        <p className="text-base text-muted-foreground">
          Small language-learning tools you can embed in any Notion page.
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {widgetDefinitions.map((widget) => (
          <li key={widget.type}>
            <WidgetCard widget={widget} />
          </li>
        ))}
      </ul>
    </main>
  );
}

export default Home;
