import { Link, isRouteErrorResponse, useRouteError } from "react-router";

function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : String(error);

  return (
    <main className="flex flex-col items-center gap-2 px-4 py-16 text-center text-sm">
      <h1 className="font-medium">Something went wrong</h1>
      {message && <p className="max-w-md break-words text-muted-foreground">{message}</p>}
      <Link
        to="/"
        className="rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Back to all widgets
      </Link>
    </main>
  );
}

export default ErrorPage;
