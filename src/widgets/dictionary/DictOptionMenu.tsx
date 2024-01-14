import MenuDialog from "../../components/MenuDialog";
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Stack,
  Typography,
} from "@mui/material";
import LanguageSelect from "../../components/LanguageSelect";
import SettingsIcon from "@mui/icons-material/Settings";
import styled from "styled-components";

const StyledBox = styled(Box)`
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;

  & > * {
    flex: 1;
  }

  & > *:first-child {
    margin-right: 10px;
  }

  & > *:last-child {
    margin-left: 10px;
  }
`;

export interface DictOptionMenuProps {
  open: boolean;
  onClose: () => void;

  showOriginTTSBtn?: boolean;
  showTranslatedTTSBtn?: boolean;

  fixedLang?: boolean;
  from?: string | null;
  to?: string | null;

  onTTSOriginChange?: (value: boolean) => void;
  onTTSAfterChange?: (value: boolean) => void;

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
          {/* Show speech button */}
          <Typography>Hide text-to-speech button for:</Typography>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.showOriginTTSBtn}
                  onChange={(event) => {
                    props.onTTSOriginChange?.(event.target.checked);
                  }}
                />
              }
              label="Original text"
            />
          </FormControl>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.showTranslatedTTSBtn}
                  onChange={(event) => {
                    props.onTTSAfterChange?.(event.target.checked);
                  }}
                />
              }
              label="Translated text"
            />
          </FormControl>

          <Divider />

          {/* Fixed Languages */}
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
            <StyledBox>
              <FormControl>
                <FormLabel>From</FormLabel>
                <LanguageSelect
                  lang={props.from}
                  onChange={(value) => {
                    props.onFromChange?.(value);
                  }}
                  alwaysShowLabel
                />
              </FormControl>
              <FormControl>
                <FormLabel>To</FormLabel>
                <LanguageSelect
                  lang={props.to}
                  onChange={(value) => {
                    props.onToChange?.(value);
                  }}
                  alwaysShowLabel
                />
              </FormControl>
            </StyledBox>
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
