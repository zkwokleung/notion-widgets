import React from "react";
import MenuDialog from "../../components/MenuDialog";

export interface DictOptionMenuProps {
  open: boolean;
  onClose: () => void;
}

function DictOptionMenu(props: DictOptionMenuProps) {
  return (
    <>
      <MenuDialog
        open={props.open}
        onClose={props.onClose}
        title="Options"
      ></MenuDialog>
    </>
  );
}

export default DictOptionMenu;
