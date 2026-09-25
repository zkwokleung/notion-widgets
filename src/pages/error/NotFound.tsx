import { Link } from "react-router";

function NotFound({ message = "This page doesn't exist." }: { message?: string }) {
  return (
    <main className="flex flex-col items-center gap-2 px-4 py-16 text-center text-sm">
      <p className="text-muted-foreground">{message}</p>
      <Link
        to="/"
        className="rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        See all widgets
      </Link>
    </main>
  );
}

export default NotFound;
