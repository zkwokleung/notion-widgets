import { ChevronDown, Eye, Pencil, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareMenuProps {
  editUrl: string;
  readOnlyUrl: string;
}

function copy(url: string, what: string) {
  navigator.clipboard.writeText(url).then(
    () => toast.success(`${what} copied`),
    () => toast.error("Couldn't copy the link. Copy it from the address bar instead.")
  );
}

function ShareMenu({ editUrl, readOnlyUrl }: ShareMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" variant="ghost" className="text-muted-foreground">
          <Share2 />
          Share
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuItem onSelect={() => copy(editUrl, "Embed link")}>
          <Pencil />
          Copy embed link (can edit)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copy(readOnlyUrl, "Read-only link")}>
          <Eye />
          Copy read-only link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ShareMenu;
