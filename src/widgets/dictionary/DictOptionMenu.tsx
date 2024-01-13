import MenuDialog from "../../components/MenuDialog";
import {
  Button,
  Checkbox,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormLabel,
  Stack,
  Typography,
} from "@mui/material";
import LanguageSelect from "../../components/LanguageSelect";
import SettingsIcon from "@mui/icons-material/Settings";

export interface DictOptionMenuProps {
  open: boolean;
  onClose: () => void;

  fixedLang?: boolean;
  from?: string | null;
  to?: string | null;

  onFixedLangChange?: (value: boolean) => void;
  onFromChange?: (value: string) => void;
  onToChange?: (value: string) => void;
}

function DictOptionMenu(props: DictOptionMenuProps) {
  return (
    <>
      <MenuDialog
        open={props.open}
        onClose={props.onClose}
        title={
          <>
            <Stack direction="row" spacing={2}>
              <SettingsIcon />
              <Typography
                sx={{
                  fontWeight: "bold",
                }}
              >
                Options
              </Typography>
            </Stack>
          </>
        }
        fullWidth
      >
        <Stack direction="column" spacing={2}>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.fixedLang}
                  onChange={(event) => {
                    props.onFixedLangChange?.(event.target.checked);
                  }}
                />
              }
              label="Set languages for all entries"
            />
          </FormControl>
          {!!props.fixedLang && !!props.from && !!props.to && (
            <>
              <FormControl>
                <FormLabel>From</FormLabel>
                <LanguageSelect
                  lang={props.from}
                  onChange={(value) => {
                    props.onFromChange?.(value);
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>To</FormLabel>
                <LanguageSelect
                  lang={props.to}
                  onChange={(value) => {
                    props.onToChange?.(value);
                  }}
                />
              </FormControl>
            </>
          )}
        </Stack>
        <DialogActions>
          <Button onClick={props.onClose}>
            <Typography>Close</Typography>
          </Button>
        </DialogActions>
      </MenuDialog>
    </>
  );
}

export default DictOptionMenu;
