import { Suspense, type ReactNode } from "react";
import type { RegisteredWidget } from "../../widgets/registry";
import LoadingSpinner from "../LoadingSpinner";

interface WidgetFrameProps {
  widget: RegisteredWidget;
  config: unknown;
  onChange: (next: unknown) => void;
  readOnly: boolean;
  toolbar?: ReactNode;
}

function WidgetFrame({ widget, config, onChange, readOnly, toolbar }: WidgetFrameProps) {
  const { Component } = widget;

  return (
    <div className="flex w-full flex-col text-sm">
      <div className="w-full p-3">
        <Suspense fallback={<LoadingSpinner />}>
          <Component config={config} onChange={onChange} readOnly={readOnly} />
        </Suspense>
      </div>
      {toolbar && (
        <footer className="flex min-h-9 flex-wrap items-center justify-end gap-1 px-2 pb-1.5 text-xs text-muted-foreground">
          {toolbar}
        </footer>
      )}
    </div>
  );
}

export default WidgetFrame;
