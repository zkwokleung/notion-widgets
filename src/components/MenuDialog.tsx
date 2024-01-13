import { Dialog, DialogTitle, Typography } from "@mui/material";
import React from "react";
import { StyledCard } from "./StyledComponents";

interface MenuDialogProps {
  open: boolean;
  onClose: () => void;

  title?: string | React.ReactNode;

  children?: React.ReactNode;

  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  fullWidth?: boolean;
}

function MenuDialog(props: MenuDialogProps) {
  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.onClose}
        maxWidth={props.maxWidth || "lg"}
        fullWidth={props.fullWidth}
      >
        {props.title && (
          <DialogTitle sx={{ m: 0, p: 2 }}>
            <Typography>{props.title}</Typography>
          </DialogTitle>
        )}
        <StyledCard>{props.children}</StyledCard>
      </Dialog>
    </>
  );
}

export default MenuDialog;
