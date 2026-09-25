import { Box, CircularProgress } from "@mui/material";
import { Suspense, type ReactNode } from "react";
import type { RegisteredWidget } from "../../widgets/registry";

interface WidgetFrameProps {
  widget: RegisteredWidget;
  config: unknown;
  onChange: (next: unknown) => void;
  readOnly: boolean;
  toolbar: ReactNode;
}

function WidgetFrame({ widget, config, onChange, readOnly, toolbar }: WidgetFrameProps) {
  const { Component } = widget;

  return (
    <Box>
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        }
      >
        <Component config={config} onChange={onChange} readOnly={readOnly} />
      </Suspense>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, px: 2, pb: 1 }}>
        {toolbar}
      </Box>
    </Box>
  );
}

export default WidgetFrame;
