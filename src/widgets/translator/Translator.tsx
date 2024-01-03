import { Card, TextField } from "@mui/material";
import React from "react";

export default function Translator() {
  return (
    <Card variant="outlined">
      <TextField
        id="outlined-multiline-static"
        label="Multiline"
        multiline
        rows={4}
        defaultValue="Default Value"
      />
    </Card>
  );
}
