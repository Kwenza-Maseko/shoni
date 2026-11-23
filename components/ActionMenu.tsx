
"use client";

import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActionItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: ActionItem[];
  label?: string;
}

const ActionMenu = ({
  actions,
  label = "Open actions",
}: ActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            aria-label={label}
            className="bg-transparent text-white hover:bg-gray-600"
          >
            <Ellipsis className="h-4 w-4 rotate-90" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-45 border border-gray-700 bg-gray-900 text-white"
      >
        <DropdownMenuGroup>
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              disabled={action.disabled}
              onClick={action.onClick}
              className="cursor-pointer"
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionMenu;
