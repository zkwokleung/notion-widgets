import { LoaderCircle } from "lucide-react";

function LoadingSpinner() {
  return (
    <div role="status" className="flex justify-center p-6 text-muted-foreground">
      <LoaderCircle aria-hidden className="size-4 animate-spin" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default LoadingSpinner;
